import { studio } from "../data/content";

export function Studio() {
  return (
    <section className="section" aria-labelledby="entrega-titulo">
      <div className="wrap studio">
        <div className="intro">
          <p className="eyebrow">Después de construir</p>
          <h2 className="section__title" id="entrega-titulo">
            Lo dejamos en <em>tus manos.</em>
          </h2>
        </div>
        <ul className="studio__list">
          {studio.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.title}>
                <Icon size={26} />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
