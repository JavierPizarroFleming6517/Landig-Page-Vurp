import { platform } from "../data/content";

export function Platform() {
  return (
    <section className="section" id="plataforma">
      <div className="wrap">
        <div className="intro">
          <p className="eyebrow">Una plataforma</p>
          <h2 className="section__title">
            Tres piezas. <em>Un solo proyecto.</em>
          </h2>
          <p className="section__lead">Software, automatización y seguridad se entregan juntos.</p>
        </div>
        {/* Un solo panel dividido en tres: las piezas son partes del mismo proyecto, no productos sueltos. */}
        <div className="platform__grid">
          {platform.map((item) => {
            const Icon = item.icon;
            return (
              <article className="platform__card" key={item.title}>
                <Icon size={28} />
                <span className="kicker">{item.kicker}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <a href={item.href}>Ver más</a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
