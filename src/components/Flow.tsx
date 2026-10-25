import { flowSteps } from "../data/content";

export function Flow() {
  return (
    <section className="section" id="proceso">
      <div className="wrap">
        <div className="intro">
          <p className="eyebrow">El camino completo</p>
          <h2 className="section__title">
            De la idea al sistema, <em>sin perder el control.</em>
          </h2>
          <p className="section__lead">Todo empieza por entender cómo trabaja tu empresa hoy.</p>
        </div>
        <ol className="flow__grid">
          {flowSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li className="flow__card" key={step.title}>
                <Icon size={28} />
                <span className="kicker">
                  {String(index + 1).padStart(2, "0")} · {step.kicker}
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
