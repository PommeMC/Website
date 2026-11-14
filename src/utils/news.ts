import { getCollection, type CollectionEntry } from "astro:content";
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
  cover?: { src: ImageMetadata | string; alt: string };
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

/** Posts, newest first. */
export async function getPosts(): Promise<CollectionEntry<"posts">[]> {
  return (await getCollection("posts")).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Title, summary and reading time, shared by the news list and the post page. */
export function postInfo(post: CollectionEntry<"posts">) {
  const body = post.body ?? "";
  return {
    title: post.data.title ?? post.id,
    summary: post.data.description ?? truncateForPreview(body, 160),
    readTime: `${minutesToRead(countWords(body))} min read`,
  };
}

/** Posts and releases together, newest first. */
export async function getNewsEntries(): Promise<NewsEntry[]> {
  const [posts, releases] = await Promise.all([getPosts(), getReleases()]);
  const fromPosts = posts.map((p): NewsEntry => {
    const { title, summary, readTime } = postInfo(p);
    return {
      category: p.data.category,
      title,
      date: p.data.date,
      summary,
      href: `/news/${p.id}`,
      external: false,
      cta: "Read the post",
      meta: readTime,
      cover: p.data.cover,
    };
  });
  return [...fromPosts, ...(releases ?? []).map(fromRelease)].sort((a, b) => b.date.valueOf() - a.date.valueOf());
}
