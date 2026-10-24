import { ENTER, SCENES, TIMELINE, type SceneRange } from "./config";
import type { StageLayout } from "./layout";
import { horizonPoint, project, type Vec3 } from "./orbits";

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
  /** Logo completo: opacidad, escala y luminosidad del halo que tiene detrás. */
  reveal: { opacity: number; scale: number; halo: number };
  backdrop: number;
}

/** Pose completa de la escena: función pura del progreso, la entrada (0–1) y el layout. */
export function poseAt(progress: number, enter: number, layout: StageLayout): WelcomePose {
  const p = clamp01(progress);
  const t = easeInOutSine(clamp01((p - TIMELINE.orbitStart) / (TIMELINE.orbitEnd - TIMELINE.orbitStart)));
  const lift = (1 - enter) * ENTER.offsetPx;
  const converge = easeInOutSine(clamp01((p - TIMELINE.converge.start) / (TIMELINE.converge.end - TIMELINE.converge.start)));
  const gatherLogo = { x: layout.cx, y: layout.revealY + layout.height * 0.06 };
  const gatherText = { x: layout.cx, y: layout.revealY - layout.height * 0.1 };

  const crest = Math.sin(Math.PI * t);
  // Logo: de derecha a izquierda, pegado a la curva. Texto: de izquierda a derecha, más arriba.
  const logoArc = horizonPoint(layout, Math.PI * t, layout.preset.logoCrest * crest);
  const textArc = horizonPoint(layout, Math.PI - Math.PI * t, layout.preset.textRise + layout.preset.textCrest * crest);

  const [a0, a1, a2] = TIMELINE.messageAnchors;
  const relay = (anchor: number) =>
    1 - smoothstep(TIMELINE.messageFade.inner, TIMELINE.messageFade.outer, Math.abs(t - anchor));
  const shift = (anchor: number) =>
    Math.max(-1, Math.min(1, (anchor - t) / TIMELINE.messageFade.outer)) * TIMELINE.messageShiftPx;

  // Cara que mira a cámara tras la inclinación del horizonte (lat −70°): el estallido queda en el casquete visible.
  const impactWorld: Vec3 = { x: 0, y: 0.94, z: 0.342 };
  const impact = project(impactWorld, layout);
  const { glow, flash, shatter, burst, planetOut, reveal, backdropOut, textOut } = TIMELINE;
  const impactGlow = smoothstep(glow.start, glow.peak, p) * (1 - smoothstep(glow.peak, glow.end, p));
  const enterGlow = ENTER.glow * Math.sin(Math.PI * enter);

  const logoOpacity = enter * (1 - smoothstep(textOut.start, textOut.end, p));

  return {
    logo: {
      x: lerp(logoArc.x, gatherLogo.x, converge),
      y: lerp(logoArc.y, gatherLogo.y, converge) + lift,
      scale: lerp(1, 1.08, converge),
      opacity: logoOpacity,
      front: true,
    },
    text: {
      x: lerp(textArc.x, gatherText.x, converge),
      y: lerp(textArc.y, gatherText.y, converge) + lift,
      scale: 1,
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
      x: lerp(logoArc.x, gatherLogo.x, converge),
      y: lerp(logoArc.y, gatherLogo.y, converge) + lift,
      radius: Math.hypot(layout.logoWidth, layout.logoPx) / 2,
      amount: logoOpacity,
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
