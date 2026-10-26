/**
 * Datos del grafo de "Cómo trabajamos", estilo `git log --graph`: main con un commit por etapa y el tag v1.0 en la
 * última.
 */
import type { CSSProperties } from "react";

/** Variables CSS en línea. */
export const vars = (values: Record<string, string | number>) => values as CSSProperties;

/**
 * Posición del centro de cada nodo desde el inicio de su etapa, en px, sobre el eje del grafo (vertical en móvil,
 * horizontal en escritorio). Debe coincidir con `--dot` en Process.css.
 */
export const DOT = 22;

/** Velocidad del pulso que recorre el camino al seleccionar una etapa (px/s). */
export const PULSE_SPEED = 1100;
