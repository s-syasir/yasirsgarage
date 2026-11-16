import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// Update this manually whenever your situation changes.
const lastUpdated = "March 2026";

export default function Now() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto flex flex-col gap-16">
      <Nav />

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-4xl font-heading font-bold tracking-tight">
            Now
          </h1>
          <p className="text-xs font-mono text-[#444]">
            Updated {lastUpdated} · inspired by{" "}
            <a
              href="https://nownownow.com/about"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--muted)] transition-colors underline underline-offset-2"
            >
              nownownow.com
            </a>
          </p>
        </div>

        <div className="flex flex-col gap-8 text-[var(--muted)] leading-relaxed text-sm">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-mono text-[#555] uppercase tracking-widest">
              Building
            </span>
            <p>
              This portfolio, adding MDX writeups, the home lab docs, and the
              /whereisyasir location feature. Could use some more ideas, getting more into agents
              these days.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-mono text-[#555] uppercase tracking-widest">
              Home lab
            </span>
            <p>
              Running Proxmox on a NUC. Self-hosting a few services
              behind Tailscale. Nothing fancy, but it&apos;s mine. Slowly
              containerising everything with Docker.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-mono text-[#555] uppercase tracking-widest">
              Location
            </span>
            <p>
              Moving around. Check{" "}
              <a
                href="/whereisyasir"
                className="text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
              >
                /whereisyasir
              </a>{" "}
              if you know the password.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
