import { useEffect, useRef, useState } from "react";
import { welcomeLines } from "./config";
import { createHeaderHooks } from "./headerHooks";
import { paintStars } from "./starfield";

/** Puntos del globo estático (se dibujan una sola vez). */
const STATIC_POINTS = 6000;

/**
 * Intro para `prefers-reduced-motion`: una sección normal de 100svh, sin sticky ni scroll animado, con el globo
 * de puntos pintado una vez, el logo completo y los tres mensajes. No descarga three ni corre ningún rAF.
 */
export function WelcomeStatic() {
  const sectionRef = useRef<HTMLElement>(null);
  const starsRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<HTMLCanvasElement>(null);
  const [headerHooks] = useState(createHeaderHooks);

  useEffect(() => {
    const section = sectionRef.current;
    const stars = starsRef.current;
    const globe = globeRef.current;
    if (!section || !stars || !globe) return;
    let cancelled = false;
    let paintGlobe: ((canvas: HTMLCanvasElement, size: number, points: number) => void) | null = null;

    const paint = () => {
      paintStars(stars, section.clientWidth, section.clientHeight);
      if (paintGlobe) paintGlobe(globe, globe.clientWidth, STATIC_POINTS);
    };
    // Chunk chico (máscara de tierra + dibujo 2D), sin three.
    import("./scene/staticGlobe").then((module) => {
      if (cancelled) return;
      paintGlobe = module.paintStaticGlobe;
      paint();
    });

    const resize = new ResizeObserver(paint);
    resize.observe(section);
    // El logo completo ya está en pantalla: mientras la sección se ve, se aparta el de la barra (área de respeto).
    const visibility = new IntersectionObserver(([entry]) => headerHooks.sync("logoHidden", (entry?.intersectionRatio ?? 0) >= 0.4), {
      threshold: [0, 0.4, 1],
    });
    visibility.observe(section);
    return () => {
      cancelled = true;
      resize.disconnect();
      visibility.disconnect();
      headerHooks.reset();
    };
  }, [headerHooks]);

  return (
    <section id="bienvenida" ref={sectionRef} className="welcome welcome--static media-surface" aria-label="Introducción de Vurp">
      <div className="welcome__backdrop welcome-static__backdrop" aria-hidden="true">
        <canvas ref={starsRef} className="welcome__stars" />
      </div>
      <div className="welcome-static">
        <canvas ref={globeRef} className="welcome-static__globe" aria-hidden="true" />
        <img
          className="welcome-static__logo"
          src="/brand/logo-completo-oscuro.svg"
          alt="Vurp · Software & Cybersecurity"
          width={395}
          height={124}
        />
        <div className="welcome-static__messages">
          {welcomeLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
