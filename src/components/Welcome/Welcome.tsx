import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { BrandReveal } from "./BrandReveal";
import { HEADER, SECTION_VH, welcomeLines } from "./config";
import { DebugOverlay, type DebugHandle } from "./DebugOverlay";
import { createHeaderHooks } from "./headerHooks";
import { computeLayout, type StageLayout } from "./layout";
import { Messages } from "./Messages";
import { OrbitLogo } from "./OrbitLogo";
import type { SceneController } from "./scene/createScene";
import { paintStars } from "./starfield";
import { poseAt, sceneAt, type OrbiterPose } from "./timeline";
import { useScrollTimeline, type TimelineFrame } from "./useScrollTimeline";
import { WelcomeStatic } from "./WelcomeStatic";
import "./Welcome.css";

interface WelcomeProps {
  /** Pasa a true cuando termina el splash de carga: ahí arranca la entrada de la escena 1. */
  started: boolean;
}

const place = (element: HTMLElement, { x, y, scale, opacity }: OrbiterPose) => {
  element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
  element.style.opacity = String(opacity);
};

/** Intro de la landing: la animación por scroll o, con `prefers-reduced-motion`, la versión estática. */
export function Welcome({ started }: WelcomeProps) {
  const reduced = usePrefersReducedMotion();
  return reduced ? <WelcomeStatic /> : <WelcomeScroll started={started} />;
}

function WelcomeScroll({ started }: WelcomeProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<SceneController | null>(null);
  const planetRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const waveRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const [headerHooks] = useState(createHeaderHooks);
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
      stage.style.setProperty("--logo-w", `${layout.logoWidth}px`);
      stage.style.setProperty("--text-w", `${layout.textWidth}px`);
      if (starsRef.current) paintStars(starsRef.current, layout.width, layout.height);
      sceneRef.current?.setLayout(layout);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    measure();
    return () => observer.disconnect();
  }, []);

  // La escena WebGL vive en un chunk aparte: se descarga y compila mientras el splash está visible.
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    let cancelled = false;
    stage.dataset.webgl = "loading";
    import("./scene/createScene")
      .then(({ createScene }) => {
        const layout = layoutRef.current;
        if (cancelled || !layout) return;
        sceneRef.current = createScene(canvas, layout);
        stage.dataset.webgl = "ready";
      })
      .catch((error: unknown) => {
        console.error(error);
        if (!cancelled) stage.dataset.webgl = "off";
      });
    return () => {
      cancelled = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  const onFrame = useCallback((frame: TimelineFrame) => {
    const layout = layoutRef.current;
    if (!layout) return;
    const pose = poseAt(frame.progress, frame.enter, layout);
    // Los ganchos del header se deciden con el scroll real (sin suavizar): un salto por ancla nunca los deja puestos.
    // Logo de la barra fuera durante la revelación y la transición (escenas 5 y 6), por el área de respeto.
    const { id: sceneId } = sceneAt(frame.target);
    headerHooks.sync("logoHidden", (sceneId === "revelacion" || sceneId === "transicion") && frame.target < 1);
    headerHooks.sync("translucent", frame.target > HEADER.translucentFrom && frame.target < HEADER.translucentUntil);
    const scene = sceneRef.current;
    scene?.render({
      time: frame.now / 1000,
      progress: frame.progress,
      opacity: pose.planet.opacity,
      glow: pose.planet.glow,
      shatter: pose.planet.shatter,
      burst: pose.burst,
      impact: pose.impact.world,
      focus: pose.focus,
    });
    debugRef.current?.update(frame, pose, [
      `webgl     ${stageRef.current?.dataset.webgl ?? "-"} · dpr ${scene?.pixelRatio() ?? "-"} · ${scene?.quality() ?? "-"}`,
      `planeta   ×${layout.planetScale.toFixed(2)} · ${Math.round(layout.planetPx)} px`,
      `capa      ${layout.fits ? "ok" : "no cabe"} · ${Math.round(layout.logoClearance)} px del disco`,
    ]);

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
    const halo = haloRef.current;
    const backdrop = backdropRef.current;
    if (!logo || !messages || !planet || !wave || !flash || !reveal || !halo || !backdrop) return;

    place(logo, pose.logo);
    if (pose.logo.front !== last.logoFront) {
      last.logoFront = pose.logo.front;
      logo.dataset.layer = pose.logo.front ? "front" : "back";
    }
    place(messages, pose.text);
    pose.messages.forEach((opacity, index) => {
      const line = lineRefs.current[index];
      if (!line) return;
      line.style.opacity = String(opacity);
      line.style.transform = `translate3d(0, ${pose.messageOffsets[index] ?? 0}px, 0)`;
    });

    planet.style.opacity = String(pose.planet.bodyOpacity);
    planet.style.setProperty("--glow", pose.planet.glow.toFixed(3));
    planet.style.setProperty("--shatter", pose.planet.shatter.toFixed(3));

    flash.style.opacity = String(pose.flash);
    flash.style.setProperty("--fx", `${pose.impact.x}px`);
    flash.style.setProperty("--fy", `${pose.impact.y}px`);
    wave.style.transform = `translate3d(${pose.impact.x}px, ${pose.impact.y}px, 0) translate(-50%, -50%) scale(${0.2 + pose.burst * 3})`;
    wave.style.opacity = String(pose.burst > 0 ? (1 - pose.burst) * 0.8 : 0);

    reveal.style.opacity = String(pose.reveal.opacity);
    reveal.style.transform = `translate(-50%, -50%) scale(${pose.reveal.scale})`;
    halo.style.opacity = String(pose.reveal.halo);
    halo.style.transform = `translate(-50%, -50%) scale(${0.8 + pose.reveal.halo * 0.25})`;
    backdrop.style.opacity = String(pose.backdrop);
  }, [headerHooks]);

  const onVisibilityChange = useCallback(
    (visible: boolean) => {
      if (!visible) headerHooks.reset();
    },
    [headerHooks],
  );

  useEffect(() => () => headerHooks.reset(), [headerHooks]);

  useScrollTimeline({ sectionRef, stageRef, started, onFrame, onVisibilityChange });

  return (
    <section
      id="bienvenida"
      ref={sectionRef}
      className="welcome media-surface"
      style={{ height: `${SECTION_VH}vh` }}
      aria-label="Introducción de Vurp"
    >
      <div ref={stageRef} className="welcome__stage">
        <div ref={backdropRef} className="welcome__backdrop" aria-hidden="true">
          <canvas ref={starsRef} className="welcome__stars" />
          <div className="welcome__floor" />
        </div>
        <OrbitLogo logoRef={logoRef} />
        <div ref={planetRef} className="welcome__planet" aria-hidden="true" />
        <canvas ref={canvasRef} className="welcome__canvas" aria-hidden="true" />
        <div ref={waveRef} className="welcome__wave" aria-hidden="true" />
        <Messages lines={welcomeLines} containerRef={messagesRef} lineRefs={lineRefs} />
        <div ref={flashRef} className="welcome__flash" aria-hidden="true" />
        <BrandReveal revealRef={revealRef} haloRef={haloRef} />
        {debug && <DebugOverlay handleRef={debugRef} />}
      </div>
    </section>
  );
}
