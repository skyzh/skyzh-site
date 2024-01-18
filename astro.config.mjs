import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkToc from 'remark-toc';
import react from "@astrojs/react";
import { rehypeHeadingIds } from '@astrojs/markdown-remark';

// https://astro.build/config
export default defineConfig({
  experimental: {
    redirects: true
  },
  redirects: {
    '/pages/about': '/about',
    '/join/discord': 'https://discord.gg/ZgXzxpua3H'
  },
  site: 'https://www.skyzh.dev',
  integrations: [mdx(), sitemap(), react()],
  output: 'static',
  markdown: {
    remarkPlugins: ['remark-math'],
    rehypePlugins: [['rehype-katex', {
      // Katex plugin options
    }]]
  },
  trailingSlash: 'always',
  markdown: {
    // Applied to .md and .mdx files
    remarkPlugins: [
      [remarkToc, { tight: true }]
    ],
    rehypePlugins: [
      rehypeHeadingIds,
    ],
    shikiConfig: {
      theme: 'github-light',
    },
  },
});
