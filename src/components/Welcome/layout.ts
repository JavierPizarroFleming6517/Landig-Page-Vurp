import { BREAKPOINT, CAMERA, LAYOUT, type LayoutPreset } from "./config";

export interface StageLayout {
  width: number;
  height: number;
  compact: boolean;
  preset: LayoutPreset;
  /** Centro del planeta en px dentro del stage. */
  cx: number;
  cy: number;
  /** Radio del planeta en px (a profundidad 0). */
  planetPx: number;
  /** Distancia focal en px: un punto a profundidad z se proyecta con escala focal / (distancia − z). */
  focal: number;
  /** Campo de visión vertical (grados) equivalente, para la cámara de Three.js. */
  fov: number;
  logoPx: number;
  textWidth: number;
}

export function computeLayout(width: number, height: number): StageLayout {
  const compact = width < BREAKPOINT;
  const preset = compact ? LAYOUT.compact : LAYOUT.wide;
  const planetPx = Math.min(width * preset.planetVw, height * preset.planetVh);
  const focal = planetPx * CAMERA.distance;
  return {
    width,
    height,
    compact,
    preset,
    cx: width / 2,
    cy: height * preset.centerY,
    planetPx,
    focal,
    fov: (2 * Math.atan(height / 2 / focal) * 180) / Math.PI,
    logoPx: Math.round(planetPx * preset.logoSize),
    textWidth: Math.round(Math.min(preset.textMaxPx, width * preset.textVw)),
  };
}
