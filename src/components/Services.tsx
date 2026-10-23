import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { solutions } from "../data/content";
import { Reveal } from "./ui/Reveal";
import "./Services.css";

export function Services() {
  const ref = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  const active = solutions[activeIndex] ?? solutions[0];
  if (!active) return null;
  const ActiveIcon = active.icon;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const delta = event.key === "ArrowDown" ? 1 : -1;
    setActiveIndex((current) => (current + delta + solutions.length) % solutions.length);
  };

  return (
    <section id="soluciones" ref={ref} className="section services media-surface">
      <motion.div className="services__bg" style={{ y: bgY }} data-parallax>
        <AnimatePresence initial={false}>
          <motion.img
            key={active.id}
            src={active.image.src}
            alt=""
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>
      </motion.div>
      <div className="media-tint" />
      <div className="services__overlay" />

      <div className="container services__inner">
        <div className="section-header">
          <Reveal>
            <span className="eyebrow">Soluciones a medida</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="title">Lo que construimos para tu empresa</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="subtitle">
              Cada solución parte de un problema concreto. Elige una para ver qué resuelve y qué puedes esperar.
            </p>
          </Reveal>
        </div>

        <div className="services__layout">
          <Reveal direction="right">
            <div className="services__tabs" role="tablist" aria-orientation="vertical" onKeyDown={handleKeyDown}>
              {solutions.map((solution, index) => {
                const Icon = solution.icon;
                const isActive = index === activeIndex;
                return (
                  <button
                    key={solution.id}
                    type="button"
                    role="tab"
                    id={`tab-${solution.id}`}
                    aria-selected={isActive}
                    aria-controls={`panel-${solution.id}`}
                    tabIndex={isActive ? 0 : -1}
                    className={`services__tab ${isActive ? "is-active" : ""}`}
                    onClick={() => setActiveIndex(index)}
                    onMouseEnter={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="services-tab-bg"
                        className="services__tab-bg"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="services__tab-icon">
                      <Icon size={22} strokeWidth={1.75} />
                    </span>
                    <span className="services__tab-text">
                      <span className="services__tab-name">{solution.name}</span>
                      <span className="services__tab-tagline">{solution.tagline}</span>
                    </span>
                    <ArrowRight size={18} className="services__tab-arrow" />
                  </button>
                );
              })}
            </div>
          </Reveal>

          <div className="services__panel-wrap">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                id={`panel-${active.id}`}
                role="tabpanel"
                aria-labelledby={`tab-${active.id}`}
                className="services__panel"
                initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="services__panel-icon">
                  <ActiveIcon size={28} strokeWidth={1.5} />
                </span>
                <h3 className="services__panel-title">{active.name}</h3>
                <p className="services__panel-description">{active.description}</p>
                <ul className="services__benefits">
                  {active.benefits.map((benefit, index) => (
                    <motion.li
                      key={benefit}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + index * 0.06 }}
                    >
                      <Check size={18} strokeWidth={2.25} />
                      {benefit}
                    </motion.li>
                  ))}
                </ul>
                <a href="#contacto" className="btn btn--primary">
                  {active.ctaLabel}
                  <ArrowRight size={18} />
                </a>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
