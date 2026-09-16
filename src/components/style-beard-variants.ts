import * as THREE from "three";
import { BEARD_STYLE_IDS, type BeardStyleId } from "../lib/style-selection";

type SurfacePoint = { position: THREE.Vector3; normal: THREE.Vector3 };
type BeardPreset = {
  thickness: number;
  drop: number;
  strands: number;
  strandLength: number;
};

const PRESETS: Record<Exclude<BeardStyleId, "clean-shaven">, BeardPreset> = {
  stubble: { thickness: 0.005, drop: 0, strands: 2600, strandLength: 0.027 },
  "short-beard": {
    thickness: 0.115,
    drop: 0.13,
    strands: 2200,
    strandLength: 0.055,
  },
  "full-beard": {
    thickness: 0.26,
    drop: 0.52,
    strands: 2700,
    strandLength: 0.115,
  },
  goatee: { thickness: 0.13, drop: 0.27, strands: 1000, strandLength: 0.06 },
  defined: { thickness: 0.075, drop: 0.08, strands: 1700, strandLength: 0.036 },
};

const U_MIN = 0.297;
const U_MAX = 0.703;
const V_MIN = 0.275;
const V_MAX = 0.671;
const COLUMNS = 72;
const ROWS = 72;
const clamp = THREE.MathUtils.clamp;

/**
 * UVs identify the actual cheeks, chin and upper lip on the bundled scan. The
 * returned positions/normals are barycentric samples of its original triangles,
 * so every root follows the face instead of an approximate sphere/ellipsoid.
 * Replacing the licensed scan requires reauthoring these anatomical masks.
 */
function faceSampler(geometry: THREE.BufferGeometry) {
  const positions = geometry.getAttribute("position");
  const normals = geometry.getAttribute("normal");
  const uvs = geometry.getAttribute("uv");
  const index = geometry.getIndex();
  if (!positions || !normals || !uvs || !index)
    throw new Error("The beard rig requires the indexed, UV-mapped head scan.");
  const bins = new Map<string, [number, number, number][]>();
  const cell = 0.025;
  const key = (u: number, v: number) =>
    `${Math.floor(u / cell)}:${Math.floor(v / cell)}`;
  for (let i = 0; i < index.count; i += 3) {
    const ids = [index.getX(i), index.getX(i + 1), index.getX(i + 2)] as const;
    const us = ids.map((id) => uvs.getX(id));
    const vs = ids.map((id) => uvs.getY(id));
    const minU = Math.min(...us);
    const maxU = Math.max(...us);
    const minV = Math.min(...vs);
    const maxV = Math.max(...vs);
    if (minU > U_MAX || maxU < U_MIN || minV > V_MAX || maxV < V_MIN) continue;
    for (let u = Math.floor(minU / cell); u <= Math.floor(maxU / cell); u++) {
      for (let v = Math.floor(minV / cell); v <= Math.floor(maxV / cell); v++) {
        const id = `${u}:${v}`;
        if (!bins.has(id)) bins.set(id, []);
        bins.get(id)!.push([...ids]);
      }
    }
  }
  return (u: number, v: number): SurfacePoint | null => {
    for (const [a, b, c] of bins.get(key(u, v)) ?? []) {
      const au = uvs.getX(a);
      const av = uvs.getY(a);
      const bu = uvs.getX(b);
      const bv = uvs.getY(b);
      const cu = uvs.getX(c);
      const cv = uvs.getY(c);
      const denominator = (bv - cv) * (au - cu) + (cu - bu) * (av - cv);
      if (Math.abs(denominator) < 1e-12) continue;
      const wa = ((bv - cv) * (u - cu) + (cu - bu) * (v - cv)) / denominator;
      const wb = ((cv - av) * (u - cu) + (au - cu) * (v - cv)) / denominator;
      const wc = 1 - wa - wb;
      if (wa < -0.00001 || wb < -0.00001 || wc < -0.00001) continue;
      const position = new THREE.Vector3();
      const normal = new THREE.Vector3();
      for (const [id, weight] of [
        [a, wa],
        [b, wb],
        [c, wc],
      ]) {
        position.x += positions.getX(id) * weight;
        position.y += positions.getY(id) * weight;
        position.z += positions.getZ(id) * weight;
        normal.x += normals.getX(id) * weight;
        normal.y += normals.getY(id) * weight;
        normal.z += normals.getZ(id) * weight;
      }
      return { position, normal: normal.normalize() };
    }
    return null;
  };
}

