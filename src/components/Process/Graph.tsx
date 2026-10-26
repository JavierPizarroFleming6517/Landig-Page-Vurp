import { FORK_H, GRAPH_WIDTH, MERGE_H, MERGE_Y, branches, laneX, vars } from "./graphData";

/** Tramo recto de un carril. `top`/`bottom` son valores CSS dentro de la celda del grafo. */
export function Lane({ lane, color, top = "0px", bottom = "0px" }: { lane: number; color: string; top?: string; bottom?: string }) {
  return <i className="proc__lane" style={vars({ "--x": `${laneX(lane)}px`, "--c": color, top, bottom })} />;
}

/** Commit: punto sobre su carril. `top` es la altura de su centro. */
export function Dot({ lane, color, top, merge = false }: { lane: number; color: string; top: string; merge?: boolean }) {
  return (
    <b
      className={merge ? "proc__dot proc__dot--merge" : "proc__dot"}
      style={vars({ "--x": `${laneX(lane)}px`, "--c": color, top })}
    />
  );
}

/** Curvas de main hacia cada rama, justo debajo del commit de la etapa 3. */
export function Fork() {
  const from = laneX(0);
  return (
    <svg className="proc__curves proc__curves--fork" width={GRAPH_WIDTH} height={FORK_H} viewBox={`0 0 ${GRAPH_WIDTH} ${FORK_H}`}>
      {branches.map(({ lane, color }) => {
        const x = laneX(lane);
        return (
          <path
            key={lane}
            d={`M${from} 0 C${from} ${FORK_H * 0.62}, ${x} ${FORK_H * 0.38}, ${x} ${FORK_H}`}
            pathLength={1}
            style={vars({ "--c": color })}
          />
        );
      })}
    </svg>
  );
}

/** Curvas de cada rama de vuelta a main, hasta el nodo de merge. */
export function Merge() {
  const to = laneX(0);
  return (
    <svg className="proc__curves" width={GRAPH_WIDTH} height={MERGE_H} viewBox={`0 0 ${GRAPH_WIDTH} ${MERGE_H}`}>
      {branches.map(({ lane, color }) => {
        const x = laneX(lane);
        return (
          <path
            key={lane}
            d={`M${x} 0 C${x} ${MERGE_Y * 0.55}, ${to} ${MERGE_Y * 0.45}, ${to} ${MERGE_Y}`}
            pathLength={1}
            style={vars({ "--c": color })}
          />
        );
      })}
    </svg>
  );
}
