import { Tag } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { Dot, Lane, type PulseSpan } from "./Graph";
import { DOT, PULSE_SPEED, vars } from "./graphData";
import { useDraw } from "./useDraw";
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

/** Tag de la entrega, junto al título de la última etapa (como `git tag`). */
const RELEASE_TAG = (
  <span className="proc__ref proc__ref--tag" aria-hidden="true">
    <Tag strokeWidth={2.5} />
    v1.0
  </span>
);

/**
 * Tramo de cada etapa sobre el eje del grafo (px): `top`/`height` en vertical, `left`/`width` en horizontal. `dot`
 * es dónde está su nodo dentro del tramo: a la altura del título en vertical, al centro de la tarjeta en horizontal.
 */
type Span = { start: number; size: number; dot: number };

export function Process() {
  const list = useRef<HTMLOListElement>(null);
  const reduced = usePrefersReducedMotion();
  const draw = useDraw(list, reduced);
  const spans = useStageSpans(list);
  const [active, setActive] = useState(0);
  // Cada selección vuelve a lanzar el pulso; 0 = todavía no hay interacción (el HTML inicial no lleva pulso).
  const [pulseKey, setPulseKey] = useState(0);

  const select = (stage: number, replay = false) => {
    if (stage === active && !replay) return;
    setActive(stage);
    setPulseKey((key) => key + 1);
  };

  // Punta del dibujo en px a lo largo del grafo. Sin medidas (prerender) las etapas no reciben `--tip` y el CSS
  // las muestra completas.
  const last = spans?.[spans.length - 1];
  const drawPx = last ? draw * (last.start + last.size) : 0;
  const firstDot = spans?.[0]?.dot ?? DOT;

  // Pulso desde el primer commit hasta la etapa seleccionada: cada etapa anima su tramo en su turno.
  const pulseOf = (index: number, laneStart: number): PulseSpan | undefined => {
    const span = spans?.[index];
    if (!pulseKey || !span || index > active) return undefined;
    const isEnd = index === active;
    const length = isEnd ? span.dot - laneStart : span.size - laneStart;
    if (length <= 0) return undefined;
    return {
      delay: (span.start + laneStart - firstDot) / PULSE_SPEED,
      duration: length / PULSE_SPEED,
      length: isEnd ? length : undefined,
    };
  };
  const target = spans?.[active];
  const arriveAt = target ? (target.start + target.dot - firstDot) / PULSE_SPEED : undefined;

  return (
    <section className="section proc" id="proceso" aria-labelledby="proceso-titulo">
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

        <ol className="proc__graph" ref={list}>
          {stages.map((stage, index) => {
            const span = spans?.[index];
            const tip = span ? Math.min(span.size, Math.max(0, drawPx - span.start)) : undefined;
            const selected = active === index;
            const dot = span?.dot ?? DOT;
            const laneStart = index === 0 ? dot : 0;
            const state = `${selected ? " is-selected" : ""}${index > active ? " is-after" : ""}`;
            return (
              <li
                className={`proc__row${state}`}
                key={stage.title}
                style={tip === undefined ? undefined : vars({ "--tip": tip })}
              >
                <span className="proc__cell" aria-hidden="true">
                  <Lane key={pulseKey} start={laneStart} pulse={pulseOf(index, laneStart)} />
                  <Dot
                    key={selected ? `dot-${pulseKey}` : "dot"}
                    on={tip === undefined || tip >= dot}
                    label={String(index + 1).padStart(2, "0")}
                    arrive={selected && pulseKey ? arriveAt : undefined}
                  />
                </span>
                <div className="proc__commit">
                  <h3>
                    <button
                      className="proc__select"
                      type="button"
                      aria-pressed={selected}
                      aria-describedby={`proceso-texto-${index}`}
                      onMouseEnter={() => select(index)}
                      onFocus={() => select(index)}
                      onClick={() => select(index, true)}
                    >
                      {stage.title}
                    </button>
                    {index === stages.length - 1 && RELEASE_TAG}
                  </h3>
                  <p className="proc__text" id={`proceso-texto-${index}`}>
                    {stage.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/**
 * Tramo de cada etapa sobre el eje del grafo, medido del DOM: horizontal si las etapas quedan en una fila
 * (escritorio), vertical si no. `null` hasta medir.
 */
function useStageSpans(ref: RefObject<HTMLOListElement | null>) {
  const [spans, setSpans] = useState<Span[] | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const rows = [...element.children] as HTMLElement[];
      const horizontal = rows.length > 1 && rows[0]?.offsetTop === rows[1]?.offsetTop;
      setSpans(
        rows.map((row) =>
          horizontal
            ? { start: row.offsetLeft, size: row.offsetWidth, dot: row.offsetWidth / 2 }
            : { start: row.offsetTop, size: row.offsetHeight, dot: DOT },
        ),
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return spans;
}
