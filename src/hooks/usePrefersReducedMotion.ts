import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/** true si el usuario pidió reducir el movimiento; se actualiza si cambia la preferencia del sistema. */
export function usePrefersReducedMotion() {
  // El mismo valor inicial en servidor y cliente evita diferencias al hidratar el HTML prerenderizado.
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(QUERY);
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
