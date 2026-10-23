import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { valueProps } from "../data/content";
import type { ValueProp } from "../types";
import { Reveal } from "./ui/Reveal";
import "./ValueProposition.css";

interface ValueCardProps {
  item: ValueProp;
  index: number;
}

function ValueCard({ item, index }: ValueCardProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });

  const opacity = useTransform(scrollYProgress, [0, 1], [0.15, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [80, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [18, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  const Icon = item.icon;

  return (
    <motion.article
      ref={ref}
      className="value-card"
      style={{ opacity, y, rotateX, scale }}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <div className="value-card__top">
        <span className="value-card__icon">
          <Icon size={22} strokeWidth={1.75} />
        </span>
        <span className="value-card__index">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <h3 className="value-card__title">{item.title}</h3>
      <p className="value-card__description">{item.description}</p>
      <p className="value-card__detail">{item.detail}</p>
    </motion.article>
  );
}

export function ValueProposition() {
  return (
    <section id="propuesta" className="section value">
      <div className="value__decor" aria-hidden="true" />
      <div className="container value__layout">
        <div className="value__intro">
          <Reveal>
            <span className="eyebrow">Propuesta de valor</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="title">
              Sistemas que <span className="text-accent">ordenan</span> tu empresa
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="subtitle">
              La tecnología tiene que simplificar el trabajo, no sumarle complejidad. Por eso construimos
              herramientas que tu equipo entiende y usa desde el primer día.
            </p>
          </Reveal>
        </div>

        <div className="value__cards">
          {valueProps.map((item, index) => (
            <ValueCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
