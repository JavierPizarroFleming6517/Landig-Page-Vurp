import {
  BufferGeometry,
  CanvasTexture,
  ClampToEdgeWrapping,
  Float32BufferAttribute,
  LinearFilter,
  LinearSRGBColorSpace,
  RepeatWrapping,
  Uint32BufferAttribute,
  Vector3,
} from "three";
import { hash, landGrid } from "./land";

export { hash };

const DEG = Math.PI / 180;

/** Posición en la esfera unitaria: lon 0 mira hacia la cámara (+z) y el norte queda arriba (+y). */
export function latLonToVector(lat: number, lon: number, radius = 1) {
  const phi = lat * DEG;
  const lambda = lon * DEG;
  return new Vector3(Math.cos(phi) * Math.sin(lambda), Math.sin(phi), Math.cos(phi) * Math.cos(lambda)).multiplyScalar(radius);
}

/**
 * Máscara de tierra suavizada. Se amplía para que la costa, al muestrearse en la esfera, quede continua
 * y no en los escalones de 0.5° de la grilla original.
 */
export function landMaskTexture() {
  const { width, height, cells } = landGrid();
  const source = document.createElement("canvas");
  source.width = width;
  source.height = height;
  const sourceContext = source.getContext("2d");
  if (!sourceContext) throw new Error("No se pudo preparar la máscara de tierra");
  const image = sourceContext.createImageData(width, height);
  for (let index = 0; index < cells.length; index += 1) {
    const value = cells[index] ? 255 : 0;
    const offset = index * 4;
    image.data[offset] = value;
    image.data[offset + 1] = value;
    image.data[offset + 2] = value;
    image.data[offset + 3] = 255;
  }
  sourceContext.putImageData(image, 0, 0);

  const canvas = document.createElement("canvas");
  canvas.width = width * 4;
  canvas.height = height * 4;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No se pudo preparar la máscara de tierra");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  // El desenfoque redondea los escalones de 0.5°; el shader recorta al 50 % y la costa queda nítida.
  context.filter = "blur(12px)";
  context.drawImage(source, 0, 0, canvas.width, canvas.height);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = LinearSRGBColorSpace;
  texture.flipY = false;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Esfera de soporte de los continentes. El relleno lo recorta la máscara en el fragmento, así la costa
 * no depende del tamaño de cada triángulo.
 */
export function continentSphere(radius: number) {
  const width = 200;
  const height = 100;
  const cols = width + 1;
  const rows = height + 1;
  const positions = new Float32Array(cols * rows * 3);

  for (let row = 0; row < rows; row += 1) {
    const lat = (90 - (row * 180) / height) * DEG;
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);
    for (let col = 0; col < cols; col += 1) {
      const lon = (-180 + (col * 360) / width) * DEG;
      const index = (row * cols + col) * 3;
      positions[index] = cosLat * Math.sin(lon) * radius;
      positions[index + 1] = sinLat * radius;
      positions[index + 2] = cosLat * Math.cos(lon) * radius;
    }
  }

  const indices = new Uint32Array(width * height * 6);
  let cursor = 0;
  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const northWest = row * cols + col;
      const northEast = northWest + 1;
      const southWest = northWest + cols;
      const southEast = southWest + 1;
      indices[cursor] = northWest;
      indices[cursor + 1] = southWest;
      indices[cursor + 2] = northEast;
      indices[cursor + 3] = northEast;
      indices[cursor + 4] = southWest;
      indices[cursor + 5] = southEast;
      cursor += 6;
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(new Uint32BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  return geometry;
}
