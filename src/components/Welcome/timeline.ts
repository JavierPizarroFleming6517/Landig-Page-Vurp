import { ENTER, SCENES, TIMELINE, type SceneRange } from "./config";
import type { StageLayout } from "./layout";
import { project, type Vec3 } from "./orbits";

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
  /** Brazo izquierdo y pieza derecha del isotipo, cada uno con su propia posición. */
  left: OrbiterPose;
  right: OrbiterPose;
  /** Opacidad del titular fijo. No se desplaza: solo entra y se apaga cuando aparece el logo completo. */
  headline: number;
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
  /** Logo completo: opacidad, escala y luminosidad del halo que tiene detrás. */
  reveal: { opacity: number; scale: number; halo: number };
  backdrop: number;
}

/**
 * El encuentro recorre casi todo el tramo con calma y cierra el último trecho de golpe.
 * Llega a 1 exactamente cuando empieza la fragmentación, sin mover esa ventana.
 */
function mergeEase(t: number) {
  const u = clamp01(t);
  const travel = 0.86;
  if (u < 0.9) return travel * easeInOutSine(u / 0.9);
  return travel + (1 - travel) * easeOutCubic((u - 0.9) / 0.1);
}

/**
 * Arco concéntrico al planeta, separado de la superficie por `arcLift`.
 * Así las mitades flotan sobre la curvatura y no se meten en los continentes.
 */
function orbitRadius(layout: StageLayout) {
  return layout.planetPx + layout.height * layout.preset.arcLift;
}

/** Donde el planeta corta el borde inferior: de ahí arranca el arco, ya elevado. */
function emergenceX(layout: StageLayout, side: -1 | 1) {
  const drop = layout.cy - layout.height;
  const reach = Math.sqrt(Math.max(layout.planetPx * layout.planetPx - drop * drop, 0));
  return layout.cx + side * reach;
}

/**
 * Punto más bajo de cada pieza, relativo al centro del viewBox (ancho y alto).
 * El brazo izquierdo no llega al borde inferior; la pieza derecha sí, en su vértice.
 */
const CONTACT = {
  left: { x: -0.232, y: 0.371 },
  right: { x: -0.087, y: 0.499 },
} as const;

/** Mitad del isotipo: su punto más bajo recorre el arco elevado y, al final, las cajas coinciden. */
function halfPose(layout: StageLayout, side: -1 | 1, merge: number, lift: number, opacity: number): OrbiterPose {
  const orbitR = orbitRadius(layout);
  const anchorX = lerp(emergenceX(layout, side), layout.cx, merge);
  const dx = anchorX - layout.cx;
  const limb = Math.sqrt(Math.max(orbitR * orbitR - dx * dx, 0));
  const surfaceY = layout.cy - limb;
  const contact = side < 0 ? CONTACT.left : CONTACT.right;
  const scale = lerp(1, 1.04, merge);
  const seatedX = anchorX - contact.x * layout.logoWidth * scale;
  const seatedY = surfaceY - contact.y * layout.logoPx * scale + lift;
  // El último tramo alinea las dos cajas sobre el mismo arco, sin bajarlas al disco.
  const lock = smoothstep(0.9, 1, merge);
  const crownY = layout.cy - orbitR - layout.logoPx * 0.5 + lift;
  return {
    x: lerp(seatedX, layout.cx, lock),
    y: lerp(seatedY, crownY, lock),
    scale,
    opacity,
    front: true,
  };
}

/** Pose completa de la escena: función pura del progreso, la entrada (0–1) y el layout. */
export function poseAt(progress: number, enter: number, layout: StageLayout): WelcomePose {
  const p = clamp01(progress);
  const lift = (1 - enter) * ENTER.offsetPx;
  const merge = mergeEase(clamp01(p / TIMELINE.shatter.start));
  // En reposo no se ven. Aparecen con el primer tramo de scroll y se apagan al fragmentarse.
  const markOpacity =
    enter *
    smoothstep(0, 0.08, p) *
    (1 - smoothstep(TIMELINE.shatter.start, TIMELINE.shatter.start + 0.045, p));

  // Cara que mira a cámara tras la inclinación del horizonte (lat −70°): el estallido queda en el casquete visible.
  const impactWorld: Vec3 = { x: 0, y: 0.94, z: 0.342 };
  const impact = project(impactWorld, layout);
  const { glow, flash, shatter, burst, planetOut, reveal, backdropOut } = TIMELINE;
  const impactGlow = smoothstep(glow.start, glow.peak, p) * (1 - smoothstep(glow.peak, glow.end, p));
  const enterGlow = ENTER.glow * Math.sin(Math.PI * enter);
  const left = halfPose(layout, -1, merge, lift, markOpacity);
  const right = halfPose(layout, 1, merge, lift, markOpacity);
  const meet = halfPose(layout, 1, 1, lift, markOpacity);

  return {
    left,
    right,
    headline: enter * (1 - smoothstep(TIMELINE.shatter.start, reveal.inStart, p)),
    planet: {
      opacity: enter,
      bodyOpacity: enter * (1 - smoothstep(planetOut.start, planetOut.end, p)),
      glow: Math.max(impactGlow, enterGlow),
      shatter: clamp01((p - shatter.start) / (shatter.end - shatter.start)),
    },
    impact: { x: impact.x, y: impact.y, world: impactWorld },
    focus: {
      x: meet.x,
      y: meet.y,
      radius: Math.hypot(layout.logoWidth, layout.logoPx) / 2,
      amount: markOpacity * merge,
    },
    burst: smoothstep(burst.start, burst.end, p),
    flash: flash.max * smoothstep(flash.rise, TIMELINE.impact, p) * (1 - smoothstep(TIMELINE.impact, flash.end, p)),
    reveal: {
      opacity: smoothstep(reveal.inStart, reveal.inEnd, p) * (1 - smoothstep(reveal.outStart, reveal.outEnd, p)),
      scale: lerp(0.88, 1, easeOutCubic(clamp01((p - reveal.inStart) / (reveal.inEnd + 0.02 - reveal.inStart)))),
      // El halo sube con la entrada, se asienta un poco durante la pausa y se va antes que el logo.
      halo:
        smoothstep(reveal.inStart, reveal.inEnd, p) *
        (1 - 0.4 * smoothstep(reveal.inEnd, reveal.inEnd + 0.04, p)) *
        (1 - smoothstep(reveal.outStart - 0.02, reveal.outEnd - 0.02, p)),
    },
    backdrop: enter * (1 - smoothstep(backdropOut.start, backdropOut.end, p)),
  };
}
