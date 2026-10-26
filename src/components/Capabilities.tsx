import { useRef, type CSSProperties } from "react";
import { useInView } from "./Mascot/useInView";
import "./Capabilities.css";

const cards = [
  { id: "sistemas", area: "Software", title: "Software que calza contigo", art: "app" },
  { id: "paneles", area: "Software", title: "Todo donde lo necesitas", art: "modules" },
  { id: "flujos", area: "Automatización", title: "Menos tareas repetitivas", art: "flow" },
  { id: "chat", area: "Automatización", title: "Herramientas que conversan", art: "chat" },
  { id: "audit", area: "Ciberseguridad", title: "Encuentra los riesgos antes", art: "audit" },
  { id: "iso", area: "Ciberseguridad", title: "Seguridad con estructura", art: "controls" },
] as const;

export function Capabilities() {
  const ref = useRef<HTMLElement>(null);
  const { entered } = useInView(ref, 0);

  return (
    <section
      className={entered ? "section cap is-in" : "section cap"}
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
  if (kind === "app") return <AppArt />;
  if (kind === "modules") return <ModulesArt />;
  if (kind === "flow") return <FlowArt />;
  if (kind === "chat") return <ChatArt />;
  if (kind === "audit") return <AuditArt />;
  return <ControlsArt />;
}

function AppArt() {
  return (
    <div className="art art--app" aria-hidden="true">
      <span className="art__side" />
      <span className="art__main">
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}

function ModulesArt() {
  return (
    <div className="art art--modules" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

function FlowArt() {
  return (
    <svg className="art art--flow" viewBox="0 0 280 96" aria-hidden="true">
      <path className="art__dash" d="M28 48 H108 L132 28 H196 L220 48 H252" />
      <circle cx="28" cy="48" r="7" />
      <circle cx="132" cy="28" r="7" />
      <circle cx="220" cy="48" r="7" />
    </svg>
  );
}

function ChatArt() {
  return (
    <div className="art art--chat" aria-hidden="true">
      <span className="art__bubble">Pedido recibido</span>
      <span className="art__bubble art__bubble--me">Aviso a bodega</span>
      <span className="art__apps">
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}

function AuditArt() {
  return (
    <ul className="art art--audit" aria-hidden="true">
      <li>
        <b>Accesos</b>
        <em>Revisar</em>
      </li>
      <li>
        <b>Respaldos</b>
        <em className="is-ok">En orden</em>
      </li>
      <li>
        <b>Exposición</b>
        <em>Hallazgo</em>
      </li>
    </ul>
  );
}

function ControlsArt() {
  return (
    <div className="art art--docs" aria-hidden="true">
      <span />
      <span />
      <span>
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}
