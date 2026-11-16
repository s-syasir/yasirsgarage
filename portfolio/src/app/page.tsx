import Link from "next/link";
import Nav from "@/components/Nav";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto flex flex-col justify-between">
      <Nav />

      <div className="flex flex-col gap-8 py-24">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl md:text-5xl font-heading font-bold tracking-tight leading-tight">
            Syed Yasir
          </h1>
          <p className="text-xl text-[var(--muted)] leading-relaxed">
            Software Engineer interested in building tools focused on internet privacy
            and occasionally app ideas that interest me.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent)]" />
          <span className="text-[var(--muted)]">Currently in</span>
          <span className="text-[var(--foreground)]">Seattle, WA</span>
        </div>

        <div className="flex gap-4 text-sm font-mono">
          <Link
            href="/projects"
            className="px-4 py-2 bg-[var(--accent)] text-[var(--background)] font-semibold hover:opacity-90 transition-opacity"
          >
            projects →
          </Link>
          <Link
            href="/about"
            className="px-4 py-2 border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors"
          >
            about me
          </Link>
        </div>
      </div>

      <footer className="text-base text-[var(--muted)] font-mono">
        <Link href="/whereisyasir" className="hover:text-[var(--foreground)] transition-colors">
          /whereisyasir
        </Link>
      </footer>
    </main>
  );
}
