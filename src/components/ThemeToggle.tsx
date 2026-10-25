import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { setTheme } from "../theme";

/** Botón de tema: "Tema oscuro" activado o no. El ícono muestra el tema actual. */
export function ThemeToggle() {
  const dark = useTheme() === "dark";

  return (
    <button
      className="icon-btn theme-toggle"
      type="button"
      aria-label="Tema oscuro"
      aria-pressed={dark}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
    </button>
  );
}
