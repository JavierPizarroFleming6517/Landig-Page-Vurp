import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import "./Process.css";

const stages = [
  {
    title: "Entendemos el desafío",
    text: "Antes de proponer herramientas, necesitamos entender qué quieres resolver, cómo trabajas y qué esperas conseguir.",
  },
  {
    title: "Definimos el alcance",
    text: "Aterrizamos la solución, sus prioridades y sus límites. Sabes qué vamos a hacer antes de comenzar.",
  },
  {
    title: "Nos ponemos a trabajar",
    text: "Desarrollamos software, implementamos automatizaciones o realizamos evaluaciones de seguridad según las necesidades del proyecto.",
  },
  {
    title: "Revisamos y ajustamos",
    text: "Probamos lo que construimos, revisamos los resultados y corregimos lo que corresponde al alcance acordado.",
  },
  {
    title: "Entregamos con claridad",
    text: "Presentamos el trabajo realizado, su documentación y los siguientes pasos definidos para el proyecto.",
  },
] as const;

export function Process() {
  const track = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const draw = useDraw(track, reduced);
  const [active, setActive] = useState(0);

  return (
    <section
      className="section proc"
      id="proceso"
      aria-labelledby="proceso-titulo"
      style={{ ["--draw" as string]: String(draw) }}
    >
      <div className="wrap">
        <div className="intro proc__intro">
          <p className="eyebrow">Cómo trabajamos</p>
          <h2 className="section__title" id="proceso-titulo">
            Cada proyecto tiene su camino. <em>Nosotros sabemos cómo recorrerlo.</em>
          </h2>
          <p className="section__lead">
            No todas las necesidades se resuelven igual. Trabajamos con etapas claras, decisiones fundamentadas y
            revisiones durante el proceso.
          </p>
        </div>

        <div className="proc__board" ref={track}>
          <svg className="proc__svg" viewBox="0 0 1000 220" aria-hidden="true">
            <path className="proc__rail proc__rail--base" d="M70 110 H930" />
            <path className="proc__rail proc__rail--main" pathLength={1} d="M70 110 H930" />
            <path className="proc__rail proc__rail--branch" pathLength={1} d="M250 110 C250 42, 390 42, 430 110" />
            <path className="proc__rail proc__rail--branch proc__rail--late" pathLength={1} d="M610 110 C610 178, 760 178, 800 110" />
            <circle className="proc__twig" cx="340" cy="46" r="5" />
            <circle className="proc__twig proc__twig--late" cx="700" cy="174" r="5" />
          </svg>
          <p className="proc__note proc__note--up">Revisión</p>
          <p className="proc__note proc__note--down">Ajuste</p>

          <ol className="proc__steps">
            {stages.map((stage, index) => {
              const on = draw >= index / (stages.length - 1) - 0.04;
              const selected = active === index;
              return (
                <li key={stage.title} className={on ? "is-on" : undefined}>
                  <button
                    className={selected ? "proc__dot is-selected" : "proc__dot"}
                    type="button"
                    aria-pressed={selected}
                    aria-describedby={`proceso-texto-${index}`}
                    onMouseEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    onClick={() => setActive(index)}
                  >
                    <span className="sr-only">{`Etapa ${index + 1}: ${stage.title}`}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <ol className="proc__copy">
          {stages.map((stage, index) => (
            <li key={stage.title} className={active === index ? "is-selected" : undefined}>
              <p className="proc__index">{String(index + 1).padStart(2, "0")}</p>
              <h3>{stage.title}</h3>
              <p id={`proceso-texto-${index}`}>{stage.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function useDraw(ref: { current: HTMLElement | null }, reduced: boolean) {
  const [draw, setDraw] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const element = ref.current;
    if (!element) return;
    let frame = 0;
    const update = () => {
      const rect = element.getBoundingClientRect();
      const start = window.innerHeight * 0.82;
      const travel = Math.max(rect.height, window.innerHeight * 0.45);
      const seen = start - rect.top;
      const next = Math.min(1, Math.max(0, seen / travel));
      setDraw((prev) => (Math.abs(prev - next) < 0.008 ? prev : next));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced, ref]);

  return reduced ? 1 : draw;
}
