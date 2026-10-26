import { Check, RefreshCw } from "lucide-react";
import "./SyncScene.css";

function Order() {
  return (
    <div className="sync__order">
      <strong>Pedido #1042</strong>
      <span className="sync__status">
        <em className="scene-chip scene-chip--soft sync__before">Pendiente</em>
        <em className="scene-chip scene-chip--ok sync__after">
          <Check strokeWidth={3} />
          Despachado
        </em>
      </span>
    </div>
  );
}

/** "Todo donde lo necesitas": el mismo pedido en escritorio y celular; cambia en uno y se ve en el otro. */
export function SyncScene() {
  return (
    <div className="scene scene--sync" aria-hidden="true">
      <div className="sync__desk scene-panel">
        <span className="sync__bar">
          <i />
          <i />
          <i />
        </span>
        <div className="sync__screen">
          <Order />
          <span className="sync__line" />
          <span className="sync__line sync__line--short" />
        </div>
      </div>
      <span className="sync__link">
        <RefreshCw strokeWidth={2.5} />
      </span>
      <div className="sync__phone scene-panel">
        <span className="sync__notch" />
        <Order />
      </div>
    </div>
  );
}
