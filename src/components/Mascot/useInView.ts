import { useEffect, useState, type RefObject } from "react";

/**
 * `inView`: el elemento está en pantalla ahora. `entered`: ya apareció al menos una vez (para la entrada, que no se
 * repite al volver a hacer scroll).
 */
export function useInView(ref: RefObject<Element | null>, threshold = 0.25) {
  const [inView, setInView] = useState(false);
  const [entered, setEntered] = useState(false);
  if (inView && !entered) setEntered(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting === true), { threshold });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return { inView, entered };
}
