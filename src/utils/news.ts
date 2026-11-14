import { getCollection } from "astro:content";
import { countWords, minutesToRead, plural, truncateForPreview } from "@/utils/content";
import { getReleases, type Release } from "@/utils/github";

export const NEWS_CATEGORIES = {
  release: { tag: "Release", tab: "Releases" },
  "dev-log": { tag: "Dev log", tab: "Dev logs" },
  announcement: { tag: "Announcement", tab: "Announcements" },
} as const;
export type NewsCategory = keyof typeof NEWS_CATEGORIES;

export interface NewsEntry {
  category: NewsCategory;
  title: string;
  date: Date;
  summary: string;
  href: string;
  external: boolean;
  cta: string;
  /** Reading time for posts, downloads for releases. */
  meta: string | null;
  cover?: { src: string; alt?: string };
  /** Releases only: the first few changes, and how many more there are. */
  changes?: { shown: string[]; more: number };
}

const SHOWN_CHANGES = 5;

function fromRelease(r: Release): NewsEntry {
  return {
    category: "release",
    title: `${r.product} v${r.version}`,
    date: r.publishedAt,
    summary: r.changes.length > 0 ? `${plural(r.changes.length, "change")} from ${plural(r.contributors, "contributor")}.` : "",
    href: r.url,
    external: true,
    cta: "Read the release notes",
    meta: plural(r.downloads, "download"),
    changes: { shown: r.changes.slice(0, SHOWN_CHANGES), more: Math.max(0, r.changes.length - SHOWN_CHANGES) },
  };
}

/** Posts and releases together, newest first. */
export async function getNewsEntries(): Promise<NewsEntry[]> {
  const [posts, releases] = await Promise.all([getCollection("posts"), getReleases()]);
  const fromPosts = posts.map((p): NewsEntry => {
    const body = p.body ?? "";
    return {
      category: p.data.category,
      title: p.data.title ?? p.id,
      date: p.data.date,
      summary: p.data.description ?? truncateForPreview(body, 160),
      href: `/news/${p.id}`,
      external: false,
      cta: "Read the post",
      meta: `${minutesToRead(countWords(body))} min read`,
      cover: p.data.cover,
    };
  });
  return [...fromPosts, ...(releases ?? []).map(fromRelease)].sort((a, b) => b.date.valueOf() - a.date.valueOf());
}
