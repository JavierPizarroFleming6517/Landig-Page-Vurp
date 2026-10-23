import { framePlanet } from "./orbit";

export interface PlanetView {
  width: number;
  height: number;
}

export interface PlanetState {
  glow: number;
  burst: number;
  shatter: number;
  reduced: boolean;
}

export interface PlanetController {
  setState: (state: PlanetState) => void;
  setView: (view: PlanetView) => void;
  setActive: (active: boolean) => void;
  dispose: () => void;
}

interface City {
  u: number;
  v: number;
  size: number;
  bright: number;
}

type MapPoint = readonly [number, number];

const LAND: readonly (readonly MapPoint[])[] = [
  [
    [-0.94, 0.14], [-0.78, 0.05], [-0.56, 0.02], [-0.36, 0.06], [-0.26, 0.14], [-0.2, 0.24],
    [-0.3, 0.17], [-0.42, 0.2], [-0.52, 0.32], [-0.66, 0.26], [-0.82, 0.18],
  ],
  [
    [-0.46, 0.36], [-0.34, 0.33], [-0.16, 0.31], [0.02, 0.33], [0.16, 0.4], [0.32, 0.5],
    [0.24, 0.64], [0.12, 0.78], [0.02, 0.9], [-0.06, 0.99], [-0.16, 0.84], [-0.26, 0.66],
    [-0.36, 0.5], [-0.44, 0.42],
  ],
  [[0.0, 0.05], [0.14, 0.02], [0.28, 0.07], [0.2, 0.15], [0.06, 0.16]],
  [
    [0.3, 0.22], [0.4, 0.3], [0.34, 0.38], [0.44, 0.46], [0.4, 0.6], [0.5, 0.74],
    [0.64, 0.58], [0.74, 0.42], [0.88, 0.28], [0.72, 0.14], [0.54, 0.08], [0.38, 0.12],
  ],
];

const CITIES: readonly MapPoint[] = [
  [-0.62, 0.14],
  [-0.4, 0.16],
  [-0.5, 0.28],
  [-0.08, 0.44],
  [0.12, 0.56],
  [-0.12, 0.74],
  [0.16, 0.1],
  [0.58, 0.3],
  [0.56, 0.5],
];

const LINKS: readonly (readonly [number, number])[] = [
  [0, 1],
  [1, 6],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [4, 7],
  [6, 7],
  [7, 8],
];

interface Dot {
  u: number;
  v: number;
  radius: number;
  ivory: boolean;
}

const contains = (u: number, v: number, polygon: readonly MapPoint[]) => {
  let inside = false;
  for (let index = 0; index < polygon.length; index += 1) {
    const current = polygon[index];
    const next = polygon[(index + 1) % polygon.length];
    if (!current || !next) continue;
    const [x1, y1] = current;
    const [x2, y2] = next;
    if ((y1 > v) !== (y2 > v) && u < ((x2 - x1) * (v - y1)) / (y2 - y1) + x1) inside = !inside;
  }
  return inside;
};

const DOTS: readonly Dot[] = LAND.flatMap((polygon, landIndex) => {
  const dots: Dot[] = [];
  for (let v = 0.02; v <= 0.98; v += 0.02) {
    for (let u = -0.96; u <= 0.96; u += 0.024) {
      if (!contains(u, v, polygon)) continue;
      const seed = landIndex * 1000 + dots.length;
      const jitter = hash(seed + 4);
      dots.push({
        u: u + (jitter - 0.5) * 0.008,
        v: v + (hash(seed + 9) - 0.5) * 0.006,
        radius: jitter > 0.72 ? 1.7 : 1.05,
        ivory: jitter > 0.4,
      });
    }
  }
  return dots;
});

