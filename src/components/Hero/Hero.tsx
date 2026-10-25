import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { hero, marquee } from "../../data/content";
import { BREAKPOINT, DEVICE, LIVE, LOGO, NAV_CLEARANCE, SECTION_VH, ZOOM } from "./config";
import { DebugOverlay, type DebugHandle } from "./DebugOverlay";
import { Erp } from "./Erp";
import { computeLayout, type HeroLayout } from "./layout";
import { Notebook } from "./Notebook";
import { poseAt } from "./timeline";
import { useScrollTimeline, type TimelineFrame } from "./useScrollTimeline";
import "./Hero.css";

const loop = [...marquee, ...marquee];

/** La capa de profundidad sobresale lo justo para cubrir el viewport incluso a su escala mínima. */
const depthInset = `${-50 * (1 / ZOOM.depthFrom - 1)}%`;

/**
 * Hero en animación (en pantalla y con progreso < 1): el header pierde su fondo y se esconde el botón de volver
 * arriba. Lo escribe el timeline como atributo de <html>, solo cuando cambia.
 */
const setPlaying = (playing: boolean) => {
  const root = document.documentElement;
  if (root.hasAttribute("data-hero-playing") !== playing) root.toggleAttribute("data-hero-playing", playing);
};

/**
 * `?debug` muestra el panel; junto a él, `w` fuerza el ancho de la pantalla, `t` la inclinación inicial (grados) y
 * `p` fija el progreso.
 */
function readDebugParams() {
  const params = new URLSearchParams(window.location.search);
  const debug = params.has("debug");
  const read = (key: string, min: number, max: number) => {
    const value = Number.parseFloat(params.get(key) ?? "");
    return debug && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : undefined;
  };
  return { debug, widthFraction: read("w", 0.3, 1.5), tiltDeg: read("t", 0, 12), progress: read("p", 0, 1) };
}

