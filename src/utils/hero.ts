import { getImage } from "astro:assets";
import sky from "@/assets/hero/plains/00-sky.webp";
import far from "@/assets/hero/plains/01-far.webp";
import distant from "@/assets/hero/plains/02-200-500.webp";
import mid from "@/assets/hero/plains/03-80-200.webp";
import close from "@/assets/hero/plains/04-24-80.webp";
import near from "@/assets/hero/plains/05-near.webp";
import skyDesktopAv1 from "@/assets/hero/plains/sky-desktop.av1.mp4?url";
import skyDesktopH264 from "@/assets/hero/plains/sky-desktop.h264.mp4?url";
import skyMobileAv1 from "@/assets/hero/plains/sky-mobile.av1.mp4?url";
import skyMobileH264 from "@/assets/hero/plains/sky-mobile.h264.mp4?url";
import { once } from "@/utils/once";

/** Size of the rendered layers, and the highest terrain under the logo as a fraction of the height (measured from the layers). */
export const HERO_RENDER = { width: 2560, height: 1440, ridgeY: 0.36 } as const;

/** `mobileBreakpoint` must match the max-width media query in home.css. */
export const HERO_LAYOUT = { navHeight: 64, mobileHeight: 564, mobileBreakpoint: 900 } as const;

const AV1 = 'video/mp4; codecs="av01.0.08M.08"';
const DESKTOP = `(min-width: ${HERO_LAYOUT.mobileBreakpoint + 1}px)`;
/** Looping sky-and-clouds video over the still sky layer, in the order browsers should try them. Its first frame is 00-sky, so the fade-in is seamless. */
export const HERO_SKY_SOURCES: { src: string; type: string; media?: string }[] = [
  { src: skyDesktopAv1, type: AV1, media: DESKTOP },
  { src: skyDesktopH264, type: "video/mp4", media: DESKTOP },
  { src: skyMobileAv1, type: AV1 },
  { src: skyMobileH264, type: "video/mp4" },
];

// Layers use object-fit: cover, so they render at the larger of the viewport width and the hero height at the render aspect.
// The nav floats over the hero, so on desktop the hero fills the whole viewport height.
const ASPECT = HERO_RENDER.width / HERO_RENDER.height;
const { mobileHeight, mobileBreakpoint } = HERO_LAYOUT;
export const HERO_SIZES = `(max-width: ${mobileBreakpoint}px) ${Math.ceil(mobileHeight * ASPECT)}px, max(100vw, calc(100vh * ${ASPECT.toFixed(4)}))`;
const WIDTHS = [960, 1600, HERO_RENDER.width];

type HeroLayerKey = "sky" | "far" | "distant" | "mid" | "close" | "near";
interface HeroLayer {
  key: HeroLayerKey;
  src: string;
  srcset: string;
  /** Preloaded and fetched first: the sky behind the logo and the nearest terrain. */
  priority: boolean;
}

const SOURCES: [HeroLayerKey, ImageMetadata][] = [
  ["sky", sky],
  ["far", far],
  ["distant", distant],
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
