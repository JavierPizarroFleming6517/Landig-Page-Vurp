import { securityBackground, securityBadge, securityFeatures, securityStats } from "../data/content";
import type { SecurityStat } from "../types";
import "./SecurityHighlight.css";

function Stat({ stat }: { stat: SecurityStat }) {
  return (
    <div className="security__stat">
      <span className="security__stat-value">
        {stat.value}
        {stat.suffix}
      </span>
      <span className="security__stat-label">{stat.label}</span>
    </div>
  );
}

export function SecurityHighlight() {
  const BadgeIcon = securityBadge.icon;

  return (
    <section id="seguridad" className="section security media-surface">
      <div className="media-bg security__bg">
        <img src={securityBackground.src} alt="" loading="lazy" />
      </div>
      <div className="security__overlay" />

      <div className="container security__layout">
        <div className="security__intro">
          <div>
            <span className="eyebrow">Ciberseguridad integrada</span>
          </div>
          <div>
            <h2 className="title">Software con respaldo de seguridad</h2>
          </div>
          <div>
            <p className="subtitle">
              La seguridad no es un módulo que se agrega al final. Está presente en cada decisión de diseño, en
              cada línea de código y en cada servidor que mantenemos.
            </p>
          </div>

          <div>
            <div className="security__shield">
              <div className="security__ring security__ring--outer" />
              <div className="security__ring security__ring--inner" />
              <span className="security__shield-core">
                <BadgeIcon size={40} strokeWidth={1.5} />
              </span>
              <span className="security__shield-label">{securityBadge.label}</span>
            </div>
          </div>
        </div>

        <div className="security__content">
          <div className="security__grid">
            {securityFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.id} className="security__card">
                  <span className="security__card-icon">
                    <Icon size={22} strokeWidth={1.75} />
                  </span>
                  <h3 className="security__card-title">{feature.title}</h3>
                  <p className="security__card-description">{feature.description}</p>
                </article>
              );
            })}
          </div>

          <div>
            <div className="security__stats">
              {securityStats.map((stat) => (
                <Stat key={stat.id} stat={stat} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
