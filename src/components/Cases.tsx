import { cases } from "../data/content";

export function Cases() {
  return (
    <section className="section" id="casos">
      <div className="wrap">
        <div className="intro">
          <p className="eyebrow">Casos de uso</p>
          <h2 className="section__title">
            Problemas reales, <em>sistemas concretos.</em>
          </h2>
          <p className="section__lead">
            No son clientes inventados. Son las situaciones para las que armamos el trabajo.
          </p>
        </div>
        <div className="cases__grid">
          {cases.map((item) => {
            const Icon = item.icon;
            return (
              <article className="case" key={item.title}>
                <span className="case__icon" aria-hidden="true">
                  <Icon size={22} />
                </span>
                <div className="case__body">
                  <p className="kicker">{item.area}</p>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
