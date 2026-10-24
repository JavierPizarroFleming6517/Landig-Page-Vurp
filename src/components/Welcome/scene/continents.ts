import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three";
import { LAND_MASK } from "./landMask";

const DEG = Math.PI / 180;

/** Posición en la esfera unitaria: lon 0 mira hacia la cámara (+z) y el norte queda arriba (+y). */
export function latLonToVector(lat: number, lon: number, radius = 1) {
  const phi = lat * DEG;
  const lambda = lon * DEG;
  return new Vector3(Math.cos(phi) * Math.sin(lambda), Math.sin(phi), Math.cos(phi) * Math.cos(lambda)).multiplyScalar(radius);
}

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
 * Nube de puntos de los continentes: una espiral de Fibonacci (reparto uniforme por área) filtrada por la máscara,
 * con un leve jitter para que no se lea el patrón. Cada punto trae lo que la Fase 4 necesita para fragmentarse:
 * `aDir` (dirección de dispersión) y `aDelay` (retardo propio), además de `aSeed` para tono y parpadeo.
 */
export function continentGeometry(targetPoints: number, radius: number) {
  const { isLand, landShare } = decodeMask();
  const candidates = Math.round(targetPoints / landShare);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const spacing = Math.sqrt((4 * Math.PI) / candidates);

  const positions: number[] = [];
  const directions: number[] = [];
  const delays: number[] = [];
  const seeds: number[] = [];
  const point = new Vector3();
  const direction = new Vector3();

  for (let index = 0; index < candidates; index += 1) {
    const y = 1 - ((index + 0.5) / candidates) * 2;
    const ring = Math.sqrt(1 - y * y);
    const theta = golden * index;
    point.set(Math.cos(theta) * ring, y, Math.sin(theta) * ring);
    point.x += (hash(index * 3 + 1) - 0.5) * spacing * 0.5;
    point.y += (hash(index * 3 + 2) - 0.5) * spacing * 0.5;
    point.z += (hash(index * 3 + 3) - 0.5) * spacing * 0.5;
    point.normalize();

    const lat = Math.asin(point.y) / DEG;
    const lon = Math.atan2(point.x, point.z) / DEG;
    if (!isLand(lat, lon)) continue;

    positions.push(point.x * radius, point.y * radius, point.z * radius);
    direction
      .set(hash(index + 7) - 0.5, hash(index + 11) - 0.5, hash(index + 13) - 0.5)
      .multiplyScalar(0.9)
      .add(point)
      .normalize();
    directions.push(direction.x, direction.y, direction.z);
    delays.push(hash(index + 19));
    seeds.push(hash(index + 23));
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aDir", new Float32BufferAttribute(directions, 3));
  geometry.setAttribute("aDelay", new Float32BufferAttribute(delays, 1));
  geometry.setAttribute("aSeed", new Float32BufferAttribute(seeds, 1));
  return geometry;
}
