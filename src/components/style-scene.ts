import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import {
  DEFAULT_STYLE_SELECTION,
  type StyleSelection,
} from "@/lib/style-selection";
import { createHairVariants } from "./style-hair-variants";
import { createBeardVariants } from "./style-beard-variants";

export type StyleCategory = "hair" | "beard";
export type StyleScene = {
  setCategory: (category: StyleCategory) => void;
  setSelection: (selection: StyleSelection) => void;
  rotate: (direction: number) => void;
  reset: () => void;
  dispose: () => void;
};

/** Local scan with fitted, cached hair and beard child groups. */
const MODEL = "/models/lee-perry-smith/";
const clamp = THREE.MathUtils.clamp;

export function createStyleScene(
  host: HTMLDivElement,
  options: {
    onReady: () => void;
    onError: () => void;
    onHotspot: (
      category: StyleCategory,
      xPercent: number,
      yPercent: number,
    ) => void;
  },
): StyleScene {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      window.innerWidth < 768 ? 1.25 : 1.5,
    ),
  );
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
  camera.position.set(0, 0.5, 17.75);
  camera.lookAt(0, 0.45, 0);
  const portrait = new THREE.Group();
  portrait.rotation.y = -0.12;
  scene.add(portrait);
  scene.add(new THREE.HemisphereLight(0xffe5c0, 0x161914, 0.8));
  const key = new THREE.DirectionalLight(0xffdec0, 2.5);
  key.position.set(-6, 8, 9);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd5e2e3, 0.5);
  fill.position.set(7, 0, 6);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xe5b56e, 3.3);
  rim.position.set(3, 5, -5);
  scene.add(rim);
  const zoneLight = new THREE.PointLight(0xe5b975, 9, 16, 2);
  zoneLight.position.set(-1, 5, 4);
  portrait.add(zoneLight);

  let disposed = false;
  let failed = false;
  let loaded = false;
  let inView = true;
  let frame = 0;
  let width = 1;
  let height = 1;
  let baseYaw = -0.12;
  let targetYaw = baseYaw;
  let targetPitch = 0;
  let introStart = 0;
  let category: StyleCategory = "hair";
  let selection = DEFAULT_STYLE_SELECTION;
  let hair: ReturnType<typeof createHairVariants> | undefined;
  let beard: ReturnType<typeof createBeardVariants> | undefined;
  function setSelection(next: StyleSelection) {
    selection = next;
    hair?.setStyle(next.hairStyleId);
    beard?.setStyle(next.beardStyleId);
    requestFrame();
  }
  let pointer: {
    id: number;
    x: number;
    y: number;
    yaw: number;
    dragging: boolean;
  } | null = null;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const textures: THREE.Texture[] = [];
  const vector = new THREE.Vector3();
  const anchors: Record<StyleCategory, THREE.Vector3> = {
    hair: new THREE.Vector3(-1.2, 3.25, 1.6),
    beard: new THREE.Vector3(0.6, -0.2, 1.95),
  };

  function requestFrame() {
    if (!frame && !disposed && !failed && inView && !document.hidden)
      frame = requestAnimationFrame(render);
  }
  function render(now: number) {
    frame = 0;
    if (disposed || failed || !inView || document.hidden) return;
    const factor = reducedMotion.matches ? 1 : 0.16;
    portrait.rotation.y += (targetYaw - portrait.rotation.y) * factor;
    portrait.rotation.x += (targetPitch - portrait.rotation.x) * factor;
    const progress =
      !loaded || reducedMotion.matches
        ? 1
        : Math.min(1, (now - introStart) / 700);
    camera.position.z = 17.75 + (1 - progress) * 1.2;
    renderer.render(scene, camera);
    for (const name of ["hair", "beard"] as const) {
      vector.copy(anchors[name]);
      portrait.localToWorld(vector);
      vector.project(camera);
      options.onHotspot(
        name,
        (vector.x * 0.5 + 0.5) * 100,
        (-vector.y * 0.5 + 0.5) * 100,
      );
    }
    if (
      progress < 1 ||
      Math.abs(targetYaw - portrait.rotation.y) > 0.0005 ||
      Math.abs(targetPitch - portrait.rotation.x) > 0.0005
    )
      requestFrame();
  }
  function resize() {
    width = Math.max(1, host.clientWidth);
    height = Math.max(1, host.clientHeight);
    camera.aspect = width / height;
    // Keep the head inside narrow phone viewports while retaining a large portrait.
    camera.fov = width / height < 0.8 ? 39 : 34;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    requestFrame();
  }
  function setCategory(next: StyleCategory) {
    category = next;
    zoneLight.position.set(
      next === "hair" ? -1 : 1,
      next === "hair" ? 5 : 0.5,
      4,
    );
    zoneLight.intensity = next === "hair" ? 9 : 7;
    requestFrame();
  }
  function rotate(direction: number) {
    baseYaw = clamp(baseYaw + direction * 0.22, -0.65, 0.65);
    targetYaw = baseYaw;
    targetPitch = 0;
    requestFrame();
  }
  function reset() {
    baseYaw = -0.12;
    targetYaw = baseYaw;
    targetPitch = 0;
    requestFrame();
  }
  function down(event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0) return;
    pointer = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      yaw: baseYaw,
      dragging: false,
    };
    // Capture only after horizontal intent; touch-action: pan-y preserves page scrolling.
  }
  function move(event: PointerEvent) {
    // A mouse release outside the host can arrive before we capture the pointer.
    if (event.pointerType === "mouse" && event.buttons === 0 && pointer)
      up(event);
    if (pointer && pointer.id === event.pointerId) {
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      if (
        !pointer.dragging &&
        Math.abs(dx) > 7 &&
        Math.abs(dx) > Math.abs(dy)
      ) {
        pointer.dragging = true;
        host.setPointerCapture(event.pointerId);
      }
      if (pointer.dragging) {
        baseYaw = clamp(pointer.yaw + dx * 0.004, -0.65, 0.65);
        targetYaw = baseYaw;
        targetPitch = clamp(dy * 0.001, -0.09, 0.09);
      }
    } else if (event.pointerType === "mouse" && !reducedMotion.matches) {
      const rect = host.getBoundingClientRect();
      targetYaw = clamp(
        baseYaw + ((event.clientX - rect.left) / width - 0.5) * 0.2,
        -0.65,
        0.65,
      );
      targetPitch = clamp(
        ((event.clientY - rect.top) / height - 0.5) * 0.08,
        -0.09,
        0.09,
      );
    }
    requestFrame();
  }
  function up(event: PointerEvent) {
    if (pointer?.id !== event.pointerId) return;
    if (host.hasPointerCapture(event.pointerId))
      host.releasePointerCapture(event.pointerId);
    pointer = null;
    targetPitch = 0;
    requestFrame();
  }
  function leave() {
    // Before horizontal intent, leaving the host also ends this pending drag.
    if (pointer && !pointer.dragging) pointer = null;
    if (!pointer) {
      targetYaw = baseYaw;
      targetPitch = 0;
      requestFrame();
    }
  }
  function fail(event?: Event) {
    event?.preventDefault();
    if (disposed || failed) return;
    failed = true;
    cancelAnimationFrame(frame);
    frame = 0;
    options.onError();
  }
  function visibility() {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else requestFrame();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) requestFrame();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });
  visibilityObserver.observe(host);
  host.addEventListener("pointerdown", down);
  host.addEventListener("pointermove", move);
  host.addEventListener("pointerup", up);
  host.addEventListener("pointercancel", up);
  host.addEventListener("pointerleave", leave);
  renderer.domElement.addEventListener("webglcontextlost", fail);
  document.addEventListener("visibilitychange", visibility);
  reducedMotion.addEventListener("change", requestFrame);
  resize();

  function disposeObject(object: THREE.Object3D) {
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.geometry.dispose();
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];
      materials.forEach((material) => material.dispose());
    });
  }
  const textureLoader = new THREE.TextureLoader();
  function loadTexture(path: string) {
    return new Promise<THREE.Texture>((resolve, reject) => {
      const texture = textureLoader.load(
        MODEL + path,
        resolve,
        undefined,
        reject,
      );
      textures.push(texture);
    });
  }
  // The upstream example supplies these two textures separately from the GLB.
  Promise.all([
    new GLTFLoader().loadAsync(MODEL + "LeePerrySmith.glb").then((gltf) => {
      if (disposed || failed) {
        disposeObject(gltf.scene);
        return null;
      }
      portrait.add(gltf.scene);
      return gltf.scene;
    }),
    loadTexture("Map-COL.jpg"),
    loadTexture("Infinite-Level_02_Tangent_SmoothUV.jpg"),
  ])
    .then(([model, color, normal]) => {
      if (disposed || failed || !model) {
        textures.forEach((texture) => texture.dispose());
        return;
      }
      color.colorSpace = THREE.SRGBColorSpace;
      const material = new THREE.MeshStandardMaterial({
        map: color,
        normalMap: normal,
        normalScale: new THREE.Vector2(0.65, 0.65),
        roughness: 0.8,
      });
      let head: THREE.Mesh | undefined;
      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const old = Array.isArray(child.material)
          ? child.material
          : [child.material];
        old.forEach((item) => item.dispose());
        child.material = material;
        head ??= child;
      });
      if (!head) throw new Error("Head mesh missing");
      // Build only once, after assigning the scan material. Child transforms follow
      // the scan exactly; later choices only toggle the cached groups' visibility.
      hair = createHairVariants(head);
      beard = createBeardVariants(head);
      head.add(hair.group, beard.group);
      // Fit each projected control to a real surface vertex, including any GLB
      // node transform. A point floating in front of the jaw drifts on rotation.
      const positions = head.geometry.getAttribute("position");
      const normals = head.geometry.getAttribute("normal");
      const sample = new THREE.Vector3();
      const surfaceNormal = new THREE.Vector3();
      for (const anchor of Object.values(anchors)) {
        let nearest = 0;
        let distance = Infinity;
        for (let index = 0; index < positions.count; index++) {
          sample.fromBufferAttribute(positions, index);
          const squared = sample.distanceToSquared(anchor);
          if (squared < distance) {
            distance = squared;
            nearest = index;
          }
        }
        anchor.fromBufferAttribute(positions, nearest);
        if (normals)
          anchor.addScaledVector(
            surfaceNormal.fromBufferAttribute(normals, nearest),
            0.03,
          );
        head.updateWorldMatrix(true, false);
        head.localToWorld(anchor);
        portrait.worldToLocal(anchor);
      }
      setSelection(selection);
      loaded = true;
      introStart = performance.now();
      setCategory(category);
      options.onReady();
      requestFrame();
    })
    .catch(() => {
      fail();
    });

  return {
    setCategory,
    setSelection,
    rotate,
    reset,
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      host.removeEventListener("pointerdown", down);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerup", up);
      host.removeEventListener("pointercancel", up);
      host.removeEventListener("pointerleave", leave);
      renderer.domElement.removeEventListener("webglcontextlost", fail);
      document.removeEventListener("visibilitychange", visibility);
      reducedMotion.removeEventListener("change", requestFrame);
      hair?.group.removeFromParent();
      hair?.dispose();
      beard?.dispose();
      disposeObject(portrait);
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
