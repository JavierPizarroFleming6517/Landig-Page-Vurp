/**
 * Configuración central de la intro. Los tramos, la cámara, las órbitas y los tiempos se ajustan aquí,
 * sin tocar la lógica. Los tramos de scroll se expresan como fracción (0–1) del recorrido de la sección.
 */
import { welcomeLines } from "../../data/content";

export { welcomeLines };

/** Alto total de la sección. El stage sticky mide 100svh, así que el recorrido es (SECTION_VH − 100)vh. */
export const SECTION_VH = 500;

export type SceneId = "presentacion" | "orbita" | "intercambio" | "impacto" | "revelacion" | "transicion";

export interface SceneRange {
  id: SceneId;
  label: string;
  start: number;
  end: number;
}

export const SCENES: readonly [SceneRange, ...SceneRange[]] = [
  { id: "presentacion", label: "1 · Presentación", start: 0, end: 0.1 },
  { id: "orbita", label: "2 · Órbita", start: 0.1, end: 0.32 },
  { id: "intercambio", label: "3 · Intercambio", start: 0.32, end: 0.56 },
  { id: "impacto", label: "4 · Impacto", start: 0.56, end: 0.74 },
  { id: "revelacion", label: "5 · Revelación", start: 0.74, end: 0.88 },
  { id: "transicion", label: "6 · Transición", start: 0.88, end: 1 },
];

/** Puntos de la línea de tiempo (fracciones del recorrido). */
export const TIMELINE = {
  /** Recorrido de las órbitas: el logo y el texto pasan de θ = 0 a θ = π. */
  orbitStart: 0.04,
  orbitEnd: 0.5,
  /** Posición de cada mensaje dentro del recorrido de la órbita (0–1). */
  messageAnchors: [0, 0.45, 1] as const,
  /** Distancia (en recorrido de órbita) a la que un mensaje empieza a apagarse y en la que desaparece. */
  messageFade: { inner: 0.14, outer: 0.32 },
  textOut: { start: 0.56, end: 0.6 },
  dive: { start: 0.6, end: 0.68 },
  impact: 0.68,
  glow: { start: 0.58, peak: 0.68, end: 0.76 },
  /** El destello nunca supera `max` de opacidad: nada de pantallazo blanco. */
  flash: { rise: 0.672, end: 0.7, max: 0.35 },
  shatter: { start: 0.675, end: 0.74 },
  burst: { start: 0.676, end: 0.75 },
  planetOut: { start: 0.69, end: 0.78 },
  reveal: { inStart: 0.76, inEnd: 0.82, outStart: 0.88, outEnd: 0.94 },
  backdropOut: { start: 0.88, end: 0.96 },
} as const;

/** Entrada de la escena 1, por tiempo, una vez que termina el splash. */
export const ENTER = {
  delayMs: 150,
  durationMs: 900,
  /** Desplazamiento vertical inicial (px) de logo y texto. */
  offsetPx: 16,
  /** Brillo puntual del planeta durante la entrada (0–1). */
  glow: 0.3,
} as const;

/** Suavizado del progreso: constante de tiempo del lerp exponencial (s). Sin overshoot. */
export const SMOOTHING_SECONDS = 0.09;

/** Cámara compartida por la proyección del DOM y, desde la Fase 2, por Three.js (radio del planeta = 1). */
export const CAMERA = {
  distance: 7,
} as const;

export interface OrbitConfig {
  /** Radio de la órbita en unidades de mundo (radio del planeta = 1). */
  radius: number;
  /** Inclinación de la órbita (rad): el tramo trasero sube en pantalla y el delantero baja. */
  tilt: number;
  /** Desplazamiento vertical del centro de la órbita (unidades de mundo). */
  offsetY: number;
}

export interface LayoutPreset {
  /** Radio del planeta en px = min(ancho × planetVw, alto × planetVh). */
  planetVw: number;
  planetVh: number;
  /** Centro vertical del planeta como fracción del alto del stage. */
  centerY: number;
  /** Alto del logo orbitando, relativo al radio del planeta en px. */
  logoSize: number;
  /** Ancho del bloque de texto: min(textMaxPx, ancho × textVw). */
  textVw: number;
  textMaxPx: number;
  logoOrbit: OrbitConfig;
  textOrbit: OrbitConfig;
  /** Cuánto amplifica la profundidad la escala proyectada (1 = perspectiva pura). */
  logoDepthGain: number;
  textDepthGain: number;
  /** Opacidad mínima del logo en el punto más profundo de la órbita. */
  logoBackOpacity: number;
}

export const BREAKPOINT = 900;

export const LAYOUT: Record<"wide" | "compact", LayoutPreset> = {
  wide: {
    planetVw: 0.15,
    planetVh: 0.24,
    centerY: 0.5,
    logoSize: 0.5,
    textVw: 0.3,
    textMaxPx: 420,
    logoOrbit: { radius: 1.55, tilt: 0.85, offsetY: 0 },
    textOrbit: { radius: 2.1, tilt: 0.56, offsetY: 0 },
    logoDepthGain: 2.5,
    textDepthGain: 0.3,
    logoBackOpacity: 0.55,
  },
  compact: {
    planetVw: 0.25,
    planetVh: 0.2,
    centerY: 0.4,
    logoSize: 0.55,
    textVw: 0.82,
    textMaxPx: 360,
    logoOrbit: { radius: 1.4, tilt: 0.85, offsetY: 0 },
    textOrbit: { radius: 0.12, tilt: 0.4, offsetY: -2.1 },
    logoDepthGain: 2.5,
    textDepthGain: 0.3,
    logoBackOpacity: 0.55,
  },
};
