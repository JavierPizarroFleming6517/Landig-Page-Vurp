/**
 * Shaders GLSL de la escena. Todos comparten `uOpacity` (entrada y salida del planeta) y `uGlow`
 * (brillo previo al impacto); los colores llegan en sRGB, igual que en el CSS.
 */

/** Cuerpo opaco del planeta: oscuro al centro, borde con un fresnel en berenjena. Tapa lo que pasa por detrás. */
export const occluder = {
  vertex: /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vView;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vView = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragment: /* glsl */ `
    uniform vec3 uCore;
    uniform vec3 uRim;
    uniform vec3 uLight;
    uniform float uOpacity;
    uniform float uGlow;
    varying vec3 vNormal;
    varying vec3 vView;
    void main() {
      float facing = clamp(dot(vNormal, vView), 0.0, 1.0);
      float rim = pow(1.0 - facing, 2.5);
      float light = clamp(dot(vNormal, normalize(vec3(-0.45, 0.55, 0.7))), 0.0, 1.0);
      vec3 color = uCore + uLight * light * 0.1 + uRim * rim * (0.55 + uGlow * 0.8);
      gl_FragColor = vec4(color, uOpacity);
    }
  `,
};

/** Líneas sobre la superficie o alrededor del planeta (arcos y líneas orbitales), más intensas hacia el limbo. */
const surfaceLineVertex = /* glsl */ `
  attribute float aT;
  attribute float aSeed;
  varying float vFacing;
  varying float vT;
  varying float vSeed;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normalize(position));
    vFacing = clamp(dot(n, normalize(-mv.xyz)), 0.0, 1.0);
    vT = aT;
    vSeed = aSeed;
    gl_Position = projectionMatrix * mv;
  }
`;

const lineAlpha = /* glsl */ `
  float lineAlpha(float base) {
    float limb = 1.0 - vFacing;
    float hiDpi = mix(1.0, 1.6, clamp(uPixelRatio - 1.0, 0.0, 1.0));
    return base * (0.55 + 0.9 * limb) * (1.0 + uGlow * 1.2) * hiDpi;
  }
`;

/** Arcos entre ciudades y líneas orbitales, con un pulso de luz que viaja por algunos de ellos. */
export const arcs = {
  vertex: surfaceLineVertex,
  fragment: /* glsl */ `
    uniform vec3 uColor;
    uniform vec3 uPulse;
    uniform float uAlpha;
    uniform float uOpacity;
    uniform float uGlow;
    uniform float uPixelRatio;
    uniform float uTime;
    uniform float uSpeed;
    uniform float uShare;
    uniform float uPulseGain;
    varying float vFacing;
    varying float vT;
    varying float vSeed;
    ${lineAlpha}
    void main() {
      float head = fract(uTime * uSpeed * (0.7 + vSeed * 0.6) + vSeed);
      float d = vT - head;
      float trail = smoothstep(-0.22, 0.0, d) * step(d, 0.0);
      float pulse = trail * step(1.0 - uShare, fract(vSeed * 7.31));
      vec3 color = mix(uColor, uPulse, pulse);
      gl_FragColor = vec4(color, (lineAlpha(uAlpha) + pulse * uPulseGain) * uOpacity);
    }
  `,
};

/**
 * Continentes: un punto por muestra de tierra, en orquídea/lila claro y algunos núcleos Marfil, apagándose hacia el limbo.
 * `aDir` y `aDelay` quedan declarados para la fragmentación de la Fase 4.
 */
export const continents = {
  vertex: /* glsl */ `
    attribute float aSeed;
    attribute vec3 aDir;
    attribute float aDelay;
    uniform float uSize;
    uniform float uPixelRatio;
    uniform float uDistance;
    uniform float uTime;
    uniform float uIvoryShare;
    varying float vFacing;
    varying float vIvory;
    varying float vTone;
    varying float vTwinkle;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vec3 n = normalize(normalMatrix * normalize(position));
      vFacing = clamp(dot(n, normalize(-mv.xyz)), 0.0, 1.0);
      vIvory = step(1.0 - uIvoryShare, aSeed);
      vTone = fract(aSeed * 13.7);
      vTwinkle = 0.82 + 0.18 * sin(uTime * 1.1 + aSeed * 40.0);
      gl_PointSize = uSize * (1.0 + vIvory * 0.5) * uPixelRatio * (uDistance / -mv.z);
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragment: /* glsl */ `
    uniform vec3 uFrom;
    uniform vec3 uTo;
    uniform vec3 uIvory;
    uniform float uOpacity;
    uniform float uGlow;
    varying float vFacing;
    varying float vIvory;
    varying float vTone;
    varying float vTwinkle;
    void main() {
      float r = length(gl_PointCoord - 0.5) * 2.0;
      if (r > 1.0) discard;
      float soft = smoothstep(1.0, 0.15, r);
      vec3 color = mix(mix(uFrom, uTo, vTone), uIvory, vIvory);
      float limb = smoothstep(0.0, 0.45, vFacing);
      float alpha = soft * (0.3 + 0.7 * limb) * vTwinkle * (0.8 + 0.2 * vIvory) * (1.0 + uGlow * 0.7);
      gl_FragColor = vec4(color, alpha * uOpacity);
    }
  `,
};

/** Nodos: punto redondo con núcleo Marfil y halo lila, con un parpadeo sutil. */
export const nodes = {
  vertex: /* glsl */ `
    attribute float aSeed;
    uniform float uSize;
    uniform float uPixelRatio;
    uniform float uDistance;
    uniform float uTime;
    varying float vTwinkle;
    varying float vFacing;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vec3 n = normalize(normalMatrix * normalize(position));
      vFacing = clamp(dot(n, normalize(-mv.xyz)), 0.0, 1.0);
      vTwinkle = 0.72 + 0.28 * sin(uTime * 1.4 + aSeed * 6.2831);
      gl_PointSize = uSize * uPixelRatio * (uDistance / -mv.z);
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragment: /* glsl */ `
    uniform vec3 uCore;
    uniform vec3 uHalo;
    uniform float uOpacity;
    uniform float uGlow;
    varying float vTwinkle;
    varying float vFacing;
    void main() {
      float r = length(gl_PointCoord - 0.5) * 2.0;
      if (r > 1.0) discard;
      float core = smoothstep(0.38, 0.0, r);
      float halo = smoothstep(1.0, 0.0, r) * 0.4;
      vec3 color = mix(uHalo, uCore, core);
      float alpha = (core + halo) * vTwinkle * (0.55 + 0.45 * vFacing) * (1.0 + uGlow * 0.8);
      gl_FragColor = vec4(color, alpha * uOpacity);
    }
  `,
};

/** Halo exterior: esfera mayor vista por dentro, que se apaga suavemente hacia su silueta. */
export const atmosphere = {
  vertex: occluder.vertex,
  fragment: /* glsl */ `
    uniform vec3 uColor;
    uniform float uAlpha;
    uniform float uOpacity;
    uniform float uGlow;
    varying vec3 vNormal;
    varying vec3 vView;
    void main() {
      float depth = clamp(-dot(vNormal, vView), 0.0, 1.0);
      float glow = pow(smoothstep(0.0, 0.6, depth), 2.0);
      gl_FragColor = vec4(uColor, glow * uAlpha * (1.0 + uGlow * 1.6) * uOpacity);
    }
  `,
};
