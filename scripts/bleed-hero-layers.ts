/**
 * The browser downscales each hero layer on its own, leaving half-transparent pixels where one depth
 * band meets the next, so the sky shows through as a light seam. This extends every layer `radius`
 * pixels under the layers in front of it, filled with the colour visible there at rest.
 * Input layers are sorted back to front by file name (00-sky first).
 */
import { mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const [inputDir, outputDir, radiusArg] = process.argv.slice(2);
if (!inputDir || !outputDir) {
  console.error("usage: bun scripts/bleed-hero-layers.ts <input-dir> <output-dir> [radius=8]");
  process.exit(1);
}
const radius = Number(radiusArg ?? 8);

const files = (await readdir(inputDir)).filter((f) => /^\d+-.+\.(webp|png)$/i.test(f)).sort();
const layers = await Promise.all(
  files.map(async (file) => {
    const { data, info } = await sharp(join(inputDir, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    return { file, data, width: info.width, height: info.height };
  })
);
const { width, height } = layers[0];
const size = width * height;
const alpha = (data: Buffer, p: number) => data[p * 4 + 3];

/** Grows a binary mask by `r` pixels with a separable square max filter. */
function dilate(mask: Uint8Array, r: number): Uint8Array {
  const pass = (src: Uint8Array, horizontal: boolean) => {
    const out = new Uint8Array(size);
    const [outer, inner] = horizontal ? [height, width] : [width, height];
    for (let o = 0; o < outer; o++) {
      const at = (i: number) => (horizontal ? o * width + i : i * width + o);
      let count = 0;
      for (let i = 0; i < Math.min(r, inner); i++) count += src[at(i)];
      for (let i = 0; i < inner; i++) {
        if (i + r < inner) count += src[at(i + r)];
        if (i - r - 1 >= 0) count -= src[at(i - r - 1)];
        out[at(i)] = count > 0 ? 1 : 0;
      }
    }
    return out;
  };
  return pass(pass(mask, true), false);
}

await mkdir(outputDir, { recursive: true });

for (const [i, layer] of layers.entries()) {
  const out = Buffer.from(layer.data);
  const front = layers.slice(i + 1).reverse();

  if (front.length > 0) {
    const grown = dilate(
      Uint8Array.from({ length: size }, (_, p) => (alpha(layer.data, p) > 0 ? 1 : 0)),
      radius
    );
    for (let p = 0; p < size; p++) {
      if (!grown[p] || alpha(layer.data, p) === 255) continue;
      const visible = front.find((f) => alpha(f.data, p) === 255);
      if (!visible) continue;
      visible.data.copy(out, p * 4, p * 4, p * 4 + 4);
    }
  }

  const name = layer.file.replace(/\.\w+$/, ".webp");
  await sharp(out, { raw: { width, height, channels: 4 } })
    .webp({ quality: 90, alphaQuality: 100, smartSubsample: true })
    .toFile(join(outputDir, name));
  console.log(name);
}
