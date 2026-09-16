"""Assemble the reviewed human, cape, and independent grooms; render every pair.

Run inside Blender with --background --factory-startup --disable-autoexec.
Inputs are ASSET_ROOT/generated/base-portable.glb, generated/hair/hair-variants.glb,
and generated/beards/<id>.glb. Outputs default to ASSET_ROOT/generated/assembled.
Previews are rendered after a GLB round-trip so they use the exported materials.
"""

import argparse
import json
import math
import os
from pathlib import Path
import re
import struct
import sys

sys.dont_write_bytecode = True


def load_contract(path):
    contract = json.loads(Path(path).read_text())
    if contract.get("schemaVersion") != 1:
        raise ValueError("Unsupported style build contract version")
    all_groups = []
    for key, prefix in (("hairStyles", "hair_"), ("beardStyles", "beard_")):
        entries = contract.get(key)
        if not isinstance(entries, list) or not entries:
            raise ValueError(f"Build contract has no {key}")
        ids = []
        for entry in entries:
            identifier = entry.get("id", "")
            if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", identifier):
                raise ValueError(f"Invalid style identifier: {identifier!r}")
            if entry.get("groupName") != prefix + identifier:
                raise ValueError(f"Invalid mesh group for {identifier}")
            ids.append(identifier)
            all_groups.append(entry["groupName"])
        if len(set(ids)) != len(ids):
            raise ValueError(f"Duplicate identifiers in {key}")
    if len(set(all_groups)) != len(all_groups):
        raise ValueError("Build contract group names must be unique")
    return contract


def add_cape():
    """Preserve the reviewed radial cloth folds, collar, and shoulder silhouette."""
    import bpy

    vertices = []
    faces = []
    segments = 128
    rings = 32
    for j in range(rings + 1):
        t = j / rings
        if t < .16:
            radius = .064 + .039 * t / .16
            z = 1.365 - .020 * t / .16
        elif t < .5:
            radius = .103 + .179 * (t - .16) / .34
            z = 1.345 - .046 * (t - .16) / .34
        else:
            radius = .282 + .11 * (t - .5) / .5
            z = 1.299 - .28 * (t - .5) / .5
        for i in range(segments):
            angle = i / segments * math.tau
            fold = (math.sin(angle * 21 + .5) * .008 + math.sin(angle * 37) * .003) * t
            x = math.sin(angle) * (radius + fold)
            y = -.036 + math.cos(angle) * (radius * .82 + fold)
            height = z + math.cos(angle) * .028 * t + math.cos(angle * 2) * .009 * math.sin(t * math.pi)
            vertices.append((x, y, height))
    for j in range(rings):
        for i in range(segments):
            a = j * segments + i
            b = j * segments + (i + 1) % segments
            faces.append((a, b, b + segments, a + segments))
    mesh = bpy.data.meshes.new("Cape_tailored_cloth")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    cape = bpy.data.objects.new("Body_BarberCape", mesh)
    bpy.context.collection.objects.link(cape)
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    material = bpy.data.materials.new("Cape_charcoal")
    material.use_nodes = True
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (.005, .007, .009, 1)
    shader.inputs["Roughness"].default_value = .94
    shader.inputs["Specular IOR Level"].default_value = .09
    mesh.materials.append(material)


def finish_hair():
    import bpy

    for material in bpy.data.materials:
        if not material.use_nodes or "short0" not in material.name:
            continue
        shader = material.node_tree.nodes.get("Principled BSDF")
        shader.inputs["Roughness"].default_value = .9
        shader.inputs["Specular IOR Level"].default_value = .025
        incoming = list(shader.inputs["Base Color"].links)
        if incoming:
            source = incoming[0].from_socket
            mix = material.node_tree.nodes.new("ShaderNodeMixRGB")
            mix.blend_type = "MULTIPLY"
            mix.inputs[0].default_value = 1
            mix.inputs[2].default_value = (.28, .20, .14, 1)
            material.node_tree.links.new(source, mix.inputs[1])
            material.node_tree.links.new(mix.outputs[0], shader.inputs["Base Color"])


