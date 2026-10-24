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
 * Radio de la órbita del logo: el cambio de capa ocurre en los extremos (θ = 0 y π, profundidad 0), así que
 * ahí la caja del logo debe quedar fuera del disco (Rx ≥ Rplaneta + ancho/2 + margen) y dentro de la pantalla.
 */
function solveLogoRadius(orbit: OrbitConfig, planetPx: number, halfWidth: number, halfHeight: number, width: number) {
  const roll = orbit.roll ?? 0;
  const clearanceAt = (radius: number) =>
    discClearance(radius * planetPx * Math.cos(roll), radius * planetPx * Math.sin(roll), halfWidth, halfHeight, planetPx);
  let need = 1;
  while (need < 4 && clearanceAt(need) < LAYOUT_MARGIN.disc) need += 0.005;
  const horizontal = Math.abs(Math.cos(roll));
  const max = horizontal < 1e-3 ? Infinity : (width / 2 - LAYOUT_MARGIN.edge - halfWidth) / (planetPx * horizontal);
  const fits = need <= max;
  const radius = fits ? Math.min(max, Math.max(need, orbit.radius)) : need;
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
    return { planetScale, planetPx, logoPx, logoWidth, logo: solveLogoRadius(preset.logoOrbit, planetPx, logoWidth / 2, logoPx / 2, width) };
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
