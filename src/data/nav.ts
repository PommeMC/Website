import { LINKS } from "@/data/home";
import { GITHUB_URL } from "@/utils/github";

export const DOWNLOADS_HREF = "/downloads";

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
  /** Tooltip on hover and focus (desktop), also read by screen readers. */
  title?: string;
  /** Short note beside the label in the phone menu. */
  hint?: string;
  isNew?: boolean;
  /** Icon links sit on the right; on desktop they show the icon only. */
  icon?: "discord-brands" | "github-brands";
  showStars?: boolean;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Orchard", href: "https://orchard.pomme.rs/", external: true, title: "Add-on marketplace", hint: "Marketplace", isNew: true },
  { label: "News", href: "/news" },
  { label: "Community", href: "/community" },
  { label: "Discord", href: LINKS.discord, external: true, icon: "discord-brands" },
  { label: "GitHub", href: GITHUB_URL, external: true, icon: "github-brands", showStars: true },
];
