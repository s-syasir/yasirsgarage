import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { PostList } from "@/components/PostList";
import { getAllPosts } from "@/lib/mdx";

export default function Posts() {
  const posts = getAllPosts("posts");

  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto flex flex-col gap-16">
      <Nav />

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-4xl font-heading font-bold tracking-tight">
            Posts
          </h1>
          <p className="text-[var(--muted)] text-sm font-mono">
            Projects that weren&apos;t (generally) too coding-heavy. Things I learned, figured out, or found interesting.
          </p>
        </div>

        <PostList posts={posts} />
      </div>

      <Footer />
    </main>
  );
}
