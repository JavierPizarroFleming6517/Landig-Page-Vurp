import { reasons } from "../data/content";

export function Reasons() {
  return (
    <section className="section" aria-labelledby="razones-titulo">
      <div className="wrap">
        <div className="intro">
          <p className="eyebrow">Por qué Vurp</p>
          <h2 className="section__title" id="razones-titulo">
            {reasons.length} razones para <em>construir con nosotros.</em>
          </h2>
          <p className="section__lead">
            Construimos el sistema y lo protegemos. Te decimos el alcance con claridad, sin letra chica.
          </p>
        </div>
        <div className="reasons__grid">
          {reasons.map((reason, index) => (
            <article className={index === 0 ? "reason reason--lead" : "reason"} key={reason.title}>
              <span className="reason__num" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{reason.title}</h3>
              <p>{reason.text}</p>
              {reason.chips ? (
                <div className="chips">
                  {reason.chips.map((chip) => (
                    <span className="chip" key={chip}>
                      {chip}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
