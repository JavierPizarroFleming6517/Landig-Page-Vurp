import { useState } from "react";
import { ART, type MascotArtProps, type MascotState } from "./art";

/** Una pose por estado: PNG originales limpiados, alineados por el notebook y exportados a WebP. */
const POSES: Record<MascotState, string> = {
  idle: "/mascota/trabajando.webp",
  attention: "/mascota/atento.webp",
  greeting: "/mascota/saludo.webp",
  idea: "/mascota/idea.webp",
  happy: "/mascota/feliz.webp",
};

const ORDER = Object.keys(POSES) as MascotState[];

/**
 * Dibujo con imágenes: la pose nueva aparece encima de la anterior, que se mantiene visible mientras dura el fundido
 * (así no se transparenta el fondo a mitad de camino). Las cinco quedan en el DOM para que el cambio sea inmediato.
 */
export function MascotPoses({ state }: MascotArtProps) {
  const [shown, setShown] = useState({ current: state, previous: state });
  if (shown.current !== state) setShown({ current: state, previous: shown.current });

  return (
    <span className="mascot__poses">
      {ORDER.map((pose) => (
        <img
          key={pose}
          className="mascot__pose"
          src={POSES[pose]}
          alt=""
          width={ART.width}
          height={ART.height}
          loading="lazy"
          decoding="async"
          draggable={false}
          data-pose={pose === shown.current ? "on" : pose === shown.previous ? "prev" : undefined}
        />
      ))}
    </span>
  );
}
