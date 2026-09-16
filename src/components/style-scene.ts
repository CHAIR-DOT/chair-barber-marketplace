import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  STYLE_ASSET_MANIFEST,
  resolveStudioSelection,
} from "@/lib/style-assets";

import {
  DEFAULT_STYLE_SELECTION,
  type StyleSelection,
} from "@/lib/style-selection";

export type StyleCategory = "hair" | "beard";
export type StyleScene = {
  setCategory: (category: StyleCategory) => void;
  setSelection: (selection: StyleSelection) => void;
  rotate: (direction: number) => void;
  reset: () => void;
  dispose: () => void;
};

/** One local human, six registered grooming groups, no scene rebuild on selection. */
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
  let disposed = false;
  let failed = false;
  let frame = 0;
  const cleanup: (() => void)[] = [];
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    frame = 0;
    // Release every initialized resource even if a later setup step failed.
    for (const release of cleanup.reverse()) {
      try {
        release();
      } catch {
        /* Continue releasing the remaining resources. */
      }
    }
    cleanup.length = 0;
  }
  try {
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    cleanup.push(() => {
      renderer.dispose();
      renderer.domElement.remove();
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
    const viewHeight = 8.28;
    const camera = new THREE.OrthographicCamera(
      -3.3,
      3.3,
      viewHeight / 2,
      -viewHeight / 2,
      0.1,
      80,
    );
    camera.position.set(0, 0.63, 17.75);
    camera.lookAt(0, 0.63, 0);
    const portrait = new THREE.Group();
    portrait.rotation.y = -0.12;
    scene.add(portrait);
    cleanup.push(() => disposeObject(portrait));
    const pmrem = new THREE.PMREMGenerator(renderer);
    try {
      const environmentRoom = new RoomEnvironment();
      try {
        const environment = pmrem.fromScene(environmentRoom, 0.04);
        cleanup.push(() => environment.dispose());
        scene.environment = environment.texture;
      } finally {
        environmentRoom.dispose();
      }
    } finally {
      pmrem.dispose();
    }
    scene.environmentIntensity = 0.3;
    scene.add(new THREE.HemisphereLight(0xffe5c0, 0x161914, 0.4));
    const key = new THREE.DirectionalLight(0xffdec0, 1.8);
    key.position.set(-6, 8, 9);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xd5e2e3, 0.35);
    fill.position.set(7, 0, 6);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xe5b56e, 2);
    rim.position.set(3, 5, -5);
    scene.add(rim);
    let inView = true;
    let width = 1;
    let height = 1;
    let baseYaw = -0.12;
    let targetYaw = baseYaw;
    let targetPitch = 0;
    let selection = DEFAULT_STYLE_SELECTION;
    const grooming = new Map<string, THREE.Object3D>();
    cleanup.push(() => grooming.clear());
    function setSelection(next: StyleSelection) {
      selection = next;
      const visible = resolveStudioSelection(next);
      for (const entry of STYLE_ASSET_MANIFEST.hairStyles) {
        const group = grooming.get(entry.groupName);
        if (group) group.visible = entry.id === visible.hairStyleId;
      }
      for (const entry of STYLE_ASSET_MANIFEST.beardStyles) {
        const group = grooming.get(entry.groupName);
        if (group) group.visible = entry.id === visible.beardStyleId;
      }
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
    const vector = new THREE.Vector3();
    const anchors: Record<StyleCategory, THREE.Vector3> = {
      hair: new THREE.Vector3(-0.7, 3.0, 1.8),
      beard: new THREE.Vector3(0.6, -0.1, 2.1),
    };

    function requestFrame() {
      if (!frame && !disposed && !failed && inView && !document.hidden)
        frame = requestAnimationFrame(render);
    }
    function render() {
      frame = 0;
      if (disposed || failed || !inView || document.hidden) return;
      const factor = reducedMotion.matches ? 1 : 0.16;
      portrait.rotation.y += (targetYaw - portrait.rotation.y) * factor;
      portrait.rotation.x += (targetPitch - portrait.rotation.x) * factor;
      // Geometry and camera stay fixed through the poster-to-WebGL transition.
      try {
        renderer.render(scene, camera);
      } catch {
        fail();
        return;
      }
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
        Math.abs(targetYaw - portrait.rotation.y) > 0.0005 ||
        Math.abs(targetPitch - portrait.rotation.x) > 0.0005
      )
        requestFrame();
    }
    function resize() {
      width = Math.max(1, host.clientWidth);
      height = Math.max(1, host.clientHeight);
      camera.left = -((viewHeight * width) / height) / 2;
      camera.right = -camera.left;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      requestFrame();
    }
    function setCategory() {
      // Category highlights are UI-only; keep skin/groom lighting identical.
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
      dispose();
      options.onError();
    }
    function visibility() {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else requestFrame();
    }
    const resizeObserver = new ResizeObserver(resize);
    cleanup.push(() => resizeObserver.disconnect());
    resizeObserver.observe(host);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) requestFrame();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    cleanup.push(() => visibilityObserver.disconnect());
    visibilityObserver.observe(host);
    cleanup.push(() => {
      if (pointer && host.hasPointerCapture(pointer.id))
        host.releasePointerCapture(pointer.id);
      pointer = null;
      host.removeEventListener("pointerdown", down);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerup", up);
      host.removeEventListener("pointercancel", up);
      host.removeEventListener("pointerleave", leave);
      renderer.domElement.removeEventListener("webglcontextlost", fail);
      document.removeEventListener("visibilitychange", visibility);
      reducedMotion.removeEventListener("change", requestFrame);
    });
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
        materials.forEach((material) => {
          for (const value of Object.values(material)) {
            if (value instanceof THREE.Texture) {
              const bitmap = value.source?.data;
              if (
                typeof ImageBitmap !== "undefined" &&
                bitmap instanceof ImageBitmap
              )
                bitmap.close();
              value.dispose();
            }
          }
          material.dispose();
        });
      });
    }
    const manager = new THREE.LoadingManager();
    // GLTFLoader can turn a failed texture decode into null without rejecting the GLB.
    manager.onError = () => fail();
    const loader = new GLTFLoader(manager).setMeshoptDecoder(MeshoptDecoder);
    loader
      .loadAsync(STYLE_ASSET_MANIFEST.model.src)
      .then(async ({ scene: model, parser }) => {
        if (disposed || failed) {
          disposeObject(model);
          return;
        }
        model.scale.setScalar(18);
        model.position.set(0, -1.39 * 18, -0.4);
        portrait.add(model);
        const textures: unknown[] = await parser.getDependencies("texture");
        if (disposed || failed) {
          // The model may finish after timeout, a mode change, or a texture error.
          disposeObject(model);
          model.removeFromParent();
          return;
        }
        if (
          !textures.length ||
          textures.some(
            (texture) =>
              !(texture instanceof THREE.Texture) || !texture.source.data,
          )
        )
          throw new Error("Required portrait texture did not decode");
        for (const entry of [
          ...STYLE_ASSET_MANIFEST.hairStyles,
          ...STYLE_ASSET_MANIFEST.beardStyles,
        ]) {
          const group = model.getObjectByName(entry.groupName);
          if (!group || !group.children.length)
            throw new Error("Required grooming group is missing");
          grooming.set(entry.groupName, group);
        }
        model.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];
          for (const material of materials) {
            if (material instanceof THREE.MeshStandardMaterial) {
              const materialIndex =
                parser.associations.get(material)?.materials;
              const definition =
                materialIndex === undefined
                  ? undefined
                  : parser.json.materials?.[materialIndex];
              if (
                (definition?.pbrMetallicRoughness?.baseColorTexture &&
                  !material.map) ||
                (definition?.normalTexture && !material.normalMap)
              )
                throw new Error(
                  "Required portrait material texture is missing",
                );
              material.envMapIntensity = 0.3;
              if (material.alphaTest > 0) material.alphaToCoverage = true;
            }
          }
        });
        setSelection(selection);
        renderer.render(scene, camera);
        options.onReady();
        requestFrame();
      })
      .catch(() => fail());

    return {
      setCategory,
      setSelection,
      rotate,
      reset,
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
