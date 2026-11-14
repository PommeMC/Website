import { LINKS } from "@/data/home";
import { GITHUB_URL } from "@/utils/github";

export const DOWNLOADS_HREF = "/#download";

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
  /** Tooltip on hover and focus (desktop), also read by screen readers. */
  title?: string;
  /** Short note beside the label in the phone menu. */
  hint?: string;
  /** Icon links sit on the right; on desktop they show the icon only. */
  icon?: "discord-brands" | "github-brands";
  showStars?: boolean;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Orchard", href: "https://orchard.pomme.rs/", external: true, title: "Add-on marketplace", hint: "Marketplace" },
  { label: "News", href: "/news" },
  { label: "Community", href: "/community" },
  { label: "Discord", href: LINKS.discord, external: true, icon: "discord-brands" },
  { label: "GitHub", href: GITHUB_URL, external: true, icon: "github-brands", showStars: true },
];

/** New-tab attributes for links that leave the site. */
export const NEW_TAB = { target: "_blank", rel: "noopener" } as const;
export const externalAttrs = (l: Pick<NavLink, "external">) => (l.external ? NEW_TAB : {});
