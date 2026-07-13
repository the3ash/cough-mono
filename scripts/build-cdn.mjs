import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const fontFiles = [
  "CoughMono-Regular.otf",
  "CoughMono-Regular.ttf",
  "CoughMono-Regular.woff2",
];

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, "fonts"), { recursive: true });

await Promise.all([
  cp(resolve(root, "cough-mono.css"), resolve(dist, "cough-mono.css")),
  cp(resolve(root, "OFL.txt"), resolve(dist, "OFL.txt")),
  cp(resolve(root, "cdn/_headers"), resolve(dist, "_headers")),
  ...fontFiles.map((fontFile) =>
    cp(resolve(root, "fonts", fontFile), resolve(dist, "fonts", fontFile)),
  ),
]);

const fontBuffer = await readFile(
  resolve(root, "fonts/CoughMono-Regular.ttf"),
);
const fontArrayBuffer = fontBuffer.buffer.slice(
  fontBuffer.byteOffset,
  fontBuffer.byteOffset + fontBuffer.byteLength,
);
const font = opentype.parse(fontArrayBuffer);
const codePoints = [
  ...new Set(Object.keys(font.tables.cmap.glyphIndexMap).map(Number)),
].sort((a, b) => a - b);
const characters = codePoints.map((codePoint) =>
  String.fromCodePoint(codePoint),
);

await writeFile(
  resolve(dist, "glyphs.json"),
  `${JSON.stringify({ count: characters.length, characters }, null, 2)}\n`,
);

const css = await readFile(resolve(dist, "cough-mono.css"), "utf8");
const assetPaths = [...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(
  ([, assetPath]) => assetPath,
);

if (assetPaths.length === 0) {
  throw new Error("cough-mono.css does not reference any font assets");
}

for (const assetPath of assetPaths) {
  if (!assetPath.startsWith("./")) {
    throw new Error(`Expected a relative font URL, got ${assetPath}`);
  }
  await access(resolve(dist, assetPath));
}

console.log(`Built CDN assets in ${dist}`);
