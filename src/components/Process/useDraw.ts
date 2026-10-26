import { useEffect, useState } from "react";

/** Avance 0–1 del dibujo según cuánto se ha recorrido el elemento con el scroll; 1 con reduced-motion. */
export function useDraw(ref: { current: HTMLElement | null }, reduced: boolean) {
  const [draw, setDraw] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const element = ref.current;
    if (!element) return;
    let frame = 0;
    const update = () => {
      const rect = element.getBoundingClientRect();
      const start = window.innerHeight * 0.82;
      const travel = Math.max(rect.height, window.innerHeight * 0.45);
      const seen = start - rect.top;
      const next = Math.min(1, Math.max(0, seen / travel));
      setDraw((prev) => (Math.abs(prev - next) < 0.008 ? prev : next));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced, ref]);

  return reduced ? 1 : draw;
}
