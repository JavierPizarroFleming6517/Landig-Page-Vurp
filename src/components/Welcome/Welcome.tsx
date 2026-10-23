import { ArrowDown } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { welcomeLines } from "../../data/content";
import { createPlanet, type PlanetController } from "./createPlanet";
import { currentViewport, getOrbitLayout, poseAt, type OrbitLayout } from "./orbit";
import "./Welcome.css";

const place = (element: HTMLElement, x: number, y: number, scale: number) => {
  element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
};

function usePlanet(reduced: boolean, onView?: (layout: OrbitLayout) => void) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const planetRef = useRef<PlanetController | null>(null);
  const onViewRef = useRef(onView);

  useEffect(() => {
    onViewRef.current = onView;
  }, [onView]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const layout = getOrbitLayout(currentViewport());
    let planet: PlanetController;
    try {
      planet = createPlanet(canvas, { width: layout.width, height: layout.height }, reduced);
    } catch (error) {
      console.error(error);
      section.dataset.webgl = "off";
      return;
    }
    planetRef.current = planet;
    onViewRef.current?.(layout);

    const onResize = () => {
      const next = getOrbitLayout(currentViewport());
      planet.setView({ width: next.width, height: next.height });
      onViewRef.current?.(next);
    };
    const observer = new IntersectionObserver(([entry]) => {
      planet.setActive(entry?.isIntersecting === true);
    });
    observer.observe(section);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      planet.dispose();
      planetRef.current = null;
    };
  }, [reduced]);

  return { canvasRef, sectionRef, planetRef };
}

function WelcomeCalm() {
  const { canvasRef, sectionRef } = usePlanet(true);

  return (
    <section id="bienvenida" ref={sectionRef} className="welcome welcome--calm media-surface" data-welcome="horizon" aria-label="Vurp">
      <canvas ref={canvasRef} className="welcome__canvas" aria-hidden="true" />
      <div className="welcome__fallback" aria-hidden="true" />
      <div className="welcome__calm">
        <img className="welcome__lockup" src="/brand/logo-completo-oscuro.svg" alt="Vurp" />
        {welcomeLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </section>
  );
}

function WelcomeScroll() {
  const stageRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const revealRef = useRef<HTMLImageElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLAnchorElement>(null);
  const lineRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const layoutRef = useRef<OrbitLayout>(getOrbitLayout(currentViewport()));
  const enterRef = useRef(0);
  const applyRef = useRef<() => void>(() => {});
  const { canvasRef, sectionRef, planetRef } = usePlanet(false, (layout) => {
    layoutRef.current = layout;
    applyRef.current();
  });

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 28, mass: 0.32 });

  useLayoutEffect(() => {
    applyRef.current = () => {
      const stage = stageRef.current;
      const logo = logoRef.current;
      const reveal = revealRef.current;
      const flash = flashRef.current;
      const hint = hintRef.current;
      if (!stage || !logo || !reveal || !flash || !hint) return;

      const layout = layoutRef.current;
      const pose = poseAt(progress.get(), layout);
      const enter = enterRef.current;
      stage.style.setProperty("--horizon", `${layout.crownY}px`);

      place(logo, pose.logoX, pose.logoY, pose.logoScale);
      logo.style.opacity = String(pose.logoOpacity * enter);

      place(reveal, layout.cx, layout.height * 0.34, pose.revealScale);
      reveal.style.opacity = String(pose.reveal * enter);

      pose.messages.forEach((linePose, index) => {
        const line = lineRefs.current[index];
        if (!line) return;
        place(line, linePose.x, linePose.y, linePose.scale);
        line.style.opacity = String(linePose.opacity * enter);
        line.setAttribute("aria-hidden", linePose.opacity < 0.45 ? "true" : "false");
      });

      flash.style.opacity = String(pose.flash);
      hint.style.opacity = String(pose.hint * enter);
      const canvas = canvasRef.current;
      if (canvas) canvas.style.opacity = String(Math.min(1, enter * 1.15));

      planetRef.current?.setState({
        glow: pose.glow,
        burst: pose.burst,
        shatter: pose.shatter,
        reduced: false,
      });
    };
  });

  useMotionValueEvent(progress, "change", () => applyRef.current());

  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      enterRef.current = Math.min(1, (now - start) / 1100);
      applyRef.current();
      if (enterRef.current < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <section id="bienvenida" ref={sectionRef} className="welcome media-surface" data-welcome="horizon" aria-label="Introducción de Vurp">
      <div ref={stageRef} className="welcome__stage">
        <canvas ref={canvasRef} className="welcome__canvas" aria-hidden="true" />
        <div className="welcome__fallback" aria-hidden="true" />
        <img ref={logoRef} className="welcome__mark" src="/brand/simbolo-oscuro.svg" alt="" />
        <img ref={revealRef} className="welcome__reveal" src="/brand/logo-completo-oscuro.svg" alt="" />
        <div className="welcome__copy">
          {welcomeLines.map((line, index) => (
            <p
              key={line}
              ref={(node) => {
                lineRefs.current[index] = node;
              }}
              className="welcome__line"
            >
              {line}
            </p>
          ))}
        </div>
        <div ref={flashRef} className="welcome__flash" aria-hidden="true" />
        <a ref={hintRef} href="#inicio" className="welcome__hint">
          <span>Scroll</span>
          <span className="welcome__hint-icon">
            <ArrowDown size={16} />
          </span>
        </a>
      </div>
    </section>
  );
}

export function Welcome() {
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced ? <WelcomeCalm /> : <WelcomeScroll />;
}
