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
  note: string;
}

export function buildPlatforms(release: Release | null): HomePlatform[] {
  return PLATFORMS.map((p) => {
    const match = p.match;
    const asset = match ? release?.assets.find((a) => match.test(a.name)) : undefined;
    if (asset) {
      const size = formatBytes(asset.size);
      const arch = archLabel(p.key, asset.name);
      return {
        key: p.key,
        label: p.label,
        href: asset.browser_download_url,
        cta: `Download for ${p.label}`,
        downloadable: true,
        // Browsers report every Mac as Intel, so the Mac build says plainly which chips it runs on.
        details: [p.key === "macos" && arch ? `${arch} only` : arch, size].filter(Boolean).join(" · "),
        note: release?.firstLaunch[p.key] ?? "",
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
      note: "",
    };
  });
}

export function downloadLabel(p: HomePlatform): string {
  return `Download Pomme for ${p.label}, ${p.details}`;
}

export function releaseParts(release: Release | null): string[] {
  return release ? [`v${release.version}`, `released ${formatDateLong(release.publishedAt)}`] : [];
}
