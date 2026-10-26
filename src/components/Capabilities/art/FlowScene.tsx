import { Bell, Check, Database, FileText } from "lucide-react";
import "./FlowScene.css";

const steps = [
  { label: "Llega factura", Icon: FileText },
  { label: "Se registra", Icon: Database },
  { label: "Se notifica", Icon: Bell },
] as const;

/** Conteo del día: la tira sube hasta el último valor (el que se ve sin animación). */
const counts = [125, 126, 127, 128] as const;

/** "Menos tareas repetitivas": una factura recorre el flujo sola y el contador del día sube. */
export function FlowScene() {
  return (
    <div className="scene scene--flow" aria-hidden="true">
      <div className="flow__steps">
        <span className="flow__track">
          <i className="flow__pulse" />
        </span>
        {steps.map(({ label, Icon }, index) => (
          <div className={`flow__step flow__step--${index}`} key={label}>
            <span className="flow__node">
              <Icon strokeWidth={2} />
              <b className="flow__check">
                <Check strokeWidth={3.5} />
              </b>
            </span>
            <span className="flow__label">{label}</span>
          </div>
        ))}
      </div>
      <p className="flow__count">
        Tareas automáticas hoy
        <strong className="flow__ticker">
          <span className="flow__strip" style={{ ["--n" as string]: counts.length - 1 }}>
            {counts.map((count) => (
              <span key={count}>{count}</span>
            ))}
          </span>
        </strong>
      </p>
    </div>
  );
}
