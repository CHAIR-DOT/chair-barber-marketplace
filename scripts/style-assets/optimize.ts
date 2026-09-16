import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  dedup,
  prune,
  meshopt,
  textureCompress,
} from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";
import sharp from "sharp";
import {
  STYLE_ASSET_MANIFEST,
  STYLE_COMBINATIONS,
} from "../../src/lib/style-assets";

const source = resolve(
  process.argv[2] ?? ".cache/style-assets/generated/assembled",
);
const contract = JSON.parse(
  await readFile(resolve("scripts/style-assets/build-contract.json"), "utf8"),
);
for (const category of ["hairStyles", "beardStyles"] as const) {
  const expected = STYLE_ASSET_MANIFEST[category].map(({ id, groupName }) => ({
    id,
    groupName,
  }));
  if (JSON.stringify(contract[category]) !== JSON.stringify(expected))
    throw new Error(`Authoring contract differs from registry: ${category}`);
}
const output = resolve("public/models/human/chair-human.glb");
await MeshoptEncoder.ready;
await MeshoptDecoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "meshopt.encoder": MeshoptEncoder,
    "meshopt.decoder": MeshoptDecoder,
  });
const document = await io.read(join(source, "chair-human-raw.glb"));
const names = new Set(
  document
    .getRoot()
    .listNodes()
    .map((node) => node.getName()),
);
for (const entry of [
  ...STYLE_ASSET_MANIFEST.hairStyles,
  ...STYLE_ASSET_MANIFEST.beardStyles,
]) {
  if (!names.has(entry.groupName))
    throw new Error(`Missing group: ${entry.groupName}`);
}
// Preserve named groups. Do not flatten or join independently switchable variants.
await document.transform(
  dedup(),
  prune({ keepLeaves: true }),
  textureCompress({
    encoder: sharp,
    targetFormat: "webp",
    resize: [2048, 2048],
    quality: 90,
    effort: 75,
    slots: /^(?!normalTexture$).*/,
  }),
  textureCompress({
    encoder: sharp,
    targetFormat: "webp",
    resize: [2048, 2048],
    lossless: true,
    effort: 75,
    slots: /^normalTexture$/,
  }),
  meshopt({
    encoder: MeshoptEncoder,
    level: "medium",
    quantizePosition: 16,
    quantizeNormal: 12,
    quantizeTexcoord: 14,
  }),
);
await mkdir(resolve("public/models/human"), { recursive: true });
await io.write(output, document);
const outputs = [];
for (const combination of STYLE_COMBINATIONS) {
  const path = resolve("public" + combination.previewSrc);
  await mkdir(resolve("public" + STYLE_ASSET_MANIFEST.previewDirectory), {
    recursive: true,
  });
  await sharp(join(source, combination.id + ".png"))
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(path);
  outputs.push({
    path: combination.previewSrc,
    bytes: (await stat(path)).size,
    sha256: createHash("sha256")
      .update(await readFile(path))
      .digest("hex"),
  });
}
const verified = await io.read(output);
let triangles = 0;
for (const mesh of verified.getRoot().listMeshes())
  for (const primitive of mesh.listPrimitives())
    triangles +=
      (primitive.getIndices()?.getCount() ??
        primitive.getAttribute("POSITION")!.getCount()) / 3;
const report = {
  model: STYLE_ASSET_MANIFEST.model.src,
  bytes: (await stat(output)).size,
  sha256: createHash("sha256")
    .update(await readFile(output))
    .digest("hex"),
  trianglesAllVariants: triangles,
  groups: [
    ...STYLE_ASSET_MANIFEST.hairStyles,
    ...STYLE_ASSET_MANIFEST.beardStyles,
  ].map((entry) => entry.groupName),
  compression: "Meshopt; 16-bit positions; WebP color; lossless WebP normal",
  previews: outputs,
};
await writeFile(
  resolve("public/models/human/asset-report.json"),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    modelBytes: report.bytes,
    triangles,
    previewBytes: outputs.reduce((sum, item) => sum + item.bytes, 0),
    combinations: outputs.length,
  }),
);
