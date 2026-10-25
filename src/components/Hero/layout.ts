import { BREAKPOINT, DEVICE, ERP, LOGO, TIMELINE, ZOOM } from "./config";
import { lerp } from "./easing";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface KeyRow {
  y: number;
  h: number;
  x0: number;
  x1: number;
  gap: number;
}

/** Geometría del notebook en p = 0, en px del viewport (es también el viewBox del SVG). */
export interface NotebookGeometry {
  /** Plano de la habitación: cubre el viewport durante todo el zoom y tiene el agujero de la pantalla. */
  room: Rect;
  screen: Rect;
  lid: Rect & { r: number };
  hinge: Rect;
  /** Base en trapecio: se ensancha hacia el espectador. */
  deck: { top: number; bottom: number; topLeft: number; topRight: number; bottomLeft: number; bottomRight: number };
  keyRows: readonly KeyRow[];
}

export interface HeroLayout {
  width: number;
  height: number;
  compact: boolean;
  widthFraction: number;
  /** Centro de la pantalla en p = 0. */
  cx: number;
  cy0: number;
  /** Zoom (visto desde p = 0) con el que el agujero cubre justo el viewport, y zoom final con margen. */
  kCross: number;
  kEnd: number;
  /** Valor del easing del zoom en el cruce (0–1) y progreso en que ocurre. */
  eCross: number;
  pCross: number;
  notebook: NotebookGeometry;
  /** Elemento del notebook maquetado a tamaño de cruce (escala máxima 1) y su transform-origin (centro de la pantalla). */
  device: { width: number; height: number; originX: number; originY: number };
  /** Símbolo de la pantalla a su tamaño máximo (justo antes de apagarse). */
  logo: { width: number; height: number };
  /** ERP a escala 1 en su posición final, y desplazamiento y escala con que se arma centrado. */
  erp: { left: number; top: number; width: number; height: number; assemblyY: number; assemblyScale: number };
}

interface Options {
  /** Borde inferior del bloque de texto (px desde el borde superior del stage). */
  copyBottom: number;
  /** Borde inferior del header fijo (px, medido). */
  headerBottom: number;
  /** Ancho de la pantalla forzado desde `?debug&w=`. */
  widthFraction?: number;
}

/** Progreso en que el easing del zoom alcanza `value` (bisección: el easing es monótono). */
function zoomProgressAt(value: number) {
  let low = 0;
  let high = 1;
  for (let i = 0; i < 24; i += 1) {
    const mid = (low + high) / 2;
    if (ZOOM.ease(mid) < value) low = mid;
    else high = mid;
  }
  return lerp(TIMELINE.zoom.start, TIMELINE.zoom.end, (low + high) / 2);
}

/**
 * Alto (en anchos de pantalla) desde el borde superior de la tapa hasta el final de las primeras `rows` filas de
 * teclas. Admite filas fraccionarias.
 */
function heightToRows(rows: number) {
  const { bezel, hinge, keys } = DEVICE;
  let total = bezel.top + 1 / DEVICE.aspect + bezel.bottom + hinge.height + keys.top;
  for (let row = 0; row < Math.ceil(rows); row += 1) {
    const share = Math.min(1, rows - row);
    total += share * (keys.height + (share === 1 ? keys.gap : 0)) * Math.pow(keys.growth, row);
  }
  return total;
}

function notebookGeometry(screen: Rect, room: Rect): NotebookGeometry {
  const sw = screen.w;
  const { bezel, hinge, deck, keys } = DEVICE;
  const lid = {
    x: screen.x - bezel.side * sw,
    y: screen.y - bezel.top * sw,
    w: screen.w + 2 * bezel.side * sw,
    h: screen.h + (bezel.top + bezel.bottom) * sw,
    r: DEVICE.lidRadius * sw,
  };
  const hingeRect = {
    x: lid.x + hinge.inset * sw,
    y: lid.y + lid.h,
    w: lid.w - 2 * hinge.inset * sw,
    h: hinge.height * sw,
  };
  const deckTop = hingeRect.y + hingeRect.h;
  const deckDepth = deck.depth * sw;
  const topLeft = lid.x - deck.overhang * sw;
  const topRight = lid.x + lid.w + deck.overhang * sw;
  const deckShape = {
    top: deckTop,
    bottom: deckTop + deckDepth,
    topLeft,
    topRight,
    bottomLeft: topLeft - deck.flare * deckDepth,
    bottomRight: topRight + deck.flare * deckDepth,
  };
  const edgeAt = (y: number) => {
    const t = (y - deckShape.top) / deckDepth;
    return [lerp(deckShape.topLeft, deckShape.bottomLeft, t), lerp(deckShape.topRight, deckShape.bottomRight, t)] as const;
  };

  const keyRows: KeyRow[] = [];
  let y = deckTop + keys.top * sw;
  for (let row = 0; row < keys.rows; row += 1) {
    const grow = Math.pow(keys.growth, row);
    const h = keys.height * sw * grow;
    const gap = keys.gap * sw * grow;
    const [left, right] = edgeAt(y + h / 2);
    const inset = keys.inset * (right - left);
    keyRows.push({ y, h, x0: left + inset, x1: right - inset, gap });
    y += h + gap;
  }

  return { room, screen, lid, hinge: hingeRect, deck: deckShape, keyRows };
}

