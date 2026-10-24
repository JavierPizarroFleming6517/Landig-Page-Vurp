import { useEffect, useRef, type RefObject } from "react";
import { SCENES, TIMELINE } from "./config";
import { sceneAt, type WelcomePose } from "./timeline";
import type { TimelineFrame } from "./useScrollTimeline";

export interface DebugHandle {
  update: (frame: TimelineFrame, pose: WelcomePose, extra: readonly string[]) => void;
}

const pct = (value: number) => `${(value * 100).toFixed(1).padStart(5, " ")} %`;

/** Panel de depuración (`?debug`): progreso, escena, FPS y marcadores de tramo. Solo escribe texto y la posición del cursor. */
export function DebugOverlay({ handleRef }: { handleRef: RefObject<DebugHandle | null> }) {
  const readoutRef = useRef<HTMLPreElement>(null);
  const playheadRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frames = 0;
    let since = performance.now();
    let fps = 0;
    handleRef.current = {
      update: (frame, pose, extra) => {
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
            ...extra,
            `entrada   ${pct(frame.enter)}`,
            `mitades   ${pose.left.opacity.toFixed(2)} · ${Math.round(pose.left.x)} / ${Math.round(pose.right.x)}`,
            `titular   ${pose.headline.toFixed(2)}`,
          ].join("\n");
        }
        playheadRef.current?.style.setProperty("left", `${frame.progress * 100}%`);
      },
    };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef]);

  return (
    <div className="welcome-debug" aria-hidden="true">
      <pre ref={readoutRef} className="welcome-debug__readout" />
      <div className="welcome-debug__track">
        {SCENES.map((scene) => (
          <span
            key={scene.id}
            className="welcome-debug__segment"
            style={{ left: `${scene.start * 100}%`, width: `${(scene.end - scene.start) * 100}%` }}
          >
            {scene.label.split(" · ")[0]}
          </span>
        ))}
        <span className="welcome-debug__impact" style={{ left: `${TIMELINE.impact * 100}%` }} />
        <span ref={playheadRef} className="welcome-debug__playhead" />
      </div>
    </div>
  );
}
