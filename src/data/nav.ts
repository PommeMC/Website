import { LINKS } from "@/data/home";
import { GITHUB_URL } from "@/utils/github";
import { getParityRun } from "@/utils/parity";

export const DOWNLOADS_HREF = "/#download";
export const PARITY_HREF = "/parity";

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

const NAV_LINKS: NavLink[] = [
  { label: "Orchard", href: LINKS.orchard, external: true, title: "Add-on marketplace", hint: "Marketplace" },
  { label: "News", href: "/news" },
  { label: "Community", href: "/community" },
  { label: "Parity", href: PARITY_HREF, title: "How close it is to vanilla", hint: "vs vanilla" },
  { label: "Discord", href: LINKS.discord, external: true, icon: "discord-brands" },
  { label: "GitHub", href: GITHUB_URL, external: true, icon: "github-brands", showStars: true },
];

/**
 * The nav's page links and icon links. Parity is left out of builds that couldn't load the parity results, as its
 * page isn't built then.
 */
export async function getNavLinks(): Promise<{ pages: NavLink[]; social: NavLink[] }> {
  const parity = await getParityRun();
  const links = NAV_LINKS.filter((l) => l.href !== PARITY_HREF || parity);
  return { pages: links.filter((l) => !l.icon), social: links.filter((l) => l.icon) };
}

/** Download plus the nav's page links, for lists of everywhere a visitor can go. */
export async function getSitePages(): Promise<NavLink[]> {
  return [{ label: "Download", href: DOWNLOADS_HREF }, ...(await getNavLinks()).pages];
}

/** New-tab attributes for links that leave the site. */
export const NEW_TAB = { target: "_blank", rel: "noopener" } as const;
export const externalAttrs = (l: Pick<NavLink, "external">) => (l.external ? NEW_TAB : {});
