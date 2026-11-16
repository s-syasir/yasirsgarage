import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  draft?: boolean;
  github?: string;
  privateRepo?: boolean;
}

export interface Post extends PostMeta {
  content: string;
}

function getContentDir(collection: "projects" | "posts") {
  return path.join(process.cwd(), "content", collection);
}

export function getAllPosts(collection: "projects" | "posts"): PostMeta[] {
  const dir = getContentDir(collection);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((filename) => {
      const slug = filename.replace(/\.(mdx|md)$/, "");
      const raw = fs.readFileSync(path.join(dir, filename), "utf-8");
      const { data } = matter(raw);
      return {
        slug,
        title: data.title ?? slug,
        description: data.description ?? "",
        date: data.date ?? "",
        tags: data.tags ?? [],
        draft: data.draft ?? false,
        github: data.github,
        privateRepo: data.privateRepo ?? false,
      } satisfies PostMeta;
    })
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(
  collection: "projects" | "posts",
  slug: string
): Post | null {
  const dir = getContentDir(collection);
  const mdxPath = path.join(dir, `${slug}.mdx`);
  const mdPath = path.join(dir, `${slug}.md`);
  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;

  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ?? "",
    tags: data.tags ?? [],
    draft: data.draft ?? false,
    github: data.github,
    privateRepo: data.privateRepo ?? false,
    content,
  };
}
