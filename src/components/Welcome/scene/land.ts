/**
 * Muestreo de tierra sin three: decodifica la máscara Natural Earth y recorre una espiral de Fibonacci quedándose
 * con los puntos que caen en tierra. Lo usan los continentes 3D y el globo estático (reduced-motion).
 */
import { LAND_MASK } from "./landMask";

const DEG = Math.PI / 180;

/** Semilla determinista en [0, 1). */
export const hash = (index: number) => {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

/** Decodifica la máscara (runs agua/tierra en varint) y devuelve la consulta y la fracción de tierra por área. */
function decodeMask() {
  const { width, height, data } = LAND_MASK;
  const binary = atob(data);
  const cells = new Uint8Array(width * height);
  let cursor = 0;
  const varint = () => {
    let value = 0;
    let shift = 0;
    for (;;) {
      const byte = binary.charCodeAt(cursor);
      cursor += 1;
      value |= (byte & 0x7f) << shift;
      if (byte < 0x80) return value;
      shift += 7;
    }
  };

  let landArea = 0;
  let totalArea = 0;
  for (let row = 0; row < height; row += 1) {
    const weight = Math.cos((90 - ((row + 0.5) * 180) / height) * DEG);
    let col = 0;
    let land = 0;
    while (col < width) {
      const run = varint();
      if (land) {
        cells.fill(1, row * width + col, row * width + col + run);
        landArea += run * weight;
      }
      totalArea += run * weight;
      col += run;
      land ^= 1;
    }
  }

  const isLand = (lat: number, lon: number) => {
    const row = Math.min(height - 1, Math.max(0, Math.floor(((90 - lat) / 180) * height)));
    const col = Math.min(width - 1, Math.max(0, Math.floor(((lon + 180) / 360) * width)));
    return cells[row * width + col] === 1;
  };
  return { isLand, landShare: landArea / totalArea };
}

/**
 * Llama a `visit` con cada punto de tierra (vector unitario: lon 0 mira a +z, norte a +y) de una espiral de
 * Fibonacci con leve jitter, de modo que salgan ~`targetPoints` puntos repartidos por área.
 */
export function forEachLandPoint(targetPoints: number, visit: (x: number, y: number, z: number, index: number) => void) {
  const { isLand, landShare } = decodeMask();
  const candidates = Math.round(targetPoints / landShare);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const jitter = Math.sqrt((4 * Math.PI) / candidates) * 0.5;

  for (let index = 0; index < candidates; index += 1) {
    const y0 = 1 - ((index + 0.5) / candidates) * 2;
    const ring = Math.sqrt(1 - y0 * y0);
    const theta = golden * index;
    let x = Math.cos(theta) * ring + (hash(index * 3 + 1) - 0.5) * jitter;
    let y = y0 + (hash(index * 3 + 2) - 0.5) * jitter;
    let z = Math.sin(theta) * ring + (hash(index * 3 + 3) - 0.5) * jitter;
    const length = Math.hypot(x, y, z);
    x /= length;
    y /= length;
    z /= length;
    if (isLand(Math.asin(y) / DEG, Math.atan2(x, z) / DEG)) visit(x, y, z, index);
  }
}
