import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { intro } from "../data/content";
import { SYMBOL_OFFSET, SYMBOL_PATHS, SYMBOL_SIZE } from "./ui/vurpSymbol";
import "./Intro.css";

interface IntroProps {
  onFinish?: () => void;
}

const ease = [0.22, 1, 0.36, 1] as const;
const DURATION_MS = 3000;
const REDUCED_DURATION_MS = 1200;

const piece = (x: number, y: number, delay: number) => ({
  initial: { opacity: 0, x, y },
  animate: { opacity: 1, x: 0, y: 0 },
  transition: { duration: 0.8, delay, ease },
});

export function Intro({ onFinish }: IntroProps) {
  const [visible, setVisible] = useState(true);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), reducedMotion ? REDUCED_DURATION_MS : DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  useEffect(() => {
    if (visible) {
      document.documentElement.classList.add("is-intro");
      return;
    }
    document.documentElement.classList.remove("is-intro");
    onFinish?.();
  }, [visible, onFinish]);

  useEffect(() => () => document.documentElement.classList.remove("is-intro"), []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="intro"
          role="status"
          aria-label={`Vurp, ${intro.tagline}`}
          onClick={() => setVisible(false)}
          exit={{ opacity: 0, transition: { duration: 0.7, ease } }}
        >
          <motion.div className="intro__inner" exit={{ scale: 1.08, filter: "blur(6px)", transition: { duration: 0.7, ease } }}>
            <div className="intro__logo" aria-hidden="true">
              <svg className="intro__symbol" viewBox={`0 0 ${SYMBOL_SIZE.width} ${SYMBOL_SIZE.height}`}>
                <g transform={`translate(${SYMBOL_OFFSET.x} ${SYMBOL_OFFSET.y})`}>
                  <motion.path
                    d={SYMBOL_PATHS.left}
                    fill="var(--vurp-berenjena-claro)"
                    stroke="var(--vurp-berenjena-claro)"
                    strokeWidth={1.4}
                    strokeLinejoin="round"
                    {...piece(-28, -28, 0.2)}
                  />
                  <motion.path d={SYMBOL_PATHS.middle} fill="var(--vurp-orquidea-claro)" {...piece(0, 34, 0.38)} />
                  <motion.path d={SYMBOL_PATHS.top} fill="var(--vurp-lila-claro)" {...piece(28, -28, 0.56)} />
                </g>
              </svg>
              <motion.img
                className="intro__wordmark"
                src="/brand/wordmark-oscuro.svg"
                alt=""
                initial={{ clipPath: "inset(0 100% 0 0)", x: -16 }}
                animate={{ clipPath: "inset(0 0% 0 0)", x: 0 }}
                transition={{ duration: 0.9, delay: 0.95, ease }}
              />
            </div>

            <motion.span
              className="eyebrow intro__tagline"
              initial={{ opacity: 0, letterSpacing: "0.5em" }}
              animate={{ opacity: 1, letterSpacing: "0.24em" }}
              transition={{ duration: 1, delay: 1.5, ease }}
            >
              {intro.tagline}
            </motion.span>
          </motion.div>

          <motion.span
            className="intro__progress"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: (reducedMotion ? REDUCED_DURATION_MS : DURATION_MS) / 1000, ease: "easeInOut" }}
            aria-hidden="true"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
