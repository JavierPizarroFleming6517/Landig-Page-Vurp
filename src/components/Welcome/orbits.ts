import { CAMERA, type OrbitConfig } from "./config";
import type { StageLayout } from "./layout";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Projected {
  x: number;
  y: number;
  /** Escala relativa a la de profundidad 0 (> 1 delante del planeta, < 1 detrás). */
  depthScale: number;
}

/**
 * Punto de una órbita circular inclinada. θ = 0 queda a la derecha y θ = π a la izquierda (girados por `roll`);
 * con sen θ > 0 el punto está delante del planeta (y más abajo en pantalla), con sen θ < 0, detrás (y más arriba).
 */
export function orbitPoint({ radius, tilt, offsetY, roll = 0 }: OrbitConfig, theta: number): Vec3 {
  const s = Math.sin(theta);
  const x = radius * Math.cos(theta);
  const y = offsetY - radius * s * Math.sin(tilt);
  return {
    x: x * Math.cos(roll) - y * Math.sin(roll),
    y: x * Math.sin(roll) + y * Math.cos(roll),
    z: radius * s * Math.cos(tilt),
  };
}

/**
 * Punto sobre la curvatura del horizonte. θ = 0 queda a la derecha y θ = π a la izquierda;
 * en θ = π/2 el punto está en el centro y es el más alto del arco.
 */
export function horizonPoint(layout: StageLayout, theta: number, rise: number): { x: number; y: number } {
  const reach = layout.width * layout.preset.arcReach;
  const x = layout.cx + Math.cos(theta) * reach;
  const dx = x - layout.cx;
  const limb = Math.sqrt(Math.max(layout.planetPx * layout.planetPx - dx * dx, 0));
  return { x, y: layout.cy - limb - layout.height * (layout.preset.arcLift + rise) };
}

/** Proyección en perspectiva con la cámara compartida (en +z, mirando al origen). */
export function project(point: Vec3, layout: StageLayout): Projected {
  const scale = layout.focal / (CAMERA.distance - point.z);
  return {
    x: layout.cx + point.x * scale,
    y: layout.cy - point.y * scale,
    depthScale: (scale * CAMERA.distance) / layout.focal,
  };
}
