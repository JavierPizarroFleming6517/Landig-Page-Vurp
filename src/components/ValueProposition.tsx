import { valueProps } from "../data/content";
import type { ValueProp } from "../types";
import "./ValueProposition.css";

interface ValueCardProps {
  item: ValueProp;
  index: number;
}

function ValueCard({ item, index }: ValueCardProps) {
  const Icon = item.icon;

  return (
    <article className="value-card">
      <div className="value-card__top">
        <span className="value-card__icon">
          <Icon size={22} strokeWidth={1.75} />
        </span>
        <span className="value-card__index">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <h3 className="value-card__title">{item.title}</h3>
      <p className="value-card__description">{item.description}</p>
      <p className="value-card__detail">{item.detail}</p>
    </article>
  );
}

export function ValueProposition() {
  return (
    <section id="propuesta" className="section value">
      <div className="value__decor" aria-hidden="true" />
      <div className="container value__layout">
        <div className="value__intro">
          <div>
            <span className="eyebrow">Propuesta de valor</span>
          </div>
          <div>
            <h2 className="title">
              Sistemas que <span className="text-accent">ordenan</span> tu empresa
            </h2>
          </div>
          <div>
            <p className="subtitle">
              La tecnología tiene que simplificar el trabajo, no sumarle complejidad. Por eso construimos
              herramientas que tu equipo entiende y usa desde el primer día.
            </p>
          </div>
        </div>

        <div className="value__cards">
          {valueProps.map((item, index) => (
            <ValueCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
