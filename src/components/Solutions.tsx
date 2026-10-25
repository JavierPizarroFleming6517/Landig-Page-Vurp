import { useRef, useState, type KeyboardEvent } from "react";
import { solutions } from "../data/content";

/**
 * Soluciones con el tratamiento "flujo completo": encabezado centrado con pestañas; abajo, a la izquierda, el panel
 * de la solución y, a la derecha, un notebook con una pantalla de ejemplo (bajo 1180 px se apila dentro de los
 * márgenes). Las tres pantallas quedan en el DOM para el fundido al cambiar de pestaña.
 */
export function Solutions() {
  const [active, setActive] = useState(solutions[0]?.id ?? "");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(0, solutions.findIndex((item) => item.id === active));
  const current = solutions[index];
  if (!current) return null;
  const CurrentIcon = current.icon;

  // Pestañas ARIA: flechas, Inicio y Fin mueven el foco y activan la pestaña.
  const onKeyDown = (event: KeyboardEvent) => {
    const last = solutions.length - 1;
    const next =
      event.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : event.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : null;
    if (next === null) return;
    event.preventDefault();
    setActive(solutions[next]?.id ?? active);
    tabs.current[next]?.focus();
  };

  return (
    <section className="section flujo" id="soluciones" aria-labelledby="soluciones-titulo">
      <div className="wrap flujo__head">
        <p className="eyebrow">Para cada parte de tu empresa</p>
        <h2 className="section__title" id="soluciones-titulo">
          Tenemos una forma de <em>ordenarlo.</em>
        </h2>
        <div className="tabs" role="tablist" aria-label="Soluciones" onKeyDown={onKeyDown}>
          {solutions.map((item, i) => (
            <button
              key={item.id}
              ref={(element) => {
                tabs.current[i] = element;
              }}
              className="tab"
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={item.id === current.id}
              aria-controls="soluciones-panel"
              tabIndex={item.id === current.id ? 0 : -1}
              onClick={() => setActive(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flujo__body">
        {/* key: al cambiar de pestaña el panel se monta de nuevo y repite su entrada. */}
        <div
          className="flujo__panel"
          role="tabpanel"
          id="soluciones-panel"
          aria-labelledby={`tab-${current.id}`}
          key={current.id}
        >
          <div className="flujo__panel-head">
            <span className="flujo__icon" aria-hidden="true">
              <CurrentIcon size={24} />
            </span>
            <div>
              <h3>{current.title}</h3>
              <p>{current.summary}</p>
            </div>
          </div>
          <ul className="flujo__list">
            {current.features.map((feature) => {
              const Icon = feature.icon;
              return (
                <li className="flujo__item" key={feature.title}>
                  <span className="flujo__tile" aria-hidden="true">
                    <Icon size={20} />
                  </span>
                  <div>
                    <h4>{feature.title}</h4>
                    <p>{feature.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <figure className="flujo__visual">
          <span className="flujo__shape flujo__shape--a" aria-hidden="true" />
          <span className="flujo__shape flujo__shape--b" aria-hidden="true" />
          <div className="laptop">
            <div className="laptop__lid">
              <div className="laptop__screen">
                {solutions.map((item) => (
                  <img
                    key={item.id}
                    src={item.screen.src}
                    alt={item.id === current.id ? item.screen.alt : ""}
                    aria-hidden={item.id === current.id ? undefined : true}
                    className={item.id === current.id ? "is-on" : undefined}
                    width={1792}
                    height={1120}
                    loading="lazy"
                    decoding="async"
                  />
                ))}
              </div>
            </div>
            <div className="laptop__base" aria-hidden="true" />
            {/* Fichas flotantes con los dos primeros íconos de la solución, como en las pantallas reales. */}
            {current.features.slice(0, 2).map((feature, i) => {
              const Icon = feature.icon;
              return (
                <span className={`flujo__badge flujo__badge--${i + 1}`} key={`${current.id}-${feature.title}`} aria-hidden="true">
                  <Icon size={26} />
                </span>
              );
            })}
          </div>
          <figcaption>Pantalla de ejemplo con datos ficticios. Cada sistema se diseña para tu operación.</figcaption>
        </figure>
      </div>
    </section>
  );
}
