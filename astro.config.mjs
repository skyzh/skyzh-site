import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  experimental: {
    redirects: true
  },
  redirects: {
    '/pages/about': '/about'
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
  trailingSlash: 'always'
});