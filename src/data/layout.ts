/** Site-wide layout values. `MOBILE_BREAKPOINT` must match the max-width media queries in brand.css, nav.css and home.css. */
export const MOBILE_BREAKPOINT = 900;
export const NAV_HEIGHT = 64;
/** Each page's h1 carries this id; rendering waits for it so a page transition never fades to an empty page. */
export const PAGE_TITLE_ID = "page-title";
/** Shown on every page's footer and handed to the press, so it is worded once. */
export const DISCLAIMER = "Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.";
export const LICENCE = "GPL-3.0";
/** Pomme in one sentence: the footer's tagline and the press kit's one-liner. */
export const ONE_LINE = "Pomme is a Minecraft: Java Edition client written from scratch in Rust.";
/** Must stay true: change it if the site ever sets a cookie, adds analytics or loads anything from another site. */
export const PRIVACY = "No cookies, no analytics, and nothing loads from outside pomme.rs.";

export interface ShareImage {
  src: string;
  width?: number;
  height?: number;
  alt: string;
}
/** The picture shown when a page is shared without its own. */
export const SITE_CARD: ShareImage = {
  src: "/og.jpg",
  width: 1200,
  height: 630,
  alt: "Pomme, a Minecraft client written from scratch in Rust, next to a landscape captured in Pomme.",
};
