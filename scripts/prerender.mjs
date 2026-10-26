import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const template = await readFile(resolve(dist, "index.html"), "utf8");
const { renderPage } = await import(pathToFileURL(resolve(root, "dist-ssr", "entry-server.js")));
const paths = ["/", "/servicios/desarrollo-software-medida/", "/servicios/automatizacion-procesos/", "/servicios/ciberseguridad/"];
const siteUrl = "https://vurp.cl";

const escapeHtml = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

for (const path of paths) {
  const { html, meta, structuredData } = renderPage(path);
  const canonical = new URL(meta.path, siteUrl).href;
  const head = [
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="es_CL" />`,
    `<meta property="og:site_name" content="Vurp" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${siteUrl}/brand/logo-completo.png" />`,
    `<meta property="og:image:width" content="1600" />`,
    `<meta property="og:image:height" content="502" />`,
    `<meta property="og:image:alt" content="Vurp, software y ciberseguridad" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${siteUrl}/brand/logo-completo.png" />`,
    `<script type="application/ld+json">${JSON.stringify(structuredData).replaceAll("<", "\\u003c")}</script>`,
  ].join("\n    ");
  const output = template
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(meta.title)}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/s, `<meta name="description" content="${escapeHtml(meta.description)}" />`)
    .replace("<!--seo-head-->", head)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  const target = path === "/" ? resolve(dist, "index.html") : resolve(dist, path.slice(1), "index.html");
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, output);
}

await rm(resolve(root, "dist-ssr"), { recursive: true, force: true });
