import { vars } from "./graphData";

/** Tramo del pulso dentro del carril de una etapa: cuándo parte, cuánto dura y dónde termina (px). */
export type PulseSpan = { delay: number; duration: number; length?: number };

/**
 * Tramo de main dentro de una etapa. Su geometría (vertical u horizontal, primera o última etapa) la pone el CSS;
 * `start` es dónde empieza el tramo (px) para pintarlo hasta la punta del dibujo (`--tip`).
 */
export function Lane({ start, pulse }: { start: number; pulse?: PulseSpan }) {
  return (
    <i className="proc__lane" style={vars({ "--t": start })}>
      {pulse && (
        <i
          className="proc__pulse"
          style={vars({
            "--delay": `${pulse.delay}s`,
            "--duration": `${pulse.duration}s`,
            ...(pulse.length === undefined ? {} : { "--stop": `${pulse.length}px` }),
          })}
        />
      )}
    </i>
  );
}

/** Nodo del commit, con el número de la etapa. `arrive`: segundos hasta que el pulso llega (etapa seleccionada). */
export function Dot({ on, label, arrive }: { on: boolean; label: string; arrive?: number }) {
  return (
    <b
      className={`proc__dot${on ? " is-on" : ""}${arrive === undefined ? "" : " is-arriving"}`}
      style={arrive === undefined ? undefined : vars({ "--arrive": `${arrive}s` })}
    >
      {label}
    </b>
  );
}
