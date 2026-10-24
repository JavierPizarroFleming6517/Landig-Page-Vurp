/**
 * Shaders GLSL de la escena. Todos comparten `uOpacity` (entrada del planeta), `uGlow` (brillo previo al impacto)
 * y `uShatter` (avance lineal de la explosión, 0–1); los colores llegan en sRGB, igual que en el CSS.
 * Todo es función de esos uniforms: al volver a subir el scroll la escena se recompone exactamente.
 */

/**
 * Atenuación bajo el logo: cuando el símbolo cruza por delante del disco, lo que queda detrás baja a `uFocusDim`
 * para que el lila del logo no se pierda (manual de marca · 02). Se calcula en px CSS, igual que el DOM.
 */
const focusChunk = /* glsl */ `
  uniform vec2 uViewport;
  uniform vec2 uFocus;
  uniform float uFocusRadius;
  uniform float uFocusAmount;
  uniform float uFocusDim;
  float focusDim(vec4 clip) {
    vec2 ndc = clip.xy / clip.w;
    vec2 css = vec2((ndc.x * 0.5 + 0.5) * uViewport.x, (0.5 - ndc.y * 0.5) * uViewport.y);
    float inside = 1.0 - smoothstep(uFocusRadius * 0.7, uFocusRadius * 1.25, distance(css, uFocus));
    return mix(1.0, uFocusDim, inside * uFocusAmount);
  }
`;

const sphereVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec4 mv = viewMatrix * world;
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

/**
 * Cuerpo opaco del planeta: oscuro al centro, borde con un fresnel en berenjena. Tapa lo que pasa por detrás.
 * En el impacto se rompe en celdas desde el punto de contacto, con un borde de energía en el frente de ruptura.
 */
export const occluder = {
  vertex: sphereVertex,
  fragment: /* glsl */ `
    uniform vec3 uCore;
    uniform vec3 uRim;
    uniform vec3 uLight;
    uniform vec3 uHot;
    uniform vec3 uImpact;
    uniform float uOpacity;
    uniform float uGlow;
    uniform float uShatter;
    uniform float uShardDensity;
    varying vec3 vNormal;
    varying vec3 vView;
    varying vec3 vWorld;
    float shard(vec3 p) {
      return fract(sin(dot(floor(p * uShardDensity), vec3(12.9898, 78.233, 37.719))) * 43758.5453);
    }
    void main() {
      float front = distance(vWorld, uImpact) - uShatter * 5.0 + shard(vWorld) * 0.45;
      if (uShatter > 0.0 && front < 0.0) discard;
      float facing = clamp(dot(vNormal, vView), 0.0, 1.0);
      float rim = pow(1.0 - facing, 2.5);
      float light = clamp(dot(vNormal, normalize(vec3(-0.45, 0.55, 0.7))), 0.0, 1.0);
      vec3 color = uCore + uLight * light * 0.1 + uRim * rim * (0.55 + uGlow * 0.8);
      float edge = uShatter > 0.0 ? smoothstep(0.14, 0.0, front) : 0.0;
      color = mix(color, uHot, edge * 0.55);
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
  varying float vFocus;
  ${focusChunk}
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normalize(position));
    vFacing = clamp(dot(n, normalize(-mv.xyz)), 0.0, 1.0);
    vT = aT;
    vSeed = aSeed;
    gl_Position = projectionMatrix * mv;
    vFocus = focusDim(gl_Position);
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
    uniform float uShatter;
    uniform float uPixelRatio;
    uniform float uTime;
    uniform float uSpeed;
    uniform float uShare;
    uniform float uPulseGain;
    varying float vFacing;
    varying float vT;
    varying float vSeed;
    varying float vFocus;
    void main() {
      float limb = 1.0 - vFacing;
      float hiDpi = mix(1.0, 1.6, clamp(uPixelRatio - 1.0, 0.0, 1.0));
      float base = uAlpha * (0.55 + 0.9 * limb) * (1.0 + uGlow * 1.2) * hiDpi;
      float head = fract(uTime * uSpeed * (0.7 + vSeed * 0.6) + vSeed);
      float d = vT - head;
      float trail = smoothstep(-0.22, 0.0, d) * step(d, 0.0);
      float pulse = trail * step(1.0 - uShare, fract(vSeed * 7.31));
      vec3 color = mix(uColor, uPulse, pulse);
      float alive = 1.0 - smoothstep(0.0, 0.35, uShatter);
      gl_FragColor = vec4(color, (base + pulse * uPulseGain) * alive * vFocus * uOpacity);
    }
  `,
};

