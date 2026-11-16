import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Nav from "@/components/Nav";
import { ProjectLink } from "@/components/ProjectLink";
import { getAllPosts, getPost } from "@/lib/mdx";

export async function generateStaticParams() {
  return getAllPosts("projects").map((p) => ({ slug: p.slug }));
}

// Unknown slugs would otherwise be rendered and cached at runtime, which fails on the read-only container
export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost("projects", slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto flex flex-col gap-16">
      <Nav />

      <article className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <Link
            href="/projects"
            className="text-sm font-mono text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
          >
            ← projects
          </Link>
          <h1 className="text-2xl md:text-4xl font-heading font-bold tracking-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#444]">
              {new Date(post.date).toLocaleDateString("en-GB", {
                year: "numeric",
                month: "long",
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
          {post.github && (
            <a
              href={post.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-[var(--foreground)] hover:text-[var(--accent)] transition-colors self-start"
            >
              github →
            </a>
          )}
          {post.privateRepo && (
            <span className="text-sm font-mono text-[var(--foreground)] self-start">
              Private Repo, No Link. Sorry :)
            </span>
          )}
        </div>

        <div className="prose-styles">
          <MDXRemote source={post.content} components={{ ProjectLink }} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
        </div>
      </article>
    </main>
  );
}
