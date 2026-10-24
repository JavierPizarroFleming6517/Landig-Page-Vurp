import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  LineSegments,
  Mesh,
  Points,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  type IUniform,
} from "three";
import { CAMERA, COLORS, NETWORK, PLANET } from "../config";
import { continentGeometry, hash, latLonToVector } from "./continents";
import * as shaders from "./shaders";

/** Uniforms compartidos por todos los materiales del planeta (se pasan por referencia). */
export interface SharedUniforms {
  [uniform: string]: IUniform;
  uTime: IUniform<number>;
  uOpacity: IUniform<number>;
  uGlow: IUniform<number>;
  uPixelRatio: IUniform<number>;
}

export interface Planet {
  /** Contenedor del planeta, la atmósfera y las líneas orbitales. `spin` gira dentro de la orientación inicial. */
  root: Group;
  spin: Group;
  /** Giro de `spin` que deja `PLANET.facing` de frente. */
  baseSpin: number;
  dispose: () => void;
}

export type Tier = "wide" | "compact";

const DEG = Math.PI / 180;
const color = (hex: string) => new Color(hex);

const lineMaterial = (shared: SharedUniforms, extra: Record<string, IUniform>) =>
  new ShaderMaterial({
    uniforms: { ...shared, ...extra },
    vertexShader: shaders.arcs.vertex,
    fragmentShader: shaders.arcs.fragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });

