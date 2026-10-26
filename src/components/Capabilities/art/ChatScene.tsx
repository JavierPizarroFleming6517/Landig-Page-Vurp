import { Check } from "lucide-react";
import "./ChatScene.css";

/** "Herramientas que conversan": el cliente pregunta, el asistente responde con el dato del sistema y lo registra. */
export function ChatScene() {
  return (
    <div className="scene scene--chat" aria-hidden="true">
      <div className="chat__panel scene-panel">
        <p className="chat__head">
          <span className="chat__avatar" />
          <strong>Asistente</strong>
          <span>en línea</span>
        </p>
        <div className="chat__log">
          <p className="chat__bubble chat__bubble--in">¿Tienen stock del taladro TX-20?</p>
          <div className="chat__reply">
            <p className="chat__typing">
              <i />
              <i />
              <i />
            </p>
            <p className="chat__bubble chat__bubble--out">Sí, quedan 14 en bodega.</p>
          </div>
          <em className="scene-chip scene-chip--ok chat__saved">
            <Check strokeWidth={3} />
            Registrado en el sistema
          </em>
        </div>
      </div>
    </div>
  );
}
