import { ArrowRight, Mail } from "lucide-react";
import { contactInfo, ctaBackground } from "../data/content";
import "./CallToAction.css";

export function CallToAction() {
  return (
    <section id="contacto" className="section cta">
      <div className="container">
        <div className="cta__card media-surface">
          <div className="media-bg cta__bg">
            <img src={ctaBackground.src} alt="" loading="lazy" />
          </div>
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
        </div>
      </div>
    </section>
  );
}