def add_portrait_studio(samples):
    import bpy
    from mathutils import Vector

    def point_at(obj, target):
        obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()

    scene = bpy.context.scene
    camera_data = bpy.data.cameras.new("Portrait_camera")
    camera = bpy.data.objects.new("Portrait_camera", camera_data)
    scene.collection.objects.link(camera)
    camera.location = (.24, -2, 1.46)
    point_at(camera, (0, -.018, 1.425))
    camera_data.type = "ORTHO"
    camera_data.ortho_scale = .46
    scene.camera = camera
    for name, location, color, power, size in [
        ("Key", (-.5, -.6, 1.98), (1, .85, .72), 28, .5),
        ("Fill", (.5, -.4, 1.6), (.73, .82, 1), 5, .75),
        ("Rim", (.4, .45, 1.9), (1, .72, .4), 40, .4),
    ]:
        light = bpy.data.lights.new(name, "AREA")
        light.energy = power
        light.color = color
        light.shape = "DISK"
        light.size = size
        obj = bpy.data.objects.new(name, light)
        scene.collection.objects.link(obj)
        obj.location = location
        point_at(obj, (0, -.03, 1.46))
    scene.world = bpy.data.worlds.new("Studio")
    scene.world.use_nodes = True
    scene.world.node_tree.nodes["Background"].inputs[0].default_value = (.028, .032, .03, 1)
    scene.world.node_tree.nodes["Background"].inputs[1].default_value = .25
    scene.render.engine = "CYCLES"
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 640
    scene.render.resolution_y = 800
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.view_settings.view_transform = "AgX"
    scene.render.image_settings.file_format = "PNG"
    scene.render.threads_mode = "FIXED"
    scene.render.threads = 6


def patch_portable_materials(path):
    """Keep the exact reviewed color factors and consistent alpha cutout rules."""
    data = Path(path).read_bytes()
    if struct.unpack_from("<III", data, 0) != (0x46546C67, 2, len(data)):
        raise ValueError("Assembly output is not a valid GLB 2.0 container")
    length, kind = struct.unpack_from("<II", data, 12)
    if kind != 0x4E4F534A:
        raise ValueError("GLB output has no JSON header")
    gltf = json.loads(data[20:20 + length])
    binary = data[20 + length:]
    for material in gltf["materials"]:
        name = material.get("name", "")
        if name.startswith("CHAIR_BeardCards_"):
            material.setdefault("pbrMetallicRoughness", {})["baseColorFactor"] = [.33, .22, .15, 1]
        if "short0" in name:
            material.setdefault("pbrMetallicRoughness", {})["baseColorFactor"] = [.28, .20, .14, 1]
        if material.get("alphaMode") == "BLEND" and (
            "short0" in name or "beard" in name.lower() or "buzz_density" in name
        ):
            material["alphaMode"] = "MASK"
            material["alphaCutoff"] = .3
    encoded = json.dumps(gltf, separators=(",", ":")).encode()
    encoded += b" " * ((-len(encoded)) % 4)
    output = (
        struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(encoded) + len(binary))
        + struct.pack("<II", len(encoded), 0x4E4F534A)
        + encoded + binary
    )
    Path(path).write_bytes(output)


def verify_groups(scene, contract):
    """Reject missing or unexpected variant groups before export and rendering."""
    expected = {
        entry["groupName"]
        for category in ("hairStyles", "beardStyles")
        for entry in contract[category]
    }
    actual = {
        obj.name for obj in scene.objects
        if obj.type == "EMPTY" and obj.name.startswith(("hair_", "beard_"))
    }
    if actual != expected:
        raise ValueError(f"Groom groups differ from contract: missing={expected - actual}, unexpected={actual - expected}")
    for name in expected:
        group = scene.objects.get(name)
        if not group or not any(child.type == "MESH" for child in group.children_recursive):
            raise ValueError(f"Groom group has no mesh descendants: {name}")


