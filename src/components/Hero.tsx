import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { hero } from "../data/content";
import { SYMBOL_OFFSET, SYMBOL_PATHS, SYMBOL_SIZE, SYMBOL_ZOOM_ORIGIN } from "./ui/vurpSymbol";
import "./Hero.css";

/** Fracción del recorrido del hero en la que ocurre el zoom a través de la V. */
const ZOOM_END = 0.55;
const MAX_ZOOM = 45;
const WIDE_BREAKPOINT = 900;
/** Tramo del recorrido en el que se revela el texto, una vez abierta la V. */
const COPY_START = 0.56;
const COPY_END = 0.8;

interface Viewport {
  width: number;
  height: number;
}

interface SymbolLayout {
  scale: number;
  originX: number;
  originY: number;
}

const ease = [0.22, 1, 0.36, 1] as const;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const getViewport = (): Viewport => ({ width: window.innerWidth, height: window.innerHeight });

const getLayout = ({ width, height }: Viewport): SymbolLayout => {
  const wide = width >= WIDE_BREAKPOINT;
  const symbolWidth = wide ? Math.min(width * 0.36, 500) : Math.min(width * 0.58, 260);
  const scale = symbolWidth / SYMBOL_SIZE.width;
  const symbolHeight = SYMBOL_SIZE.height * scale;
  const centerX = wide ? width * 0.73 : width / 2;
  const centerY = wide ? height * 0.5 : height * 0.34;
  return {
    scale,
    originX: centerX - symbolWidth / 2 + SYMBOL_ZOOM_ORIGIN.x * scale,
    originY: centerY - symbolHeight / 2 + SYMBOL_ZOOM_ORIGIN.y * scale,
  };
};

const symbolTransform = (progress: number, layout: SymbolLayout, viewport: Viewport) => {
  const t = clamp01(progress / ZOOM_END);
  const zoom = Math.pow(MAX_ZOOM, t * t);
  const move = easeOutCubic(clamp01(t * 1.6));
  const x = layout.originX + (viewport.width / 2 - layout.originX) * move;
  const y = layout.originY + (viewport.height / 2 - layout.originY) * move;
  const scale = layout.scale * zoom;
  const dx = SYMBOL_OFFSET.x - SYMBOL_ZOOM_ORIGIN.x;
  const dy = SYMBOL_OFFSET.y - SYMBOL_ZOOM_ORIGIN.y;
  return `translate(${x} ${y}) scale(${scale}) translate(${dx} ${dy})`;
};

/** Desplaza un tramo [start, end] dentro de la ventana de revelado del texto. */
const copyRange = (start: number, end: number): [number, number] => [
  COPY_START + (COPY_END - COPY_START) * start,
  COPY_START + (COPY_END - COPY_START) * end,
];

interface ProgressRevealProps {
  progress: MotionValue<number>;
  range: [number, number];
  className?: string;
  children: ReactNode;
}

function ProgressReveal({ progress, range, className, children }: ProgressRevealProps) {
  const opacity = useTransform(progress, range, [0, 1]);
  const y = useTransform(progress, range, [28, 0]);
  return (
    <motion.div className={className} style={{ opacity, y }}>
      {children}
    </motion.div>
  );
}

interface ProgressWordProps {
  progress: MotionValue<number>;
  range: [number, number];
  accent?: boolean;
  children: string;
}

function ProgressWord({ progress, range, accent = false, children }: ProgressWordProps) {
  const opacity = useTransform(progress, range, [0, 1]);
  const y = useTransform(progress, range, ["0.6em", "0em"]);
  const blur = useTransform(progress, range, [8, 0]);
  const filter = useTransform(blur, (value) => `blur(${value}px)`);
  return (
    <motion.span className={`hero__word${accent ? " hero__word--accent" : ""}`} style={{ opacity, y, filter }}>
      {children}
    </motion.span>
  );
}

const piece = (x: number, y: number, delay: number, ready: boolean) => ({
  initial: { opacity: 0, x, y },
  animate: ready ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x, y },
  transition: { duration: 1.1, delay, ease },
});

interface HeroProps {
  ready: boolean;
}

