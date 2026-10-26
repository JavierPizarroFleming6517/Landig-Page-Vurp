import { useCallback, useEffect, useState, type FormEvent } from "react";
import { EMPTY_FORM, SETTLE_MS, readForm, walterFromForm, type WalterState } from "./walterState";

/**
 * Conecta a Walter con el formulario: `formHandlers` va en el <form> (solo escucha, no cambia validaciones ni envío)
 * y `onSubmitted` se llama solo cuando el proveedor ya aceptó el envío.
 */
export function useWalter() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [event, setEvent] = useState<"opened" | "missing" | null>(null);
  const target: WalterState = event ?? walterFromForm(form);
  const [shown, setShown] = useState<WalterState>(target);

  // Los eventos se muestran al tiro; lo que depende de escribir espera a que se asiente. El temporizador se limpia
  // si el objetivo cambia antes (o al desmontar).
  useEffect(() => {
    if (target === shown) return;
    const timer = window.setTimeout(() => setShown(target), event ? 0 : SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [target, shown, event]);

  const onInput = useCallback((formEvent: FormEvent<HTMLFormElement>) => {
    setForm(readForm(formEvent.currentTarget));
    setEvent(null);
  }, []);
  // `invalid` no burbujea: se escucha en captura. Llega una vez por campo inválido al intentar enviar.
  const onInvalidCapture = useCallback(() => setEvent("missing"), []);
  const onSubmitted = useCallback(() => setEvent("opened"), []);

  return { state: shown, formHandlers: { onInput, onInvalidCapture }, onSubmitted };
}
