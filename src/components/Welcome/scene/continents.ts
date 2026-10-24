import {
  BufferGeometry,
  CanvasTexture,
  ClampToEdgeWrapping,
  Float32BufferAttribute,
  LinearFilter,
  LinearMipmapLinearFilter,
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

/** Replica cada celda de 0.5° en un bloque, para que el desenfoque tenga subpíxeles donde redondear. */
function expandBinary(cells: Uint8Array, width: number, height: number, scale: number) {
  const outWidth = width * scale;
  const outHeight = height * scale;
  const values = new Float32Array(outWidth * outHeight);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (cells[y * width + x] !== 1) continue;
      for (let dy = 0; dy < scale; dy += 1) {
        const row = (y * scale + dy) * outWidth + x * scale;
        values.fill(1, row, row + scale);
      }
    }
  }
  return { width: outWidth, height: outHeight, values };
}

/**
 * Gaussiana separable. En longitud el mundo se cierra sobre sí mismo; en latitud se repite el polo.
 * Desenfocar la máscara binaria mueve el contorno 0.5; un SDF de poco contraste lo dejaba en el escalón.
 */
function blurCoverage(source: Float32Array, width: number, height: number, sigma: number) {
  const radius = Math.ceil(sigma * 3);
  const kernel = new Float32Array(radius * 2 + 1);
  let weight = 0;
  for (let offset = -radius; offset <= radius; offset += 1) {
    const sample = Math.exp(-(offset * offset) / (2 * sigma * sigma));
    kernel[offset + radius] = sample;
    weight += sample;
  }
  for (let index = 0; index < kernel.length; index += 1) kernel[index] = (kernel[index] ?? 0) / weight;

  const horizontal = new Float32Array(source.length);
  const blurred = new Float32Array(source.length);
  for (let y = 0; y < height; y += 1) {
    const row = y * width;
    for (let x = 0; x < width; x += 1) {
      let acc = 0;
      for (let offset = -radius; offset <= radius; offset += 1) {
        let sampleX = x + offset;
        if (sampleX < 0) sampleX += width;
        else if (sampleX >= width) sampleX -= width;
        acc += (source[row + sampleX] ?? 0) * (kernel[offset + radius] ?? 0);
      }
      horizontal[row + x] = acc;
    }
  }
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let acc = 0;
      for (let offset = -radius; offset <= radius; offset += 1) {
        let sampleY = y + offset;
        if (sampleY < 0) sampleY = 0;
        else if (sampleY >= height) sampleY = height - 1;
        acc += (horizontal[sampleY * width + x] ?? 0) * (kernel[offset + radius] ?? 0);
      }
      blurred[y * width + x] = acc;
    }
  }
  return blurred;
}

/**
 * Cobertura de tierra en 0–1, con 0.5 en la costa. La rejilla de 0.5° es escalonada; el desenfoque
 * deja una curva continua y el shader la recorta al ancho de un píxel de pantalla.
 */
export function landMaskTexture(maxAnisotropy = 8) {
  const { width, height, cells } = landGrid();
  const scale = 2;
  const fine = expandBinary(cells, width, height, scale);
  // 1.8 celdas de origen: aplana el escalón de la rejilla y conserva los istmos estrechos.
  const coverage = blurCoverage(fine.values, fine.width, fine.height, 1.8 * scale);

  const canvas = document.createElement("canvas");
  canvas.width = fine.width;
  canvas.height = fine.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No se pudo preparar la máscara de tierra");
  const image = context.createImageData(fine.width, fine.height);
  for (let index = 0; index < coverage.length; index += 1) {
    const byte = Math.round(Math.min(1, Math.max(0, coverage[index] ?? 0)) * 255);
    const offset = index * 4;
    image.data[offset] = byte;
    image.data[offset + 1] = byte;
    image.data[offset + 2] = byte;
    image.data[offset + 3] = 255;
  }
  context.putImageData(image, 0, 0);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = LinearSRGBColorSpace;
  texture.flipY = false;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = Math.max(1, maxAnisotropy);
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
