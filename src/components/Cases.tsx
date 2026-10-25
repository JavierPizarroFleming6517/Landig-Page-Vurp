import { cases } from "../data/content";

export function Cases() {
  return (
    <section className="section" id="casos">
      <div className="wrap">
        <p className="eyebrow">Casos de uso</p>
        <h2 className="section__title">
          Problemas reales, <em>sistemas concretos.</em>
        </h2>
        <p className="section__lead">
          No son clientes inventados. Son las situaciones para las que armamos el trabajo.
        </p>
        <div className="cases__grid" style={{ marginTop: "2rem" }}>
          {cases.map((item) => (
            <article className="case" key={item.title}>
              <p className="kicker">{item.area}</p>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
