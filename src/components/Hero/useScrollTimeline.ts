import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { SMOOTHING_SECONDS } from "./config";
import { clamp01 } from "./easing";

export interface TimelineFrame {
  /** Progreso suavizado (0–1) que conduce la escena. */
  progress: number;
  /** Progreso real del scroll, sin suavizar. */
  target: number;
  now: number;
}

interface Options {
  sectionRef: RefObject<HTMLElement | null>;
  stageRef: RefObject<HTMLElement | null>;
  onFrame: (frame: TimelineFrame) => void;
  /** Se llama cuando la sección entra o sale de pantalla. */
  onVisibilityChange?: (visible: boolean) => void;
  /** Progreso fijo (`?debug&p=`): el scroll deja de conducir la escena. */
  fixedProgress?: number;
}

/**
 * Un único rAF que lee el scroll de la sección, suaviza el progreso (lerp exponencial, sin overshoot)
 * y entrega el frame a `onFrame`. No intercepta eventos: el scroll sigue siendo nativo.
 * Corre solo con la sección en pantalla y mientras el progreso se mueve: al asentarse se duerme y lo despierta
 * el siguiente scroll (listener pasivo). Devuelve `refresh`, para después de un resize: despierta el rAF o, si la
 * sección aún no está en pantalla, pinta un frame síncrono (así el primer paint ya sale con la pose correcta).
 */
export function useScrollTimeline({ sectionRef, stageRef, onFrame, onVisibilityChange, fixedProgress }: Options) {
  const onFrameRef = useRef(onFrame);
  const onVisibilityRef = useRef(onVisibilityChange);
  const refreshRef = useRef(() => {});

  useEffect(() => {
    onFrameRef.current = onFrame;
    onVisibilityRef.current = onVisibilityChange;
  });

  // Layout effect: queda listo antes de que el componente mida y pida el primer `refresh`.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const readTarget = () => {
      if (fixedProgress !== undefined) return clamp01(fixedProgress);
      const travel = section.offsetHeight - stage.offsetHeight;
      return travel > 0 ? clamp01(-section.getBoundingClientRect().top / travel) : 0;
    };

    let frame = 0;
    let running = false;
    let visible = false;
    let last = 0;
    let progress = readTarget();

    const tick = (now: number) => {
      const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
      last = now;
      const target = readTarget();
      progress += (target - progress) * (1 - Math.exp(-dt / SMOOTHING_SECONDS));
      if (Math.abs(target - progress) < 1e-4) progress = target;

      onFrameRef.current({ progress, target, now });
      if (progress === target) {
        running = false;
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };

    const wake = () => {
      if (running || !visible || document.hidden) return;
      running = true;
      last = performance.now();
      frame = window.requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      window.cancelAnimationFrame(frame);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting === true;
      onVisibilityRef.current?.(visible);
      if (!visible) {
        stop();
        return;
      }
      // Al volver a la sección se parte del scroll real, sin barrer escenas intermedias.
      progress = readTarget();
      wake();
    });
    const onVisibility = () => (document.hidden ? stop() : wake());

    observer.observe(section);
    window.addEventListener("scroll", wake, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    refreshRef.current = () => {
      if (visible && !document.hidden) {
        wake();
        return;
      }
      progress = readTarget();
      onFrameRef.current({ progress, target: progress, now: performance.now() });
    };
    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("scroll", wake);
      document.removeEventListener("visibilitychange", onVisibility);
      refreshRef.current = () => {};
    };
  }, [sectionRef, stageRef, fixedProgress]);

  return useCallback(() => refreshRef.current(), []);
}
