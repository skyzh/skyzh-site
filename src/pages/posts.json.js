import { getCollection } from 'astro:content';

export async function get(ctx) {
	const posts = await getCollection('blog');
	const json = new Response(JSON.stringify({
		items: posts.map((post) => ({
			slug: post.slug,
		})),
	}, null, 2))
	return json
}
