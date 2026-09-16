import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as THREE from "three";
import { createHairVariants } from "../src/components/style-hair-variants";
import { HAIR_STYLE_IDS } from "../src/lib/style-selection";

function scanMesh() {
  const bytes = readFileSync("public/models/lee-perry-smith/LeePerrySmith.glb");
  const length = bytes.readUInt32LE(12);
  const document = JSON.parse(bytes.toString("utf8", 20, 20 + length));
  const binary = bytes.subarray(28 + length);
  const geometry = new THREE.BufferGeometry();
  for (const [name, accessorIndex] of [
    ["position", 1],
    ["index", 0],
  ] as const) {
    const accessor = document.accessors[accessorIndex];
    const view = document.bufferViews[accessor.bufferView];
    const offset = binary.byteOffset + view.byteOffset;
    if (name === "position")
      geometry.setAttribute(
        name,
        new THREE.BufferAttribute(
          new Float32Array(binary.buffer, offset, accessor.count * 3),
          3,
        ),
      );
    else
      geometry.setIndex(
        new THREE.BufferAttribute(
          new Uint16Array(binary.buffer, offset, accessor.count),
          1,
        ),
      );
  }
  return new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
}

test("every canonical hair choice switches to its own finite fitted geometry", () => {
  const head = scanMesh();
  const originalPositions = head.geometry
    .getAttribute("position")
    .array.slice();
  const variants = createHairVariants(head);
  assert.deepEqual(
    variants.group.children.map((item) => item.name),
    HAIR_STYLE_IDS,
  );
  const bounds = new Map<string, THREE.Box3>();
  let triangleCount = 0;
  for (const id of HAIR_STYLE_IDS) {
    variants.setStyle(id);
    const visible = variants.group.children.filter((item) => item.visible);
    assert.equal(visible.length, 1);
    assert.equal(visible[0].name, id);
    const box = new THREE.Box3().setFromObject(visible[0]);
    assert.ok(box.min.y > -2, `${id} stays around the head and neck`);
    assert.ok(box.max.y < 5.5, `${id} stays inside the portrait`);
    assert.ok(box.min.x > -2.7 && box.max.x < 2.7);
    bounds.set(id, box);
    visible[0].traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const positions = child.geometry.getAttribute("position");
      assert.ok(Array.from(positions.array).every(Number.isFinite));
      triangleCount += child.geometry.index
        ? child.geometry.index.count / 3
        : positions.count / 3;
    });
  }
  assert.ok(
    triangleCount < 230000,
    "all cached options use a bounded geometry budget",
  );
  assert.ok(
    bounds.get("pompadour")!.max.y > bounds.get("buzz-cut")!.max.y + 0.65,
  );
  assert.ok(
    bounds.get("long-hair")!.min.y <
      bounds.get("classic-scissor-cut")!.min.y - 0.7,
  );
  assert.ok(
    bounds.get("low-fade")!.min.y < bounds.get("skin-fade")!.min.y - 0.5,
  );
  assert.equal(
    new Set([...bounds.values()].map((box) => JSON.stringify(box))).size,
    HAIR_STYLE_IDS.length,
  );
  assert.deepEqual(
    head.geometry.getAttribute("position").array,
    originalPositions,
    "skin geometry is never mutated",
  );
  variants.setStyle("invalid");
  assert.equal(variants.group.userData.activeStyleId, "skin-fade");
  variants.dispose();
  variants.dispose();
  head.geometry.dispose();
  head.material.dispose();
});
