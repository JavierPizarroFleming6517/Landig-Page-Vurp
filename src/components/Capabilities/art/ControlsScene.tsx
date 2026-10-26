import { Check } from "lucide-react";
import "./ControlsScene.css";

const controls = ["Accesos", "Respaldos", "Políticas", "Registros"] as const;

/** Conteo de controles: la tira sube hasta el último valor (el que se ve sin animación). */
const counts = [14, 15, 16, 17, 18] as const;
const TOTAL = 20;

/** "Seguridad con estructura": los controles se van implementando y la barra avanza. */
export function ControlsScene() {
  const done = counts[counts.length - 1] ?? 0;
  return (
    <div className="scene scene--controls" aria-hidden="true">
      <div className="ctrl__panel scene-panel">
        <p className="ctrl__head">
          Controles implementados
          <strong>
            <span className="ctrl__ticker">
              <span className="ctrl__strip" style={{ ["--n" as string]: counts.length - 1 }}>
                {counts.map((count) => (
                  <span key={count}>{count}</span>
                ))}
              </span>
            </span>
            /{TOTAL}
          </strong>
        </p>
        <span className="ctrl__bar">
          <i style={{ ["--p" as string]: done / TOTAL }} />
        </span>
        <ul className="ctrl__list">
          {controls.map((name, index) => (
            <li className={`ctrl__item--${index}`} key={name}>
              <b className="ctrl__check">
                <i className="ctrl__tick">
                  <Check strokeWidth={3.5} />
                </i>
              </b>
              {name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
