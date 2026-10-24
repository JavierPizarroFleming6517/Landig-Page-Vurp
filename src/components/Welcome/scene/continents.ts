import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three";
import { forEachLandPoint, hash } from "./land";

export { hash };

const DEG = Math.PI / 180;

/** Posición en la esfera unitaria: lon 0 mira hacia la cámara (+z) y el norte queda arriba (+y). */
export function latLonToVector(lat: number, lon: number, radius = 1) {
  const phi = lat * DEG;
  const lambda = lon * DEG;
  return new Vector3(Math.cos(phi) * Math.sin(lambda), Math.sin(phi), Math.cos(phi) * Math.cos(lambda)).multiplyScalar(radius);
}

/**
 * Nube de puntos de los continentes (Fibonacci filtrado por la máscara de tierra). Cada punto trae lo que la
 * explosión necesita para fragmentarse: `aDir` (dirección de dispersión) y `aDelay` (retardo propio), además de
 * `aSeed` para tono y parpadeo. El orden se baraja: así cualquier prefijo (drawRange) es una muestra pareja.
 */
export function continentGeometry(targetPoints: number, radius: number) {
  const points: { x: number; y: number; z: number; index: number }[] = [];
  forEachLandPoint(targetPoints, (x, y, z, index) => points.push({ x, y, z, index }));
  for (let index = points.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(hash(index + 977) * (index + 1));
    const current = points[index];
    const other = points[swap];
    if (!current || !other) continue;
    points[index] = other;
    points[swap] = current;
  }

  const positions: number[] = [];
  const directions: number[] = [];
  const delays: number[] = [];
  const seeds: number[] = [];
  const direction = new Vector3();
  for (const { x, y, z, index } of points) {
    positions.push(x * radius, y * radius, z * radius);
    direction
      .set(hash(index + 7) - 0.5, hash(index + 11) - 0.5, hash(index + 13) - 0.5)
      .multiplyScalar(0.9)
      .add(new Vector3(x, y, z))
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
