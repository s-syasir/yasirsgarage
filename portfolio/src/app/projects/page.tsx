import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { ProjectList } from "@/components/ProjectList";
import { getAllPosts } from "@/lib/mdx";

export default function Projects() {
  const projects = getAllPosts("projects");

  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto flex flex-col gap-16">
      <Nav />

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-4xl font-heading font-bold tracking-tight">
            Projects
          </h1>
          <p className="text-[var(--muted)] text-sm font-mono">
            Things I&apos;ve built. Some finished, some ongoing.
          </p>
        </div>

        <ProjectList projects={projects} />
      </div>

      <Footer />
    </main>
  );
}
