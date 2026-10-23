import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { useRef } from "react";
import { contactInfo, ctaBackground } from "../data/content";
import "./CallToAction.css";

export function CallToAction() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const cardScale = useTransform(scrollYProgress, [0, 0.4], [0.9, 1]);
  const cardOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section id="contacto" ref={ref} className="section cta">
      <div className="container">
        <motion.div className="cta__card media-surface" style={{ scale: cardScale, opacity: cardOpacity }}>
          <motion.div className="media-bg cta__bg" style={{ y: bgY }} data-parallax>
            <img src={ctaBackground.src} alt="" loading="lazy" />
          </motion.div>
          <div className="cta__overlay" />

          <div className="cta__content">
            <span className="eyebrow">Hablemos</span>
            <h2 className="title">¿Tienes un proceso que podría funcionar mejor?</h2>
            <p className="subtitle">
              Cuéntanos cómo trabaja tu equipo hoy. En una primera reunión, sin costo, te decimos con
              honestidad si podemos ayudarte y cómo.
            </p>
            <div className="cta__actions">
              <a href={`mailto:${contactInfo.email}`} className="btn btn--light">
                Agendar una reunión
                <ArrowRight size={18} />
              </a>
              <a href={`mailto:${contactInfo.email}`} className="btn btn--ghost">
                <Mail size={18} />
                {contactInfo.email}
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
