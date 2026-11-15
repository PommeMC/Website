/**
 * Builds the press kit into public/press/ before each build: the header's wordmark and the apple as SVG and PNG,
 * full-size screenshots, about-pomme.txt, and one zip of all of them.
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { zipSync } from "fflate";
import opentype from "opentype.js";
import sharp from "sharp";
import { PRESS_HREF } from "@/data/nav";
import { BACKGROUNDS, LOGOS, NAME_RULES, PRESS_EMAIL, PRESS_TEXT, PRESS_ZIP, SCREENSHOTS, type Background } from "@/data/press";

const OUT = join("public", PRESS_HREF);
// The wordmark as .site-brand draws it (SiteBrand.astro, brand.css): a 24px apple, a 10px gap, then POMME in
// Josefin Sans 700 at 22px with 0.06em of letter spacing.
const APPLE_PX = 24;
const APPLE_SQUARES = 16;
const GAP_PX = 10;
const FONT_PX = 22;
const TRACKING_EM = 0.06;
const FONT = "node_modules/@fontsource/josefin-sans/files/josefin-sans-latin-700-normal.woff";
// PNG sizes as multiples of the SVGs, whole numbers so the apple's squares stay crisp: the wordmark at 10× the
// header's size, and the apple at 512px.
const LOGO_SCALE = 10;
const APPLE_SCALE = 32;

const brand = await readFile("src/styles/brand.css", "utf8");
function token(name: string) {
  const value = brand.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"))?.[1];
  if (!value) throw new Error(`brand.css has no --${name}`);
  return value;
}
const TEXT_ON: Record<Background, string> = { dark: token("text"), light: token("ink") };

const appleSvg = await readFile("src/assets/brand/pomme-apple.svg", "utf8");
const appleSquares = appleSvg.replace(/^[\s\S]*?<svg[^>]*>|<\/svg>\s*$/g, "");

const fontFile = await readFile(FONT);
const font = opentype.parse(fontFile.buffer.slice(fontFile.byteOffset, fontFile.byteOffset + fontFile.byteLength));
// The fruit fills rows 4 to 16 of the apple; the capitals are centred on it.
const baseline = (10 / APPLE_SQUARES) * APPLE_PX + (font.tables.os2.sCapHeight / font.unitsPerEm) * (FONT_PX / 2);
// Written out here because opentype.js's toPathData() prints some coordinates as NaN.
const pathData = (path: opentype.Path) =>
  path.commands
    .map((c) => {
      const points =
        c.type === "Z" ? [] : c.type === "Q" ? [c.x1, c.y1, c.x, c.y] : c.type === "C" ? [c.x1, c.y1, c.x2, c.y2, c.x, c.y] : [c.x, c.y];
      return c.type + points.map((n) => +n.toFixed(2)).join(" ");
    })
    .join("");
let x = APPLE_PX + GAP_PX;
const letters: string[] = [];
for (const ch of "POMME") {
  const glyph = font.charToGlyph(ch);
  letters.push(pathData(glyph.getPath(x, baseline, FONT_PX)));
  x += font.getAdvanceWidth(ch, FONT_PX) + TRACKING_EM * FONT_PX;
}
const width = Math.ceil(x - TRACKING_EM * FONT_PX);

const wordmark = (bg: Background) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${APPLE_PX}" width="${width}" height="${APPLE_PX}">` +
  `<g transform="scale(${APPLE_PX / APPLE_SQUARES})" shape-rendering="crispEdges">${appleSquares}</g>` +
  `<path fill="${TEXT_ON[bg]}" d="${letters.join("")}"/></svg>\n`;
const png = (svg: string, scale: number) =>
  sharp(Buffer.from(svg), { density: 72 * scale })
    .png()
    .toBuffer();

const [logo, apple] = LOGOS;
const files: Record<string, Uint8Array> = {
  [`${apple.file()}.svg`]: Buffer.from(appleSvg),
  [`${apple.file()}.png`]: await png(appleSvg, APPLE_SCALE),
  "about-pomme.txt": new TextEncoder().encode(
    [
      ...PRESS_TEXT.map((t) => `${t.label}\n${t.text}`),
      `Using the name\n${NAME_RULES.map((r) => `- ${r}`).join("\n")}`,
      `Contact\n${PRESS_EMAIL}\nhttps://pomme.rs`,
    ].join("\n\n") + "\n"
  ),
};
for (const bg of BACKGROUNDS) {
  const svg = wordmark(bg);
  files[`${logo.file(bg)}.svg`] = Buffer.from(svg);
  files[`${logo.file(bg)}.png`] = await png(svg, LOGO_SCALE);
}
for (const s of SCREENSHOTS) files[s.file] = await readFile(s.source);

// Start empty, so a file dropped from the kit doesn't linger.
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await Promise.all(Object.entries(files).map(([name, data]) => writeFile(join(OUT, name), data)));
// Stored, not deflated: the PNGs are already compressed and the text is tiny.
await writeFile(join(OUT, PRESS_ZIP), zipSync(files, { level: 0 }));