export function Hero({ ready }: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const maskGroupRef = useRef<SVGGElement>(null);
  const colorGroupRef = useRef<SVGGElement>(null);
  const maskId = useId();
  const [viewport, setViewport] = useState<Viewport>(getViewport);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.35 });

  const photoOpacity = useTransform(progress, [0.02, 0.18], [0, 1]);
  const photoScale = useTransform(progress, [0, ZOOM_END], [1.35, 1]);
  const shadeOpacity = useTransform(progress, [0.4, 0.62], [0.2, 0.78]);
  const maskOpacity = useTransform(progress, [0.5, 0.58], [1, 0]);
  const colorOpacity = useTransform(progress, [0.06, 0.26], [1, 0]);
  const decorOpacity = useTransform(progress, [0, 0.15], [1, 0]);
  const leadOpacity = useTransform(progress, [0, 0.16], [1, 0]);
  const leadScale = useTransform(progress, [0, 0.2], [1, 1.12]);
  const leadBlur = useTransform(progress, [0, 0.16], [0, 8]);
  const leadFilter = useTransform(leadBlur, (value) => `blur(${value}px)`);
  const scrollHintOpacity = useTransform(progress, [0, 0.06], [1, 0]);
  const copyPointer = useTransform(progress, (value) => (value > copyRange(0.8, 1)[0] ? "auto" : "none"));
  const exitOpacity = useTransform(progress, [0.9, 1], [0, 1]);

  const applyTransform = useCallback(
    (value: number) => {
      const transform = symbolTransform(value, getLayout(viewport), viewport);
      maskGroupRef.current?.setAttribute("transform", transform);
      colorGroupRef.current?.setAttribute("transform", transform);
    },
    [viewport],
  );

  useLayoutEffect(() => applyTransform(progress.get()), [applyTransform, progress]);
  useMotionValueEvent(progress, "change", applyTransform);

  useEffect(() => {
    const onResize = () => setViewport(getViewport());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const titleWords = [
    ...hero.title.split(" ").map((text) => ({ text, accent: false })),
    ...hero.highlight.split(" ").map((text) => ({ text, accent: true })),
  ];
  const firstAccent = titleWords.findIndex((w) => w.accent);
  const wordSpan = 0.5 / titleWords.length;

  return (
    <section id="inicio" ref={ref} className="hero media-surface">
      <div className="hero__stage">
        <motion.div className="hero__photo" style={{ opacity: photoOpacity, scale: photoScale }}>
          <img src={hero.background.src} alt={hero.background.alt} fetchPriority="high" />
          <div className="media-tint" />
          <motion.div className="hero__shade" style={{ opacity: shadeOpacity }} />
        </motion.div>

        <motion.div className="hero__decor" style={{ opacity: decorOpacity }} aria-hidden="true">
          <div className="hero__glow" />
          <div className="hero__grid" />
        </motion.div>

        <svg className="hero__window" width="100%" height="100%" aria-hidden="true">
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={viewport.width} height={viewport.height}>
              <rect width={viewport.width} height={viewport.height} fill="#fff" />
              <g ref={maskGroupRef}>
                <path d={SYMBOL_PATHS.left} fill="#000" stroke="#000" strokeWidth={1.4} strokeLinejoin="round" />
                <path d={SYMBOL_PATHS.middle} fill="#000" />
                <path d={SYMBOL_PATHS.top} fill="#000" />
              </g>
            </mask>
          </defs>
          <motion.rect
            width="100%"
            height="100%"
            fill="var(--vurp-grafito)"
            mask={`url(#${maskId})`}
            style={{ opacity: maskOpacity }}
          />
          <motion.g style={{ opacity: colorOpacity }}>
            <g ref={colorGroupRef}>
              <motion.path
                d={SYMBOL_PATHS.left}
                fill="var(--vurp-berenjena-claro)"
                stroke="var(--vurp-berenjena-claro)"
                strokeWidth={1.4}
                strokeLinejoin="round"
                {...piece(-24, -24, 0.05, ready)}
              />
              <motion.path d={SYMBOL_PATHS.middle} fill="var(--vurp-orquidea-claro)" {...piece(0, 30, 0.2, ready)} />
              <motion.path d={SYMBOL_PATHS.top} fill="var(--vurp-lila-claro)" {...piece(24, -24, 0.35, ready)} />
            </g>
          </motion.g>
        </svg>

        <motion.div className="container hero__lead" style={{ opacity: leadOpacity, scale: leadScale, filter: leadFilter }}>
          <p className="display hero__lead-text">{hero.lead}</p>
        </motion.div>

        <motion.div className="container hero__content" style={{ pointerEvents: copyPointer }}>
          <ProgressReveal progress={progress} range={copyRange(0, 0.3)}>
            <span className="eyebrow hero__eyebrow">{hero.eyebrow}</span>
          </ProgressReveal>

          <h1 className="display hero__title">
            {titleWords.map((w, i) => {
              const start = 0.1 + i * wordSpan;
              return (
                <span key={`w-${i}`} className="hero__word-slot">
                  {i === firstAccent && <br />}
                  <ProgressWord progress={progress} range={copyRange(start, start + wordSpan * 3)} accent={w.accent}>
                    {w.text}
                  </ProgressWord>
                </span>
              );
            })}
          </h1>

          <ProgressReveal progress={progress} range={copyRange(0.55, 0.8)} className="hero__description">
            <p className="subtitle">{hero.description}</p>
          </ProgressReveal>

          <ProgressReveal progress={progress} range={copyRange(0.7, 1)} className="hero__actions">
            <a href={hero.primaryCta.href} className="btn btn--primary">
              {hero.primaryCta.label}
              <ArrowRight size={18} />
            </a>
            <a href={hero.secondaryCta.href} className="btn btn--ghost">
              {hero.secondaryCta.label}
            </a>
          </ProgressReveal>
        </motion.div>

        <motion.div className="hero__exit" style={{ opacity: exitOpacity }} aria-hidden="true" />

        <motion.a
          href="#propuesta"
          className="hero__scroll"
          aria-label="Bajar a la siguiente sección"
          style={{ opacity: scrollHintOpacity }}
        >
          <motion.span
            className="hero__scroll-inner"
            initial={{ opacity: 0, y: 12 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.8, delay: 0.8, ease }}
          >
            <span>Scroll</span>
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="hero__scroll-icon"
            >
              <ArrowDown size={16} />
            </motion.span>
          </motion.span>
        </motion.a>
      </div>
    </section>
  );
}
