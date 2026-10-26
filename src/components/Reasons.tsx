import { useRef } from "react";
import { useInView } from "./Mascot/useInView";
import "./Reasons.css";

const reasons = [
  {
    n: "01",
    title: "Primero entendemos",
    text: "No empezamos recomendando una herramienta. Primero entendemos el problema que necesitas resolver.",
  },
  {
    n: "02",
    title: "A medida de verdad",
    text: "Cada proyecto tiene sus propias necesidades. Diseñamos soluciones alrededor de ellas, no de un catálogo cerrado.",
  },
  {
    n: "03",
    title: "Seguridad desde el diseño",
    text: "Pensamos en accesos, datos y riesgos desde las primeras decisiones. Y cuando necesitas una evaluación especializada, también podemos abordar ese trabajo.",
  },
  {
    n: "04",
    title: "Conectamos lo que ya usas",
    text: "Antes de reemplazar herramientas, evaluamos cómo aprovecharlas e integrarlas. No todo necesita construirse desde cero.",
  },
  {
    n: "05",
    title: "Sin promesas infladas",
    text: "Explicamos lo que proponemos, sus alcances y sus límites. Preferimos una conversación clara a vender soluciones mágicas.",
    place: "Coquimbo, Chile",
  },
] as const;

export function Reasons() {
  const ref = useRef<HTMLElement>(null);
  const { entered } = useInView(ref, 0);

  return (
    <section
      className={entered ? "section why is-in" : "section why"}
      id="por-que-vurp"
      ref={ref}
      aria-labelledby="por-que-titulo"
    >
      <div className="wrap">
        <div className="intro why__intro">
          <p className="eyebrow">Por qué Vurp</p>
          <h2 className="section__title" id="por-que-titulo">
            La tecnología importa. <em>Cómo se construye, también.</em>
          </h2>
          <p className="section__lead">
            Nos importa entender el desafío, construir con criterio y hablar claro sobre lo que podemos hacer.
          </p>
        </div>

        <div className="why__grid">
          {reasons.map((reason) => (
            <article className={`why__card why__card--${reason.n}`} key={reason.n}>
              <span className="why__num" aria-hidden="true">
                {reason.n}
              </span>
              <h3>{reason.title}</h3>
              <p>{reason.text}</p>
              {reason.n === "04" ? <Links /> : null}
              {"place" in reason ? <p className="why__place">{reason.place}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Links() {
  return (
    <span className="why__links" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}
