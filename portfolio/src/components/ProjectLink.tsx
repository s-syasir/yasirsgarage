import Link from "next/link";
import { getPost } from "@/lib/mdx";

interface Props {
  slug: string;
  children?: React.ReactNode;
}

export function ProjectLink({ slug, children }: Props) {
  const post = getPost("projects", slug);
  if (!post) return <code>{slug}</code>;
  return (
    <Link
      href={`/projects/${slug}`}
      className="text-[var(--accent)] hover:opacity-80 transition-opacity underline underline-offset-2"
    >
      {children ?? post.title}
    </Link>
  );
}
