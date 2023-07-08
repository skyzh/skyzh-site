import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	experimental: {
		redirects: true
	},
	redirects: {
		'/pages/about': '/about',
	},
	site: 'https://www.skyzh.dev',
	integrations: [mdx(), sitemap()],
	output: 'static',
	markdown: {
		remarkPlugins: [
			'remark-math',
		],
		rehypePlugins: [
			['rehype-katex', {
				// Katex plugin options
			}]
		]
	},
	trailingSlash: 'always',
});
