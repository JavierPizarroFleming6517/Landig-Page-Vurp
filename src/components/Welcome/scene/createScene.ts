/**
 * Entrada diferida de la escena WebGL (chunk aparte con three). Se descarga y compila mientras el splash
 * está visible; si WebGL no está disponible, `createScene` lanza y la intro queda con el planeta CSS.
 */
import { ColorManagement, LinearSRGBColorSpace, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { CAMERA, PLANET } from "../config";
import type { StageLayout } from "../layout";
import { createPlanet, type SharedUniforms } from "./planet";

export interface SceneFrame {
  /** Segundos desde el inicio de la página. */
  time: number;
  progress: number;
  opacity: number;
  glow: number;
}

export interface SceneController {
  setLayout: (layout: StageLayout) => void;
  render: (frame: SceneFrame) => void;
  pixelRatio: () => number;
  dispose: () => void;
}

// Los colores de los shaders se escriben en sRGB, igual que en el CSS, sin conversión a espacio lineal.
ColorManagement.enabled = false;

export function createScene(canvas: HTMLCanvasElement, layout: StageLayout): SceneController {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: window.devicePixelRatio < 2,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = LinearSRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA.distance);

  const shared: SharedUniforms = {
    uTime: { value: 0 },
    uOpacity: { value: 0 },
    uGlow: { value: 0 },
    uPixelRatio: { value: 1 },
  };
  // El tier de puntos se fija al crear la escena (no se rehace la geometría al rotar el dispositivo).
  const planet = createPlanet(shared, layout.compact ? "compact" : "wide");
  scene.add(planet.root);

  let lastOpacity = -1;
  /** Momento en que el planeta empieza a verse: desde ahí corre la rotación propia, así la escena 1 parte de frente. */
  let shownAt: number | null = null;

  const setLayout = (next: StageLayout) => {
    const dpr = Math.min(window.devicePixelRatio || 1, next.compact ? PLANET.dprCap.compact : PLANET.dprCap.wide);
    renderer.setPixelRatio(dpr);
    renderer.setSize(next.width, next.height, false);
    shared.uPixelRatio.value = dpr;
    // Misma cámara que la proyección del DOM: foco en (cx, cy) mediante un desplazamiento de vista.
    camera.fov = next.fov;
    camera.aspect = next.width / next.height;
    camera.setViewOffset(next.width, next.height, next.width / 2 - next.cx, next.height / 2 - next.cy, next.width, next.height);
    camera.updateProjectionMatrix();
    lastOpacity = -1;
  };

  setLayout(layout);
  renderer.compile(scene, camera);

  return {
    setLayout,
    render: ({ time, progress, opacity, glow }) => {
      // Con el planeta invisible basta un frame vacío; después no se renderiza nada.
      if (opacity <= 0.001 && lastOpacity <= 0.001 && lastOpacity >= 0) return;
      lastOpacity = opacity;
      if (shownAt === null && opacity > 0) shownAt = time;
      shared.uTime.value = time;
      shared.uOpacity.value = opacity;
      shared.uGlow.value = glow;
      planet.spin.rotation.y = planet.baseSpin + (time - (shownAt ?? time)) * PLANET.spinSpeed + progress * PLANET.scrollTurn;
      renderer.render(scene, camera);
    },
    pixelRatio: () => renderer.getPixelRatio(),
    dispose: () => {
      planet.dispose();
      renderer.dispose();
    },
  };
}
