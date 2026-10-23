import { animate, motion, useInView, useScroll, useTransform, type Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { securityBackground, securityBadge, securityFeatures, securityStats } from "../data/content";
import type { SecurityStat } from "../types";
import { Reveal } from "./ui/Reveal";
import "./SecurityHighlight.css";

const grid: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

function StatCounter({ stat }: { stat: SecurityStat }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, stat.value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, stat.value]);

  return (
    <div className="security__stat">
      <span ref={ref} className="security__stat-value">
        {value}
        {stat.suffix}
      </span>
      <span className="security__stat-label">{stat.label}</span>
    </div>
  );
}

export function SecurityHighlight() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const shieldRotate = useTransform(scrollYProgress, [0, 1], [-25, 25]);
  const BadgeIcon = securityBadge.icon;

  return (
    <section id="seguridad" ref={ref} className="section security media-surface">
      <motion.div className="media-bg security__bg" style={{ y: bgY }} data-parallax>
        <img src={securityBackground.src} alt="" loading="lazy" />
      </motion.div>
      <div className="security__overlay" />

      <div className="container security__layout">
        <div className="security__intro">
          <Reveal>
            <span className="eyebrow">Ciberseguridad integrada</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="title">Software con respaldo de seguridad</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="subtitle">
              La seguridad no es un módulo que se agrega al final. Está presente en cada decisión de diseño, en
              cada línea de código y en cada servidor que mantenemos.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="security__shield">
              <motion.div className="security__ring security__ring--outer" style={{ rotate: shieldRotate }} />
              <div className="security__ring security__ring--inner" />
              <motion.span
                className="security__shield-core"
                animate={{ boxShadow: ["0 0 0 0 rgba(201,167,228,0.45)", "0 0 0 22px rgba(201,167,228,0)"] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
              >
                <BadgeIcon size={40} strokeWidth={1.5} />
              </motion.span>
              <span className="security__shield-label">{securityBadge.label}</span>
            </div>
          </Reveal>
        </div>

        <div className="security__content">
          <motion.div
            className="security__grid"
            variants={grid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {securityFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.article key={feature.id} className="security__card" variants={card}>
                  <span className="security__card-icon">
                    <Icon size={22} strokeWidth={1.75} />
                  </span>
                  <h3 className="security__card-title">{feature.title}</h3>
                  <p className="security__card-description">{feature.description}</p>
                </motion.article>
              );
            })}
          </motion.div>

          <Reveal delay={0.1}>
            <div className="security__stats">
              {securityStats.map((stat) => (
                <StatCounter key={stat.id} stat={stat} />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
