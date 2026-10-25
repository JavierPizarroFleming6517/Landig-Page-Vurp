import { metrics, outcomes } from "../data/content";

export function Metrics() {
  return (
    <section className="section" aria-labelledby="metricas-titulo">
      <div className="wrap">
        <div className="intro">
          <p className="eyebrow">Cómo trabajamos</p>
          <h2 className="section__title" id="metricas-titulo">
            Criterios que se notan <em>en el resultado.</em>
          </h2>
        </div>
        <div className="metrics__grid">
          <article className="metric metric--lead">
            <p className="kicker">La base</p>
            <strong>Hecho para tu operación</strong>
            <p>No prometemos un número mágico. Prometemos un sistema que calza con tu día a día.</p>
          </article>
          {metrics.map((item) => (
            <article className="metric" key={item.value}>
              <strong>{item.value}</strong>
              <p>{item.label}</p>
            </article>
          ))}
        </div>
        {/* Los resultados van como lista tipográfica, sin tarjetas: la sección no es un muro de cajas. */}
        <ul className="outcomes">
          {outcomes.map((item) => (
            <li key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
