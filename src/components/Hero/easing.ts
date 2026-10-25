export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
export const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/** Interpolación en espacio logarítmico: un zoom avanza parejo en vez de frenar al final. `from` y `to` > 0. */
export const lerpLog = (from: number, to: number, t: number) => from * Math.pow(to / from, t);

export const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

export interface Range {
  start: number;
  end: number;
}

/** Avance (0–1) de `value` dentro de un tramo. */
export const progressIn = (value: number, { start, end }: Range) => clamp01((value - start) / (end - start));

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInQuad = (t: number) => t * t;
export const easeInCubic = (t: number) => t * t * t;
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
