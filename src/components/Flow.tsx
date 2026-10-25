import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { flowSteps } from "../data/content";

export function Flow() {
  const rail = useRef<HTMLDivElement>(null);

  const move = (direction: number) => {
    rail.current?.scrollBy({ left: direction * 340, behavior: "smooth" });
  };

  return (
    <section className="section" id="proceso">
      <div className="wrap">
        <div className="head">
          <div>
            <p className="eyebrow">El camino completo</p>
            <h2 className="section__title">
              De la idea al sistema, <em>sin perder el control.</em>
            </h2>
            <p className="section__lead">Todo empieza por entender cómo trabaja tu empresa hoy.</p>
          </div>
          <div className="flow__tools">
            <button className="icon-btn" type="button" aria-label="Anterior" onClick={() => move(-1)}>
              <ChevronLeft size={18} />
            </button>
            <button className="icon-btn" type="button" aria-label="Siguiente" onClick={() => move(1)}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className="rail" ref={rail}>
        {flowSteps.map((step) => {
          const Icon = step.icon;
          return (
            <article className="flow__card" key={step.title}>
              <Icon size={28} />
              <span className="kicker">{step.kicker}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
