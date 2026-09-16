import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { HAIR_STYLE_IDS } from "../lib/style-selection";

type HairShape = {
  side: number;
  back: number;
  top: number;
  sideLength: number;
  sweep: number;
  fringe?: number;
  quiff?: boolean;
  curls?: boolean;
  long?: boolean;
  textured?: boolean;
};

// These authored proportions describe illustrative cuts, not a simulated salon result.
const SHAPES: Record<string, HairShape> = {
  "skin-fade": {
    side: 1.27,
    back: 1.49,
    top: 0.33,
    sideLength: 0.015,
    sweep: 0.2,
  },
  "low-fade": {
    side: 1.72,
    back: 1.93,
    top: 0.25,
    sideLength: 0.055,
    sweep: -0.12,
  },
  "mid-fade": {
    side: 1.47,
    back: 1.7,
    top: 0.44,
    sideLength: 0.035,
    sweep: 0.1,
  },
  "taper-fade": {
    side: 1.76,
    back: 1.94,
    top: 0.5,
    sideLength: 0.1,
    sweep: 0.3,
  },
  "buzz-cut": {
    side: 1.77,
    back: 1.99,
    top: 0.045,
    sideLength: 0.025,
    sweep: 0,
  },
  "french-crop": {
    side: 1.45,
    back: 1.69,
    top: 0.2,
    sideLength: 0.03,
    sweep: 0,
    fringe: 0.32,
  },
  "textured-crop": {
    side: 1.54,
    back: 1.78,
    top: 0.4,
    sideLength: 0.075,
    sweep: -0.08,
    fringe: 0.21,
    textured: true,
  },
  pompadour: {
    side: 1.71,
    back: 1.91,
    top: 0.8,
    sideLength: 0.09,
    sweep: 0.06,
    quiff: true,
  },
  "classic-scissor-cut": {
    side: 1.87,
    back: 2.05,
    top: 0.37,
    sideLength: 0.17,
    sweep: 0.38,
  },
  "curly-hair": {
    side: 1.74,
    back: 1.95,
    top: 0.42,
    sideLength: 0.16,
    sweep: 0,
    curls: true,
  },
  "long-hair": {
    side: 1.92,
    back: 2.25,
    top: 0.27,
    sideLength: 0.25,
    sweep: 0,
    long: true,
  },
};
const CENTER = new THREE.Vector3(0, 1.8, -0.2);
const TAU = Math.PI * 2;
const clamp = THREE.MathUtils.clamp;
const smooth = THREE.MathUtils.smoothstep;

/**
 * Fitted to the local coordinates of the bundled scan. A shared radial surface
 * field follows the actual skull instead of placing a generic sphere over it.
 * Attach the returned group as a child of the scan to inherit its transform.
 */
