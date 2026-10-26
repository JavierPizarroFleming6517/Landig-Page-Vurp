/**
 * Datos del grafo de "Cómo trabajamos", estilo `git log --graph`: main con un commit por etapa, tres ramas en paralelo
 * durante la etapa 3, el merge antes de la etapa 4 y el tag v1.0 en la 5. Hashes ficticios y fijos (el prerender no
 * puede variar).
 */
import type { CSSProperties } from "react";

/** Variables CSS en línea (carril, color, índice de fila). */
export const vars = (values: Record<string, string | number>) => values as CSSProperties;

/** Ancho de cada carril (px). El carril 0 es main. */
export const LANE = 22;
export const GRAPH_WIDTH = LANE * 4;
export const laneX = (lane: number) => LANE / 2 + lane * LANE;

/** Alturas fijas (px) de las piezas curvas y de las filas decorativas: así las curvas nunca se deforman. */
export const FORK_H = 30;
export const BRANCH_H = 34;
export const MERGE_H = 46;
/** Altura del nodo de merge dentro de su fila. */
export const MERGE_Y = MERGE_H - 15;

export const MAIN_COLOR = "var(--graph-main)";

export const branches = [
  { name: "software", lane: 1, hash: "e5a90d1", message: "módulo de pedidos", color: "var(--graph-software)" },
  { name: "automatizacion", lane: 2, hash: "b62f7c4", message: "flujo de facturas", color: "var(--graph-auto)" },
  { name: "seguridad", lane: 3, hash: "9d14e3b", message: "revisión de accesos", color: "var(--graph-sec)" },
] as const;

export const stageHashes = ["a1f3c2e", "7b2d9e0", "3c8e41a", "4e6b1d9", "c2a85f3"] as const;
export const MERGE_HASH = "f07a2c8";

/** Etapa donde se abren las ramas (índice de `stages`). */
export const FORK_STAGE = 2;

export type GraphRow = { kind: "stage"; stage: number } | { kind: "branch"; branch: number } | { kind: "merge" };

export const graphRows: readonly GraphRow[] = [
  { kind: "stage", stage: 0 },
  { kind: "stage", stage: 1 },
  { kind: "stage", stage: 2 },
  { kind: "branch", branch: 0 },
  { kind: "branch", branch: 1 },
  { kind: "branch", branch: 2 },
  { kind: "merge" },
  { kind: "stage", stage: 3 },
  { kind: "stage", stage: 4 },
];
