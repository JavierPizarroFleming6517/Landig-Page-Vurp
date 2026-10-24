import { ArrowRight } from "lucide-react";
import { hero } from "../data/content";
import "./Hero.css";

export function Hero() {
  return (
    <section id="inicio" className="hero media-surface">
      <div className="hero__photo">
        <img src={hero.background.src} alt={hero.background.alt} fetchPriority="high" />
        <div className="media-tint" />
        <div className="hero__shade" />
      </div>

      <div className="container hero__content">
        <span className="eyebrow hero__eyebrow">{hero.eyebrow}</span>

        <h1 className="display hero__title">
          {hero.title}
          <br />
          <span className="hero__accent">{hero.highlight}</span>
        </h1>

        <p className="subtitle hero__description">{hero.description}</p>

        <div className="hero__actions">
          <a href={hero.primaryCta.href} className="btn btn--primary">
            {hero.primaryCta.label}
            <ArrowRight size={18} />
          </a>
          <a href={hero.secondaryCta.href} className="btn btn--ghost">
            {hero.secondaryCta.label}
          </a>
        </div>
      </div>

      <div className="hero__exit" aria-hidden="true" />
    </section>
  );
}
