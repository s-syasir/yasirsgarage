import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Nav from "@/components/Nav";
import { ProjectLink } from "@/components/ProjectLink";
import { getAllPosts, getPost } from "@/lib/mdx";

export async function generateStaticParams() {
  return getAllPosts("posts").map((p) => ({ slug: p.slug }));
}

// Unknown slugs would otherwise be rendered and cached at runtime, which fails on the read-only container
export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Post({ params }: Props) {
  const { slug } = await params;
  const post = getPost("posts", slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto flex flex-col gap-16">
      <Nav />

      <article className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <Link
            href="/posts"
            className="text-xs font-mono text-[#444] hover:text-[var(--muted)] transition-colors"
          >
            ← posts
          </Link>
          <h1 className="text-2xl md:text-4xl font-heading font-bold tracking-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#444]">
              {new Date(post.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <div className="flex gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] font-mono px-1.5 py-0.5 border border-[var(--border)] text-[#555] uppercase tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="prose-styles">
          <MDXRemote source={post.content} components={{ ProjectLink }} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
        </div>
      </article>
    </main>
  );
}
