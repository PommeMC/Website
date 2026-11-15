import { COMPARE, LOD_NOTE, POMME_SETTINGS } from "@/data/compare";
import { SERVER_VERSIONS } from "@/data/home";
import { DISCLAIMER, LICENCE } from "@/data/layout";
import { PARITY_HREF } from "@/data/nav";

/** `scripts/press-kit.ts` writes the kit's files into public/ at build, served under PRESS_HREF. */
export const PRESS_ZIP = "pomme-press-kit.zip";
export const PRESS_EMAIL = "press@pomme.rs";

/** Words for anyone writing about Pomme: copyable on the page, and about-pomme.txt in the zip. */
export const PRESS_TEXT = [
  { id: "one-line", label: "One line", text: "Pomme is a Minecraft: Java Edition client written from scratch in Rust." },
  {
    id: "description",
    label: "Short description",
    text: `Pomme is a free, open-source client for Minecraft: Java Edition, written from scratch in Rust. It is not a mod: it is a separate program that joins the same worlds and servers, from ${SERVER_VERSIONS}. Pomme runs on Windows, macOS (Apple Silicon) and Linux, and is built by volunteers. The code is public under the ${LICENCE} licence, and the project publishes how close it is to the original game at pomme.rs${PARITY_HREF}.`,
  },
  { id: "legal", label: "Legal line", text: DISCLAIMER },
];

export const NAME_RULES = [
  'Write "Pomme" with a capital P. It is pronounced like the French word for apple.',
  'Call it "a client for Minecraft: Java Edition", not "Minecraft Pomme" or an official client.',
  "Use the logo as supplied. Don't recolour, stretch or redraw the apple.",
  `When space allows, include: "${DISCLAIMER}"`,
];

/** Every mark comes as SVG and PNG, for the site's dark and for light backgrounds. */
export const LOGO_FORMATS = ["svg", "png"] as const;
export const BACKGROUNDS = ["dark", "light"] as const;
export type Background = (typeof BACKGROUNDS)[number];
/** The header's wordmark, its text recoloured for each background; the apple works on both. */
export const LOGOS = [
  { title: "Logo", file: (bg: Background) => `pomme-logo-on-${bg}` },
  { title: "Apple", file: () => "pomme-apple" },
] as const;

/** Full-size shots, copied from `source` into the kit. A shot using LoD says how it was taken. */
export const SCREENSHOTS = [
  {
    file: "players-on-a-server.png",
    source: "src/assets/images/home-1.png",
    title: "Players on a server",
    alt: "A crowd of players in their own skins, gathered in a stone quarry, seen from above.",
  },
  {
    file: "distant-terrain.png",
    source: "src/assets/compare/pomme.png",
    title: "Distant terrain",
    alt: COMPARE.pomme.alt,
    note: `${POMME_SETTINGS}. ${LOD_NOTE}`,
  },
];