/**
 * Continentes: un punto por muestra de tierra, en orquídea/lila claro y algunos núcleos Marfil, apagándose hacia
 * el limbo. En la explosión cada punto sale despedido según `aDir` (más un empuje desde el impacto), con su propio
 * retardo `aDelay`: se enciende al partir y se apaga al alejarse.
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
    uniform float uShatter;
    uniform float uSpread;
    uniform vec3 uImpact;
    varying float vFacing;
    varying float vIvory;
    varying float vTone;
    varying float vTwinkle;
    varying float vHeat;
    varying float vFade;
    varying float vFocus;
    ${focusChunk}
    void main() {
      vec4 world = modelMatrix * vec4(position, 1.0);
      vec3 normalWorld = normalize(mat3(modelMatrix) * position);
      float local = clamp((uShatter - distance(world.xyz, uImpact) * 0.175 - aDelay * 0.12) / 0.5, 0.0, 1.0);
      float eased = 1.0 - pow(1.0 - local, 3.0);
      vec3 away = normalize(world.xyz - uImpact + normalWorld * 0.01);
      vec3 direction = normalize(mat3(modelMatrix) * aDir + away * 0.9);
      world.xyz += direction * eased * (0.35 + aDelay * 1.3) * uSpread;

      vec4 mv = viewMatrix * world;
      vec3 n = normalize(mat3(viewMatrix) * normalWorld);
      float facing = clamp(dot(n, normalize(-mv.xyz)), 0.0, 1.0);
      vFacing = mix(facing, 1.0, step(0.001, local));
      vIvory = step(1.0 - uIvoryShare, aSeed);
      vTone = fract(aSeed * 13.7);
      vTwinkle = 0.82 + 0.18 * sin(uTime * 1.1 + aSeed * 40.0);
      vHeat = sin(local * 3.14159);
      vFade = 1.0 - smoothstep(0.35, 0.95, local);
      gl_PointSize = uSize * (1.0 + vIvory * 0.5 + vHeat * 0.9) * uPixelRatio * (uDistance / -mv.z);
      gl_Position = projectionMatrix * mv;
      vFocus = focusDim(gl_Position);
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
    varying float vHeat;
    varying float vFade;
    varying float vFocus;
    void main() {
      float r = length(gl_PointCoord - 0.5) * 2.0;
      if (r > 1.0) discard;
      float soft = smoothstep(1.0, 0.15, r);
      vec3 color = mix(mix(mix(uFrom, uTo, vTone), uIvory, vIvory), uIvory, vHeat * 0.6);
      float limb = smoothstep(0.0, 0.45, vFacing);
      float alpha = soft * (0.3 + 0.7 * limb) * vTwinkle * (0.8 + 0.2 * vIvory) * (1.0 + uGlow * 0.7 + vHeat * 0.8);
      gl_FragColor = vec4(color, alpha * vFade * vFocus * uOpacity);
    }
  `,
};

/** Nodos de ciudad: punto redondo con núcleo Marfil y halo lila, con un parpadeo sutil. Se apagan en el impacto. */
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
    uniform float uShatter;
    varying float vTwinkle;
    varying float vFacing;
    void main() {
      float r = length(gl_PointCoord - 0.5) * 2.0;
      if (r > 1.0) discard;
      float core = smoothstep(0.38, 0.0, r);
      float halo = smoothstep(1.0, 0.0, r) * 0.4;
      vec3 color = mix(uHalo, uCore, core);
      float alpha = (core + halo) * vTwinkle * (0.55 + 0.45 * vFacing) * (1.0 + uGlow * 0.8);
      gl_FragColor = vec4(color, alpha * (1.0 - smoothstep(0.0, 0.3, uShatter)) * uOpacity);
    }
  `,
};

/** Halo exterior: esfera mayor vista por dentro, que se apaga suavemente hacia su silueta y se disipa en el impacto. */
export const atmosphere = {
  vertex: sphereVertex,
  fragment: /* glsl */ `
    uniform vec3 uColor;
    uniform float uAlpha;
    uniform float uOpacity;
    uniform float uGlow;
    uniform float uShatter;
    varying vec3 vNormal;
    varying vec3 vView;
    varying vec3 vWorld;
    void main() {
      float depth = clamp(-dot(vNormal, vView), 0.0, 1.0);
      float glow = pow(smoothstep(0.0, 0.6, depth), 2.0);
      float alive = 1.0 - smoothstep(0.05, 0.5, uShatter);
      gl_FragColor = vec4(uColor, glow * uAlpha * (1.0 + uGlow * 1.6) * alive * uOpacity);
    }
  `,
};

/** Plano en el punto de impacto: `uv` centrado en [-1, 1]. Sirve para las ondas y el núcleo de luz. */
const burstVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Onda de energía: un anillo fino que crece y se apaga. */
export const wave = {
  vertex: burstVertex,
  fragment: /* glsl */ `
    uniform vec3 uColor;
    uniform float uAlpha;
    uniform float uWidth;
    uniform float uProgress;
    varying vec2 vUv;
    void main() {
      float r = length(vUv);
      float ring = smoothstep(uWidth, 0.0, abs(r - 0.92));
      float alpha = ring * uAlpha * pow(1.0 - uProgress, 1.6) * step(0.001, uProgress);
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
};

/** Núcleo de luz del impacto: degradado radial de Marfil a lila claro, breve. */
export const core = {
  vertex: burstVertex,
  fragment: /* glsl */ `
    uniform vec3 uInner;
    uniform vec3 uOuter;
    uniform float uAlpha;
    uniform float uProgress;
    varying vec2 vUv;
    void main() {
      float r = length(vUv);
      float glow = pow(clamp(1.0 - r, 0.0, 1.0), 2.2);
      vec3 color = mix(uOuter, uInner, glow);
      float life = sin(clamp(uProgress, 0.0, 1.0) * 3.14159);
      gl_FragColor = vec4(color, glow * uAlpha * life);
    }
  `,
};
