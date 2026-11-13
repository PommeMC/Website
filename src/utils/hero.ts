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
import { MOBILE_BREAKPOINT } from "@/data/layout";

/** Size of the rendered layers, and the highest terrain under the logo as a fraction of the height (measured from the layers). */
export const HERO_RENDER = { width: 2560, height: 1440, ridgeY: 0.36 } as const;

/** Fixed hero height on phones, where the viewport is too tall and narrow for a full-height scene. */
export const HERO_MOBILE_HEIGHT = 564;

const AV1 = 'video/mp4; codecs="av01.0.08M.08"';
const DESKTOP = `(min-width: ${MOBILE_BREAKPOINT + 1}px)`;
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
const HERO_SIZES = `(max-width: ${MOBILE_BREAKPOINT}px) ${Math.ceil(HERO_MOBILE_HEIGHT * ASPECT)}px, max(100vw, calc(100vh * ${ASPECT.toFixed(4)}))`;
/** Options for every layer, shared by the Image component and the preload tags so both point at the same files. */
export const HERO_IMAGE = {
  widths: [960, 1600, HERO_RENDER.width],
  sizes: HERO_SIZES,
  format: "webp" as const,
  quality: 82,
  fit: "cover" as const,
};

type HeroLayerKey = "sky" | "far" | "distant" | "mid" | "close" | "near";
interface HeroLayer {
  key: HeroLayerKey;
  image: ImageMetadata;
  /** Preloaded and fetched first: the sky behind the logo and the nearest terrain. */
  priority: boolean;
}

export const HERO_LAYERS: HeroLayer[] = [
  { key: "sky", image: sky, priority: true },
  { key: "far", image: far, priority: false },
  { key: "distant", image: distant, priority: false },
  { key: "mid", image: mid, priority: false },
  { key: "close", image: close, priority: false },
  { key: "near", image: near, priority: true },
];

export const getHeroPreloads = () =>
  Promise.all(
    HERO_LAYERS.filter((l) => l.priority).map(async (l) => {
      const img = await getImage({ src: l.image, ...HERO_IMAGE });
      return { src: img.src, srcset: img.srcSet.attribute };
    })
  );
