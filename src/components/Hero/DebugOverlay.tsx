import { useEffect, useRef, type RefObject } from "react";
import { SCENES } from "./config";
import type { HeroLayout } from "./layout";
import { sceneAt, type HeroPose } from "./timeline";
import type { TimelineFrame } from "./useScrollTimeline";

export interface DebugHandle {
  update: (frame: TimelineFrame, pose: HeroPose, layout: HeroLayout) => void;
}

const pct = (value: number) => `${(value * 100).toFixed(1).padStart(5, " ")} %`;

/**
 * Panel de depuración (`?debug`): progreso, escena, FPS, zoom y marcadores de tramo y de cruce. Solo escribe texto y
 * la posición de los marcadores. Los FPS se cuentan con frames entregados: si el rAF duerme, no avanzan.
 */
export function DebugOverlay({ handleRef }: { handleRef: RefObject<DebugHandle | null> }) {
  const readoutRef = useRef<HTMLPreElement>(null);
  const playheadRef = useRef<HTMLSpanElement>(null);
  const crossRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frames = 0;
    let since = performance.now();
    let fps = 0;
    handleRef.current = {
      update: (frame, pose, layout) => {
        frames += 1;
        const elapsed = frame.now - since;
        if (elapsed >= 500) {
          fps = Math.round((frames * 1000) / elapsed);
          frames = 0;
          since = frame.now;
        }
        const readout = readoutRef.current;
        if (readout) {
          readout.textContent = [
            `progreso  ${pct(frame.progress)}`,
            `scroll    ${pct(frame.target)}`,
            `escena    ${sceneAt(frame.progress).label}`,
            `fps       ${fps}`,
            `pantalla  ${pct(layout.widthFraction)} del ancho · ${layout.compact ? "móvil" : "escritorio"}`,
            `zoom      ×${pose.zoom.toFixed(2)} · cruce ×${layout.kCross.toFixed(2)} en ${pct(layout.pCross)}`,
            `notebook  ${pose.device.visible ? "visible" : "oculto"}`,
          ].join("\n");
        }
        playheadRef.current?.style.setProperty("left", `${frame.progress * 100}%`);
        crossRef.current?.style.setProperty("left", `${layout.pCross * 100}%`);
      },
    };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef]);

  return (
    <div className="hero-debug" aria-hidden="true">
      <pre ref={readoutRef} className="hero-debug__readout" />
      <div className="hero-debug__track">
        {SCENES.map((scene) => (
          <span
            key={scene.id}
            className="hero-debug__segment"
            style={{ left: `${scene.start * 100}%`, width: `${(scene.end - scene.start) * 100}%` }}
          >
            {scene.label.split(" · ")[0]}
          </span>
        ))}
        <span ref={crossRef} className="hero-debug__cross" />
        <span ref={playheadRef} className="hero-debug__playhead" />
      </div>
    </div>
  );
}
