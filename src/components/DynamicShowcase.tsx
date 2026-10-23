import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Check } from "lucide-react";
import { useRef, useState } from "react";
import { showcaseScenes } from "../data/content";
import type { ShowcaseScene } from "../types";
import "./DynamicShowcase.css";

interface SceneLayerProps {
  scene: ShowcaseScene;
  index: number;
  total: number;
  progress: MotionValue<number>;
}

interface SceneWindow {
  start: number;
  end: number;
  fade: number;
  isFirst: boolean;
  isLast: boolean;
}

const sceneWindow = (index: number, total: number): SceneWindow => {
  const segment = 1 / total;
  const start = index * segment;
  return {
    start,
    end: start + segment,
    fade: segment * 0.25,
    isFirst: index === 0,
    isLast: index === total - 1,
  };
};

function SceneImage({ scene, index, total, progress }: SceneLayerProps) {
  const { start, end, fade, isFirst, isLast } = sceneWindow(index, total);

  const opacityInput = isFirst
    ? [end - fade, end + fade]
    : isLast
      ? [start - fade, start + fade]
      : [start - fade, start + fade, end - fade, end + fade];
  const opacityOutput = isFirst ? [1, 0] : isLast ? [0, 1] : [0, 1, 1, 0];

  const opacity = useTransform(progress, opacityInput, opacityOutput);
  const scale = useTransform(progress, [start - fade, end + fade], [1.18, 1]);
  const y = useTransform(progress, [start - fade, end + fade], ["-4%", "4%"]);

  return (
    <motion.div className="showcase__image" style={{ opacity, scale, y }} data-parallax>
      <img src={scene.image.src} alt={scene.image.alt} loading="lazy" />
    </motion.div>
  );
}

function SceneText({ scene, index, total, progress }: SceneLayerProps) {
  const { start, end, fade, isFirst, isLast } = sceneWindow(index, total);

  const input = [start, start + fade, end - fade, end];
  const opacity = useTransform(progress, input, [isFirst ? 1 : 0, 1, 1, isLast ? 1 : 0]);
  const y = useTransform(progress, input, [isFirst ? 0 : 80, 0, 0, isLast ? 0 : -80]);
  const blur = useTransform(progress, input, [isFirst ? 0 : 10, 0, 0, isLast ? 0 : 10]);
  const filter = useTransform(blur, (value) => `blur(${value}px)`);

  return (
    <motion.article className="showcase__scene" style={{ opacity, y, filter }}>
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
    </motion.article>
  );
}

export function DynamicShowcase() {
  const ref = useRef<HTMLElement>(null);
  const total = showcaseScenes.length;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setActive(Math.min(total - 1, Math.floor(latest * total)));
  });

  const jumpTo = (index: number) => {
    const section = ref.current;
    if (!section) return;
    const scrollable = section.offsetHeight - window.innerHeight;
    const target = section.offsetTop + scrollable * ((index + 0.5) / total);
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <section
      id="proceso"
      ref={ref}
      className="showcase media-surface"
      style={{ height: `${total * 100 + 50}vh` }}
      aria-label="Cómo trabajamos"
    >
      <div className="showcase__sticky">
        <div className="showcase__media">
          {showcaseScenes.map((scene, index) => (
            <SceneImage key={scene.id} scene={scene} index={index} total={total} progress={scrollYProgress} />
          ))}
          <div className="media-tint" />
          <div className="showcase__overlay" />
        </div>

        <div className="container showcase__layout">
          <header className="showcase__header">
            <span className="eyebrow">Cómo trabajamos</span>
            <h2 className="title">Un proceso claro, de la idea al sistema funcionando</h2>
          </header>

          <div className="showcase__scenes">
            {showcaseScenes.map((scene, index) => (
              <SceneText key={scene.id} scene={scene} index={index} total={total} progress={scrollYProgress} />
            ))}
          </div>

          <nav className="showcase__progress" aria-label="Etapas del proceso">
            <div className="showcase__track">
              <motion.div className="showcase__fill" style={{ scaleY: scrollYProgress }} />
            </div>
            <ol>
              {showcaseScenes.map((scene, index) => (
                <li key={scene.id}>
                  <button
                    type="button"
                    className={`showcase__dot ${index === active ? "is-active" : ""} ${index < active ? "is-done" : ""}`}
                    onClick={() => jumpTo(index)}
                    aria-current={index === active ? "step" : undefined}
                  >
                    <span className="showcase__dot-label">{scene.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </section>
  );
}
