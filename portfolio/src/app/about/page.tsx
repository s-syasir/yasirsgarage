import Link from "next/link";
import Image from "next/image";
import { existsSync } from "fs";
import { join } from "path";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

function getServerImage(): string | null {
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    if (existsSync(join(process.cwd(), "public", `homeserver.${ext}`))) {
      return `/homeserver.${ext}`;
    }
  }
  return null;
}

export default function About() {
  const serverImage = getServerImage();

  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto flex flex-col gap-16">
      <Nav />

      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl md:text-4xl font-heading font-bold tracking-tight">
            About
          </h1>
          <div className="flex flex-col gap-3 text-[var(--muted)] leading-relaxed text-sm">
            <p>
              Hello! I&apos;m Yasir (Syed Yasir) and I&apos;m a Software Engineer who likes to build apps/tools
              focused on privacy or whatever is interesting to me that week/month.
            </p>
            <p>
              Whenever possible, I like creating apps that use the full stack. Clean APIs,
              solid backends, and the infrastructure underneath them. However, I am definitely
              biased towards projects that I can self-host and just have fun with :).
            </p>
            <p>
              If you&apos;re reading this, this site is running on my home server (pictured below).
              It&apos;s a beelink NUC with an Intel CPU. It runs damn near every self-hosted
              service that I run on my homelab. You can find out more by reading through my Posts/Projects!
            </p>
          </div>

          {serverImage && (
            <div className="border border-[var(--border)] overflow-hidden">
              <Image
                src={serverImage}
                alt="Yasir's home server"
                width={672}
                height={400}
                className="w-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col border-t border-[var(--border)] pt-6 gap-0">
          <Link
            href="/now"
            className="flex items-center justify-between py-3 border-b border-[var(--border)] text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors group"
          >
            <span>See what I&apos;m currently working on</span>
            <span className="text-[#444] group-hover:text-[var(--muted)] transition-colors font-mono text-xs">
              /now →
            </span>
          </Link>
          <Link
            href="/setup"
            className="flex items-center justify-between py-3 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors group"
          >
            <span>See my setup</span>
            <span className="text-[#444] group-hover:text-[var(--muted)] transition-colors font-mono text-xs">
              /setup →
            </span>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
