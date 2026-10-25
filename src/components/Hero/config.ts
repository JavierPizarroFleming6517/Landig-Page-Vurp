/**
 * Configuración central del Hero. Los tramos, el alto, las escalas y el easing se ajustan aquí, sin tocar la lógica.
 * Los tramos de scroll se expresan como fracción (0–1) del recorrido de la sección.
 */
import { easeInQuad, type Range } from "./easing";

/** Alto total de la sección (en vh). El stage sticky mide 100svh, así que el recorrido es (alto − 100)vh. */
export const SECTION_VH = { wide: 300, compact: 280 } as const;

export const BREAKPOINT = 900;

/** Alto del header fijo (igual que `--nav` en index.css). Respaldo: el layout usa el borde inferior medido. */
export const NAV_CLEARANCE = 84;

/** Suavizado del progreso: constante de tiempo del lerp exponencial (s). Sin overshoot. */
export const SMOOTHING_SECONDS = 0.09;

export type SceneId = "notebook" | "viaje" | "armado" | "composicion" | "final";

export interface SceneRange extends Range {
  id: SceneId;
  label: string;
}

export const SCENES: readonly [SceneRange, ...SceneRange[]] = [
  { id: "notebook", label: "1 · Notebook", start: 0, end: 0.05 },
  { id: "viaje", label: "2 · Viaje", start: 0.05, end: 0.38 },
  { id: "armado", label: "3 · Armado", start: 0.38, end: 0.72 },
  { id: "composicion", label: "4 · Composición", start: 0.72, end: 0.94 },
  { id: "final", label: "Final", start: 0.94, end: 1 },
];

/** Puntos de la línea de tiempo (fracciones del recorrido). */
export const TIMELINE = {
  /** Zoom hacia la pantalla. El cruce (el agujero cubre el viewport) depende del layout y cae cerca del final. */
  zoom: { start: 0.05, end: 0.38 },
  /** El logo de la pantalla se apaga justo antes del cruce. */
  logoFade: { start: 0.27, end: 0.33 },
  /** Llegada del ERP desde el fondo y descenso a su posición final. */
  erpIn: { start: 0.38, end: 0.46 },
  erpSettle: { start: 0.72, end: 0.86 },
  /** Badge, título, bajada y CTAs: inicio de cada uno, duración común y desplazamiento vertical (px). */
  copy: { starts: [0.76, 0.79, 0.82, 0.85] as const, duration: 0.06, offsetPx: 16 },
} as const;

export const ZOOM = {
  /** Easing del zoom: ease-in, la cámara acelera hacia el cruce. */
  ease: easeInQuad,
  /** Escala de la capa de profundidad del fondo de adentro al inicio del zoom (llega a 1 al terminar). */
  depthFrom: 0.85,
} as const;

const units = (count: number) => Array.from({ length: count }, () => 1);

/**
 * Notebook. Las medidas de las piezas son relativas al ancho de la pantalla en p = 0. El aspecto es el del área
 * visible de la pantalla (16:10).
 */
export const DEVICE = {
  aspect: 1.6,
  /**
   * Ancho máximo de la pantalla en p = 0, como fracción del viewport (`?debug&w=` lo sobreescribe). El ancho real
   * es el que cabe: la tapa completa bajo el header y `visibleRows` filas de teclas sobre el borde inferior.
   */
  widthFraction: { wide: 0.72, compact: 1.2 },
  /** Margen (px) entre el borde inferior del header (medido) y el borde superior de la tapa. */
  topMargin: 16,
  /** Escritorio: filas de teclas que deben verse sobre el borde inferior del viewport. */
  visibleRows: 2.5,
  /** Móvil: centro vertical de la pantalla como fracción del alto del stage. */
  compactCenterY: 0.42,
  /** Tapa: bisel lateral, superior (con cámara) e inferior, borde de aluminio y radio de esquina. */
  lid: { side: 0.026, top: 0.04, bottom: 0.036, rim: 0.0045, radius: 0.022 },
  /** Radio de la cámara. */
  camera: 0.0042,
  hinge: { height: 0.016, inset: 0.06 },
  /**
   * Base vista desde arriba y de frente: cuánto sobresale de la tapa, profundidad proyectada, ensanche hacia el
   * espectador, perspectiva (cuánto más altas se ven las zonas cercanas) y alto del borde frontal.
   */
  deck: { overhang: 0.015, depth: 0.4, flare: 0.1, perspective: 0.5, lip: 0.016 },
  /**
   * Teclado: tramo de la profundidad que ocupa (0 = bisagra, 1 = borde frontal), margen lateral (fracción del ancho
   * de la base), separación entre teclas (fracción de una tecla) y fracción del alto que muestra el costado frontal.
   */
  keyboard: { from: 0.05, to: 0.6, inset: 0.085, gap: 0.16, travel: 0.24 },
  /** Filas de teclas: alto relativo y ancho de cada tecla en unidades (cada fila ocupa el ancho completo). */
  rows: [
    { height: 0.55, keys: units(14) },
    { height: 1, keys: [...units(13), 1.5] },
    { height: 1, keys: [1.5, ...units(12), 1] },
    { height: 1, keys: [1.8, ...units(11), 1.7] },
    { height: 1, keys: [2.3, ...units(10), 2.2] },
    { height: 1, keys: [1, 1, 1.2, 1.3, 5.5, 1.3, 1.2, 1, 1] },
  ] as readonly { height: number; keys: readonly number[] }[],
  touchpad: { from: 0.67, to: 0.94, width: 0.4 },
  /** Margen sobre la escala de cruce: con 1.04 el bisel ya está fuera del viewport cuando termina el zoom. */
  crossMargin: 1.04,
  /** Inclinación inicial (grados) que se endereza al llegar al cruce. 0 = frontal. `?debug&t=` la sobreescribe. */
  tiltDeg: 0,
  /** Perspectiva del stage (px) cuando hay inclinación. */
  perspectivePx: 1800,
} as const;

/** Símbolo en la pantalla: ancho en p = 0 (fracción del ancho de la pantalla) y cuánto crece antes de apagarse. */
export const LOGO = {
  src: "/brand/simbolo-blanco.svg",
  /** Proporción ancho/alto (viewBox de simbolo-blanco.svg). */
  aspect: 239 / 171,
  widthFraction: { wide: 0.14, compact: 0.2 },
  grow: 1.2,
} as const;

/** ERP: tamaño final (escala 1), posición y escalas del armado. */
export const ERP = {
  maxWidth: 1180,
  maxHeight: 660,
  /** Proporción ancho/alto en escritorio. */
  aspect: 1.75,
  compactMaxHeight: 600,
  /** Separación (px) entre el bloque de texto y el borde superior del ERP en la composición final. */
  gapBelowCopy: { wide: 40, compact: 28 },
  /** Posición mínima del borde superior del ERP, como fracción del alto. */
  minTop: { wide: 0.42, compact: 0.5 },
  /** Escala máxima mientras se arma (centrado) y escala relativa con que llega desde el fondo. */
  assemblyScale: 0.92,
  arriveScale: 0.94,
  /** Margen (px) con el header y el borde inferior mientras se arma. */
  assemblyMargin: 16,
} as const;
