import { useState } from "react";
import { solutions } from "../data/content";

export function Solutions() {
  const [active, setActive] = useState(solutions[0]?.id ?? "");
  const current = solutions.find((item) => item.id === active) ?? solutions[0];
  if (!current) return null;

  return (
    <section className="section" id="soluciones">
      <div className="wrap">
        <div className="intro">
          <div>
            <p className="eyebrow">Para cada parte de tu empresa</p>
            <h2 className="section__title">
              Tenemos una forma de <em>ordenarlo.</em>
            </h2>
          </div>
        <div className="pills" role="tablist" aria-label="Soluciones">
          {solutions.map((item) => (
            <button
              key={item.id}
              className={item.id === current.id ? "pill is-on" : "pill"}
              type="button"
              role="tab"
              aria-selected={item.id === current.id}
              onClick={() => setActive(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        </div>
        <div className="solution">
          <div className="card solution__list">
            <div className="solution__head">
              <span className="mark" aria-hidden="true">
                {current.label.slice(0, 1)}
              </span>
              <div>
                <h3>{current.title}</h3>
                <p>{current.summary}</p>
              </div>
            </div>
            {current.features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article className="solution__item" key={feature.title}>
                  <Icon size={22} />
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
          <aside className="solution__preview">
            <div className="preview__window">
              <p className="kicker">Así se ve en la práctica</p>
              <h3>{current.label}</h3>
              <ol>
                {current.features.map((feature, index) => (
                  <li key={feature.title}>
                    0{index + 1} · {feature.title}
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