export function Hero() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const depthRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const erpRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const debugRef = useRef<DebugHandle | null>(null);
  const layoutRef = useRef<HeroLayout | null>(null);
  const lastRef = useRef({
    progress: -1,
    layout: null as HeroLayout | null,
    deviceVisible: true,
    moving: false,
    live: false,
    assembly: "",
  });
  /** Sección en pantalla (lo actualiza el IntersectionObserver; antes, una medición inicial). */
  const inViewRef = useRef(false);
  const [params] = useState(readDebugParams);
  const [layout, setLayout] = useState<HeroLayout | null>(null);

  const onFrame = useCallback((frame: TimelineFrame) => {
    const current = layoutRef.current;
    if (!current) return;
    const pose = poseAt(frame.progress, current);
    debugRef.current?.update(frame, pose, current);
    setPlaying(inViewRef.current && frame.progress < 1);

    const last = lastRef.current;
    // will-change solo en movimiento: en reposo el navegador vuelve a rasterizar a la escala real.
    const moving = frame.progress !== frame.target;
    if (moving !== last.moving) {
      last.moving = moving;
      stageRef.current?.classList.toggle("is-moving", moving);
    }
    // El ERP queda vivo (loops en CSS) al terminar de armarse; con histéresis para no reiniciarlo por un temblor.
    const live = frame.progress >= (last.live ? LIVE.off : LIVE.on);
    if (live !== last.live) {
      last.live = live;
      erpRef.current?.classList.toggle("is-live", live);
    }
    if (last.progress === frame.progress && last.layout === current) return;
    last.progress = frame.progress;
    last.layout = current;

    const device = deviceRef.current;
    const depth = depthRef.current;
    const logo = logoRef.current;
    const erp = erpRef.current;
    if (!device || !depth || !logo || !erp) return;

    const { tx, ty, scale, tilt } = pose.device;
    device.style.transform =
      `translate3d(${tx}px, ${ty}px, 0) scale(${scale})` + (tilt > 0.001 ? ` rotateX(${tilt}deg)` : "");
    if (pose.device.visible !== last.deviceVisible) {
      last.deviceVisible = pose.device.visible;
      device.style.visibility = pose.device.visible ? "" : "hidden";
    }

    logo.style.transform = `translate3d(${pose.logo.tx}px, ${pose.logo.ty}px, 0) scale(${pose.logo.scale})`;
    logo.style.opacity = String(pose.logo.opacity);
    depth.style.transform = `scale(${pose.depth.scale})`;

    erp.style.transform = `translate3d(0, ${pose.erp.y}px, 0) scale(${pose.erp.scale})`;
    erp.style.opacity = String(pose.erp.opacity);
    // El armado interno va en variables CSS (heredadas): Erp.css las traduce a transform y opacity.
    const { side, cards, fill, charts } = pose.assembly;
    const assembly = [side, cards, fill, charts].map((value) => value.toFixed(3)).join();
    if (assembly !== last.assembly) {
      last.assembly = assembly;
      erp.style.setProperty("--erp-side", side.toFixed(3));
      erp.style.setProperty("--erp-cards", cards.toFixed(3));
      erp.style.setProperty("--erp-fill", fill.toFixed(3));
      erp.style.setProperty("--erp-charts", charts.toFixed(3));
    }

    pose.copy.forEach((fade, index) => {
      const item = itemRefs.current[index];
      if (!item) return;
      item.style.opacity = String(fade.opacity);
      item.style.transform = `translate3d(0, ${fade.y}px, 0)`;
      const hidden = fade.opacity < 0.5;
      if (item.hasAttribute("data-hidden") !== hidden) item.toggleAttribute("data-hidden", hidden);
    });
  }, []);

  // Fuera de pantalla no hay will-change, y el header y el resto vuelven a su estilo.
  const onVisibilityChange = useCallback((visible: boolean) => {
    inViewRef.current = visible;
    stageRef.current?.classList.toggle("is-active", visible);
    if (!visible) setPlaying(false);
  }, []);

  useLayoutEffect(() => () => setPlaying(false), []);

  const refresh = useScrollTimeline({
    sectionRef: trackRef,
    stageRef,
    onFrame,
    onVisibilityChange,
    fixedProgress: params.progress,
  });

  useLayoutEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const copy = copyRef.current;
    if (!track || !stage || !copy) return;
    // Antes de que avise el IntersectionObserver: así el primer paint ya sale con el header correcto.
    const rect = track.getBoundingClientRect();
    inViewRef.current = rect.bottom > 0 && rect.top < window.innerHeight;
    const measure = () => {
      const width = stage.clientWidth;
      track.style.setProperty("--track-vh", String(width < BREAKPOINT ? SECTION_VH.compact : SECTION_VH.wide));
      const next = computeLayout(width, stage.clientHeight, {
        copyBottom: copy.offsetTop + copy.offsetHeight,
        headerBottom: document.querySelector(".nav__bar")?.getBoundingClientRect().bottom ?? NAV_CLEARANCE,
        widthFraction: params.widthFraction,
        tiltDeg: params.tiltDeg,
      });
      layoutRef.current = next;
      setLayout(next);
      refresh();
    };
    // El bloque de texto también se observa: cambia de alto cuando carga la fuente.
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(copy);
    measure();
    return () => observer.disconnect();
  }, [params.widthFraction, params.tiltDeg, refresh]);

  // Los CTAs están en el orden de foco desde el inicio. Si reciben foco antes del final del recorrido (Tab desde el
  // header), la página salta al final para que lo enfocado se vea.
  const onCopyFocus = useCallback(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const travel = track.offsetHeight - stage.offsetHeight;
    const top = track.getBoundingClientRect().top;
    if (travel > 0 && -top < travel - 1) window.scrollTo({ top: window.scrollY + top + travel, behavior: "instant" });
  }, []);

  const setItem = (index: number) => (node: HTMLElement | null) => {
    itemRefs.current[index] = node;
  };

  return (
    <section className="hero" id="inicio">
      <div ref={trackRef} className="hero__track">
        <span id="contenido" className="hero__anchor" />
        <div
          ref={stageRef}
          className="hero__stage"
          style={
            layout && layout.tiltDeg > 0
              ? { perspective: DEVICE.perspectivePx, perspectiveOrigin: `${layout.cx}px ${layout.cy0}px` }
              : undefined
          }
        >
          <div className="hero__world">
            <div ref={depthRef} className="hero__depth" style={{ inset: depthInset }} aria-hidden="true" />
            <img
              ref={logoRef}
              className="hero__logo"
              src={LOGO.src}
              alt=""
              width={layout?.logo.width}
              height={layout?.logo.height}
            />
            <div
              ref={erpRef}
              className="hero__erp"
              aria-hidden="true"
              style={
                layout
                  ? { left: layout.erp.left, top: layout.erp.top, width: layout.erp.width, height: layout.erp.height }
                  : undefined
              }
            >
              <Erp />
            </div>
            <div ref={copyRef} className="hero__copy" onFocus={onCopyFocus}>
              <p ref={setItem(0)} className="hero__badge">
                {hero.badge}
              </p>
              <h1 ref={setItem(1)} className="hero__title">
                {hero.title}
                <br />
                <em>{hero.titleAccent}</em>
              </h1>
              <p ref={setItem(2)} className="hero__lead">
                {hero.lead}
              </p>
              <div ref={setItem(3)} className="hero__actions">
                {hero.actions.map((action) => (
                  <a key={action.href} className={`btn btn--${action.variant}`} href={action.href}>
                    {action.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div
            ref={deviceRef}
            className="hero__device"
            aria-hidden="true"
            style={layout ? { transformOrigin: `${layout.device.originX}px ${layout.device.originY}px` } : undefined}
          >
            {layout && <Notebook layout={layout} />}
          </div>
          {params.debug && <DebugOverlay handleRef={debugRef} />}
        </div>
      </div>
      <div className="wrap">
        <div className="marquee" aria-label="Qué construye Vurp">
          <div className="marquee__track">
            {loop.map((item, index) => (
              <span className="chip" key={`${item}-${index}`}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
