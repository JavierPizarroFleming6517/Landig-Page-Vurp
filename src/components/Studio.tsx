import { studio } from "../data/content";

export function Studio() {
  return (
    <section className="section" aria-labelledby="entrega-titulo">
      <div className="wrap">
        <p className="eyebrow">Después de construir</p>
        <h2 className="section__title" id="entrega-titulo">
          Lo dejamos en <em>tus manos.</em>
        </h2>
        <div className="studio__grid" style={{ marginTop: "2rem" }}>
          {studio.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title}>
                <Icon size={26} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
