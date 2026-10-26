import { Tag } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Dot, Fork, Lane, Merge } from "./Graph";
import {
  BRANCH_H,
  FORK_H,
  FORK_STAGE,
  MAIN_COLOR,
  MERGE_H,
  MERGE_HASH,
  MERGE_Y,
  branches,
  graphRows,
  stageHashes,
  vars,
} from "./graphData";
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

/** Referencias junto al hash (como en `git log --decorate`): el commit de ajuste y el tag de la entrega. */
const stageRefs: Record<number, ReactNode> = {
  3: <span className="proc__ref proc__ref--plain">ajuste</span>,
  4: (
    <span className="proc__ref proc__ref--tag">
      <Tag strokeWidth={2.5} />
      v1.0
    </span>
  ),
};

const DOT_Y = "var(--dot-y)";
const LAST_STAGE = stages.length - 1;

export function Process() {
  const [active, setActive] = useState(0);

  return (
    <section className="section proc" id="proceso" aria-labelledby="proceso-titulo">
      <div className="wrap proc__layout">
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

        <ol className="proc__graph">
          {graphRows.map((row, index) => {
            const style = vars({ "--row": index });

            if (row.kind === "branch") {
              const branch = branches[row.branch];
              if (!branch) return null;
              return (
                <li className="proc__row proc__row--decor" key={branch.name} style={style} aria-hidden="true">
                  <span className="proc__cell" style={vars({ height: `${BRANCH_H}px` })}>
                    <Lane lane={0} color={MAIN_COLOR} />
                    {branches.map(({ lane, color }) => (
                      <Lane key={lane} lane={lane} color={color} />
                    ))}
                    <Dot lane={branch.lane} color={branch.color} top="50%" />
                  </span>
                  <p className="proc__meta">
                    <code>{branch.hash}</code>
                    <span className="proc__ref" style={vars({ "--c": branch.color })}>
                      {branch.name}
                    </span>
                    <span className="proc__msg">{branch.message}</span>
                  </p>
                </li>
              );
            }

            if (row.kind === "merge") {
              return (
                <li className="proc__row proc__row--decor proc__row--merge" key="merge" style={style} aria-hidden="true">
                  <span className="proc__cell" style={vars({ height: `${MERGE_H}px` })}>
                    <Lane lane={0} color={MAIN_COLOR} />
                    <Merge />
                    <Dot lane={0} color={MAIN_COLOR} top={`${MERGE_Y}px`} merge />
                  </span>
                  <p className="proc__meta" style={vars({ "--meta-y": `${MERGE_Y}px` })}>
                    <code>{MERGE_HASH}</code>
                    <span className="proc__msg">merge de las 3 ramas en main</span>
                  </p>
                </li>
              );
            }

            const stage = stages[row.stage];
            if (!stage) return null;
            const selected = active === row.stage;
            const fork = row.stage === FORK_STAGE;
            return (
              <li
                className={selected ? "proc__row proc__row--stage is-selected" : "proc__row proc__row--stage"}
                key={stage.title}
                style={style}
              >
                <span className="proc__cell" aria-hidden="true">
                  <Lane
                    lane={0}
                    color={MAIN_COLOR}
                    top={row.stage === 0 ? DOT_Y : "0px"}
                    bottom={row.stage === LAST_STAGE ? `calc(100% - ${DOT_Y})` : "0px"}
                  />
                  {fork && (
                    <>
                      <Fork />
                      {branches.map(({ lane, color }) => (
                        <Lane key={lane} lane={lane} color={color} top={`calc(${DOT_Y} + ${FORK_H}px)`} />
                      ))}
                    </>
                  )}
                  <Dot lane={0} color={MAIN_COLOR} top={DOT_Y} />
                </span>
                <div className="proc__commit">
                  <p className="proc__meta" aria-hidden="true">
                    <code>{stageHashes[row.stage]}</code>
                    {stageRefs[row.stage]}
                  </p>
                  <h3>
                    <button
                      className="proc__select"
                      type="button"
                      aria-pressed={selected}
                      aria-describedby={`proceso-texto-${row.stage}`}
                      onMouseEnter={() => setActive(row.stage)}
                      onFocus={() => setActive(row.stage)}
                      onClick={() => setActive(row.stage)}
                    >
                      {stage.title}
                    </button>
                  </h3>
                  <p className="proc__text" id={`proceso-texto-${row.stage}`}>
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
