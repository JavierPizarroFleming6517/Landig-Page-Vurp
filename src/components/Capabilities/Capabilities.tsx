import { useRef, type CSSProperties } from "react";
import { useInView } from "../Mascot/useInView";
import { AdaptScene } from "./art/AdaptScene";
import { ChatScene } from "./art/ChatScene";
import { ControlsScene } from "./art/ControlsScene";
import { FlowScene } from "./art/FlowScene";
import { ScanScene } from "./art/ScanScene";
import { SyncScene } from "./art/SyncScene";
import "./art/scene.css";
import "./Capabilities.css";

const cards = [
  { id: "sistemas", area: "Software", title: "Software que calza contigo", art: "app" },
  { id: "paneles", area: "Software", title: "Todo donde lo necesitas", art: "modules" },
  { id: "flujos", area: "Automatización", title: "Menos tareas repetitivas", art: "flow" },
  { id: "chat", area: "Automatización", title: "Herramientas que conversan", art: "chat" },
  { id: "audit", area: "Ciberseguridad", title: "Encuentra los riesgos antes", art: "audit" },
  { id: "iso", area: "Ciberseguridad", title: "Seguridad con estructura", art: "controls" },
] as const;

const scenes = {
  app: AdaptScene,
  modules: SyncScene,
  flow: FlowScene,
  chat: ChatScene,
  audit: ScanScene,
  controls: ControlsScene,
} as const;

export function Capabilities() {
  const ref = useRef<HTMLElement>(null);
  const { inView, entered } = useInView(ref, 0);
  // `is-in`: entrada (una vez). `is-playing`: los loops de las escenas corren solo con la sección en pantalla.
  const state = `${entered ? " is-in" : ""}${inView ? " is-playing" : ""}`;

  return (
    <section
      className={`section cap${state}`}
      id="que-hacemos"
      ref={ref}
      aria-labelledby="que-hacemos-titulo"
    >
      <div className="wrap">
        <div className="intro cap__intro">
          <p className="eyebrow">Qué hacemos</p>
          <h2 className="section__title" id="que-hacemos-titulo">
            Ideas que toman forma. Procesos que fluyen. <em>Sistemas más seguros.</em>
          </h2>
          <p className="section__lead">
            Desarrollamos, conectamos y protegemos tecnología según lo que cada proyecto necesita.
          </p>
        </div>

        <div className="cap__grid">
          <article className="cap__center" style={{ "--i": 0 } as CSSProperties}>
            <p className="cap__area">Tres disciplinas</p>
            <h3>Se complementan. También se contratan solas.</h3>
            <Ecosystem />
          </article>

          {cards.map((card, index) => (
            <article className={`cap__card cap__card--${card.id}`} key={card.id} style={{ "--i": index + 1 } as CSSProperties}>
              <Art kind={card.art} />
              <p className="cap__area">{card.area}</p>
              <h3>{card.title}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Ecosystem() {
  return (
    <div className="cap__eco" aria-hidden="true">
      <div className="cap__orbit">
        <svg className="cap__eco-lines" viewBox="0 0 280 220">
          <path d="M140 108 C140 48, 52 48, 52 28" />
          <path d="M140 108 C140 48, 228 48, 228 28" />
          <path d="M140 124 C140 176, 140 176, 140 196" />
        </svg>
        <img className="cap__mark" src="/brand/simbolo-blanco.svg" alt="" />
        <span className="cap__node cap__node--soft">Software</span>
        <span className="cap__node cap__node--auto">Automatización</span>
        <span className="cap__node cap__node--sec">Ciberseguridad</span>
      </div>
    </div>
  );
}

function Art({ kind }: { kind: (typeof cards)[number]["art"] }) {
  const Scene = scenes[kind];
  return <Scene />;
}
