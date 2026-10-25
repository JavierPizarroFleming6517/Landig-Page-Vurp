import type { ComponentType } from "react";

/** Poses de Walter: una imagen por pose (public/mascota/) y sus decoraciones en MascotDecor. */
export type MascotState = "idle" | "attention" | "greeting" | "idea" | "happy";

/**
 * Lienzo común del dibujo (px del PNG): las poses de public/mascota/ están alineadas en él (el notebook no se mueve
 * entre poses) y las decoraciones de MascotDecor usan las mismas coordenadas.
 */
export const ART = { width: 384, height: 363 } as const;

/**
 * Contrato del dibujo de la mascota: recibe la pose y la representa. Hoy lo cumple `MascotPoses` (una imagen por
 * pose con fundido). Una versión SVG por capas (cabeza, ojos, orejas, patas) puede cumplir el mismo contrato y
 * animar cada parte según `state`, sin tocar la lógica del formulario.
 */
export interface MascotArtProps {
  state: MascotState;
}

export type MascotArt = ComponentType<MascotArtProps>;
