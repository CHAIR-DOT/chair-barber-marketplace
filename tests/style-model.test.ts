import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { NodeIO, type Node } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";
import sharp from "sharp";
import {
  STYLE_ASSET_MANIFEST,
  STYLE_COMBINATIONS,
} from "../src/lib/style-assets";

const hash = (bytes: Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");
const asset = (async () => {
  await MeshoptDecoder.ready;
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ "meshopt.decoder": MeshoptDecoder });
  const bytes = await readFile(`public${STYLE_ASSET_MANIFEST.model.src}`);
  const document = await io.readBinary(bytes);
  const report = JSON.parse(
    await readFile("public/models/human/asset-report.json", "utf8"),
  ) as {
    model: string;
    bytes: number;
    sha256: string;
    trianglesAllVariants: number;
    previews: { path: string; bytes: number; sha256: string }[];
  };
  return { bytes, document, report };
})();

function meshNodes(group: Node) {
  const nodes: Node[] = [];
  group.traverse((node) => {
    if (node.getMesh()) nodes.push(node);
  });
  return nodes;
}

function triangles(group: Node) {
  return meshNodes(group).reduce(
    (sum, node) =>
      sum +
      node
        .getMesh()!
        .listPrimitives()
        .reduce(
          (count, primitive) =>
            count +
            (primitive.getIndices()?.getCount() ??
              primitive.getAttribute("POSITION")!.getCount()) /
              3,
          0,
        ),
    0,
  );
}

test("the compressed GLB decodes six distinct, nonempty registered grooms around one shared human and cape", async () => {
  const { document } = await asset;
  const nodes = document.getRoot().listNodes();
  const required = [
    ...STYLE_ASSET_MANIFEST.hairStyles,
    ...STYLE_ASSET_MANIFEST.beardStyles,
  ];
  const ownedNodes = new Set<Node>();
  const signatures = new Set<string>();
  const groups = required.map((entry) => {
    const matches = nodes.filter((node) => node.getName() === entry.groupName);
    assert.equal(
      matches.length,
      1,
      `${entry.groupName} must resolve unambiguously`,
    );
    const group = matches[0];
    assert.ok(
      group.listChildren().length > 0,
      `${entry.groupName} must be a toggleable parent`,
    );
    const meshes = meshNodes(group);
    assert.ok(
      meshes.length > 0,
      `${entry.groupName} must contain renderable geometry`,
    );
    const signature = createHash("sha256");
    for (const node of meshes) {
      assert.ok(
        !ownedNodes.has(node),
        "grooms must not contain another option's geometry",
      );
      ownedNodes.add(node);
      for (const primitive of node.getMesh()!.listPrimitives()) {
        const positions = primitive.getAttribute("POSITION");
        assert.ok(positions && positions.getCount() >= 3);
        const values = positions.getArray();
        assert.ok(
          values && Array.from(values).every(Number.isFinite),
          "decoded vertices must be finite",
        );
        signature.update(
          Buffer.from(values.buffer, values.byteOffset, values.byteLength),
        );
        assert.ok(primitive.getIndices()!.getCount() > 0);
      }
    }
    signatures.add(signature.digest("hex"));
    return group;
  });
  assert.equal(
    signatures.size,
    6,
    "different labels must not conceal identical groom geometry",
  );
  const humans = nodes.filter((node) => node.getName() === "CHAIR_BaseHuman");
  const capes = nodes.filter((node) => node.getName() === "Body_BarberCape");
  assert.equal(humans.length, 1);
  assert.equal(capes.length, 1);
  const sharedNodes = [...meshNodes(humans[0]), ...meshNodes(capes[0])];
  assert.ok(
    sharedNodes.every((node) => !ownedNodes.has(node)),
    "selecting a groom must never hide the face, eyes, or body",
  );
  for (const materialName of [
    "CHAIR_Skin_PBR",
    "CHAIR_BrownEyes_PBR",
    "CHAIR_Cornea",
  ]) {
    const owners = sharedNodes.filter((node) =>
      node
        .getMesh()!
        .listPrimitives()
        .some(
          (primitive) => primitive.getMaterial()?.getName() === materialName,
        ),
    );
    assert.equal(
      owners.length,
      1,
      `${materialName} belongs to one fixed human mesh`,
    );
  }
  for (const combination of STYLE_COMBINATIONS) {
    const active = groups.filter((group) =>
      [combination.hairGroupName, combination.beardGroupName].includes(
        group.getName(),
      ),
    );
    assert.equal(active.length, 2);
    assert.ok(
      triangles(humans[0]) +
        triangles(capes[0]) +
        active.reduce((sum, group) => sum + triangles(group), 0) <=
        150_000,
      `${combination.id} exceeds the visible triangle budget`,
    );
  }
});

