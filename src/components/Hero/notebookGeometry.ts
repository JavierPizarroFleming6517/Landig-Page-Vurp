import { DEVICE } from "./config";
import { lerp } from "./easing";

export type Point = readonly [number, number];

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Cuadrilátero en sentido horario desde la esquina superior izquierda. */
export type Quad = readonly [Point, Point, Point, Point];

export interface KeyShape {
  /** Tecla completa: la parte que asoma bajo la cara es su costado frontal (volumen). */
  body: Quad;
  /** Cara superior. */
  face: Quad;
  radius: number;
}

/** Geometría del notebook en p = 0, en px del viewport (es también el viewBox del SVG). */
export interface NotebookGeometry {
  /** Plano de la habitación: cubre el viewport durante todo el zoom y tiene el agujero de la pantalla. */
  room: Rect;
  screen: Rect;
  /** Tapa (aluminio) y, dentro del borde, el bisel negro. */
  lid: Rect & { r: number };
  bezel: Rect & { r: number };
  camera: { x: number; y: number; r: number };
  hinge: Rect;
  /** Base en perspectiva: se ensancha hacia el espectador. */
  deck: Quad;
  well: Quad;
  keys: readonly KeyShape[];
  touchpad: Quad;
  /** Borde frontal de la base y sombra de contacto. */
  lip: Quad;
  shadow: { cx: number; cy: number; rx: number; ry: number };
  /** Reflejo diagonal tenue en la esquina superior izquierda del vidrio (no llega al centro, donde está el logo). */
  reflection: readonly Point[];
  /** Ancho de la pantalla: escala de los trazos finos. */
  unit: number;
}

/**
 * Profundidad proyectada (0–1) de un punto de la base a la fracción `z` de su profundidad real (0 = bisagra,
 * 1 = borde frontal). Las zonas cercanas se ven más altas: la derivada crece de 1/(1+k) a (1+k).
 */
const project = (z: number) => {
  const k = DEVICE.deck.perspective;
  return z / (1 + k * (1 - z));
};

/** Tramos de profundidad (z) de cada fila de teclas. */
function rowSpans() {
  const { from, to, gap } = DEVICE.keyboard;
  const total = DEVICE.rows.reduce((sum, row) => sum + row.height, 0) + gap * (DEVICE.rows.length - 1);
  const spans: Array<readonly [number, number]> = [];
  let cursor = 0;
  for (const row of DEVICE.rows) {
    const start = from + ((to - from) * cursor) / total;
    cursor += row.height;
    spans.push([start, from + ((to - from) * cursor) / total]);
    cursor += gap;
  }
  return spans;
}

/**
 * Alto (en anchos de pantalla) desde el borde superior de la tapa hasta el final de las primeras `rows` filas de
 * teclas. Admite filas fraccionarias.
 */
export function heightToRows(rows: number) {
  const { lid, hinge, deck } = DEVICE;
  const spans = rowSpans();
  const index = Math.min(spans.length - 1, Math.floor(rows));
  const [start, end] = spans[index] ?? [0, 0];
  const z = rows >= spans.length ? end : lerp(start, end, rows - index);
  return lid.top + 1 / DEVICE.aspect + lid.bottom + hinge.height + deck.depth * project(z);
}

const mix = (a: Point, b: Point, t: number): Point => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

export function notebookGeometry(screen: Rect, room: Rect): NotebookGeometry {
  const sw = screen.w;
  const { lid: lidSize, hinge, deck, keyboard, touchpad } = DEVICE;

  const lid = {
    x: screen.x - lidSize.side * sw,
    y: screen.y - lidSize.top * sw,
    w: screen.w + 2 * lidSize.side * sw,
    h: screen.h + (lidSize.top + lidSize.bottom) * sw,
    r: lidSize.radius * sw,
  };
  const rim = lidSize.rim * sw;
  const bezel = { x: lid.x + rim, y: lid.y + rim, w: lid.w - 2 * rim, h: lid.h - 2 * rim, r: lid.r - rim };
  const camera = { x: screen.x + screen.w / 2, y: (bezel.y + screen.y) / 2, r: DEVICE.camera * sw };
  const hingeRect = { x: lid.x + hinge.inset * sw, y: lid.y + lid.h, w: lid.w - 2 * hinge.inset * sw, h: hinge.height * sw };

  const top = hingeRect.y + hingeRect.h;
  const depth = deck.depth * sw;
  const backLeft: Point = [lid.x - deck.overhang * sw, top];
  const backRight: Point = [lid.x + lid.w + deck.overhang * sw, top];
  const frontLeft: Point = [backLeft[0] - deck.flare * depth, top + depth];
  const frontRight: Point = [backRight[0] + deck.flare * depth, top + depth];

  /** Punto de la base: `u` a lo ancho (0–1), `z` en profundidad real; `inset` recorta los costados. */
  const at = (u: number, z: number, inset = 0): Point => {
    const t = project(z);
    const left = mix(backLeft, frontLeft, t);
    const right = mix(backRight, frontRight, t);
    return mix(left, right, inset + u * (1 - 2 * inset));
  };
  const area = (u0: number, u1: number, z0: number, z1: number, inset = 0): Quad => [
    at(u0, z0, inset),
    at(u1, z0, inset),
    at(u1, z1, inset),
    at(u0, z1, inset),
  ];

  const keys: KeyShape[] = [];
  rowSpans().forEach(([z0, z1], index) => {
    const row = DEVICE.rows[index];
    if (!row) return;
    const total = row.keys.reduce((sum, width) => sum + width, 0) + keyboard.gap * (row.keys.length - 1);
    let cursor = 0;
    for (const width of row.keys) {
      const u0 = cursor / total;
      const u1 = (cursor + width) / total;
      cursor += width + keyboard.gap;
      const body = area(u0, u1, z0, z1, keyboard.inset);
      // La cara superior deja ver abajo el costado frontal de la tecla.
      const face = area(u0, u1, z0, lerp(z0, z1, 1 - keyboard.travel), keyboard.inset);
      const height = body[3][1] - body[0][1];
      const keyWidth = body[1][0] - body[0][0];
      keys.push({ body, face, radius: 0.2 * Math.min(height, keyWidth) });
    }
  });

  const well = area(0, 1, keyboard.from - 0.025, keyboard.to + 0.025, keyboard.inset - 0.012);
  const padInset = (1 - touchpad.width) / 2;
  const pad = area(padInset, 1 - padInset, touchpad.from, touchpad.to);

  const lipHeight = deck.lip * sw;
  const lip: Quad = [
    frontLeft,
    frontRight,
    [frontRight[0] - lipHeight * 0.4, frontRight[1] + lipHeight],
    [frontLeft[0] + lipHeight * 0.4, frontLeft[1] + lipHeight],
  ];
  const shadow = {
    cx: screen.x + screen.w / 2,
    cy: frontLeft[1] + lipHeight,
    rx: (frontRight[0] - frontLeft[0]) * 0.52,
    ry: 0.035 * sw,
  };

  const reflection: Point[] = [
    [screen.x, screen.y],
    [screen.x + screen.w * 0.42, screen.y],
    [screen.x, screen.y + screen.h * 0.62],
  ];

  return {
    room,
    screen,
    lid,
    bezel,
    camera,
    hinge: hingeRect,
    deck: [backLeft, backRight, frontRight, frontLeft],
    well,
    keys,
    touchpad: pad,
    lip,
    shadow,
    reflection,
    unit: sw,
  };
}