export function createHairVariants(head: THREE.Mesh) {
  const group = new THREE.Group();
  group.name = "hair-variants";
  const geometries = new Set<THREE.BufferGeometry>();
  // Fine authored fiber relief complements the silhouette geometry without
  // requiring another downloaded texture or coarse, carved-looking ridges.
  const fiberPixels = new Uint8Array(256 * 128 * 4);
  for (let y = 0; y < 128; y++) {
    for (let x = 0; x < 256; x++) {
      const flow = x + Math.sin(y * 0.045) * 2.8;
      const fiber =
        Math.sin(flow * 2.7) * 17 + Math.sin(flow * 5.3 + y * 0.014) * 8;
      const value = Math.round(128 + fiber);
      const offset = (y * 256 + x) * 4;
      fiberPixels[offset] =
        fiberPixels[offset + 1] =
        fiberPixels[offset + 2] =
          value;
      fiberPixels[offset + 3] = 255;
    }
  }
  const fiberTexture = new THREE.DataTexture(
    fiberPixels,
    256,
    128,
    THREE.RGBAFormat,
  );
  fiberTexture.wrapS = THREE.RepeatWrapping;
  fiberTexture.wrapT = THREE.RepeatWrapping;
  fiberTexture.magFilter = THREE.LinearFilter;
  fiberTexture.minFilter = THREE.LinearMipmapLinearFilter;
  fiberTexture.generateMipmaps = true;
  fiberTexture.needsUpdate = true;
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    bumpMap: fiberTexture,
    bumpScale: 0.026,
  });
  const lockMaterial = new THREE.MeshStandardMaterial({
    color: 0x251b15,
    roughness: 0.82,
    metalness: 0,
  });
  const curlMaterial = new THREE.MeshStandardMaterial({
    color: 0x211912,
    roughness: 0.92,
    metalness: 0,
  });

  // The temporary proxy avoids mutating the original skin material or transforms.
  const proxyMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  // Ignore shoulders and lower face before raycasting the crown. They cannot
  // contribute to a scalp hit, and pruning them keeps setup responsive.
  const scanPositions = head.geometry.getAttribute("position");
  const scanIndex = head.geometry.index;
  const scalpIndices: number[] = [];
  const count = scanIndex?.count ?? scanPositions.count;
  for (let i = 0; i < count; i += 3) {
    const a = scanIndex ? scanIndex.getX(i) : i;
    const b = scanIndex ? scanIndex.getX(i + 1) : i + 1;
    const c = scanIndex ? scanIndex.getX(i + 2) : i + 2;
    if (
      Math.max(
        scanPositions.getY(a),
        scanPositions.getY(b),
        scanPositions.getY(c),
      ) > 0.3
    )
      scalpIndices.push(a, b, c);
  }
  const scalpGeometry = new THREE.BufferGeometry();
  scalpGeometry.setAttribute("position", scanPositions);
  scalpGeometry.setIndex(scalpIndices);
  const proxy = new THREE.Mesh(scalpGeometry, proxyMaterial);
  const ray = new THREE.Raycaster();
  const direction = new THREE.Vector3();
  const polarSteps = 28;
  const azimuthSteps = 48;
  const maxPolar = 2.32;
  const radii = new Float32Array((polarSteps + 1) * azimuthSteps);
  for (let row = 0; row <= polarSteps; row++) {
    const theta = (row / polarSteps) * maxPolar;
    for (let column = 0; column < azimuthSteps; column++) {
      const phi = (column / azimuthSteps) * TAU;
      direction.set(
        Math.sin(theta) * Math.sin(phi),
        Math.cos(theta),
        Math.sin(theta) * Math.cos(phi),
      );
      ray.set(
        CENTER.clone().addScaledVector(direction, 8),
        direction.clone().negate(),
      );
      const hit = ray.intersectObject(proxy, false)[0];
      radii[row * azimuthSteps + column] = hit
        ? hit.point.distanceTo(CENTER)
        : 2;
    }
  }
  proxyMaterial.dispose();
  scalpGeometry.dispose();

  function surface(theta: number, phi: number) {
    const row = clamp(theta / maxPolar, 0, 1) * polarSteps;
    const column = ((((phi / TAU) % 1) + 1) % 1) * azimuthSteps;
    const r0 = Math.floor(row),
      r1 = Math.min(polarSteps, r0 + 1);
    const c0 = Math.floor(column),
      c1 = (c0 + 1) % azimuthSteps;
    const radius = THREE.MathUtils.lerp(
      THREE.MathUtils.lerp(
        radii[r0 * azimuthSteps + c0],
        radii[r0 * azimuthSteps + c1],
        column - c0,
      ),
      THREE.MathUtils.lerp(
        radii[r1 * azimuthSteps + c0],
        radii[r1 * azimuthSteps + c1],
        column - c0,
      ),
      row - r0,
    );
    return new THREE.Vector3(
      Math.sin(theta) * Math.sin(phi),
      Math.cos(theta),
      Math.sin(theta) * Math.cos(phi),
    )
      .multiplyScalar(radius)
      .add(CENTER);
  }
  function boundary(shape: HairShape, phi: number) {
    const front = Math.cos(phi);
    const hairline =
      1.15 +
      0.025 * Math.cos(phi * 3) +
      0.009 * Math.sin(phi * 39) +
      0.006 * Math.sin(phi * 71);
    return front > 0
      ? THREE.MathUtils.lerp(shape.side, hairline, Math.pow(front, 4))
      : THREE.MathUtils.lerp(shape.side, shape.back, -front);
  }
  function height(shape: HairShape, theta: number, phi: number) {
    const top = smooth(Math.cos(theta), 0.02, 0.9);
    const edge = boundary(shape, phi) - theta;
    const taper = smooth(edge, 0, shape.sideLength < 0.08 ? 0.29 : 0.14);
    const frontPeak = shape.quiff
      ? 0.34 *
        Math.exp(-((theta - 0.73) ** 2) / 0.22) *
        Math.max(0, Math.cos(phi))
      : 0;
    const part = shape.long
      ? 0.12 *
        Math.exp(-((Math.sin(phi) / 0.18) ** 2)) *
        Math.max(0, Math.cos(phi))
      : 0;
    const ridge =
      shape.top > 0.08
        ? (Math.sin(phi * 32 + theta * 7) +
            Math.sin(phi * 57 - theta * 11) * 0.4) *
          0.0025 *
          top
        : 0;
    return (
      0.016 +
      Math.max(
        0,
        THREE.MathUtils.lerp(shape.sideLength, shape.top, top) +
          frontPeak +
          ridge -
          part,
      ) *
        taper
    );
  }
  function hairPoint(shape: HairShape, theta: number, phi: number) {
    const point = surface(theta, phi);
    const normal = point.clone().sub(CENTER).normalize();
    const top = Math.max(0, Math.cos(theta));
    point.addScaledVector(normal, height(shape, theta, phi));
    point.x += shape.sweep * top * top;
    return point;
  }
  function keep(geometry: THREE.BufferGeometry) {
    geometries.add(geometry);
    return geometry;
  }
  function addMerged(
    parent: THREE.Group,
    pieces: THREE.BufferGeometry[],
    selectedMaterial = lockMaterial,
  ) {
    if (!pieces.length) return;
    const geometry = mergeGeometries(pieces, false);
    pieces.forEach((piece) => piece.dispose());
    if (geometry) parent.add(new THREE.Mesh(keep(geometry), selectedMaterial));
  }
  function tube(
    points: THREE.Vector3[],
    radius: number,
    segments = 7,
    sides = 5,
  ) {
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(
      curve,
      segments,
      radius,
      sides,
      false,
    );
    // Taper the ends of each lock so they lie into the shell without blunt cylinders.
    const positions = geometry.getAttribute("position");
    for (let ring = 0; ring <= segments; ring++) {
      const center = curve.getPointAt(ring / segments);
      const taper =
        0.2 + 0.8 * Math.sin(Math.PI * (0.09 + (0.82 * ring) / segments));
      for (let side = 0; side <= sides; side++) {
        const i = ring * (sides + 1) + side;
        positions.setXYZ(
          i,
          center.x + (positions.getX(i) - center.x) * taper,
          center.y + (positions.getY(i) - center.y) * taper,
          center.z + (positions.getZ(i) - center.z) * taper,
        );
      }
    }
    geometry.computeVertexNormals();
    return geometry;
  }

  for (const id of HAIR_STYLE_IDS) {
    const shape = SHAPES[id];
    if (!shape) continue;
    const variant = new THREE.Group();
    variant.name = id;
    variant.userData.styleId = id;
    variant.visible = false;
    const positions: number[] = [],
      colors: number[] = [],
      uvs: number[] = [],
      indices: number[] = [];
    const rings = 28,
      columns = 112;
    const hair = new THREE.Color(0x211912);
    for (let row = 0; row <= rings; row++) {
      for (let column = 0; column <= columns; column++) {
        const phi = (column / columns) * TAU;
        const edge = boundary(shape, phi);
        const theta = (row / rings) * edge;
        const point = hairPoint(shape, theta, phi);
        positions.push(point.x, point.y, point.z);
        const front = Math.max(0, Math.cos(phi));
        const fadeSpan =
          shape.sideLength < 0.08
            ? THREE.MathUtils.lerp(0.4, 0.055, Math.pow(front, 8))
            : 0.055;
        const alpha = smooth(edge - theta, 0, fadeSpan);
        const color = hair
          .clone()
          .multiplyScalar(0.975 + 0.025 * Math.sin(phi * 43 + theta * 9));
        colors.push(color.r, color.g, color.b, alpha);
        uvs.push((column / columns) * 3, theta / maxPolar);
        if (row < rings && column < columns) {
          const a = row * (columns + 1) + column;
          indices.push(
            a,
            a + columns + 1,
            a + 1,
            a + 1,
            a + columns + 1,
            a + columns + 2,
          );
        }
      }
    }
    const shell = keep(new THREE.BufferGeometry());
    shell.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    shell.setAttribute("color", new THREE.Float32BufferAttribute(colors, 4));
    shell.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    shell.setIndex(indices);
    shell.computeVertexNormals();
    variant.add(new THREE.Mesh(shell, material));
    const locks: THREE.BufferGeometry[] = [];

    if (shape.curls) {
      // Small offset spirals follow the fitted roots: recognizable curls from any yaw.
      for (let row = 0; row < 8; row++) {
        const theta = 0.16 + row * 0.19;
        const count = Math.max(7, Math.round(Math.sin(theta) * 45));
        for (let i = 0; i < count; i++) {
          const phi = ((i + row * 0.37) / count) * TAU;
          if (theta > boundary(shape, phi) - 0.09) continue;
          const root = hairPoint(shape, theta, phi);
          const normal = root.clone().sub(CENTER).normalize();
          const side = new THREE.Vector3(Math.cos(phi), 0, -Math.sin(phi));
          const up = new THREE.Vector3().crossVectors(normal, side).normalize();
          const radius = 0.075 + 0.027 * (1 + Math.sin(i * 7 + row * 3));
          const points = Array.from({ length: 9 }, (_, j) => {
            const angle = (j / 8) * Math.PI * 2.1;
            return root
              .clone()
              .addScaledVector(side, Math.cos(angle) * radius)
              .addScaledVector(up, Math.sin(angle) * radius)
              .addScaledVector(
                normal,
                0.03 + Math.sin((j / 8) * Math.PI) * 0.105,
              );
          });
          locks.push(tube(points, 0.037, 9, 5));
        }
      }
    } else if (shape.long) {
      // A center part feeds curtain locks around the temples and down the back.
      for (let i = 0; i < 60; i++) {
        const phi = 0.36 + (i / 59) * (TAU - 0.72);
        const back = Math.max(0, -Math.cos(phi));
        const sign = Math.sin(phi) >= 0 ? 1 : -1;
        const start = hairPoint(shape, 0.28 + (i % 3) * 0.14, phi);
        const shoulder = hairPoint(shape, 1.22, phi);
        const edge = hairPoint(shape, boundary(shape, phi) - 0.03, phi);
        const end = edge
          .clone()
          .add(
            new THREE.Vector3(
              sign * (0.22 + back * 0.08),
              -1.0 - back * 0.5,
              -0.08,
            ),
          );
        shoulder.x += sign * 0.06;
        edge.x += sign * 0.12;
        locks.push(
          tube([start, shoulder, edge, end], 0.06 + (i % 4) * 0.008, 12, 5),
        );
      }
      for (const sign of [-1, 1]) {
        for (let i = 0; i < 12; i++) {
          const phi = sign * (0.11 + i * 0.044);
          const top = hairPoint(shape, 0.4 + i * 0.035, phi);
          const temple = hairPoint(shape, 1.2, sign * (0.62 + i * 0.025));
          const tip = hairPoint(shape, 1.8, sign * 1.15).add(
            new THREE.Vector3(sign * 0.22, -0.8, 0),
          );
          locks.push(tube([top, temple, tip], 0.06, 10, 5));
        }
      }
    } else if (id !== "buzz-cut") {
      // Staggered roots avoid visible rows. Hundreds of shallow fine locks read
      // as combed hair instead of a handful of thick grooves around the crown.
      const count = shape.textured ? 195 : 280;
      for (let i = 0; i < count; i++) {
        const theta = 0.1 + Math.sqrt((i + 0.5) / count) * 0.99;
        const phi = i * 2.399963229728653;
        const front = Math.cos(phi);
        const root = hairPoint(shape, theta, phi);
        const endTheta = clamp(
          theta + (shape.quiff ? -0.36 : 0.29),
          0.055,
          boundary(shape, phi) - 0.035,
        );
        const tip = hairPoint(shape, endTheta, phi + shape.sweep * 0.45);
        const middle = root.clone().lerp(tip, 0.5);
        const normal = root.clone().sub(CENTER).normalize();
        middle.addScaledVector(
          normal,
          shape.textured ? 0.045 + 0.018 * Math.sin(i * 5) : 0.006,
        );
        if (shape.quiff && front > 0) middle.y += 0.045 * front;
        if (shape.textured)
          tip.addScaledVector(normal, 0.025 * Math.sin(i * 9));
        locks.push(
          tube([root, middle, tip], shape.textured ? 0.031 : 0.014, 5, 3),
        );
      }
    }
    if (shape.fringe) {
      for (let i = 0; i < 54; i++) {
        const phi = -0.6 + (i / 53) * 1.2;
        const theta = boundary(shape, phi);
        const root = hairPoint(shape, theta - 0.29, phi);
        const brow = surface(theta + 0.06, phi).add(
          new THREE.Vector3(0, 0, 0.09),
        );
        const tip = brow
          .clone()
          .add(
            new THREE.Vector3(
              shape.textured ? 0.045 * Math.sin(i * 3) : 0,
              -shape.fringe + (shape.textured ? 0.09 * Math.sin(i * 4) : 0),
              0.03,
            ),
          );
        locks.push(
          tube([root, brow, tip], shape.textured ? 0.038 : 0.034, 6, 5),
        );
      }
    }
    addMerged(variant, locks, shape.curls ? curlMaterial : lockMaterial);
    group.add(variant);
  }
  let disposed = false;
  function setStyle(id: string) {
    if (disposed) return;
    const selected = SHAPES[id] ? id : "skin-fade";
    group.children.forEach((child) => {
      child.visible = child.name === selected;
    });
    group.userData.activeStyleId = selected;
  }
  setStyle("skin-fade");
  return {
    group,
    setStyle,
    dispose() {
      if (disposed) return;
      disposed = true;
      geometries.forEach((geometry) => geometry.dispose());
      material.dispose();
      fiberTexture.dispose();
      lockMaterial.dispose();
      curlMaterial.dispose();
      group.removeFromParent();
    },
  };
}