function coverageDistance(id: BeardStyleId, u: number, v: number): number {
  const x = Math.abs(u - 0.5);
  const cheek = x / 0.187;
  const isGoatee = id === "goatee";
  const lower = isGoatee
    ? 0.322 + 0.065 * (x / 0.077) ** 1.6
    : id === "defined"
      ? 0.334 + 0.102 * cheek ** 2
      : 0.302 + 0.121 * cheek ** 1.7;
  const upper = isGoatee
    ? 0.508 + 0.021 * (x / 0.077)
    : id === "defined"
      ? 0.487 + 0.143 * cheek
      : 0.509 + 0.143 * cheek ** 0.8;
  const width = isGoatee ? 0.077 : 0.187;
  let distance = Math.min(width - x, v - lower, upper - v);

  // A curved moustache clears the nose and upper lip; a goatee additionally
  // joins it at the two corners of the mouth, leaving the lips uncovered.
  const moustache = Math.min(
    0.088 - x,
    v - (0.544 - x * 0.04),
    0.586 - x * 0.08 - v,
  );
  if (isGoatee) {
    const connector = Math.min(x - 0.054, 0.079 - x, v - 0.475, 0.555 - v);
    distance = Math.max(distance, connector);
  }
  distance = Math.max(distance, moustache);
  const lipEllipse = Math.sqrt((x / 0.069) ** 2 + ((v - 0.535) / 0.025) ** 2);
  return Math.min(distance, (lipEllipse - 1) * 0.035);
}

function coverage(id: BeardStyleId, u: number, v: number): number {
  return THREE.MathUtils.smoothstep(
    coverageDistance(id, u, v),
    0,
    id === "defined" ? 0.004 : 0.009,
  );
}

function extrude(
  sample: SurfacePoint,
  u: number,
  v: number,
  edge: number,
  preset: BeardPreset,
) {
  const chin = clamp((0.49 - v) / 0.11, 0, 1);
  const center = Math.max(0, 1 - Math.abs(u - 0.5) / 0.21);
  const fullness = 0.38 + 0.62 * center;
  // Narrow moustache, fuller chin, and a soft attachment edge at the cheek.
  const upperLip = v > 0.53 && Math.abs(u - 0.5) < 0.1;
  const depth =
    0.005 + preset.thickness * fullness * (upperLip ? 0.5 : 1) * edge;
  const point = sample.position.clone().addScaledVector(sample.normal, depth);
  point.y -= preset.drop * chin * fullness * edge;
  point.z += preset.drop * 0.1 * chin * center * edge;
  return point;
}

function randomSequence(seed: number) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

