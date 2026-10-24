import { ENTER, SCENES, TIMELINE, type SceneRange } from "./config";
import type { StageLayout } from "./layout";
import { orbitPoint, project, type Vec3 } from "./orbits";

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
export const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

export const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInCubic = (t: number) => t * t * t;
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

export function sceneAt(progress: number): SceneRange {
  const p = clamp01(progress);
  let current = SCENES[0];
  for (const scene of SCENES) if (p >= scene.start) current = scene;
  return current;
}

export interface OrbiterPose {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  /** true cuando el elemento está delante del planeta (capa delantera). */
  front: boolean;
}

export interface WelcomePose {
  logo: OrbiterPose;
  text: OrbiterPose;
  /** Opacidad propia de cada mensaje (relevo); se multiplica por la del bloque de texto. */
  messages: readonly [number, number, number];
  /** Desplazamiento vertical (px) de cada mensaje durante el relevo: entra desde abajo, sale hacia arriba. */
  messageOffsets: readonly [number, number, number];
  /**
   * `opacity` gobierna la escena WebGL (la explosión la desarma por sí sola); `bodyOpacity` es el fundido del
   * planeta CSS de respaldo. `shatter` avanza linealmente: cada punto aplica su propia curva.
   */
  planet: { opacity: number; bodyOpacity: number; glow: number; shatter: number };
  /** Punto de impacto en pantalla (px) y en el mundo 3D. */
  impact: { x: number; y: number; world: Vec3 };
  /** Zona del logo cuando cruza por delante del disco: ahí se atenúan los puntos para no perder contraste. */
  focus: { x: number; y: number; radius: number; amount: number };
  burst: number;
  flash: number;
  reveal: { opacity: number; scale: number };
  backdrop: number;
}

/** Pose completa de la escena: función pura del progreso, la entrada (0–1) y el layout. */
export function poseAt(progress: number, enter: number, layout: StageLayout): WelcomePose {
  const p = clamp01(progress);
  const { preset } = layout;
  const t = easeInOutSine(clamp01((p - TIMELINE.orbitStart) / (TIMELINE.orbitEnd - TIMELINE.orbitStart)));
  const lift = (1 - enter) * ENTER.offsetPx;

  // Logo: de derecha a izquierda por el arco trasero y, en el impacto, en espiral hacia el frente del planeta.
  const dive = easeInCubic(clamp01((p - TIMELINE.dive.start) / (TIMELINE.dive.end - TIMELINE.dive.start)));
  const logoOrbit = {
    ...layout.logoOrbit,
    radius: lerp(layout.logoOrbit.radius, 1.02, dive),
    offsetY: lerp(layout.logoOrbit.offsetY, 0, dive),
  };
  const logoPoint = orbitPoint(logoOrbit, -Math.PI * t - (Math.PI / 2) * dive);
  const logoProj = project(logoPoint, layout);
  const deepest = layout.logoOrbit.radius * Math.cos(layout.logoOrbit.tilt);
  const depth = clamp01(-logoPoint.z / deepest);

  // Texto: de izquierda a derecha por el arco delantero, siempre delante del planeta.
  const textPoint = orbitPoint(layout.textOrbit, Math.PI - Math.PI * t);
  const textProj = project(textPoint, layout);

  const [a0, a1, a2] = TIMELINE.messageAnchors;
  const relay = (anchor: number) =>
    1 - smoothstep(TIMELINE.messageFade.inner, TIMELINE.messageFade.outer, Math.abs(t - anchor));
  const shift = (anchor: number) =>
    Math.max(-1, Math.min(1, (anchor - t) / TIMELINE.messageFade.outer)) * TIMELINE.messageShiftPx;

  const impactWorld = orbitPoint({ ...logoOrbit, radius: 1.02, offsetY: 0 }, -1.5 * Math.PI);
  const impact = project(impactWorld, layout);
  const { glow, flash, shatter, burst, planetOut, reveal, backdropOut, textOut } = TIMELINE;
  const impactGlow = smoothstep(glow.start, glow.peak, p) * (1 - smoothstep(glow.peak, glow.end, p));
  const enterGlow = ENTER.glow * Math.sin(Math.PI * enter);

  const logoScale = 1 + (logoProj.depthScale - 1) * preset.logoDepthGain;
  const logoOpacity = enter * lerp(1, preset.logoBackOpacity, depth) * (1 - smoothstep(0.85, 1, dive));
  const logoFront = logoPoint.z >= 0;

  return {
    logo: {
      x: logoProj.x,
      y: logoProj.y + lift,
      scale: logoScale,
      opacity: logoOpacity,
      front: logoFront,
    },
    text: {
      x: textProj.x,
      y: textProj.y + lift,
      scale: 1 + (textProj.depthScale - 1) * preset.textDepthGain,
      opacity: enter * (1 - smoothstep(textOut.start, textOut.end, p)),
      front: true,
    },
    messages: [relay(a0), relay(a1), relay(a2)],
    messageOffsets: [shift(a0), shift(a1), shift(a2)],
    planet: {
      opacity: enter,
      bodyOpacity: enter * (1 - smoothstep(planetOut.start, planetOut.end, p)),
      glow: Math.max(impactGlow, enterGlow),
      shatter: clamp01((p - shatter.start) / (shatter.end - shatter.start)),
    },
    impact: { x: impact.x, y: impact.y, world: impactWorld },
    focus: {
      x: logoProj.x,
      y: logoProj.y + lift,
      radius: (Math.hypot(layout.logoWidth, layout.logoPx) / 2) * logoScale,
      amount: logoFront ? logoOpacity : 0,
    },
    burst: smoothstep(burst.start, burst.end, p),
    flash: flash.max * smoothstep(flash.rise, TIMELINE.impact, p) * (1 - smoothstep(TIMELINE.impact, flash.end, p)),
    reveal: {
      opacity: smoothstep(reveal.inStart, reveal.inEnd, p) * (1 - smoothstep(reveal.outStart, reveal.outEnd, p)),
      scale: lerp(0.88, 1, smoothstep(reveal.inStart, reveal.inEnd + 0.02, p)),
    },
    backdrop: enter * (1 - smoothstep(backdropOut.start, backdropOut.end, p)),
  };
}
