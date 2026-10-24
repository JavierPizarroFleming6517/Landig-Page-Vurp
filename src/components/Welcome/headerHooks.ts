/**
 * Ganchos de la intro sobre el header: atributos en <html> que lee Navbar.css. La intro solo los enciende o apaga;
 * el header no depende de la intro.
 * - `logoHidden` → `data-welcome="reveal"`: el logo de la barra se aparta durante la revelación (escenas 5 y 6).
 * - `translucent` → `data-welcome-nav="translucent"`: la barra se vuelve translúcida mientras corre la animación.
 */
export type HeaderHook = "logoHidden" | "translucent";

const ATTRIBUTES: Record<HeaderHook, { key: string; value: string }> = {
  logoHidden: { key: "welcome", value: "reveal" },
  translucent: { key: "welcomeNav", value: "translucent" },
};

export function setHeaderHook(hook: HeaderHook, on: boolean) {
  const { key, value } = ATTRIBUTES[hook];
  const { dataset } = document.documentElement;
  if (on) dataset[key] = value;
  else delete dataset[key];
}

/** Lleva la cuenta de qué ganchos están encendidos para escribir en el DOM solo cuando cambian. */
export function createHeaderHooks() {
  const state: Record<HeaderHook, boolean> = { logoHidden: false, translucent: false };
  return {
    sync: (hook: HeaderHook, on: boolean) => {
      if (state[hook] === on) return;
      state[hook] = on;
      setHeaderHook(hook, on);
    },
    reset: () => {
      for (const hook of Object.keys(state) as HeaderHook[]) {
        state[hook] = false;
        setHeaderHook(hook, false);
      }
    },
  };
}
