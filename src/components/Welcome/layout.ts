import { orbitPoint } from "./orbits";
import {
  BREAKPOINT,
  CAMERA,
  LAYOUT,
  LAYOUT_MARGIN,
  LOGO_ASPECT,
  PLANET_SCALE,
  type LayoutPreset,
  type OrbitConfig,
} from "./config";

export interface StageLayout {
  width: number;
  height: number;
  compact: boolean;
  preset: LayoutPreset;
  /** Centro del planeta en px dentro del stage. */
  cx: number;
  cy: number;
  /** Factor de tamaño aplicado (PLANET_SCALE.preferred o .min). */
  planetScale: number;
  /** Radio del planeta en px (a profundidad 0). */
  planetPx: number;
  /** Distancia focal en px: un punto a profundidad z se proyecta con escala focal / (distancia − z). */
  focal: number;
  /** Campo de visión vertical (grados) equivalente, para la cámara de Three.js. */
  fov: number;
  logoPx: number;
  logoWidth: number;
  textWidth: number;
  /** Órbitas con el radio ya ajustado a este tamaño de pantalla. */
  logoOrbit: OrbitConfig;
  textOrbit: OrbitConfig;
  /** Separación (px) entre el logo y el disco en el punto donde cambia de capa. */
  logoClearance: number;
  /** false si ni con el factor mínimo el logo cabe sin salirse de la pantalla (se prioriza no tapar el disco). */
  fits: boolean;
}

/** Separación entre una caja centrada en (x, y) y el disco del planeta, a profundidad 0. */
function discClearance(x: number, y: number, halfWidth: number, halfHeight: number, planetPx: number) {
  return Math.hypot(Math.max(Math.abs(x) - halfWidth, 0), Math.max(Math.abs(y) - halfHeight, 0)) - planetPx;
}

/**
 * Radio de la órbita del logo. El cambio de capa ocurre en los extremos (θ = 0 y π, profundidad 0), así que ahí
 * la caja del logo debe quedar fuera del disco (Rx ≥ Rplaneta + ancho/2 + margen). Además, en todo el arco
 * trasero (con su escala por profundidad) el logo no puede acercarse al borde de la pantalla.
 */
function solveLogoRadius(preset: LayoutPreset, planetPx: number, halfWidth: number, halfHeight: number, width: number) {
  const orbit = preset.logoOrbit;
  const roll = orbit.roll ?? 0;
  const clearanceAt = (radius: number) =>
    discClearance(radius * planetPx * Math.cos(roll), radius * planetPx * Math.sin(roll), halfWidth, halfHeight, planetPx);
  const focal = planetPx * CAMERA.distance;
  const extentAt = (radius: number) => {
    let extent = 0;
    for (let step = 0; step <= 32; step += 1) {
      const point = orbitPoint({ ...orbit, radius }, (-Math.PI * step) / 32);
      const depthScale = CAMERA.distance / (CAMERA.distance - point.z);
      const scale = 1 + (depthScale - 1) * preset.logoDepthGain;
      extent = Math.max(extent, Math.abs(point.x) * (focal / (CAMERA.distance - point.z)) + halfWidth * scale);
    }
    return extent;
  };

  let need = 1;
  while (need < 4 && clearanceAt(need) < LAYOUT_MARGIN.disc) need += 0.005;
  const limit = width / 2 - LAYOUT_MARGIN.edge;
  let radius = Math.max(need, orbit.radius);
  while (radius > need && extentAt(radius) > limit) radius -= 0.005;
  const fits = extentAt(radius) <= limit;
  return { radius, fits, clearance: clearanceAt(radius) };
}

/** El texto va siempre delante: si no cabe a un costado del disco, se acerca al planeta en vez de salirse. */
function solveTextRadius(orbit: OrbitConfig, planetPx: number, halfWidth: number, width: number) {
  if (orbit.offsetY !== 0 || (orbit.roll ?? 0) !== 0) return orbit.radius;
  const need = 1 + (halfWidth + LAYOUT_MARGIN.disc) / planetPx;
  const max = (width / 2 - LAYOUT_MARGIN.edge - halfWidth) / planetPx;
  return need <= max ? Math.min(max, Math.max(need, orbit.radius)) : max;
}

export function computeLayout(width: number, height: number): StageLayout {
  const compact = width < BREAKPOINT;
  const preset = compact ? LAYOUT.compact : LAYOUT.wide;
  const basePx = Math.min(width * preset.planetVw, height * preset.planetVh);
  const textWidth = Math.round(Math.min(preset.textMaxPx, width * preset.textVw));

  const attempt = (planetScale: number) => {
    const planetPx = basePx * planetScale;
    const logoPx = Math.round(planetPx * preset.logoSize);
    const logoWidth = Math.round(logoPx * LOGO_ASPECT);
    return { planetScale, planetPx, logoPx, logoWidth, logo: solveLogoRadius(preset, planetPx, logoWidth / 2, logoPx / 2, width) };
  };
  const preferred = attempt(PLANET_SCALE.preferred);
  const chosen = preferred.logo.fits ? preferred : attempt(PLANET_SCALE.min);

  const { planetPx } = chosen;
  const focal = planetPx * CAMERA.distance;
  return {
    width,
    height,
    compact,
    preset,
    cx: width / 2,
    cy: height * preset.centerY,
    planetScale: chosen.planetScale,
    planetPx,
    focal,
    fov: (2 * Math.atan(height / 2 / focal) * 180) / Math.PI,
    logoPx: chosen.logoPx,
    logoWidth: chosen.logoWidth,
    textWidth,
    logoOrbit: { ...preset.logoOrbit, radius: chosen.logo.radius },
    textOrbit: { ...preset.textOrbit, radius: solveTextRadius(preset.textOrbit, planetPx, textWidth / 2, width) },
    logoClearance: chosen.logo.clearance,
    fits: chosen.logo.fits,
  };
}
