import { AdditiveBlending, Color, Group, Mesh, PlaneGeometry, ShaderMaterial, Vector3, type IUniform } from "three";
import { COLORS, EXPLOSION } from "../config";
import type { Vec3 } from "../orbits";
import * as shaders from "./shaders";

export interface Explosion {
  group: Group;
  /** `burst` es el avance (0–1) del tramo de ondas; `impact`, el punto de contacto en el mundo. */
  update: (burst: number, impact: Vec3) => void;
  dispose: () => void;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 2);
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Ondas y núcleo de luz del impacto. La dispersión de partículas no vive aquí: la hacen los propios puntos de
 * los continentes (ver shaders.continents), así no hace falta un segundo sistema de partículas.
 */
export function createExplosion(): Explosion {
  const group = new Group();
  const plane = new PlaneGeometry(2, 2);
  const materials: ShaderMaterial[] = [];

  const burstMaterial = (shader: { vertex: string; fragment: string }, uniforms: Record<string, IUniform>) => {
    const material = new ShaderMaterial({
      uniforms: { uProgress: { value: 0 }, ...uniforms },
      vertexShader: shader.vertex,
      fragmentShader: shader.fragment,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending,
    });
    materials.push(material);
    return material;
  };

  // Ondas de frente a la cámara (la cámara no rota, así que el plano ya mira hacia ella).
  const waves = EXPLOSION.waves.map((config, index) => {
    const mesh = new Mesh(
      plane,
      burstMaterial(shaders.wave, {
        uColor: { value: new Color(index === 0 ? COLORS.lilaClaro : COLORS.orquideaClaro) },
        uAlpha: { value: config.alpha },
        uWidth: { value: config.width },
      }),
    );
    mesh.renderOrder = 10;
    group.add(mesh);
    return { mesh, config };
  });

  // Onda sobre la superficie: un anillo en el plano tangente al punto de impacto.
  const surface = new Mesh(
    plane,
    burstMaterial(shaders.wave, {
      uColor: { value: new Color(COLORS.lilaClaro) },
      uAlpha: { value: EXPLOSION.surfaceWave.alpha },
      uWidth: { value: 0.05 },
    }),
  );
  surface.renderOrder = 10;
  group.add(surface);

  const core = new Mesh(
    plane,
    burstMaterial(shaders.core, {
      uInner: { value: new Color(COLORS.marfil) },
      uOuter: { value: new Color(COLORS.lilaClaro) },
      uAlpha: { value: EXPLOSION.core.alpha },
    }),
  );
  core.renderOrder = 11;
  group.add(core);

  const point = new Vector3();
  const outward = new Vector3();

  const progressOf = (mesh: Mesh) => (mesh.material as ShaderMaterial).uniforms.uProgress as IUniform<number>;

  return {
    group,
    update: (burst, impact) => {
      group.visible = burst > 0 && burst < 1;
      if (!group.visible) return;
      point.set(impact.x, impact.y, impact.z);

      for (const { mesh, config } of waves) {
        const progress = clamp01((burst - config.delay) / (1 - config.delay));
        progressOf(mesh).value = progress;
        mesh.position.copy(point);
        mesh.scale.setScalar(Math.max(0.001, config.radius * (0.06 + easeOut(progress))));
      }

      progressOf(surface).value = burst;
      surface.position.copy(point);
      surface.lookAt(outward.copy(point).multiplyScalar(2));
      surface.scale.setScalar(Math.max(0.001, EXPLOSION.surfaceWave.radius * (0.05 + easeOut(burst))));

      const coreProgress = clamp01(burst * 2.2);
      progressOf(core).value = coreProgress;
      core.position.copy(point);
      core.scale.setScalar(EXPLOSION.core.radius * (0.4 + coreProgress * 0.8));
    },
    dispose: () => {
      plane.dispose();
      materials.forEach((material) => material.dispose());
    },
  };
}
