import { BREAKPOINT, DEVICE, ERP, LOGO, TIMELINE, ZOOM } from "./config";
import { lerp } from "./easing";
import { heightToRows, notebookGeometry, type NotebookGeometry } from "./notebookGeometry";

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
  /** Inclinación inicial del notebook (grados). */
  tiltDeg: number;
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
  /** Ancho de la pantalla e inclinación forzados desde `?debug&w=` y `?debug&t=`. */
  widthFraction?: number;
  tiltDeg?: number;
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

export function computeLayout(
  width: number,
  height: number,
  { copyBottom, headerBottom, widthFraction, tiltDeg }: Options,
): HeroLayout {
  const compact = width < BREAKPOINT;
  const preset = compact ? "compact" : "wide";
  const fraction = widthFraction ?? DEVICE.widthFraction[preset];
  const cx = width / 2;

  // Pantalla en p = 0: la tapa completa queda bajo el header. En escritorio el ancho es el que cabe entre el header
  // y el borde inferior con algunas filas de teclas a la vista, con `fraction` como máximo.
  const lidTop = headerBottom + DEVICE.topMargin;
  const toScreenCenter = DEVICE.lid.top + 1 / DEVICE.aspect / 2;
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
    tiltDeg: tiltDeg ?? DEVICE.tiltDeg,
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
