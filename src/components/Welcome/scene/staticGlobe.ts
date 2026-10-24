/**
 * Globo estático para `prefers-reduced-motion`: la misma nube de puntos de los continentes, con la misma
 * orientación de la escena 1, pintada una sola vez en un canvas 2D. No usa three.
 */
import { COLORS, PLANET } from "../config";
import { forEachLandPoint, hash } from "./land";

const DEG = Math.PI / 180;

export function paintStaticGlobe(canvas: HTMLCanvasElement, size: number, points: number) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(size * dpr);
  canvas.height = Math.round(size * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, size, size);

  const center = size / 2;
  const radius = (size / 2) * 0.8;

  // Atmósfera: halo orquídea claro que se apaga hacia afuera.
  const atmosphere = context.createRadialGradient(center, center, radius * 0.92, center, center, radius * 1.22);
  atmosphere.addColorStop(0, "rgba(180, 132, 210, 0.38)");
  atmosphere.addColorStop(1, "rgba(180, 132, 210, 0)");
  context.fillStyle = atmosphere;
  context.fillRect(0, 0, size, size);

  // Océano: derivado de Grafito, con el borde en berenjena.
  const ocean = context.createRadialGradient(center, center, 0, center, center, radius);
  ocean.addColorStop(0, COLORS.planetCore);
  ocean.addColorStop(0.78, COLORS.planetCore);
  ocean.addColorStop(1, "#3a1d4c");
  context.fillStyle = ocean;
  context.beginPath();
  context.arc(center, center, radius, 0, Math.PI * 2);
  context.fill();

  // Misma orientación que la escena 3D: giro en lon, luego roll en pantalla, luego inclinación en lat.
  const { lat, lon, roll } = PLANET.facing;
  const spin = -lon * DEG;
  const cosSpin = Math.cos(spin);
  const sinSpin = Math.sin(spin);
  const cosRoll = Math.cos(roll * DEG);
  const sinRoll = Math.sin(roll * DEG);
  const cosTilt = Math.cos(lat * DEG);
  const sinTilt = Math.sin(lat * DEG);

  forEachLandPoint(points, (x0, y0, z0, index) => {
    const x1 = x0 * cosSpin + z0 * sinSpin;
    const z1 = -x0 * sinSpin + z0 * cosSpin;
    const x2 = x1 * cosRoll - y0 * sinRoll;
    const y2 = x1 * sinRoll + y0 * cosRoll;
    const y3 = y2 * cosTilt - z1 * sinTilt;
    const z3 = y2 * sinTilt + z1 * cosTilt;
    if (z3 <= 0) return;

    const seed = hash(index + 23);
    const ivory = seed > 1 - PLANET.continents.ivoryShare;
    const limb = Math.min(1, z3 / 0.45);
    context.globalAlpha = (0.3 + 0.7 * limb) * (ivory ? 1 : 0.85);
    // Mismo tono que el shader (fract(seed × 13,7)), resuelto a uno de los dos extremos.
    const tone = (seed * 13.7) % 1;
    context.fillStyle = ivory ? COLORS.marfil : tone > 0.5 ? COLORS.lilaClaro : COLORS.orquideaClaro;
    const dot = ivory ? 1.6 : 1.1;
    context.beginPath();
    context.arc(center + x2 * radius, center - y3 * radius, dot, 0, Math.PI * 2);
    context.fill();
  });
  context.globalAlpha = 1;
}
