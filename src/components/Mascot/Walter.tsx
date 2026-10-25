import { useRef } from "react";
import { walterMessages } from "../../data/content";
import { MascotDecor } from "./MascotDecor";
import { MascotPoses } from "./MascotPoses";
import { useInView } from "./useInView";
import { WALTER_POSE, type WalterState } from "./walterState";
import "./Mascot.css";

/**
 * Walter junto al formulario: escenario, pose según el estado y globo con el mensaje. Es complementario: va oculto
 * para lectores de pantalla (lo esencial lo dicen los campos y la nota del formulario) y no recibe clics.
 * `data-entered` dispara la entrada una sola vez; `data-live` deja correr las animaciones solo en pantalla.
 */
export function Walter({ state }: { state: WalterState }) {
  const stage = useRef<HTMLDivElement>(null);
  const { inView, entered } = useInView(stage);
  const pose = WALTER_POSE[state];
  const message: { text: string; note?: string } = walterMessages[state];

  return (
    <div
      className="walter"
      ref={stage}
      aria-hidden="true"
      data-entered={entered ? "" : undefined}
      data-live={inView ? "" : undefined}
    >
      <span className="walter__orb" />
      <span className="walter__desk" />
      <span className="mascot walter__figure" data-state={pose}>
        <span className="mascot__shadow" />
        <span className="mascot__body">
          <span className="mascot__breath">
            <MascotPoses state={pose} />
          </span>
          <MascotDecor />
        </span>
      </span>
      {/* key: cada mensaje nuevo entra con su propio fundido. */}
      <p className="walter__bubble" key={state}>
        <strong>{message.text}</strong>
        {message.note ? <span>{message.note}</span> : null}
      </p>
    </div>
  );
}
