import { getCollection } from 'astro:content';

export async function GET() {
	const posts = await getCollection('blog');
	const json = new Response(JSON.stringify({
		items: posts.map((post) => ({
			slug: post.id,
		})),
	}, null, 2), {
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
	})
	return json
}
