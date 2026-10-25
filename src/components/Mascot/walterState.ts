import type { MascotState } from "./art";

/**
 * Estados de Walter junto al formulario, de mayor a menor prioridad. `opened` y `missing` vienen de eventos (envío e
 * intento de envío con datos faltantes); el resto sale de lo escrito. Uno solo a la vez: nunca hay dos mensajes en
 * conflicto.
 */
export type WalterState = "opened" | "missing" | "ready" | "idea" | "contact" | "typing" | "welcome";

/** Lo que importa del formulario para elegir el estado; se lee de `validity`, sin cambiar las validaciones. */
export interface FormSnapshot {
  touched: boolean;
  contactValid: boolean;
  messageFilled: boolean;
  allValid: boolean;
}

export const EMPTY_FORM: FormSnapshot = { touched: false, contactValid: false, messageFilled: false, allValid: false };

export function walterFromForm(form: FormSnapshot): WalterState {
  if (form.allValid) return "ready";
  if (form.messageFilled) return "idea";
  if (form.contactValid) return "contact";
  if (form.touched) return "typing";
  return "welcome";
}

/** Pose de cada estado. Varios comparten pose: entonces solo cambia el globo y la imagen queda quieta. */
export const WALTER_POSE: Record<WalterState, MascotState> = {
  welcome: "greeting",
  typing: "attention",
  contact: "idle",
  idea: "idea",
  ready: "idle",
  missing: "attention",
  opened: "happy",
};

/** Mientras se escribe, un estado nuevo se muestra recién tras esta pausa: la pose no cambia con cada tecla. */
export const SETTLE_MS = 450;

const field = (form: HTMLFormElement, name: string) =>
  form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;

/** Lee el formulario sin `checkValidity()`, que dispararía eventos `invalid` y mostraría los avisos del navegador. */
export function readForm(form: HTMLFormElement): FormSnapshot {
  const valid = (name: string) => field(form, name)?.validity.valid === true;
  const contactValid = valid("nombre") && valid("email");
  return {
    touched: true,
    contactValid,
    messageFilled: (field(form, "mensaje")?.value.trim() ?? "") !== "",
    allValid: contactValid && valid("mensaje"),
  };
}
