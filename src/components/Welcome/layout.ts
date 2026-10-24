import { BREAKPOINT, CAMERA, LAYOUT, LOGO_ASPECT, type LayoutPreset } from "./config";

export interface StageLayout {
  width: number;
  height: number;
  compact: boolean;
  preset: LayoutPreset;
  /** Centro del planeta en px. Queda bajo el borde inferior: solo asoma el casquete superior. */
  cx: number;
  cy: number;
  /** Borde superior del horizonte y ancla del logo completo, en px. */
  horizonPx: number;
  revealY: number;
  /** Radio del planeta en px (a profundidad 0). */
  planetPx: number;
  /** Distancia focal en px: un punto a profundidad z se proyecta con escala focal / (distancia − z). */
  focal: number;
  /** Campo de visión vertical (grados) equivalente, para la cámara de Three.js. */
  fov: number;
  logoPx: number;
  logoWidth: number;
  textWidth: number;
}

/**
 * Radio para que la cuerda del planeta, en el borde inferior de la pantalla, cubra el ancho útil.
 * El centro queda debajo del viewport y la corona en `horizon`.
 */
function horizonRadius(width: number, height: number, horizon: number, inset: number) {
  const crown = horizon * height;
  const drop = Math.max(120, height - crown);
  const half = Math.max(64, width / 2 - inset);
  const planetPx = (half * half + drop * drop) / (2 * drop);
  return { planetPx, horizonPx: crown, cy: crown + planetPx };
}

export function computeLayout(width: number, height: number): StageLayout {
  const compact = width < BREAKPOINT;
  const preset = compact ? LAYOUT.compact : LAYOUT.wide;
  const { planetPx, horizonPx, cy } = horizonRadius(width, height, preset.horizon, preset.horizonInset);
  const textWidth = Math.round(Math.min(preset.textMaxPx, width * preset.textVw));
  const logoPx = Math.round(Math.min(preset.logoMaxPx, Math.max(64, height * preset.logoVh)));
  const focal = planetPx * CAMERA.distance;
  return {
    width,
    height,
    compact,
    preset,
    cx: width / 2,
    cy,
    horizonPx,
    revealY: Math.max(112, horizonPx - height * preset.revealLift),
    planetPx,
    focal,
    fov: (2 * Math.atan(height / 2 / focal) * 180) / Math.PI,
    logoPx,
    logoWidth: Math.round(logoPx * LOGO_ASPECT),
    textWidth,
  };
}
