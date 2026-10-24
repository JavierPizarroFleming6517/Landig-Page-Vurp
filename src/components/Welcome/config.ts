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
  messageAnchors: [0, 0.45, 0.92] as const,
  /**
   * Distancia (en recorrido de órbita) a la que un mensaje empieza a apagarse y en la que desaparece. Con `outer`
   * menor que la mitad de la distancia entre anclas, el saliente se apaga antes de que entre el siguiente y
   * nunca se encima el texto.
   */
  messageFade: { inner: 0.1, outer: 0.22 },
  /** Desplazamiento vertical (px) con que un mensaje entra desde abajo y el anterior sale hacia arriba. */
  messageShiftPx: 14,
  textOut: { start: 0.56, end: 0.6 },
  dive: { start: 0.6, end: 0.68 },
  impact: 0.68,
  glow: { start: 0.58, peak: 0.68, end: 0.76 },
  /** El destello nunca supera `max` de opacidad: nada de pantallazo blanco. */
  flash: { rise: 0.672, end: 0.7, max: 0.35 },
  /** Fragmentación: el cuerpo se disuelve desde el punto de impacto y los puntos de los continentes se dispersan. */
  shatter: { start: 0.676, end: 0.8 },
  /** Ondas de energía y núcleo de luz en el punto de impacto. */
  burst: { start: 0.676, end: 0.74 },
  /** Solo para el planeta CSS de respaldo (sin WebGL). */
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
  /** Radio de la órbita en unidades de mundo (radio del planeta = 1). El layout lo ajusta si no cabe. */
  radius: number;
  /** Inclinación de la órbita (rad): el tramo trasero sube en pantalla y el delantero baja. */
  tilt: number;
  /** Desplazamiento vertical del centro de la órbita (unidades de mundo). */
  offsetY: number;
  /** Giro de la órbita en el plano de la pantalla (rad). Con roll ≠ 0 los extremos quedan en diagonal. */
  roll?: number;
}

