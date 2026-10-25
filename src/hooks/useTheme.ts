import { useSyncExternalStore } from "react";
import { getTheme, subscribeTheme } from "../theme";

/** Tema activo ("light" | "dark"); se actualiza con el toggle o, sin elección guardada, con el sistema. */
export function useTheme() {
  return useSyncExternalStore(subscribeTheme, getTheme);
}
