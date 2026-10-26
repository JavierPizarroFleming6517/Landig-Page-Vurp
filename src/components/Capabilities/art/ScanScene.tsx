import { Check, Globe, HardDrive, Mail, TriangleAlert } from "lucide-react";
import "./ScanScene.css";

const assets = [
  { name: "Sitio web", Icon: Globe, severity: "Alta", tone: "high" },
  { name: "Correo", Icon: Mail, severity: "Media", tone: "mid" },
  { name: "Respaldos", Icon: HardDrive, severity: null, tone: null },
] as const;

/** "Encuentra los riesgos antes": el escaneo marca hallazgos con severidad y después quedan corregidos. */
export function ScanScene() {
  return (
    <div className="scene scene--scan" aria-hidden="true">
      <div className="scan__panel scene-panel">
        <ul className="scan__list">
          {assets.map(({ name, Icon, severity, tone }, index) => (
            <li key={name} style={{ ["--a" as string]: index }}>
              <Icon className="scan__icon" strokeWidth={2} />
              <span className="scan__name">{name}</span>
              {severity ? (
                <>
                  <em className={`scene-chip scene-chip--${tone} scan__severity`}>
                    <TriangleAlert strokeWidth={2.5} />
                    {severity}
                  </em>
                  <em className="scene-chip scene-chip--ok scan__fixed">
                    <Check strokeWidth={3} />
                    Corregido
                  </em>
                </>
              ) : (
                <em className="scene-chip scene-chip--soft scan__clean">
                  <Check strokeWidth={3} />
                  Sin hallazgos
                </em>
              )}
            </li>
          ))}
        </ul>
        <span className="scan__beam" />
      </div>
    </div>
  );
}
