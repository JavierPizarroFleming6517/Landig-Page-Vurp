import { useId, type CSSProperties } from "react";
import { ART } from "./art";

/**
 * Decoraciones de cada estado, fuera del dibujo para animarlas por separado y pintarlas con los tokens de marca.
 * Reproducen las marcas que venían en los PNG originales (en sus mismas posiciones, ya en el lienzo alineado); la
 * ampolleta pasa de amarillo a los violetas de la marca. Cuál se ve y cómo se mueve lo decide Mascot.css según
 * `data-state` del botón.
 */

/** Trazo afinado: de (x1, y1), el extremo fino hacia la mascota, a (x2, y2), el extremo grueso. */
function taper(x1: number, y1: number, x2: number, y2: number, thin = 4, thick = 8) {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const nx = -(y2 - y1) / length;
  const ny = (x2 - x1) / length;
  const a = thin / 2;
  const b = thick / 2;
  const p = (x: number, y: number) => `${x.toFixed(2)},${y.toFixed(2)}`;
  return [
    `M${p(x1 + nx * a, y1 + ny * a)}`,
    `L${p(x2 + nx * b, y2 + ny * b)}`,
    `A${b},${b} 0 0 0 ${p(x2 - nx * b, y2 - ny * b)}`,
    `L${p(x1 - nx * a, y1 - ny * a)}`,
    `A${a},${a} 0 0 0 ${p(x1 + nx * a, y1 + ny * a)}`,
    "Z",
  ].join(" ");
}

/** Destello de cuatro puntas centrado en el origen. */
function sparkle(r: number) {
  const k = r * 0.16;
  return `M0,${-r} C${k},${-k} ${k},${-k} ${r},0 C${k},${k} ${k},${k} 0,${r} C${-k},${k} ${-k},${k} ${-r},0 C${-k},${-k} ${-k},${-k} 0,${-r} Z`;
}

/** Orden de cada pieza (`--i`) para escalonar su animación. */
const order = (index: number) => ({ "--i": index }) as CSSProperties;

type Stroke = readonly [number, number, number, number];

/** Marcas de tecleo junto al notebook. */
const TYPING: readonly Stroke[] = [
  [112.5, 235, 97.5, 210],
  [91, 230, 72.5, 219],
  [100.5, 244, 85, 239],
];

/** Marcas de "¿eh?" sobre la cabeza al mirar al visitante. */
const NOTICE: readonly Stroke[] = [
  [267.75, 113.75, 287.75, 80],
  [281.5, 122.5, 304, 107.5],
];

/** Marcas del saludo alrededor de la pata levantada; giran en torno a ella (ver --wave-origin en Mascot.css). */
const WAVE: readonly Stroke[] = [
  [80.25, 171.25, 66.5, 150],
  [69, 176.25, 52.75, 166.25],
  [94.5, 173.75, 94.5, 155],
];

/** Marcas de la cola contenta. */
const WAG: readonly Stroke[] = [
  [332.75, 267.5, 349, 236.25],
  [342.75, 277.5, 371.5, 253.75],
];

const SPARKLES = [
  { x: 151.5, y: 118, r: 18 },
  { x: 114, y: 157, r: 21 },
  { x: 109.5, y: 218, r: 15 },
] as const;

/** Ampolleta: centro del vidrio y rayos (ángulo en grados, radio interior y exterior). */
const BULB = { x: 134, y: 95 } as const;
const RAYS = [180, 225, 270, 315, 0].map((deg) => {
  const rad = (deg * Math.PI) / 180;
  const [r1, r2] = [39, 51];
  return taper(Math.cos(rad) * r1, Math.sin(rad) * r1, Math.cos(rad) * r2, Math.sin(rad) * r2, 5, 5);
});

const strokes = (list: readonly Stroke[]) =>
  list.map(([x1, y1, x2, y2], index) => (
    <path key={index} className="decor__mark" d={taper(x1, y1, x2, y2)} style={order(index)} />
  ));

export function MascotDecor() {
  const glow = useId();

  return (
    <svg className="mascot__decor" viewBox={`0 0 ${ART.width} ${ART.height}`} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={glow}>
          <stop offset="0" className="decor__glow-stop" />
          <stop offset="1" className="decor__glow-stop" />
        </radialGradient>
      </defs>
      <g className="decor decor--idle">{strokes(TYPING)}</g>
      <g className="decor decor--attention">{strokes(NOTICE)}</g>
      <g className="decor decor--greeting">{strokes(WAVE)}</g>
      <g className="decor decor--idea" transform={`translate(${BULB.x} ${BULB.y})`}>
        <circle className="decor__glow" r="58" fill={`url(#${glow})`} />
        <g className="decor__rays">
          {RAYS.map((d, index) => (
            <path key={index} className="decor__mark" d={d} style={order(index)} />
          ))}
        </g>
        <g className="decor__bulb">
          <path
            className="decor__glass"
            d="M-26,0 A26,26 0 1 1 26,0 C26,10 19,16 15,22 L15,28 L-15,28 L-15,22 C-19,16 -26,10 -26,0 Z"
          />
          <path className="decor__filament" d="M-7,27 V15 Q-7,7 0,10 Q7,7 7,15 V27" />
          <rect className="decor__base" x="-14" y="31" width="28" height="6" rx="3" />
          <rect className="decor__base" x="-12" y="40" width="24" height="6" rx="3" />
          <rect className="decor__base" x="-6" y="49" width="12" height="4" rx="2" />
        </g>
      </g>
      <g className="decor decor--happy">
        {SPARKLES.map((item, index) => (
          <g key={index} transform={`translate(${item.x} ${item.y})`}>
            <path className="decor__sparkle" d={sparkle(item.r)} style={order(index)} />
          </g>
        ))}
        {strokes(WAG)}
      </g>
    </svg>
  );
}
