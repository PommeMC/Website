import type { APIRoute } from "astro";
import rss from "@astrojs/rss";
import { getNewsEntries } from "@/utils/news";

export const GET: APIRoute = async ({ site }) => {
  const entries = await getNewsEntries();

  return rss({
    title: "Pomme News",
    description: "Releases and posts from the Pomme team",
    site: site?.toString() ?? "https://pomme.rs",
    items: entries.map((e) => ({ title: e.title, pubDate: e.date, link: e.href, description: e.summary || undefined })),
    trailingSlash: false,
  });
};
