import { LINKS, MOBILE_NOTE, PLATFORMS, archLabel, type PlatformConfig } from "@/data/home";
import { formatBytes } from "@/utils/content";
import { GITHUB_URL, type Release } from "@/utils/github";
import { formatDateLong } from "@/utils/time";

export interface HomePlatform {
  key: PlatformConfig["key"];
  label: string;
  href: string;
  cta: string;
  downloadable: boolean;
  details: string;
  size: string | null;
  note: string;
}

export function buildPlatforms(release: Release | null): HomePlatform[] {
  return PLATFORMS.map((p) => {
    const match = p.match;
    const asset = match ? release?.assets.find((a) => match.test(a.name)) : undefined;
    if (asset) {
      const size = formatBytes(asset.size);
      return {
        key: p.key,
        label: p.label,
        href: asset.browser_download_url,
        cta: `Download for ${p.label}`,
        downloadable: true,
        details: [archLabel(p.key, asset.name), size].filter(Boolean).join(" · "),
        size,
        note: release?.firstLaunch[p.label.toLowerCase()] ?? "",
      };
    }
    const isMobile = p.key === "mobile";
    return {
      key: p.key,
      label: p.label,
      href: isMobile ? GITHUB_URL : `${LINKS.releases}/latest`,
      cta: isMobile ? "Follow progress" : "See releases",
      downloadable: false,
      details: isMobile ? MOBILE_NOTE : "Not in this release",
      size: null,
      note: "",
    };
  });
}

export function downloadLabel(p: HomePlatform): string {
  return `Download Pomme for ${p.label}, ${p.size}`;
}

export function releaseParts(release: Release | null): string[] {
  return release ? [`v${release.version}`, `released ${formatDateLong(release.publishedAt)}`] : [];
}