test("the local compressed model and embedded textures meet the delivery budget and recorded integrity", async () => {
  const { bytes, document, report } = await asset;
  assert.equal(bytes.readUInt32LE(0), 0x46546c67);
  assert.equal(bytes.readUInt32LE(4), 2);
  assert.equal(bytes.readUInt32LE(8), bytes.length);
  const json = JSON.parse(
    bytes.toString("utf8", 20, 20 + bytes.readUInt32LE(12)),
  ) as {
    extensionsRequired: string[];
    buffers: { uri?: string }[];
    images: { uri?: string }[];
  };
  assert.ok(json.extensionsRequired.includes("EXT_meshopt_compression"));
  assert.ok(json.extensionsRequired.includes("EXT_texture_webp"));
  assert.ok(
    json.buffers.every((buffer) => !buffer.uri) &&
      json.images.every((image) => !image.uri),
    "production model must have no external asset URLs",
  );
  assert.ok(
    bytes.length <= 8 * 1024 * 1024,
    "model must fit the 8 MiB transfer budget",
  );
  assert.equal(report.model, STYLE_ASSET_MANIFEST.model.src);
  assert.equal(report.bytes, bytes.length);
  assert.equal(report.sha256, hash(bytes));
  const triangleCount = document
    .getRoot()
    .listMeshes()
    .reduce(
      (sum, mesh) =>
        sum +
        mesh
          .listPrimitives()
          .reduce(
            (count, primitive) =>
              count +
              (primitive.getIndices()?.getCount() ??
                primitive.getAttribute("POSITION")!.getCount()) /
                3,
            0,
          ),
      0,
    );
  assert.equal(triangleCount, report.trianglesAllVariants);
  assert.ok(triangleCount <= 300_000, "cached geometry must remain bounded");
  for (const texture of document.getRoot().listTextures()) {
    const image = texture.getImage();
    assert.ok(image, `${texture.getName()} must be embedded`);
    const decoded = await sharp(image)
      .raw()
      .toBuffer({ resolveWithObject: true });
    assert.ok(
      decoded.info.width <= 2048 && decoded.info.height <= 2048,
      `${texture.getName()} exceeds 2K`,
    );
    assert.ok(decoded.data.length > 0);
  }
});

test("all nine matching WebP previews decode to distinct portraits with consistent framing and valid hashes", async () => {
  const { report } = await asset;
  assert.deepEqual(
    report.previews.map((preview) => preview.path).sort(),
    STYLE_COMBINATIONS.map((pair) => pair.previewSrc).sort(),
  );
  const portraits = new Set<string>();
  let totalBytes = 0;
  for (const pair of STYLE_COMBINATIONS) {
    const bytes = await readFile(`public${pair.previewSrc}`);
    const recorded = report.previews.find(
      (preview) => preview.path === pair.previewSrc,
    )!;
    assert.equal(recorded.bytes, bytes.length);
    assert.equal(recorded.sha256, hash(bytes));
    const metadata = await sharp(bytes).metadata();
    assert.equal(metadata.format, "webp");
    const { data, info } = await sharp(bytes)
      .raw()
      .toBuffer({ resolveWithObject: true });
    assert.deepEqual(
      [info.width, info.height, info.channels],
      [640, 800, 4],
      "every pair must use the same transparent portrait frame",
    );
    portraits.add(hash(data));
    totalBytes += bytes.length;
  }
  assert.equal(
    portraits.size,
    9,
    "previews must not reuse the same human grooming result under different names",
  );
  assert.ok(
    totalBytes <= 512 * 1024,
    "the whole photo collection must stay below 512 KiB",
  );
});
