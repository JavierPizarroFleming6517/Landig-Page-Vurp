import { platform } from "../data/content";

export function Platform() {
  return (
    <section className="section" id="plataforma">
      <div className="wrap">
        <div className="intro">
          <div>
            <p className="eyebrow">Una plataforma</p>
            <h2 className="section__title">
              Tres piezas. <em>Un solo proyecto.</em>
            </h2>
          </div>
          <p className="section__lead">Software, automatización y seguridad se entregan juntos.</p>
        </div>
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