/** Pares de vértices para LineSegments a partir de polilíneas, con su avance (aT) y semilla (aSeed). */
function segments(polylines: { points: Vector3[]; seed: number }[]) {
  const positions: number[] = [];
  const along: number[] = [];
  const seeds: number[] = [];
  for (const { points, seed } of polylines) {
    const last = points.length - 1;
    for (let index = 0; index < last; index += 1) {
      const a = points[index];
      const b = points[index + 1];
      if (!a || !b) continue;
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      along.push(index / last, (index + 1) / last);
      seeds.push(seed, seed);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aT", new Float32BufferAttribute(along, 1));
  geometry.setAttribute("aSeed", new Float32BufferAttribute(seeds, 1));
  return geometry;
}

/** Arcos de gran círculo entre ciudades reales; se elevan más cuanto más largos son. */
function cityArcs() {
  const cities = NETWORK.cities;
  const polylines = NETWORK.links.map(([from, to], index) => {
    const [latA, lonA] = cities[from];
    const [latB, lonB] = cities[to];
    const a = latLonToVector(latA, lonA);
    const b = latLonToVector(latB, lonB);
    const angle = a.angleTo(b);
    const steps = Math.max(12, Math.round(angle * 40));
    const points: Vector3[] = [];
    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps;
      const wa = Math.sin((1 - t) * angle) / Math.sin(angle);
      const wb = Math.sin(t * angle) / Math.sin(angle);
      const lift = 1.006 + PLANET.arcs.lift * Math.sin(Math.PI * t) * (angle / Math.PI);
      points.push(a.clone().multiplyScalar(wa).add(b.clone().multiplyScalar(wb)).normalize().multiplyScalar(lift));
    }
    return { points, seed: hash(index + 17) };
  });
  return segments(polylines);
}

function orbitLines() {
  return PLANET.orbitLines.lines.map(({ radius, tiltX, tiltZ }, index) => {
    const points: Vector3[] = [];
    for (let step = 0; step <= 160; step += 1) {
      const angle = (step / 160) * Math.PI * 2;
      points.push(new Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    const geometry = segments([{ points, seed: hash(index + 41) }]);
    return { geometry, tiltX, tiltZ };
  });
}

export function createPlanet(shared: SharedUniforms, tier: Tier): Planet {
  const root = new Group();
  // Orientación inicial: el eje gira `roll` en pantalla y se inclina para dejar `facing.lat` al centro.
  const orient = new Group();
  orient.rotation.set(PLANET.facing.lat * DEG, 0, PLANET.facing.roll * DEG);
  const spin = new Group();
  orient.add(spin);
  root.add(orient);

  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(item: T) => {
    disposables.push(item);
    return item;
  };

  const occluder = new Mesh(
    track(new SphereGeometry(PLANET.occluderRadius, 64, 48)),
    track(
      new ShaderMaterial({
        uniforms: {
          ...shared,
          uCore: { value: color(COLORS.planetCore) },
          uRim: { value: color(COLORS.berenjena) },
          uLight: { value: color(COLORS.orquidea) },
        },
        vertexShader: shaders.occluder.vertex,
        fragmentShader: shaders.occluder.fragment,
        transparent: true,
      }),
    ),
  );
  occluder.renderOrder = 0;
  spin.add(occluder);

  const continents = new Points(
    track(continentGeometry(PLANET.continents.points[tier], PLANET.continents.radius)),
    track(
      new ShaderMaterial({
        uniforms: {
          ...shared,
          uFrom: { value: color(COLORS.orquideaClaro) },
          uTo: { value: color(COLORS.lilaClaro) },
          uIvory: { value: color(COLORS.marfil) },
          uIvoryShare: { value: PLANET.continents.ivoryShare },
          uSize: { value: PLANET.continents.size[tier] },
          uDistance: { value: CAMERA.distance },
        },
        vertexShader: shaders.continents.vertex,
        fragmentShader: shaders.continents.fragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    ),
  );
  continents.renderOrder = 1;
  spin.add(continents);

  const arcs = new LineSegments(
    track(cityArcs()),
    track(
      lineMaterial(shared, {
        uColor: { value: color(COLORS.orquideaClaro) },
        uPulse: { value: color(COLORS.marfil) },
        uAlpha: { value: PLANET.arcs.alpha },
        uSpeed: { value: PLANET.arcs.pulseSpeed },
        uShare: { value: PLANET.arcs.pulseShare },
        uPulseGain: { value: 0.85 },
      }),
    ),
  );
  arcs.renderOrder = 2;
  spin.add(arcs);

  const cityValues = Object.values(NETWORK.cities);
  const cityGeometry = track(new BufferGeometry());
  cityGeometry.setAttribute(
    "position",
    new Float32BufferAttribute(cityValues.flatMap(([lat, lon]) => latLonToVector(lat, lon, 1.008).toArray()), 3),
  );
  cityGeometry.setAttribute("aSeed", new Float32BufferAttribute(cityValues.map((_, index) => hash(index + 3)), 1));
  const cityNodes = new Points(
    cityGeometry,
    track(
      new ShaderMaterial({
        uniforms: {
          ...shared,
          uCore: { value: color(COLORS.marfil) },
          uHalo: { value: color(COLORS.lilaClaro) },
          uSize: { value: PLANET.citySize },
          uDistance: { value: CAMERA.distance },
        },
        vertexShader: shaders.nodes.vertex,
        fragmentShader: shaders.nodes.fragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    ),
  );
  cityNodes.renderOrder = 3;
  spin.add(cityNodes);

  const orbitMaterial = track(
    lineMaterial(shared, {
      uColor: { value: color(COLORS.lilaClaro) },
      uPulse: { value: color(COLORS.orquideaClaro) },
      uAlpha: { value: PLANET.orbitLines.alpha },
      uSpeed: { value: 0.05 },
      uShare: { value: 1 },
      uPulseGain: { value: 0.3 },
    }),
  );
  for (const { geometry, tiltX, tiltZ } of orbitLines()) {
    const line = new LineSegments(track(geometry), orbitMaterial);
    line.rotation.set(tiltX, 0, tiltZ);
    line.renderOrder = 4;
    root.add(line);
  }

  const atmosphere = new Mesh(
    track(new SphereGeometry(PLANET.atmosphereRadius, 64, 48)),
    track(
      new ShaderMaterial({
        uniforms: { ...shared, uColor: { value: color(COLORS.orquideaClaro) }, uAlpha: { value: PLANET.atmosphereAlpha } },
        vertexShader: shaders.atmosphere.vertex,
        fragmentShader: shaders.atmosphere.fragment,
        side: BackSide,
        transparent: true,
        depthWrite: false,
      }),
    ),
  );
  atmosphere.renderOrder = 5;
  root.add(atmosphere);

  return {
    root,
    spin,
    baseSpin: -PLANET.facing.lon * DEG,
    dispose: () => disposables.forEach((item) => item.dispose()),
  };
}