def assemble(asset_root, output_dir, contract, samples=40, skip_previews=False):
    import bpy
    import bmesh

    asset_root = Path(asset_root).expanduser().resolve()
    output_dir = Path(output_dir).expanduser().resolve()
    base_path = asset_root / "generated/base-portable.glb"
    hair_path = asset_root / "generated/hair/hair-variants.glb"
    beard_paths = {
        entry["id"]: asset_root / "generated/beards" / (entry["id"] + ".glb")
        for entry in contract["beardStyles"]
    }
    for source in (base_path, hair_path, *beard_paths.values()):
        if not source.is_file():
            raise FileNotFoundError(f"Missing generated input: {source}")

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.preferences.system.use_online_access = False
    bpy.context.preferences.filepaths.use_scripts_auto_execute = False
    bpy.ops.import_scene.gltf(filepath=str(base_path))
    human = bpy.context.scene.objects.get("CHAIR_BaseHuman")
    if human is None or human.type != "MESH":
        raise ValueError("Base input has no CHAIR_BaseHuman mesh")
    mesh = bmesh.new()
    mesh.from_mesh(human.data)
    bmesh.ops.delete(
        mesh, geom=[v for v in mesh.verts if (human.matrix_world @ v.co).z < 1.35], context="VERTS",
    )
    mesh.to_mesh(human.data)
    mesh.free()
    bpy.ops.import_scene.gltf(filepath=str(hair_path))
    add_cape()
    finish_hair()
    add_portrait_studio(samples)
    scene = bpy.context.scene

    for entry in contract["beardStyles"]:
        before = set(scene.objects)
        bpy.ops.import_scene.gltf(filepath=str(beard_paths[entry["id"]]))
        group = bpy.data.objects.new(entry["groupName"], None)
        scene.collection.objects.link(group)
        for obj in set(scene.objects) - before - {group}:
            if obj.type == "MESH":
                matrix = obj.matrix_world.copy()
                obj.parent = group
                obj.matrix_world = matrix
    verify_groups(scene, contract)
    output_dir.mkdir(parents=True, exist_ok=True)
    model_path = output_dir / "chair-human-raw.glb"
    bpy.ops.object.select_all(action="DESELECT")
    for obj in scene.objects:
        if obj.type in ("MESH", "EMPTY"):
            obj.hide_render = False
            obj.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=str(model_path), export_format="GLB", use_selection=True,
        export_apply=True, export_animations=False, export_morph=False,
    )
    patch_portable_materials(model_path)

    # Round-trip before rendering: previews use the actual portable model/materials.
    for obj in list(scene.objects):
        if obj.type in ("MESH", "EMPTY"):
            bpy.data.objects.remove(obj, do_unlink=True)
    bpy.ops.import_scene.gltf(filepath=str(model_path))
    verify_groups(scene, contract)
    bpy.ops.wm.save_as_mainfile(filepath=str(output_dir / "figure.blend"))
    preview_count = 0
    if not skip_previews:
        for hair in contract["hairStyles"]:
            for beard in contract["beardStyles"]:
                for obj in scene.objects:
                    if obj.parent and obj.parent.name.startswith("hair_"):
                        obj.hide_render = obj.parent.name != hair["groupName"]
                    if obj.parent and obj.parent.name.startswith("beard_"):
                        obj.hide_render = obj.parent.name != beard["groupName"]
                scene.render.filepath = str(output_dir / f"{hair['id']}--{beard['id']}.png")
                bpy.ops.render.render(write_still=True)
                preview_count += 1
    print(f"Assembled: {model_path}\nRendered previews: {preview_count}")
    return model_path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--asset-root", type=Path, default=Path(os.environ.get("CHAIR_STYLE_ASSET_ROOT", ".cache/style-assets")))
    parser.add_argument("--output-dir", type=Path, help="Defaults to ASSET_ROOT/generated/assembled")
    parser.add_argument("--contract", type=Path, default=Path(__file__).with_name("build-contract.json"))
    parser.add_argument("--skip-previews", action="store_true", help="Export and validate the complete model without rendering PNGs")
    parser.add_argument("--samples", type=int, default=40, help="Cycles samples per preview (default: 40)")
    arguments = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    args = parser.parse_args(arguments)
    if args.samples < 1:
        parser.error("--samples must be positive")
    root = args.asset_root.expanduser().resolve()
    output = args.output_dir or root / "generated/assembled"
    assemble(root, output, load_contract(args.contract), args.samples, args.skip_previews)


if __name__ == "__main__":
    main()