/** Original procedural additions; the underlying CC-BY scan stays unmodified. */
export function createBeardVariants(head: THREE.Mesh): {
  group: THREE.Group;
  setStyle: (id: BeardStyleId) => void;
  dispose: () => void;
} {
  const group = new THREE.Group();
  group.name = "chair-beard-variants";
  const sampleFace = faceSampler(head.geometry);
  const surface: (SurfacePoint | null)[] = [];
  for (let row = 0; row <= ROWS; row++) {
    for (let column = 0; column <= COLUMNS; column++) {
      surface.push(
        sampleFace(
          THREE.MathUtils.lerp(U_MIN, U_MAX, column / COLUMNS),
          THREE.MathUtils.lerp(V_MIN, V_MAX, row / ROWS),
        ),
      );
    }
  }
  const material = new THREE.MeshStandardMaterial({
    color: 0x493329,
    vertexColors: true,
    roughness: 0.94,
    side: THREE.DoubleSide,
  });
  const strandMaterial = new THREE.MeshStandardMaterial({
    color: 0x34241c,
    roughness: 0.88,
  });
  const strandGeometry = new THREE.ConeGeometry(1, 1, 3, 1);
  const geometries: THREE.BufferGeometry[] = [strandGeometry];
  const variants = new Map<BeardStyleId, THREE.Group>();
  const axis = new THREE.Vector3(0, 1, 0);
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();

  for (const id of BEARD_STYLE_IDS) {
    const variant = new THREE.Group();
    variant.name = `beard-${id}`;
    variant.visible = false;
    variants.set(id, variant);
    group.add(variant);
    if (id === "clean-shaven") continue;
    const preset = PRESETS[id];
    const random = randomSequence(1947 + BEARD_STYLE_IDS.indexOf(id) * 117);
    // Stubble consists of individual short hairs only. A translucent solid
    // surface reads as painted skin under the studio's warm lighting.
    if (id !== "stubble") {
      const vertices: number[] = [];
      const uvCoordinates: number[] = [];
      const colors: number[] = [];
      const distances: number[] = [];
      const indices: number[] = [];
      const boundaryVertices = new Map<string, number>();
      function appendVertex(u: number, v: number, sample: SurfacePoint | null) {
        const edge = coverage(id, u, v);
        const distance = sample ? coverageDistance(id, u, v) : -1;
        const index = distances.length;
        distances.push(distance);
        const point = sample
          ? extrude(sample, u, v, edge, preset)
          : new THREE.Vector3();
        vertices.push(point.x, point.y, point.z);
        uvCoordinates.push(u, v);
        const grain = 0.72 + random() * 0.3;
        colors.push(grain, grain, grain);
        return index;
      }
      for (let row = 0; row <= ROWS; row++) {
        for (let column = 0; column <= COLUMNS; column++) {
          const u = THREE.MathUtils.lerp(U_MIN, U_MAX, column / COLUMNS);
          const v = THREE.MathUtils.lerp(V_MIN, V_MAX, row / ROWS);
          const sample = surface[row * (COLUMNS + 1) + column];
          appendVertex(u, v, sample);
        }
      }
      function boundaryVertex(a: number, b: number) {
        const key = `${Math.min(a, b)}:${Math.max(a, b)}`;
        const existing = boundaryVertices.get(key);
        if (existing !== undefined) return existing;
        let inside = distances[a] >= 0 ? a : b;
        let outside = inside === a ? b : a;
        let iu = uvCoordinates[inside * 2];
        let iv = uvCoordinates[inside * 2 + 1];
        let ou = uvCoordinates[outside * 2];
        let ov = uvCoordinates[outside * 2 + 1];
        // Search the true curved contour, retaining the visible side so no
        // triangle crosses the lip opening. Shared edge vertices keep it smooth.
        for (let iteration = 0; iteration < 12; iteration++) {
          const u = (iu + ou) / 2;
          const v = (iv + ov) / 2;
          if (coverageDistance(id, u, v) >= 0) {
            iu = u;
            iv = v;
          } else {
            ou = u;
            ov = v;
          }
        }
        const result = appendVertex(iu, iv, sampleFace(iu, iv));
        boundaryVertices.set(key, result);
        return result;
      }
      function appendTriangle(a: number, b: number, c: number) {
        const polygon: number[] = [];
        const triangle = [a, b, c];
        for (let i = 0; i < 3; i++) {
          const current = triangle[i];
          const next = triangle[(i + 1) % 3];
          if (distances[current] >= 0) polygon.push(current);
          if (distances[current] >= 0 !== distances[next] >= 0)
            polygon.push(boundaryVertex(current, next));
        }
        for (let i = 1; i < polygon.length - 1; i++)
          indices.push(polygon[0], polygon[i], polygon[i + 1]);
      }
      for (let row = 0; row < ROWS; row++) {
        for (let column = 0; column < COLUMNS; column++) {
          const a = row * (COLUMNS + 1) + column;
          const b = a + 1;
          const c = a + COLUMNS + 1;
          const d = c + 1;
          appendTriangle(a, b, c);
          appendTriangle(b, d, c);
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3),
      );
      geometry.setAttribute(
        "uv",
        new THREE.Float32BufferAttribute(uvCoordinates, 2),
      );
      geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 3),
      );
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      geometries.push(geometry);
      const shell = new THREE.Mesh(geometry, material);
      shell.name = `${id}-face-fitted-shell`;
      variant.add(shell);
    }

    // One instanced draw call adds fine, tapered strands to each cached variant.
    // The roots use the same anatomical mask and face projection as its shell.
    const strands = new THREE.InstancedMesh(
      strandGeometry,
      strandMaterial,
      preset.strands,
    );
    strands.name = `${id}-strands`;
    let count = 0;
    for (
      let attempt = 0;
      count < preset.strands && attempt < preset.strands * 25;
      attempt++
    ) {
      const u = THREE.MathUtils.lerp(U_MIN, U_MAX, random());
      const v = THREE.MathUtils.lerp(V_MIN, V_MAX, random());
      const edge = coverage(id, u, v);
      if (edge < 0.5) continue;
      const sample = sampleFace(u, v);
      if (!sample) continue;
      const root = extrude(sample, u, v, edge, preset);
      const direction = new THREE.Vector3(
        (u - 0.5) * 1.4 + (random() - 0.5) * 0.2,
        -1,
        0.1,
      )
        .addScaledVector(sample.normal, id === "stubble" ? 1.6 : 0.45)
        .normalize();
      const length = preset.strandLength * (0.65 + random() * 0.7);
      root.addScaledVector(direction, length * 0.44);
      quaternion.setFromUnitVectors(axis, direction);
      const radius =
        (id === "stubble" ? 0.005 : 0.006) * (0.65 + random() * 0.7);
      scale.set(radius, length, radius);
      matrix.compose(root, quaternion, scale);
      strands.setMatrixAt(count, matrix);
      count++;
    }
    strands.count = count;
    strands.instanceMatrix.needsUpdate = true;
    strands.computeBoundingSphere();
    variant.add(strands);
  }

  let disposed = false;
  function setStyle(id: BeardStyleId) {
    if (disposed) return;
    const selected = variants.has(id) ? id : "clean-shaven";
    for (const [key, variant] of variants) variant.visible = key === selected;
    group.userData.styleId = selected;
  }
  setStyle("stubble");
  return {
    group,
    setStyle,
    dispose() {
      if (disposed) return;
      disposed = true;
      group.removeFromParent();
      for (const variant of variants.values()) {
        variant.traverse((object) => {
          if (object instanceof THREE.InstancedMesh) object.dispose();
        });
      }
      for (const geometry of geometries) geometry.dispose();
      material.dispose();
      strandMaterial.dispose();
      group.clear();
    },
  };
}