function hash(index: number) {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function createPlanet(canvas: HTMLCanvasElement, view: PlanetView, reduced: boolean): PlanetController {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) throw new Error("Canvas 2D no disponible");

  const plate = document.createElement("canvas");
  const plateContext = plate.getContext("2d", { alpha: true });
  if (!plateContext) throw new Error("Canvas 2D no disponible");

  let width = view.width;
  let height = view.height;
  let state: PlanetState = { glow: 0, burst: 0, shatter: 0, reduced };
  let active = true;
  let frame = 0;
  let disposed = false;
  let spin = 0.4;
  let last = performance.now();
  const stars = Array.from({ length: width < 900 ? 70 : 120 }, (_, index) => ({
    x: hash(index + 2),
    y: hash(index + 5) * 0.58,
    r: 0.4 + hash(index + 8) * 1.15,
    a: 0.25 + hash(index + 13) * 0.65,
  }));
  const cities: City[] = CITIES.map(([u, v], index) => ({
    u,
    v,
    size: index % 3 === 0 ? 2.2 : 1.25,
    bright: index % 3 === 0 ? 0.95 : 0.6,
  }));

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    plate.width = canvas.width;
    plate.height = canvas.height;
    plateContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const globe = () => {
    const horizon = framePlanet(width).horizon;
    const crownY = horizon * height;
    const radius = Math.max(width * (width < 900 ? 1.05 : 1.18), height * 1.05);
    return { crownY, radius, cy: crownY + radius, cx: width / 2 };
  };

  const mapPoint = (u: number, v: number, metrics: ReturnType<typeof globe>) => {
    const { cx, crownY } = metrics;
    const visible = Math.max(80, height - crownY);
    const drift = Math.sin(spin * 0.35) * 0.05;
    const spread = 0.64 + 0.36 * v;
    return {
      x: cx + (u + drift) * width * 0.5 * spread,
      y: crownY + 14 + v * visible * 0.86,
    };
  };

  const traceLand = (surface: CanvasRenderingContext2D, points: readonly MapPoint[], metrics: ReturnType<typeof globe>) => {
    const projected = points.map(([u, v]) => mapPoint(u, v, metrics));
    const count = projected.length;
    const first = projected[count - 1];
    const second = projected[0];
    if (!first || !second || count < 3) return;
    surface.beginPath();
    surface.moveTo(second.x, second.y);
    for (let index = 1; index < count; index += 1) {
      const point = projected[index];
      if (!point) continue;
      surface.lineTo(point.x, point.y);
    }
    surface.closePath();
  };

  const drawStars = () => {
    for (const star of stars) {
      context.globalAlpha = star.a;
      context.fillStyle = "#E4D5F2";
      context.beginPath();
      context.arc(star.x * width, star.y * height, star.r, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  };

  const drawWorld = (target: CanvasRenderingContext2D, metrics: ReturnType<typeof globe>) => {
    const { cx, cy, radius, crownY } = metrics;
    if (target !== context) target.clearRect(0, 0, width, height);
    target.save();
    target.beginPath();
    target.arc(cx, cy, radius, 0, Math.PI * 2);
    target.clip();

    const body = target.createRadialGradient(cx + radius * 0.2, crownY + 70, 20, cx - radius * 0.1, cy, radius);
    body.addColorStop(0, "#4a2d62");
    body.addColorStop(0.2, "#241430");
    body.addColorStop(0.55, "#120c18");
    body.addColorStop(1, "#07060c");
    target.fillStyle = body;
    target.fillRect(0, 0, width, height);

    target.lineWidth = 1;
    for (let index = 0; index < 9; index += 1) {
      const spread = -0.92 + index * 0.23 + Math.sin(spin) * 0.03;
      const rx = Math.max(8, Math.abs(spread) * radius * 0.9);
      target.strokeStyle = `rgba(201, 167, 228, ${0.07 + (index % 3) * 0.015})`;
      target.beginPath();
      target.ellipse(cx + spread * radius * 0.05, cy, rx, radius, 0, 0, Math.PI * 2);
      target.stroke();
    }

    for (let index = 0; index < 6; index += 1) {
      const band = crownY + 28 + index * 22 + index * index * 6;
      const dy = band - cy;
      const half = Math.sqrt(Math.max(0, radius * radius - dy * dy));
      if (half < 48) continue;
      target.strokeStyle = `rgba(201, 167, 228, ${0.1 - index * 0.01})`;
      target.beginPath();
      target.ellipse(cx, band, half * 0.98, 8 + index * 6, 0, Math.PI, Math.PI * 2);
      target.stroke();
    }

    target.fillStyle = "#8B46AB";
    for (const land of LAND) {
      traceLand(target, land, metrics);
      target.fill();
    }

    for (const dot of DOTS) {
      const point = mapPoint(dot.u, dot.v, metrics);
      if (point.y < crownY || point.y > height) continue;
      const lit = clamp01((point.x - cx) / (width * 0.55) + 0.55);
      target.globalAlpha = 0.45 + lit * 0.5;
      target.fillStyle = dot.ivory ? "#FAF7F2" : "#E4D5F2";
      target.beginPath();
      target.arc(point.x, point.y, dot.radius, 0, Math.PI * 2);
      target.fill();
    }
    target.globalAlpha = 1;

    target.strokeStyle = "rgba(244, 236, 252, 0.88)";
    target.lineWidth = 1.6;
    for (const land of LAND) {
      traceLand(target, land, metrics);
      target.stroke();
    }

    const night = target.createLinearGradient(0, crownY, width, crownY);
    night.addColorStop(0, "rgba(6, 4, 10, 0.38)");
    night.addColorStop(0.42, "rgba(12, 8, 18, 0.08)");
    night.addColorStop(0.7, "rgba(250, 247, 242, 0)");
    night.addColorStop(1, "rgba(250, 247, 242, 0.08)");
    target.fillStyle = night;
    target.fillRect(0, 0, width, height);

    const placed = cities.map((city) => mapPoint(city.u, city.v, metrics));
    for (const link of LINKS) {
      const start = placed[link[0]];
      const end = placed[link[1]];
      if (!start || !end) continue;
      const lift = 70 + Math.abs(start.x - end.x) * 0.18;
      target.strokeStyle = "#C9A7E4";
      target.globalAlpha = 0.75;
      target.lineWidth = 1.5;
      target.beginPath();
      target.moveTo(start.x, start.y);
      target.quadraticCurveTo((start.x + end.x) / 2, Math.min(start.y, end.y) - lift, end.x, end.y);
      target.stroke();
      target.globalAlpha = 1;
      target.fillStyle = "#FAF7F2";
      for (const point of [start, end]) {
        target.beginPath();
        target.arc(point.x, point.y, 2.2, 0, Math.PI * 2);
        target.fill();
      }
    }

    for (let index = 0; index < cities.length; index += 1) {
      const city = cities[index];
      const point = placed[index];
      if (!city || !point || point.y < crownY + 4 || point.y > height) continue;
      const nightSide = clamp01((cx - point.x) / (width * 0.45) + 0.15);
      const alpha = city.bright * (0.45 + nightSide * 0.55);
      const glow = target.createRadialGradient(point.x, point.y, 0, point.x, point.y, city.size * 3.2);
      glow.addColorStop(0, `rgba(250, 247, 242, ${alpha})`);
      glow.addColorStop(0.45, `rgba(201, 167, 228, ${alpha * 0.4})`);
      glow.addColorStop(1, "rgba(201, 167, 228, 0)");
      target.fillStyle = glow;
      target.beginPath();
      target.arc(point.x, point.y, city.size * 3.2, 0, Math.PI * 2);
      target.fill();
      target.fillStyle = `rgba(255, 250, 244, ${Math.min(1, alpha + 0.25)})`;
      target.fillRect(point.x - city.size, point.y - 0.7, city.size * 2.1, 1.5);
    }

    const shade = target.createLinearGradient(0, crownY + 40, 0, height);
    shade.addColorStop(0, "rgba(0, 0, 0, 0)");
    shade.addColorStop(1, "rgba(0, 0, 0, 0.32)");
    target.fillStyle = shade;
    target.fillRect(0, crownY, width, height);
    target.restore();

    const limb = target.createLinearGradient(0, crownY, width, crownY);
    limb.addColorStop(0, "rgba(85, 35, 111, 0.2)");
    limb.addColorStop(0.5, "rgba(244, 236, 252, 0.95)");
    limb.addColorStop(1, "rgba(157, 95, 193, 0.35)");
    target.strokeStyle = limb;
    target.lineWidth = 2.5 + state.glow * 4;
    target.beginPath();
    target.arc(cx, cy, radius + 1, Math.PI * 1.05, Math.PI * 1.95);
    target.stroke();
    target.globalAlpha = 0.35 + state.glow * 0.3;
    target.lineWidth = 16 + state.glow * 12;
    target.strokeStyle = "rgba(180, 132, 210, 0.7)";
    target.beginPath();
    target.arc(cx, cy, radius + 10, Math.PI * 1.1, Math.PI * 1.9);
    target.stroke();
    target.globalAlpha = 1;
  };

  const paintFragments = (metrics: ReturnType<typeof globe>, shatter: number) => {
    const cols = width < 900 ? 8 : 12;
    const rows = width < 900 ? 5 : 7;
    const top = Math.max(0, metrics.crownY - 36);
    const regionH = Math.max(1, height - top);
    const cellW = width / cols;
    const cellH = regionH / rows;
    const impactX = width / 2;
    const impactY = metrics.crownY + 18;
    const maxDist = Math.hypot(width / 2, regionH);

    context.drawImage(plate, 0, 0, plate.width, (top * plate.height) / height, 0, 0, width, top);
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const sx = col * cellW;
        const sy = top + row * cellH;
        const cellX = sx + cellW / 2;
        const cellY = sy + cellH / 2;
        const dist = Math.hypot(cellX - impactX, cellY - impactY) / maxDist;
        const local = clamp01((shatter - dist * 0.42) / 0.58);
        const angle = Math.atan2(cellY - impactY, cellX - impactX);
        const travel = local * (36 + (1 - dist) * (width < 900 ? 90 : 150));
        context.save();
        context.globalAlpha = 1 - local * 0.94;
        context.translate(cellX + Math.cos(angle) * travel, cellY + Math.sin(angle) * travel * 0.72 - local * 24);
        context.rotate((col - cols / 2) * local * 0.28 + (row - 1) * local * 0.08);
        context.drawImage(
          plate,
          (sx * plate.width) / width,
          (sy * plate.height) / height,
          (cellW * plate.width) / width + 1,
          (cellH * plate.height) / height + 1,
          -cellW / 2,
          -cellH / 2,
          cellW + 1,
          cellH + 1,
        );
        if (local > 0.18 && local < 0.92 && (col + row) % 2 === 0) {
          context.globalAlpha = (1 - local) * 0.85;
          context.fillStyle = (col + row) % 4 === 0 ? "#FAF7F2" : "#C9A7E4";
          context.fillRect(-2, -1, 5 + local * 8, 1.4);
        }
        context.restore();
      }
    }
  };

  const drawRing = (metrics: ReturnType<typeof globe>) => {
    if (state.burst <= 0.02) return;
    const { cx, crownY } = metrics;
    context.save();
    context.globalAlpha = state.burst * 0.9;
    context.strokeStyle = "#FAF7F2";
    context.lineWidth = 1.5 + state.burst * 2;
    context.beginPath();
    context.ellipse(cx, crownY + 8, width * (0.16 + state.burst * 0.42), 12 + state.burst * 36, 0, Math.PI, Math.PI * 2);
    context.stroke();
    context.globalAlpha = state.burst * 0.35;
    context.strokeStyle = "#C9A7E4";
    context.lineWidth = 8;
    context.beginPath();
    context.ellipse(cx, crownY + 14, width * (0.1 + state.burst * 0.28), 8 + state.burst * 16, 0, Math.PI, Math.PI * 2);
    context.stroke();
    context.restore();
  };

  const render = () => {
    const metrics = globe();
    const shatter = Number.isFinite(state.shatter) ? state.shatter : 0;
    context.clearRect(0, 0, width, height);
    drawStars();
    if (shatter < 0.012) drawWorld(context, metrics);
    else {
      drawWorld(plateContext, metrics);
      paintFragments(metrics, shatter);
    }
    drawRing(metrics);
  };

  const tick = (now: number) => {
    if (disposed) return;
    const delta = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!state.reduced) spin += delta * (0.08 + state.glow * 0.12);
    if (active) render();
    frame = window.requestAnimationFrame(tick);
  };

  resize();
  if (reduced) render();
  else frame = window.requestAnimationFrame(tick);

  return {
    setState: (next) => {
      state = {
        glow: Number.isFinite(next.glow) ? next.glow : state.glow,
        burst: Number.isFinite(next.burst) ? next.burst : state.burst,
        shatter: Number.isFinite(next.shatter) ? next.shatter : state.shatter,
        reduced: next.reduced,
      };
      if (reduced) render();
    },
    setView: (next) => {
      width = next.width;
      height = next.height;
      resize();
      if (reduced || !active) render();
    },
    setActive: (next) => {
      active = next;
      if (active && !reduced) last = performance.now();
    },
    dispose: () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
    },
  };
}
