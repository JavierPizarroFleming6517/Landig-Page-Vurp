import { DEVICE } from "./config";
import type { HeroLayout, Rect } from "./layout";

const rectPath = ({ x, y, w, h }: Rect) => `M${x} ${y}h${w}v${h}h${-w}Z`;

const roundedPath = ({ x, y, w, h }: Rect, r: number) =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}` +
  `h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}Z`;

/**
 * Notebook (placeholder de la Fase 1): habitación con el agujero de la pantalla, tapa, bisagra, base y filas de
 * teclas como rectángulos. Las coordenadas son px del viewport en p = 0; el SVG se maqueta a tamaño de cruce.
 */
export function Notebook({ layout }: { layout: HeroLayout }) {
  const { room, screen, lid, hinge, deck, keyRows } = layout.notebook;
  // Habitación y tapa llevan el agujero de la pantalla (evenodd): por ahí se ve el fondo del Hero.
  const roomShape = rectPath(room) + rectPath(screen);
  const lidShape = roundedPath(lid, lid.r) + rectPath(screen);
  const deckShape = `M${deck.topLeft} ${deck.top}L${deck.topRight} ${deck.top}L${deck.bottomRight} ${deck.bottom}L${deck.bottomLeft} ${deck.bottom}Z`;

  return (
    <svg
      className="notebook"
      viewBox={`${room.x} ${room.y} ${room.w} ${room.h}`}
      width={layout.device.width}
      height={layout.device.height}
      preserveAspectRatio="none"
      focusable="false"
    >
      <defs>
        <radialGradient id="notebook-glow-a" gradientUnits="userSpaceOnUse" cx={layout.width * 0.8} cy={-layout.height * 0.1} r={900}>
          <stop offset="0" stopColor="#8b46ab" stopOpacity="0.28" />
          <stop offset="0.6" stopColor="#8b46ab" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="notebook-glow-b" gradientUnits="userSpaceOnUse" cx={-layout.width * 0.1} cy={layout.height * 0.2} r={700}>
          <stop offset="0" stopColor="#55236f" stopOpacity="0.35" />
          <stop offset="0.55" stopColor="#55236f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path className="notebook__room" fillRule="evenodd" d={roomShape} />
      <path fill="url(#notebook-glow-a)" fillRule="evenodd" d={roomShape} />
      <path fill="url(#notebook-glow-b)" fillRule="evenodd" d={roomShape} />
      <path className="notebook__deck" d={deckShape} />
      {keyRows.map((row) => {
        const cols = DEVICE.keys.cols;
        const keyWidth = (row.x1 - row.x0 - row.gap * (cols - 1)) / cols;
        return Array.from({ length: cols }, (_, col) => (
          <rect
            key={`${row.y}-${col}`}
            className="notebook__key"
            x={row.x0 + col * (keyWidth + row.gap)}
            y={row.y}
            width={keyWidth}
            height={row.h}
            rx={row.h * 0.12}
          />
        ));
      })}
      <rect className="notebook__hinge" x={hinge.x} y={hinge.y} width={hinge.w} height={hinge.h} />
      <path className="notebook__lid" fillRule="evenodd" d={lidShape} />
    </svg>
  );
}
