#!/usr/bin/env python3
"""Fetch pinned authoring sources into an isolated cache, or verify that cache.

Uses Python's standard library and curl's system TLS trust store. Does not run
downloaded code, install Blender, or change the user's Blender configuration.
"""

import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import stat
import struct
import subprocess
import zipfile
import zlib


def safe_path(root, relative):
    parts = PurePosixPath(relative)
    if parts.is_absolute() or ".." in parts.parts:
        raise ValueError(f"Unsafe archive path: {relative}")
    destination = root.joinpath(*parts.parts)
    if destination.is_symlink() or not destination.resolve().is_relative_to(root.resolve()):
        raise ValueError(f"Source path escapes the asset root: {relative}")
    return destination


def matches(path, record):
    if not path.is_file() or path.is_symlink():
        return False
    data = path.read_bytes()
    return (
        len(data) == record["size"]
        and hashlib.sha256(data).hexdigest() == record["sha256"]
        and ("crc32" not in record or f"{zlib.crc32(data) & 0xffffffff:08x}" == record["crc32"])
    )


def download(url, maximum_bytes, byte_range=None):
    if not url.startswith("https://"):
        raise ValueError("Authoring sources must use HTTPS")
    command = [
        "curl", "--fail", "--silent", "--show-error", "--location",
        "--proto", "=https", "--tlsv1.2", "--retry", "2", "--max-time", "120",
        "--max-filesize", str(maximum_bytes),
    ]
    if byte_range:
        command.extend(["--range", byte_range])
    data = subprocess.check_output([*command, url])
    if len(data) > maximum_bytes:
        raise ValueError("Source response exceeded its expected size")
    return data


def write_verified(path, data, record):
    if len(data) != record["size"] or hashlib.sha256(data).hexdigest() != record["sha256"]:
        raise ValueError(f"Source size/SHA-256 mismatch: {path.name}")
    if "crc32" in record and f"{zlib.crc32(data) & 0xffffffff:08x}" != record["crc32"]:
        raise ValueError(f"Source CRC mismatch: {path.name}")
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + ".download")
    if temporary.is_symlink():
        raise ValueError("Refusing a symlink at a temporary download path")
    temporary.write_bytes(data)
    temporary.replace(path)


def prepare_addon(root, record, verify_only):
    archive_path = safe_path(root, f"downloads/mpfb-{record['version']}.zip")
    addon_path = safe_path(root, "addon/mpfb")
    if not matches(archive_path, record):
        if verify_only:
            raise ValueError("Pinned MPFB archive is missing or has changed")
        write_verified(archive_path, download(record["url"], record["size"]), record)
    with zipfile.ZipFile(archive_path) as archive:
        if sum(item.file_size for item in archive.infolist()) > 120_000_000:
            raise ValueError("Unexpected MPFB expanded archive size")
        for item in archive.infolist():
            path = safe_path(addon_path, item.filename)
            if stat.S_ISLNK(item.external_attr >> 16):
                raise ValueError("Symlinks are not supported in authoring archives")
            if item.is_dir():
                continue
            data = archive.read(item)
            expected = {"size": len(data), "sha256": hashlib.sha256(data).hexdigest()}
            if matches(path, expected):
                continue
            if verify_only:
                raise ValueError(f"Extracted MPFB file is missing or has changed: {item.filename}")
            write_verified(path, data, expected)
    print(f"Verified MPFB {record['version']} archive and extracted files")


class RangeArchive:
    """Read the ZIP directory and selected members without downloading the whole pack."""

    def __init__(self, url):
        self.url = url
        tail = download(url, 65536, "-65536")
        end = tail.rfind(b"PK\x05\x06")
        if end < 0 or len(tail) < end + 22:
            raise ValueError("Source is not a supported ZIP archive")
        _, disk, directory_disk, _, _, size, offset, _ = struct.unpack("<4s4H2IH", tail[end:end + 22])
        if disk or directory_disk or size == 0xffffffff or offset == 0xffffffff:
            raise ValueError("Multi-volume and ZIP64 source packs are not supported")
        central = self.range(offset, size)
        self.files = {}
        position = 0
        while central[position:position + 4] == b"PK\x01\x02":
            header = struct.unpack("<4s6H3I5H2I", central[position:position + 46])
            name_length, extra_length, comment_length = header[10:13]
            name = central[position + 46:position + 46 + name_length].decode("utf-8")
            self.files[name] = {
                "method": header[4], "crc32": f"{header[7]:08x}",
                "compressed_size": header[8], "size": header[9], "offset": header[16],
            }
            position += 46 + name_length + extra_length + comment_length

    def range(self, offset, length):
        data = download(self.url, length, f"{offset}-{offset + length - 1}")
        if len(data) != length:
            raise ValueError("Source server did not honor the requested byte range")
        return data

    def read(self, record):
        member = self.files.get(record["path"])
        if not member or member["size"] != record["size"] or member["crc32"] != record["crc32"]:
            raise ValueError(f"Source pack member differs from manifest: {record['path']}")
        header = struct.unpack("<4s5H3I2H", self.range(member["offset"], 30))
        if header[0] != b"PK\x03\x04":
            raise ValueError("Invalid ZIP member header")
        start = member["offset"] + 30 + header[9] + header[10]
        compressed = self.range(start, member["compressed_size"])
        if member["method"] == 8:
            return zlib.decompress(compressed, -15)
        if member["method"] == 0:
            return compressed
        raise ValueError("Unsupported source ZIP compression")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--asset-root", type=Path, default=Path(os.environ.get("CHAIR_STYLE_ASSET_ROOT", ".cache/style-assets")))
    parser.add_argument("--manifest", type=Path, default=Path(__file__).with_name("source-manifest.json"))
    parser.add_argument("--verify-only", action="store_true", help="Check existing files without network requests or writes")
    args = parser.parse_args()
    root = args.asset_root.expanduser().resolve()
    manifest = json.loads(args.manifest.read_text())
    if manifest["schemaVersion"] != 1:
        raise ValueError("Unsupported source manifest version")
    prepare_addon(root, manifest["addon"], args.verify_only)
    count = 0
    for pack in manifest["packs"]:
        archive = None
        for record in pack["files"]:
            path = safe_path(root / "assets", record["path"])
            if not matches(path, record):
                if args.verify_only:
                    raise ValueError(f"Source asset is missing or has changed: {record['path']}")
                if archive is None:
                    archive = RangeArchive(pack["url"])
                write_verified(path, archive.read(record), record)
            count += 1
        print(f"Verified {len(pack['files'])} selected files from {pack['id']}")
    print(f"Ready: {root} ({count} selected source assets)")


if __name__ == "__main__":
    main()
