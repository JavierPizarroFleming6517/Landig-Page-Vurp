import { Check } from "lucide-react";
import { showcaseScenes } from "../data/content";
import "./DynamicShowcase.css";

export function DynamicShowcase() {
  const cover = showcaseScenes[0]?.image;

  return (
    <section id="proceso" className="section showcase media-surface" aria-label="Cómo trabajamos">
      <div className="showcase__media">
        {cover && <img src={cover.src} alt={cover.alt} loading="lazy" />}
        <div className="media-tint" />
        <div className="showcase__overlay" />
      </div>

      <div className="container showcase__layout">
        <header className="showcase__header">
          <span className="eyebrow">Cómo trabajamos</span>
          <h2 className="title">Un proceso claro, de la idea al sistema funcionando</h2>
        </header>

        <ol className="showcase__scenes">
          {showcaseScenes.map((scene) => (
            <li key={scene.id} className="showcase__scene">
              <span className="showcase__step">{scene.step}</span>
              <h3 className="showcase__title">{scene.title}</h3>
              <p className="showcase__description">{scene.description}</p>
              <ul className="showcase__bullets">
                {scene.bullets.map((bullet) => (
                  <li key={bullet}>
                    <Check size={16} strokeWidth={2.25} />
                    {bullet}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
