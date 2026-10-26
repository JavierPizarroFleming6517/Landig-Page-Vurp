/**
 * Tema claro u oscuro. El tema inicial lo fija el script inline de index.html (antes del primer paint) como
 * `data-theme` en <html>; aquí se lee, se cambia y se avisa a quien escucha.
 */
export type Theme = "light" | "dark";

const STORAGE_KEY = "vurp-theme";
/** `<meta name="theme-color">` de cada tema: el `--bg` de index.css. */
const THEME_COLOR: Record<Theme, string> = { dark: "#121016", light: "#faf7f2" };

const canUseDom = typeof window !== "undefined" && typeof document !== "undefined";
const systemLight = canUseDom ? window.matchMedia("(prefers-color-scheme: light)") : null;
const reducedMotion = canUseDom ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
const listeners = new Set<() => void>();

const isTheme = (value: unknown): value is Theme => value === "light" || value === "dark";

/** `?debug&theme=light|dark` fuerza el tema para las capturas y no se guarda. */
function forcedTheme() {
  if (!canUseDom) return null;
  const params = new URLSearchParams(window.location.search);
  const value = params.has("debug") ? params.get("theme") : null;
  return isTheme(value) ? value : null;
}

function storedTheme() {
  if (!canUseDom) return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

export function getTheme(): Theme {
  if (!canUseDom) return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function apply(theme: Theme) {
  if (!canUseDom) return;
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
  listeners.forEach((listener) => listener());
}

/** Elección del usuario: se guarda y el cambio se ve con un fundido corto (instantáneo con movimiento reducido). */
export function setTheme(theme: Theme) {
  if (!canUseDom) return;
  if (!forcedTheme()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Sin storage (modo privado, bloqueado): el tema cambia igual, solo que no se recuerda.
    }
  }
  if (reducedMotion?.matches || !("startViewTransition" in document)) {
    apply(theme);
    return;
  }
  document.startViewTransition(() => apply(theme));
}

export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Mientras el usuario no haya elegido, el tema sigue al sistema también en vivo.
systemLight?.addEventListener("change", () => {
  if (!forcedTheme() && !storedTheme()) apply(systemLight.matches ? "light" : "dark");
});
