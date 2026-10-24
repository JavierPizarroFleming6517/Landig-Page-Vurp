#!/usr/bin/env node
/**
 * Genera src/components/Welcome/scene/landMask.ts: una máscara de tierra equirectangular codificada
 * por runs (RLE + varint, en base64) a partir de Natural Earth 110m land (dominio público).
 *
 * Uso:
 *   curl -o /tmp/ne_110m_land.geojson \
 *     https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_110m_land.geojson
 *   node scripts/build-land-mask.mjs /tmp/ne_110m_land.geojson [grados por celda, por defecto 0.5]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const [input, stepArg = "0.5"] = process.argv.slice(2);
if (!input) {
  console.error("Falta la ruta del GeoJSON de Natural Earth (ne_110m_land.geojson).");
  process.exit(1);
}

const step = Number(stepArg);
const width = Math.round(360 / step);
const height = Math.round(180 / step);
const geojson = JSON.parse(readFileSync(input, "utf8"));

const rings = geojson.features.flatMap((feature) => {
  const { type, coordinates } = feature.geometry;
  return type === "Polygon" ? coordinates : coordinates.flat();
});

// Relleno por scanline (par-impar) en el centro de cada fila: los anillos de tierra no se superponen.
const bytes = [];
const pushVarint = (value) => {
  let rest = value;
  while (rest >= 0x80) {
    bytes.push((rest & 0x7f) | 0x80);
    rest >>>= 7;
  }
  bytes.push(rest);
};

let landCells = 0;
for (let row = 0; row < height; row += 1) {
  const lat = 90 - (row + 0.5) * step;
  const crossings = [];
  for (const ring of rings) {
    for (let index = 0; index < ring.length - 1; index += 1) {
      const [x1, y1] = ring[index];
      const [x2, y2] = ring[index + 1];
      if (y1 > lat === y2 > lat) continue;
      crossings.push(x1 + ((lat - y1) / (y2 - y1)) * (x2 - x1));
    }
  }
  crossings.sort((a, b) => a - b);

  const cells = new Uint8Array(width);
  for (let index = 0; index + 1 < crossings.length; index += 2) {
    const from = Math.max(0, Math.ceil((crossings[index] + 180) / step - 0.5));
    const to = Math.min(width - 1, Math.floor((crossings[index + 1] + 180) / step - 0.5));
    for (let col = from; col <= to; col += 1) cells[col] = 1;
  }

  // Runs alternados agua/tierra, empezando por agua (puede ser 0).
  let current = 0;
  let run = 0;
  for (let col = 0; col < width; col += 1) {
    landCells += cells[col];
    if (cells[col] === current) run += 1;
    else {
      pushVarint(run);
      current = cells[col];
      run = 1;
    }
  }
  pushVarint(run);
}

const encoded = Buffer.from(bytes).toString("base64");
const output = fileURLToPath(new URL("../src/components/Welcome/scene/landMask.ts", import.meta.url));
writeFileSync(
  output,
  `/**
 * Máscara de tierra equirectangular generada por scripts/build-land-mask.mjs a partir de
 * Natural Earth 110m land (dominio público, v5.1.2). ${width} × ${height} celdas de ${step}°.
 * Cada fila es una secuencia de runs alternados agua/tierra (empezando por agua) en varint, en base64.
 * No editar a mano.
 */
export const LAND_MASK = {
  width: ${width},
  height: ${height},
  data: "${encoded}",
} as const;
`,
);
console.log(`${width}×${height} · ${(landCells / (width * height) * 100).toFixed(1)} % tierra · ${bytes.length} B (${encoded.length} B en base64)`);
