import { useEffect, useRef, type RefObject } from "react";
import { ENTER, SMOOTHING_SECONDS } from "./config";
import { clamp01, easeOutCubic } from "./timeline";

export interface TimelineFrame {
  /** Progreso suavizado (0–1) que conduce la escena. */
  progress: number;
  /** Progreso real del scroll, sin suavizar. */
  target: number;
  /** Entrada de la escena 1 (0–1), por tiempo, desde que termina el splash. */
  enter: number;
  now: number;
}

interface Options {
  sectionRef: RefObject<HTMLElement | null>;
  stageRef: RefObject<HTMLElement | null>;
  started: boolean;
  onFrame: (frame: TimelineFrame) => void;
  /** Se llama cuando la sección entra o sale de pantalla (y el rAF arranca o se detiene). */
  onVisibilityChange?: (visible: boolean) => void;
}

/**
 * Un único rAF que lee el scroll de la sección, suaviza el progreso (lerp exponencial, sin overshoot)
 * y entrega el frame a `onFrame`. No intercepta eventos: el scroll sigue siendo nativo.
 * Se detiene cuando la sección sale de pantalla o la pestaña queda oculta.
 */
export function useScrollTimeline({ sectionRef, stageRef, started, onFrame, onVisibilityChange }: Options) {
  const onFrameRef = useRef(onFrame);
  const onVisibilityRef = useRef(onVisibilityChange);
  const startedRef = useRef(started);

  useEffect(() => {
    onFrameRef.current = onFrame;
    onVisibilityRef.current = onVisibilityChange;
    startedRef.current = started;
  });

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const readTarget = () => {
      const travel = section.offsetHeight - stage.offsetHeight;
      return travel > 0 ? clamp01(-section.getBoundingClientRect().top / travel) : 0;
    };

    let frame = 0;
    let running = false;
    let visible = false;
    let last = 0;
    let progress = readTarget();
    let enterAt: number | null = null;

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const target = readTarget();
      progress += (target - progress) * (1 - Math.exp(-dt / SMOOTHING_SECONDS));
      if (Math.abs(target - progress) < 1e-4) progress = target;

      if (startedRef.current && enterAt === null) enterAt = now + ENTER.delayMs;
      const enter = enterAt === null ? 0 : easeOutCubic(clamp01((now - enterAt) / ENTER.durationMs));

      onFrameRef.current({ progress, target, enter, now });
      frame = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || !visible || document.hidden) return;
      running = true;
      // Al volver a la sección se parte del scroll real, sin barrer escenas intermedias.
      progress = readTarget();
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
      if (visible) start();
      else stop();
    });
    const onVisibility = () => (document.hidden ? stop() : start());

    observer.observe(section);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [sectionRef, stageRef]);
}
