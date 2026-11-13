import { getImage } from "astro:assets";
import sky from "@/assets/hero/jungle/00-sky.webp";
import far from "@/assets/hero/jungle/01-far.webp";
import mid from "@/assets/hero/jungle/02-60-150.webp";
import close from "@/assets/hero/jungle/03-20-60.webp";
import near from "@/assets/hero/jungle/04-near.webp";
import { once } from "@/utils/once";

// Layers use object-fit: cover, so they render at the larger of the viewport width and the hero
// height at 16:9 (520px tall at <=900px, otherwise the viewport minus the 44px top bar).
export const HERO_SIZES = "(max-width: 900px) 925px, max(100vw, calc((100vh - 44px) * 1.7778))";
const WIDTHS = [960, 1600, 2560];

export type HeroLayerKey = "sky" | "far" | "mid" | "close" | "near";
export interface HeroLayer {
  key: HeroLayerKey;
  src: string;
  srcset: string;
  /** Preloaded and fetched first: the sky behind the logo and the nearest terrain. */
  priority: boolean;
}

const SOURCES: [HeroLayerKey, ImageMetadata][] = [
  ["sky", sky],
  ["far", far],
  ["mid", mid],
  ["close", close],
  ["near", near],
];

export const getHeroLayers = once(() =>
  Promise.all(
    SOURCES.map(async ([key, src]): Promise<HeroLayer> => {
      const img = await getImage({ src, widths: WIDTHS, sizes: HERO_SIZES, format: "webp", quality: 82 });
      return { key, src: img.src, srcset: img.srcSet.attribute, priority: key === "sky" || key === "near" };
    })
  )
);
