import { defineConfig } from "astro/config";
import { unified, rehypeHeadingIds } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import remarkToc from "remark-toc";
import remarkPublicImages from "./src/plugins/remark-public-images.mjs";

// https://astro.build/config
export default defineConfig({
  redirects: {
    "/pages/about": "/about",
    "/join/discord": "https://discord.gg/XY5tFAYqYh",
  },
  site: "https://www.skyzh.dev",
  integrations: [mdx(), sitemap(), react()],
  output: "static",
  trailingSlash: "always",
  compressHTML: true,
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkPublicImages,
        remarkMath,
        [remarkToc, { tight: true }],
      ],
      rehypePlugins: [
        rehypeHeadingIds,
        rehypeKatex,
      ],
    }),
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
});
