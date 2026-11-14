import { defineConfig } from "astro/config";
import { execSync } from "child_process";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import { UNLISTED } from "./src/data/unlisted.ts";

const GIT_COMMIT_HASH = (process.env.GITHUB_SHA || "").trim().slice(0, 7) || execSync("git rev-parse --short HEAD").toString().trim();

export default defineConfig({
  site: "https://pomme.rs",
  // community.html rather than community/index.html, so Cloudflare serves /community without redirecting to /community/.
  trailingSlash: "never",
  build: { format: "file" },

  vite: {
    define: {
      "import.meta.env.GIT_COMMIT_HASH": JSON.stringify(GIT_COMMIT_HASH),
    },
  },

  image: {
    responsiveStyles: true,
    layout: "full-width",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },

  integrations: [
    icon({
      iconDir: "src/assets",
    }),
    sitemap({ filter: (page) => !UNLISTED.includes(new URL(page).pathname) }),
    mdx(),
  ],

  adapter: cloudflare({
    imageService: "compile",
    platformProxy: {
      enabled: true,
      persist: true,
    },
  }),
});
