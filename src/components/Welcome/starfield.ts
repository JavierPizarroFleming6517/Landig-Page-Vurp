import { COLORS, STARS } from "./config";

/** Semilla determinista en [0, 1). */
const hash = (index: number) => {
  const value = Math.sin(index * 91.7 + 47.3) * 43758.5453;
  return value - Math.floor(value);
};

/** Pinta el campo de estrellas una sola vez (se repite solo al cambiar el tamaño del stage). */
export function paintStars(canvas: HTMLCanvasElement, width: number, height: number) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);

  const count = Math.min(STARS.maxCount, Math.round(width * height * STARS.density));
  for (let index = 0; index < count; index += 1) {
    const x = hash(index * 3 + 1) * width;
    // Más densas arriba; se apagan hacia el piso.
    const y = Math.pow(hash(index * 3 + 2), 1.35) * height;
    const size = 0.4 + hash(index * 3 + 3) * 0.95;
    context.globalAlpha = (0.2 + hash(index + 101) * 0.6) * (1 - (y / height) * 0.6);
    context.fillStyle = hash(index + 211) > 0.7 ? COLORS.lilaClaro : COLORS.marfil;
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;
}