export function computeLayout(
  width: number,
  height: number,
  { copyBottom, headerBottom, widthFraction }: Options,
): HeroLayout {
  const compact = width < BREAKPOINT;
  const preset = compact ? "compact" : "wide";
  const fraction = widthFraction ?? DEVICE.widthFraction[preset];
  const cx = width / 2;

  // Pantalla en p = 0: la tapa completa queda bajo el header. En escritorio el ancho es el que cabe entre el header
  // y el borde inferior con algunas filas de teclas a la vista, con `fraction` como máximo.
  const lidTop = headerBottom + DEVICE.topMargin;
  const toScreenCenter = DEVICE.bezel.top + 1 / DEVICE.aspect / 2;
  let sw: number;
  let cy0: number;
  if (compact) {
    sw = fraction * width;
    cy0 = Math.max(height * DEVICE.compactCenterY, lidTop + toScreenCenter * sw);
  } else {
    sw = Math.min(fraction * width, (height - lidTop) / heightToRows(DEVICE.visibleRows));
    cy0 = lidTop + toScreenCenter * sw;
  }
  const sh = sw / DEVICE.aspect;
  const screen = { x: cx - sw / 2, y: cy0 - sh / 2, w: sw, h: sh };

  // En el cruce el centro de la pantalla ya está en el centro del viewport: basta con cubrir el lado más justo.
  const kCross = Math.max(1.05, width / sw, height / sh);
  const kEnd = kCross * DEVICE.crossMargin;
  const eCross = Math.log(kCross) / Math.log(kEnd);

  // La habitación cubre el viewport en p = 0 con margen. Como solo crece alrededor de un punto del viewport, lo sigue
  // cubriendo; el margen vertical absorbe además el desplazamiento del centro hasta la mitad del alto.
  const shift = Math.abs(height / 2 - cy0);
  const marginX = width * 0.15;
  const marginY = height * 0.15 + shift;
  const room = { x: -marginX, y: -marginY, w: width + 2 * marginX, h: height + 2 * marginY };

  const logoWidth = LOGO.widthFraction[preset] * sw * LOGO.grow;

  const gutter = Math.min(72, Math.max(20, width * 0.032));
  const erpWidth = Math.min(ERP.maxWidth, width - 2 * gutter);
  const erpHeight = compact
    ? Math.min(ERP.compactMaxHeight, height * 0.78)
    : Math.min(ERP.maxHeight, erpWidth / ERP.aspect);
  const erpTop = Math.max(copyBottom + ERP.gapBelowCopy[preset], height * ERP.minTop[preset]);
  const available = height - headerBottom - 2 * ERP.assemblyMargin;
  const assemblyScale = Math.min(ERP.assemblyScale, available / erpHeight);
  const assemblyCenter = headerBottom + ERP.assemblyMargin + available / 2;

  return {
    width,
    height,
    compact,
    widthFraction: sw / width,
    cx,
    cy0,
    kCross,
    kEnd,
    eCross,
    pCross: zoomProgressAt(eCross),
    notebook: notebookGeometry(screen, room),
    device: {
      width: room.w * kEnd,
      height: room.h * kEnd,
      originX: (cx - room.x) * kEnd,
      originY: (cy0 - room.y) * kEnd,
    },
    logo: { width: logoWidth, height: logoWidth / LOGO.aspect },
    erp: {
      left: (width - erpWidth) / 2,
      top: erpTop,
      width: erpWidth,
      height: erpHeight,
      assemblyY: assemblyCenter - (erpTop + erpHeight / 2),
      assemblyScale,
    },
  };
}
