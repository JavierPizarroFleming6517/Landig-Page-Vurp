import { ArrowRight, Check } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { solutions } from "../data/content";
import "./Services.css";

export function Services() {
  const [activeIndex, setActiveIndex] = useState(0);

  const active = solutions[activeIndex] ?? solutions[0];
  if (!active) return null;
  const ActiveIcon = active.icon;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const delta = event.key === "ArrowDown" ? 1 : -1;
    setActiveIndex((current) => (current + delta + solutions.length) % solutions.length);
  };

  return (
    <section id="soluciones" className="section services media-surface">
      <div className="services__bg">
        <img src={active.image.src} alt="" />
      </div>
      <div className="media-tint" />
      <div className="services__overlay" />

      <div className="container services__inner">
        <div className="section-header">
          <div>
            <span className="eyebrow">Soluciones a medida</span>
          </div>
          <div>
            <h2 className="title">Lo que construimos para tu empresa</h2>
          </div>
          <div>
            <p className="subtitle">
              Cada solución parte de un problema concreto. Elige una para ver qué resuelve y qué puedes esperar.
            </p>
          </div>
        </div>

        <div className="services__layout">
          <div>
            <div className="services__tabs" role="tablist" aria-orientation="vertical" onKeyDown={handleKeyDown}>
              {solutions.map((solution, index) => {
                const Icon = solution.icon;
                const isActive = index === activeIndex;
                return (
                  <button
                    key={solution.id}
                    type="button"
                    role="tab"
                    id={`tab-${solution.id}`}
                    aria-selected={isActive}
                    aria-controls={`panel-${solution.id}`}
                    tabIndex={isActive ? 0 : -1}
                    className={`services__tab ${isActive ? "is-active" : ""}`}
                    onClick={() => setActiveIndex(index)}
                    onMouseEnter={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                  >
                    {isActive && <span className="services__tab-bg" />}
                    <span className="services__tab-icon">
                      <Icon size={22} strokeWidth={1.75} />
                    </span>
                    <span className="services__tab-text">
                      <span className="services__tab-name">{solution.name}</span>
                      <span className="services__tab-tagline">{solution.tagline}</span>
                    </span>
                    <ArrowRight size={18} className="services__tab-arrow" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="services__panel-wrap">
            <div
              id={`panel-${active.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${active.id}`}
              className="services__panel"
            >
              <span className="services__panel-icon">
                <ActiveIcon size={28} strokeWidth={1.5} />
              </span>
              <h3 className="services__panel-title">{active.name}</h3>
              <p className="services__panel-description">{active.description}</p>
              <ul className="services__benefits">
                {active.benefits.map((benefit) => (
                  <li key={benefit}>
                    <Check size={18} strokeWidth={2.25} />
                    {benefit}
                  </li>
                ))}
              </ul>
              <a href="#contacto" className="btn btn--primary">
                {active.ctaLabel}
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
