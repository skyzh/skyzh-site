import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
	loader: glob({
		pattern: ["**/*.md", "**/*.mdx"],
		base: "./src/content/blog",
		generateId: ({ entry }) => entry.replace(/(?:\/index)?\.(?:md|mdx)$/, ""),
	}),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		socialImage: z.string().optional(),
		lang: z.string().optional(),
		external: z.boolean().optional(),
		enable_katex: z.boolean().optional(),
		tags: z.array(z.string()).optional(),
	}),
});

const work = defineCollection({
	loader: glob({
		pattern: "**/*.md",
		base: "./src/content/work",
	}),
	schema: z.object({
		company: z.string(),
		role: z.string(),
		location: z.string(),
		dateStart: z.coerce.date(),
		dateEnd: z.coerce.date().optional(),
		homepage: z.boolean().optional(),
	}),
});

export const collections = { blog, work };
