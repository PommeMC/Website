import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { rssSchema } from "@astrojs/rss";
import { DEFAULT_AUTHOR, DEFAULT_AVATAR } from "@/data/posts";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/posts" }),
  schema: ({ image }) =>
    rssSchema.extend({
      date: z.coerce.date(),
      category: z.enum(["dev-log", "announcement"]).default("announcement"),
      author: z.string().default(DEFAULT_AUTHOR),
      authorAvatar: z.string().default(DEFAULT_AVATAR),
      /** A picture next to the post (./cover.png) or a full URL. */
      cover: z
        .object({
          src: z.union([image(), z.string().url()]),
          alt: z.string(),
          caption: z.string().optional(),
        })
        .optional(),
      /** GitHub usernames to thank at the end of the post. */
      thanks: z.array(z.string()).optional(),
    }),
});

export const collections = { posts };
