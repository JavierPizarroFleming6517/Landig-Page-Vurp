export interface Viewport {
  width: number;
  height: number;
}

export interface PlanetFrame {
  horizon: number;
}

export interface OrbitLayout {
  width: number;
  height: number;
  cx: number;
  crownY: number;
  horizon: number;
  textReach: number;
  textFloor: number;
  textPeak: number;
  compact: boolean;
}

export interface LinePose {
  x: number;
  y: number;
  opacity: number;
  scale: number;
}

export interface WelcomePose {
  logoX: number;
  logoY: number;
  logoScale: number;
  logoOpacity: number;
  messages: readonly [LinePose, LinePose, LinePose];
  glow: number;
  burst: number;
  shatter: number;
  flash: number;
  reveal: number;
  revealScale: number;
  hint: number;
}

const TEXT_START = 0.05;
const TEXT_END = 0.5;
const DROP_START = 0.52;
const IMPACT = 0.68;
const REVEAL = 0.78;
const FADE = 0.92;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

export const currentViewport = (): Viewport => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

/** Crown of the planet, as a fraction from the top. The body fills the lower half. */
export function framePlanet(width: number): PlanetFrame {
  return { horizon: width < 900 ? 0.58 : 0.5 };
}

export function getOrbitLayout({ width, height }: Viewport): OrbitLayout {
  const compact = width < 900;
  const horizon = framePlanet(width).horizon;
  const crownY = horizon * height;
  const textHalf = compact ? 124 : 230;
  return {
    width,
    height,
    cx: width / 2,
    crownY,
    horizon,
    textReach: Math.max(36, width / 2 - textHalf - (compact ? 12 : 36)),
    textFloor: crownY - (compact ? 108 : 132),
    textPeak: Math.max(128, height * (compact ? 0.22 : 0.18)),
    compact,
  };
}

export function poseAt(progress: number, layout: OrbitLayout): WelcomePose {
  const p = clamp01(progress);
  const travel = smoothstep(TEXT_START, TEXT_END, p);
  const drop = smoothstep(DROP_START, IMPACT, p);
  const fall = drop * drop;
  const textY = Math.max(layout.compact ? 138 : 168, layout.crownY - (layout.compact ? 124 : 168));
  const slide = layout.width * (layout.compact ? 0.92 : 0.58) + (layout.compact ? 40 : 80);
  const textFade = 1 - smoothstep(TEXT_END - 0.02, TEXT_END + 0.06, p);
  const anchors = [0.06, 0.46, 0.86] as const;
  const messages = anchors.map((anchor) => {
    const shift = (travel - anchor) / 0.4;
    const opacity = (1 - smoothstep(0.28, 0.82, Math.abs(shift))) * textFade;
    return {
      x: layout.cx + shift * slide,
      y: textY,
      opacity,
      scale: 1 - Math.min(Math.abs(shift), 1) * 0.04,
    };
  }) as [LinePose, LinePose, LinePose];

  return {
    logoX: layout.cx,
    logoY: -150 + (layout.crownY + 8 + 150) * fall,
    logoScale: 0.86 + fall * 0.28,
    logoOpacity: smoothstep(DROP_START, DROP_START + 0.05, p) * (1 - smoothstep(IMPACT - 0.015, IMPACT + 0.03, p)),
    messages,
    glow: smoothstep(DROP_START + 0.04, IMPACT, p) * (1 - smoothstep(IMPACT, IMPACT + 0.08, p)),
    burst: smoothstep(IMPACT - 0.02, IMPACT + 0.04, p) * (1 - smoothstep(IMPACT + 0.08, IMPACT + 0.18, p)),
    shatter: smoothstep(IMPACT - 0.01, IMPACT + 0.12, p),
    flash: smoothstep(IMPACT - 0.012, IMPACT, p) * (1 - smoothstep(IMPACT, IMPACT + 0.055, p)),
    reveal: smoothstep(REVEAL, REVEAL + 0.08, p) * (1 - smoothstep(FADE, 0.99, p)),
    revealScale: 0.9 + 0.1 * smoothstep(REVEAL, REVEAL + 0.1, p),
    hint: 1 - smoothstep(0.02, 0.09, p),
  };
}
