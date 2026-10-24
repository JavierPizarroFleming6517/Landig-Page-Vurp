import { useCallback, useEffect, useRef, useState } from "react";
import { SECTION_VH, welcomeLines } from "./config";
import { DebugOverlay, type DebugHandle } from "./DebugOverlay";
import { computeLayout, type StageLayout } from "./layout";
import { Messages } from "./Messages";
import { OrbitLogo } from "./OrbitLogo";
import { poseAt, type OrbiterPose } from "./timeline";
import { useScrollTimeline, type TimelineFrame } from "./useScrollTimeline";
import "./Welcome.css";

interface WelcomeProps {
  /** Pasa a true cuando termina el splash de carga: ahí arranca la entrada de la escena 1. */
  started: boolean;
}

const place = (element: HTMLElement, { x, y, scale, opacity }: OrbiterPose) => {
  element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
  element.style.opacity = String(opacity);
};

export function Welcome({ started }: WelcomeProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const planetRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const waveRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const debugRef = useRef<DebugHandle | null>(null);
  const layoutRef = useRef<StageLayout | null>(null);
  const lastRef = useRef({ progress: -1, enter: -1, layout: null as StageLayout | null, logoFront: true });
  const [debug] = useState(() => new URLSearchParams(window.location.search).has("debug"));

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const layout = computeLayout(stage.clientWidth, stage.clientHeight);
      layoutRef.current = layout;
      stage.style.setProperty("--cx", `${layout.cx}px`);
      stage.style.setProperty("--cy", `${layout.cy}px`);
      stage.style.setProperty("--planet-r", `${layout.planetPx}px`);
      stage.style.setProperty("--logo-h", `${layout.logoPx}px`);
      stage.style.setProperty("--text-w", `${layout.textWidth}px`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    measure();
    return () => observer.disconnect();
  }, []);

  const onFrame = useCallback((frame: TimelineFrame) => {
    const layout = layoutRef.current;
    if (!layout) return;
    const pose = poseAt(frame.progress, frame.enter, layout);
    debugRef.current?.update(frame, pose);

    const last = lastRef.current;
    if (last.progress === frame.progress && last.enter === frame.enter && last.layout === layout) return;
    last.progress = frame.progress;
    last.enter = frame.enter;
    last.layout = layout;

    const logo = logoRef.current;
    const messages = messagesRef.current;
    const planet = planetRef.current;
    const wave = waveRef.current;
    const flash = flashRef.current;
    const reveal = revealRef.current;
    const backdrop = backdropRef.current;
    if (!logo || !messages || !planet || !wave || !flash || !reveal || !backdrop) return;

    place(logo, pose.logo);
    if (pose.logo.front !== last.logoFront) {
      last.logoFront = pose.logo.front;
      logo.dataset.layer = pose.logo.front ? "front" : "back";
    }
    place(messages, pose.text);
    pose.messages.forEach((opacity, index) => {
      const line = lineRefs.current[index];
      if (line) line.style.opacity = String(opacity);
    });

    planet.style.opacity = String(pose.planet.opacity);
    planet.style.setProperty("--glow", pose.planet.glow.toFixed(3));
    planet.style.setProperty("--shatter", pose.planet.shatter.toFixed(3));

    flash.style.opacity = String(pose.flash);
    flash.style.setProperty("--fx", `${pose.impact.x}px`);
    flash.style.setProperty("--fy", `${pose.impact.y}px`);
    wave.style.transform = `translate3d(${pose.impact.x}px, ${pose.impact.y}px, 0) translate(-50%, -50%) scale(${0.2 + pose.burst * 3})`;
    wave.style.opacity = String(pose.burst > 0 ? (1 - pose.burst) * 0.8 : 0);

    reveal.style.opacity = String(pose.reveal.opacity);
    reveal.style.transform = `translate(-50%, -50%) scale(${pose.reveal.scale})`;
    backdrop.style.opacity = String(pose.backdrop);
  }, []);

  useScrollTimeline({ sectionRef, stageRef, started, onFrame });

  return (
    <section
      id="bienvenida"
      ref={sectionRef}
      className="welcome media-surface"
      style={{ height: `${SECTION_VH}vh` }}
      aria-label="Introducción de Vurp"
    >
      <div ref={stageRef} className="welcome__stage">
        <div ref={backdropRef} className="welcome__backdrop" aria-hidden="true" />
        <OrbitLogo logoRef={logoRef} />
        <div ref={planetRef} className="welcome__planet" aria-hidden="true" />
        <div ref={waveRef} className="welcome__wave" aria-hidden="true" />
        <Messages lines={welcomeLines} containerRef={messagesRef} lineRefs={lineRefs} />
        <div ref={flashRef} className="welcome__flash" aria-hidden="true" />
        <div ref={revealRef} className="welcome__reveal" aria-hidden="true">
          logo completo
        </div>
        {debug && <DebugOverlay handleRef={debugRef} />}
      </div>
    </section>
  );
}
