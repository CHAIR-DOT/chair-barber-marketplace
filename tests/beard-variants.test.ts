import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as THREE from "three";
import { createBeardVariants } from "../src/components/style-beard-variants";
import { BEARD_STYLE_IDS } from "../src/lib/style-selection";

function scanGeometry() {
  const buffer = readFileSync(
    "public/models/lee-perry-smith/LeePerrySmith.glb",
  );
  const jsonLength = buffer.readUInt32LE(12);
  const gltf = JSON.parse(buffer.subarray(20, 20 + jsonLength).toString());
  const binaryOffset = 28 + jsonLength;
  const geometry = new THREE.BufferGeometry();
  for (const [name, id, size] of [
    ["position", 1, 3],
    ["normal", 2, 3],
    ["uv", 3, 2],
  ] as const) {
    const accessor = gltf.accessors[id];
    const view = gltf.bufferViews[accessor.bufferView];
    const array = new Float32Array(
      buffer.buffer,
      buffer.byteOffset + binaryOffset + view.byteOffset,
      accessor.count * size,
    );
    geometry.setAttribute(name, new THREE.BufferAttribute(array.slice(), size));
  }
  const accessor = gltf.accessors[0];
  const view = gltf.bufferViews[accessor.bufferView];
  geometry.setIndex(
    new THREE.BufferAttribute(
      new Uint16Array(
        buffer.buffer,
        buffer.byteOffset + binaryOffset + view.byteOffset,
        accessor.count,
      ).slice(),
      1,
    ),
  );
  return geometry;
}

test("all beard IDs switch distinct cached geometry fitted to the licensed scan, preserving lips and the source", () => {
  const geometry = scanGeometry();
  const sourceBefore = geometry.getAttribute("position").array.slice();
  const head = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  const variants = createBeardVariants(head);
  head.add(variants.group);
  const signatures = new Set<string>();
  const ids = variants.group.children.map((child) => child.uuid);

  for (const id of BEARD_STYLE_IDS) {
    variants.setStyle(id);
    const visible = variants.group.children.filter((child) => child.visible);
    assert.equal(visible.length, 1);
    assert.equal(visible[0].name, `beard-${id}`);
    if (id === "clean-shaven") {
      assert.equal(visible[0].children.length, 0);
      continue;
    }
    if (id === "stubble") {
      assert.equal(
        visible[0].children.length,
        1,
        "stubble must not include a painted solid shell",
      );
      const strands = visible[0].children[0] as THREE.InstancedMesh;
      assert.ok(strands instanceof THREE.InstancedMesh);
      assert.equal(strands.count, 2600);
      signatures.add(
        createHash("sha256")
          .update(Buffer.from(strands.instanceMatrix.array.buffer))
          .digest("hex"),
      );
      continue;
    }
    const shell = visible[0].children[0] as THREE.Mesh;
    const strands = visible[0].children[1] as THREE.InstancedMesh;
    const positions = shell.geometry.getAttribute("position");
    const uv = shell.geometry.getAttribute("uv");
    const index = shell.geometry.getIndex()!;
    assert.ok(index.count > 500, `${id} has a real beard surface`);
    assert.ok(strands.count >= 1000, `${id} has fitted 3D strands`);
    for (let i = 0; i < index.count; i++) {
      const vertex = index.getX(i);
      assert.ok(Number.isFinite(positions.getX(vertex)));
      assert.ok(Number.isFinite(positions.getY(vertex)));
      assert.ok(Number.isFinite(positions.getZ(vertex)));
      assert.ok(
        positions.getZ(vertex) > 0,
        "beard must remain on the front of the head",
      );
      const lipDistance =
        ((uv.getX(vertex) - 0.5) / 0.069) ** 2 +
        ((uv.getY(vertex) - 0.535) / 0.025) ** 2;
      assert.ok(
        lipDistance >= 1 - 0.00001,
        "beard geometry must leave the lips open",
      );
    }
    const signature = createHash("sha256")
      .update(Buffer.from(positions.array.buffer))
      .update(Buffer.from(index.array.buffer))
      .digest("hex");
    signatures.add(signature);
  }
  assert.equal(
    signatures.size,
    5,
    "every nonempty beard has distinct geometry",
  );
  assert.deepEqual(
    variants.group.children.map((child) => child.uuid),
    ids,
    "switches reuse cached objects",
  );
  assert.deepEqual(geometry.getAttribute("position").array, sourceBefore);
  variants.dispose();
  variants.dispose();
  assert.equal(head.children.length, 0);
  assert.equal(variants.group.children.length, 0);
  geometry.dispose();
  (head.material as THREE.Material).dispose();
});
