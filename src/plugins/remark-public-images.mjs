import path from "node:path";

const blogRoot = path.resolve("src/content/blog");

function walk(node, visit) {
	visit(node);
	if (Array.isArray(node.children)) {
		for (const child of node.children) {
			walk(child, visit);
		}
	}
}

export default function remarkPublicImages() {
	return (tree, file) => {
		if (!file.path) return;

		const relativePath = path.relative(blogRoot, file.path).split(path.sep).join("/");
		const withoutExtension = relativePath.replace(/\.(?:md|mdx)$/, "");
		const slug = withoutExtension.endsWith("/index")
			? withoutExtension.slice(0, -6)
			: withoutExtension;

		walk(tree, (node) => {
			if (node.type !== "image" || typeof node.url !== "string") return;
			if (/^(?:[a-z]+:|\/|#)/i.test(node.url)) return;
			node.url = `/blog/${slug}/${node.url}`;
		});
	};
}
