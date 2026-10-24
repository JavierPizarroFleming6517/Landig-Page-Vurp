/**
 * Entrada diferida de la escena WebGL (chunk aparte con three). Se descarga y compila mientras el splash
 * está visible; si WebGL no está disponible, `createScene` lanza y la intro queda con el planeta CSS.
 */
import { ColorManagement, LinearSRGBColorSpace, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { CAMERA, PLANET } from "../config";
import type { StageLayout } from "../layout";
import type { Vec3 } from "../orbits";
import { createExplosion } from "./explosion";
import { createPlanet, createSharedUniforms } from "./planet";

export interface SceneFrame {
  /** Segundos desde el inicio de la página. */
  time: number;
  progress: number;
  opacity: number;
  glow: number;
  /** Explosión: avance lineal de la fragmentación, de las ondas y punto de impacto (mundo). */
  shatter: number;
  burst: number;
  impact: Vec3;
  /** Zona del logo (px CSS) donde se atenúan los puntos cuando cruza por delante del disco. */
  focus: { x: number; y: number; radius: number; amount: number };
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

  const shared = createSharedUniforms();
  // El tier de puntos se fija al crear la escena (no se rehace la geometría al rotar el dispositivo).
  const planet = createPlanet(shared, layout.compact ? "compact" : "wide");
  scene.add(planet.root);
  const explosion = createExplosion();
  scene.add(explosion.group);

  let lastOpacity = -1;
  /** Momento en que el planeta empieza a verse: desde ahí corre la rotación propia, así la escena 1 parte de frente. */
  let shownAt: number | null = null;

  const setLayout = (next: StageLayout) => {
    const dpr = Math.min(window.devicePixelRatio || 1, next.compact ? PLANET.dprCap.compact : PLANET.dprCap.wide);
    renderer.setPixelRatio(dpr);
    renderer.setSize(next.width, next.height, false);
    shared.uPixelRatio.value = dpr;
    shared.uViewport.value.set(next.width, next.height);
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
    render: ({ time, progress, opacity, glow, shatter, burst, impact, focus }) => {
      // Sin nada visible (antes de la entrada o con la explosión ya disipada) basta un frame vacío.
      const visible = shatter >= 1 && burst >= 1 ? 0 : opacity;
      if (visible <= 0.001 && lastOpacity <= 0.001 && lastOpacity >= 0) return;
      lastOpacity = visible;
      if (shownAt === null && opacity > 0) shownAt = time;
      shared.uTime.value = time;
      shared.uOpacity.value = visible;
      shared.uGlow.value = glow;
      shared.uShatter.value = shatter;
      shared.uImpact.value.set(impact.x, impact.y, impact.z);
      shared.uFocus.value.set(focus.x, focus.y);
      shared.uFocusRadius.value = focus.radius;
      shared.uFocusAmount.value = focus.amount;
      planet.spin.rotation.y = planet.baseSpin + (time - (shownAt ?? time)) * PLANET.spinSpeed + progress * PLANET.scrollTurn;
      planet.orbits.scale.setScalar(1 + (1 - Math.pow(1 - shatter, 3)) * 0.5);
      explosion.update(burst, impact);
      renderer.render(scene, camera);
    },
    pixelRatio: () => renderer.getPixelRatio(),
    dispose: () => {
      planet.dispose();
      explosion.dispose();
      renderer.dispose();
    },
  };
}
