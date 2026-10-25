import type { HeroLayout } from "./layout";
import type { Point, Quad, Rect } from "./notebookGeometry";

const rectPath = ({ x, y, w, h }: Rect) => `M${x} ${y}h${w}v${h}h${-w}Z`;

const roundedPath = ({ x, y, w, h }: Rect, r: number) =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}` +
  `h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}Z`;

/** Punto a `distance` px de `from` en dirección a `to`. */
const toward = (from: Point, to: Point, distance: number): Point => {
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
  return [from[0] + ((to[0] - from[0]) * distance) / length, from[1] + ((to[1] - from[1]) * distance) / length];
};

/** Cuadrilátero con esquinas redondeadas (curvas cuadráticas con control en cada vértice). */
const quadPath = (quad: Quad, radius = 0) => {
  if (radius <= 0) return `M${quad.map(([x, y]) => `${x} ${y}`).join("L")}Z`;
  const parts: string[] = [];
  quad.forEach((corner, index) => {
    const prev = quad[(index + 3) % 4] ?? corner;
    const next = quad[(index + 1) % 4] ?? corner;
    const a = toward(corner, prev, radius);
    const b = toward(corner, next, radius);
    parts.push(`${index === 0 ? "M" : "L"}${a[0]} ${a[1]}Q${corner[0]} ${corner[1]} ${b[0]} ${b[1]}`);
  });
  return `${parts.join("")}Z`;
};

/**
 * Notebook en SVG: habitación con el agujero de la pantalla, tapa de aluminio oscuro con bisel y cámara, bisagra,
 * base en perspectiva con teclas trapezoidales con volumen, touchpad y borde frontal. Las coordenadas son px del
 * viewport en p = 0; el SVG se maqueta a tamaño de cruce.
 */
export function Notebook({ layout }: { layout: HeroLayout }) {
  const { room, screen, lid, bezel, camera, hinge, deck, well, keys, touchpad, lip, shadow, reflection, unit } =
    layout.notebook;
  const hairline = Math.max(0.6, unit * 0.0011);
  const panelStroke = unit * 0.003;
  // Habitación, tapa y bisel llevan el agujero de la pantalla (evenodd): por ahí se ve el fondo del Hero.
  const hole = rectPath(screen);
  const roomShape = rectPath(room) + hole;

  return (
    <svg
      className="notebook"
      viewBox={`${room.x} ${room.y} ${room.w} ${room.h}`}
      width={layout.device.width}
      height={layout.device.height}
      preserveAspectRatio="none"
      shapeRendering="geometricPrecision"
      focusable="false"
    >
      <defs>
        <radialGradient id="nb-glow-a" gradientUnits="userSpaceOnUse" cx={layout.width * 0.8} cy={-layout.height * 0.1} r={900}>
          <stop offset="0" stopColor="#8b46ab" stopOpacity="0.28" />
          <stop offset="0.6" stopColor="#8b46ab" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nb-glow-b" gradientUnits="userSpaceOnUse" cx={-layout.width * 0.1} cy={layout.height * 0.2} r={700}>
          <stop offset="0" stopColor="#55236f" stopOpacity="0.35" />
          <stop offset="0.55" stopColor="#55236f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nb-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3643" />
          <stop offset="1" stopColor="#25232b" />
        </linearGradient>
        <linearGradient id="nb-bezel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f0d12" />
          <stop offset="1" stopColor="#0a090c" />
        </linearGradient>
        <linearGradient id="nb-hinge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d0c10" />
          <stop offset="0.55" stopColor="#2e2b35" />
          <stop offset="1" stopColor="#121015" />
        </linearGradient>
        <linearGradient id="nb-deck" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#25232b" />
          <stop offset="1" stopColor="#36323f" />
        </linearGradient>
        <linearGradient id="nb-key" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c2934" />
          <stop offset="1" stopColor="#1f1d25" />
        </linearGradient>
        <linearGradient id="nb-lip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a4555" />
          <stop offset="1" stopColor="#1b1920" />
        </linearGradient>
        <linearGradient id="nb-reflection" gradientUnits="userSpaceOnUse" x1={screen.x} y1={screen.y} x2={screen.x + screen.w * 0.24} y2={screen.y + screen.h * 0.36}>
          <stop offset="0" stopColor="#faf7f2" stopOpacity="0.07" />
          <stop offset="1" stopColor="#faf7f2" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="nb-shadow">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path className="notebook__room" fillRule="evenodd" d={roomShape} />
      <path fill="url(#nb-glow-a)" fillRule="evenodd" d={roomShape} />
      <path fill="url(#nb-glow-b)" fillRule="evenodd" d={roomShape} />

      <ellipse cx={shadow.cx} cy={shadow.cy} rx={shadow.rx} ry={shadow.ry} fill="url(#nb-shadow)" />
      <path fill="url(#nb-lip)" d={quadPath(lip, unit * 0.006)} />
      <path d={`M${lip[0][0]} ${lip[0][1]}L${lip[1][0]} ${lip[1][1]}`} className="notebook__edge-light" strokeWidth={hairline * 1.4} />
      <path fill="url(#nb-deck)" d={quadPath(deck, unit * 0.004)} />
      <path className="notebook__well" d={quadPath(well, unit * 0.01)} />
      {keys.map((key) => (
        <g key={`${key.body[0][0]}-${key.body[0][1]}`}>
          <path className="notebook__key-side" d={quadPath(key.body, key.radius)} />
          <path fill="url(#nb-key)" className="notebook__key" strokeWidth={hairline} d={quadPath(key.face, key.radius)} />
        </g>
      ))}
      <path className="notebook__touchpad" strokeWidth={hairline} d={quadPath(touchpad, unit * 0.012)} />

      <rect fill="url(#nb-hinge)" x={hinge.x} y={hinge.y} width={hinge.w} height={hinge.h} rx={hinge.h / 2} />
      <path className="notebook__lid" fill="url(#nb-lid)" fillRule="evenodd" d={roundedPath(lid, lid.r) + hole} />
      <path className="notebook__edge-light" fill="none" strokeWidth={hairline} d={roundedPath(lid, lid.r)} />
      <path fill="url(#nb-bezel)" fillRule="evenodd" d={roundedPath(bezel, bezel.r) + hole} />
      <circle className="notebook__camera" cx={camera.x} cy={camera.y} r={camera.r} />
      <circle className="notebook__lens" cx={camera.x} cy={camera.y} r={camera.r * 0.45} />

      {/* Vidrio: borde levemente iluminado del panel (por fuera del agujero, sobre el bisel, para que no quede
          línea en el cruce) y un reflejo tenue en la esquina, lejos del logo. */}
      <rect
        className="notebook__panel"
        x={screen.x - panelStroke / 2}
        y={screen.y - panelStroke / 2}
        width={screen.w + panelStroke}
        height={screen.h + panelStroke}
        strokeWidth={panelStroke}
      />
      <path fill="url(#nb-reflection)" d={`M${reflection.map(([x, y]) => `${x} ${y}`).join("L")}Z`} />
    </svg>
  );
}