export interface LayoutPreset {
  /** Radio base del planeta en px = min(ancho × planetVw, alto × planetVh); luego se multiplica por PLANET_SCALE. */
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

/** Proporción ancho/alto del símbolo oficial (viewBox de simbolo-oscuro.svg). */
export const LOGO_ASPECT = 239 / 171;

/**
 * Factor de tamaño del planeta respecto del radio base. El layout prueba primero `preferred` y, si con él
 * el logo no puede cambiar de capa fuera del disco sin salirse de la pantalla, baja a `min`.
 */
export const PLANET_SCALE = { preferred: 1.3, min: 1.25 } as const;

/** Márgenes (px) del layout: separación mínima entre el logo y el disco al cambiar de capa, y respecto de los bordes. */
export const LAYOUT_MARGIN = { disc: 8, edge: 8 } as const;

export const LAYOUT: Record<"wide" | "compact", LayoutPreset> = {
  wide: {
    planetVw: 0.15,
    planetVh: 0.24,
    centerY: 0.46,
    logoSize: 0.4,
    textVw: 0.26,
    textMaxPx: 360,
    logoOrbit: { radius: 1.55, tilt: 0.85, offsetY: 0 },
    textOrbit: { radius: 1.78, tilt: 0.6, offsetY: 0 },
    logoDepthGain: 2.5,
    textDepthGain: 0.3,
    logoBackOpacity: 0.55,
  },
  compact: {
    planetVw: 0.25,
    planetVh: 0.2,
    centerY: 0.4,
    logoSize: 0.44,
    textVw: 0.82,
    textMaxPx: 360,
    // En móvil no hay ancho para dar la vuelta por los costados: la órbita va en diagonal.
    logoOrbit: { radius: 1.46, tilt: 0.85, offsetY: 0, roll: 0.75 },
    textOrbit: { radius: 0.12, tilt: 0.4, offsetY: -2.1 },
    logoDepthGain: 2.5,
    textDepthGain: 0.3,
    logoBackOpacity: 0.55,
  },
};

/** Paleta oficial (manual de marca · 03). Sobre Grafito se usan los tonos "claros". */
export const COLORS = {
  grafito: "#25232B",
  berenjena: "#55236F",
  berenjenaClaro: "#9D5FC1",
  orquidea: "#8B46AB",
  orquideaClaro: "#B484D2",
  lila: "#C9A7E4",
  lilaClaro: "#E4D5F2",
  marfil: "#FAF7F2",
  /** Derivado de Grafito, más profundo, para el cuerpo del planeta. */
  planetCore: "#141218",
} as const;

/** Planeta 3D (radio = 1 unidad de mundo). */
export const PLANET = {
  /** Orientación inicial (grados): punto que queda de frente en la escena 1 y giro del eje en pantalla. */
  facing: { lat: -18, lon: -60, roll: 12 },
  /** Rotación propia (rad/s, desde que aparece el planeta) y giro extra a lo largo de todo el recorrido (rad). */
  spinSpeed: 0.03,
  scrollTurn: 0.6,
  /** La esfera oclusora es apenas menor que los puntos para que no parpadeen con ella. */
  occluderRadius: 0.985,
  /** Continentes como nube de puntos (máscara Natural Earth 110m). Cantidad de puntos de tierra por tier. */
  continents: {
    points: { wide: 9000, compact: 4000 },
    radius: 1.003,
    /** Tamaño del punto (px CSS) y fracción de puntos con núcleo Marfil. */
    size: { wide: 2.4, compact: 2.2 },
    ivoryShare: 0.06,
  },
  /** Arcos entre ciudades: elevación máxima (para los más largos), opacidad base y pulsos de luz. */
  arcs: {
    lift: 0.22,
    alpha: 0.22,
    pulseSpeed: 0.16,
    pulseShare: 0.6,
  },
  citySize: 7,
  /** Líneas orbitales finas alrededor del planeta: radio, inclinación y giro (rad). Sin anillos. */
  orbitLines: {
    alpha: 0.09,
    lines: [
      { radius: 1.16, tiltX: 0.35, tiltZ: 0.4 },
      { radius: 1.24, tiltX: -0.5, tiltZ: -0.55 },
      { radius: 1.32, tiltX: 0.75, tiltZ: -0.12 },
    ],
  },
  atmosphereRadius: 1.14,
  atmosphereAlpha: 0.38,
  /** Tope de devicePixelRatio para el canvas WebGL. */
  dprCap: { wide: 2, compact: 1.5 },
} as const;

/** Ciudades reales (lat, lon) y sus conexiones. Coquimbo es la base de Vurp. */
export const NETWORK = {
  cities: {
    coquimbo: [-29.95, -71.34],
    santiago: [-33.45, -70.67],
    lima: [-12.05, -77.04],
    bogota: [4.71, -74.07],
    panama: [8.98, -79.52],
    mexico: [19.43, -99.13],
    saoPaulo: [-23.55, -46.63],
    buenosAires: [-34.6, -58.38],
    montevideo: [-34.9, -56.16],
    miami: [25.76, -80.19],
    nuevaYork: [40.71, -74.01],
    sanFrancisco: [37.77, -122.42],
    madrid: [40.42, -3.7],
    londres: [51.51, -0.13],
    ciudadDelCabo: [-33.92, 18.42],
    dubai: [25.2, 55.27],
    singapur: [1.35, 103.82],
    tokio: [35.68, 139.69],
    sidney: [-33.87, 151.21],
  },
  links: [
    ["coquimbo", "santiago"],
    ["coquimbo", "lima"],
    ["coquimbo", "saoPaulo"],
    ["coquimbo", "buenosAires"],
    ["coquimbo", "bogota"],
    ["coquimbo", "mexico"],
    ["coquimbo", "miami"],
    ["santiago", "buenosAires"],
    ["santiago", "madrid"],
    ["santiago", "sidney"],
    ["lima", "bogota"],
    ["bogota", "panama"],
    ["panama", "mexico"],
    ["mexico", "sanFrancisco"],
    ["miami", "nuevaYork"],
    ["nuevaYork", "londres"],
    ["saoPaulo", "montevideo"],
    ["saoPaulo", "madrid"],
    ["saoPaulo", "ciudadDelCabo"],
    ["buenosAires", "montevideo"],
    ["madrid", "londres"],
    ["londres", "dubai"],
    ["dubai", "singapur"],
    ["singapur", "tokio"],
    ["singapur", "sidney"],
    ["sanFrancisco", "tokio"],
  ],
} as const;

/** Explosión digital (Fase 4): sin fuego, solo luz en la paleta. */
export const EXPLOSION = {
  /** Distancia máxima (unidades de mundo) que recorren los puntos más rápidos al dispersarse. */
  spread: 1.35,
  /** Tamaño de los fragmentos en que se rompe el cuerpo (celdas por unidad de mundo). */
  shardDensity: 26,
  /** Ondas: radio final (unidades de mundo), desfase dentro del tramo `burst` y opacidad máxima. */
  waves: [
    { radius: 2.6, delay: 0, alpha: 0.85, width: 0.035 },
    { radius: 3.6, delay: 0.16, alpha: 0.5, width: 0.06 },
  ],
  /** Onda que recorre la superficie del planeta desde el impacto. */
  surfaceWave: { radius: 1.6, alpha: 0.6 },
  /** Núcleo de luz en el punto de impacto (radio en unidades de mundo). */
  core: { radius: 0.5, alpha: 0.72 },
  /** Opacidad a la que bajan los puntos y arcos que quedan detrás del logo cuando cruza por delante del disco. */
  focusDim: 0.3,
} as const;

/** Fondo: estrellas pintadas una sola vez por resize. */
export const STARS = {
  /** Estrellas por px² del stage. */
  density: 1 / 9000,
  maxCount: 220,
} as const;
