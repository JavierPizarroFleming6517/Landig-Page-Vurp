import { DEVICE, ERP, LOGO, SCENES, TIMELINE, ZOOM, type SceneRange } from "./config";
import { clamp01, easeInOutSine, easeOutCubic, lerp, lerpLog, progressIn, smoothstep } from "./easing";
import type { HeroLayout } from "./layout";

export function sceneAt(progress: number): SceneRange {
  const p = clamp01(progress);
  let current = SCENES[0];
  for (const scene of SCENES) if (p >= scene.start) current = scene;
  return current;
}

export interface Fade {
  opacity: number;
  /** Desplazamiento vertical (px). */
  y: number;
}

export interface HeroPose {
  /** Notebook: translate (px) del transform-origin, escala (≤ 1), inclinación (grados) y si sigue en pantalla. */
  device: { tx: number; ty: number; scale: number; tilt: number; visible: boolean };
  /** Símbolo de la pantalla: posición de su esquina superior izquierda (px), escala (≤ 1) y opacidad. */
  logo: { tx: number; ty: number; scale: number; opacity: number };
  /** Capa de profundidad del fondo de adentro. */
  depth: { scale: number };
  erp: { y: number; scale: number; opacity: number };
  /** Badge, título, bajada y CTAs. */
  copy: readonly [Fade, Fade, Fade, Fade];
  /** Zoom del notebook visto desde p = 0 (1 → kEnd). */
  zoom: number;
}

/** Pose completa del Hero: función pura del progreso y el layout. */
export function poseAt(progress: number, layout: HeroLayout): HeroPose {
  const p = clamp01(progress);
  const e = ZOOM.ease(progressIn(p, TIMELINE.zoom));
  // El centro de la pantalla llega al centro del viewport justo en el cruce, para que el agujero lo cubra parejo.
  const centered = clamp01(e / layout.eCross);
  const cy = lerp(layout.cy0, layout.height / 2, centered);

  const logoScale = lerpLog(1 / LOGO.grow, 1, centered);

  const arrive = progressIn(p, TIMELINE.erpIn);
  const settle = easeInOutSine(progressIn(p, TIMELINE.erpSettle));

  const { starts, duration, offsetPx } = TIMELINE.copy;
  const fade = (start: number): Fade => {
    const opacity = smoothstep(start, start + duration, p);
    return { opacity, y: (1 - opacity) * offsetPx };
  };

  return {
    device: {
      tx: layout.cx - layout.device.originX,
      ty: cy - layout.device.originY,
      scale: lerpLog(1 / layout.kEnd, 1, e),
      tilt: DEVICE.tiltDeg * (1 - centered),
      visible: e < 1,
    },
    logo: {
      tx: layout.cx - layout.logo.width / 2,
      ty: cy - layout.logo.height / 2,
      scale: logoScale,
      opacity: 1 - smoothstep(TIMELINE.logoFade.start, TIMELINE.logoFade.end, p),
    },
    depth: { scale: lerp(ZOOM.depthFrom, 1, e) },
    erp: {
      y: lerp(layout.erp.assemblyY, 0, settle),
      scale: lerp(ERP.arriveScale, 1, easeOutCubic(arrive)) * lerp(layout.erp.assemblyScale, 1, settle),
      opacity: smoothstep(0, 1, arrive),
    },
    copy: [fade(starts[0]), fade(starts[1]), fade(starts[2]), fade(starts[3])],
    zoom: lerpLog(1, layout.kEnd, e),
  };
}
