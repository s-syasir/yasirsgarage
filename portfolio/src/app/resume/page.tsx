import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { HeadlessBrowserDetect } from "./HeadlessBrowserDetect";
import { getResume } from "@/lib/resume";

export const dynamic = "force-dynamic";

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-[var(--border)] pb-1 mb-4 mt-8 first:mt-0">
      <h2 className="text-xs font-mono uppercase tracking-widest text-[var(--foreground)]">
        {title}
      </h2>
    </div>
  );
}

function Entry({
  primary,
  secondary,
  role,
  dates,
  bullets,
}: {
  primary: string;
  secondary: string;
  role?: string;
  dates?: string;
  bullets?: string[];
}) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-semibold text-[var(--foreground)] text-sm">{primary}</span>
        <span className="text-xs font-mono text-[var(--muted)] shrink-0">{secondary}</span>
      </div>
      {(role || dates) && (
        <div className="flex items-baseline justify-between gap-4 mt-0.5">
          <span className="text-xs text-[var(--muted)] italic">{role}</span>
          <span className="text-xs font-mono text-[#555] shrink-0">{dates}</span>
        </div>
      )}
      {bullets && bullets.length > 0 && (
        <ul className="mt-2 list-disc list-outside pl-4 flex flex-col gap-1">
          {bullets.map((b, i) => (
            <li key={i} className="text-xs text-[var(--muted)] leading-relaxed">{b}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

export default function Resume() {
  const { name, contact, education, experience, projects, skills } = getResume();

  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto flex flex-col gap-16">
      <HeadlessBrowserDetect />
      <Nav />

      <div className="flex flex-col gap-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-4xl font-heading font-bold tracking-tight">
              Resume
            </h1>
            <p className="text-[var(--muted)] text-sm font-mono">
              {name} · Software Engineer
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/resume/print"
              className="px-4 py-2 border border-[var(--border)] text-sm font-mono text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[#333] transition-colors"
            >
              Download .pdf (print)
            </Link>
            <Link
              href="/resume/docx"
              className="px-4 py-2 border border-[var(--border)] text-sm font-mono text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[#333] transition-colors"
            >
              Download .docx
            </Link>
          </div>
        </div>

        <div>
          <div className="flex flex-col gap-1 mb-8">
            <h2 className="text-2xl font-heading font-bold tracking-tight text-[var(--foreground)]">
              {name}
            </h2>
            <div className="flex flex-nowrap items-center gap-x-3 text-xs font-mono text-[var(--muted)] overflow-x-auto">
              <span className="cursor-default whitespace-nowrap">{maskEmail(contact.email)}</span>
              <a href={contact.linkedin.url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn" className="shrink-0 hover:text-[var(--foreground)] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z"/></svg>
              </a>
              <a href={contact.github.url} target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub" className="shrink-0 hover:text-[var(--foreground)] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.5v-1.75c-2.78.62-3.37-1.36-3.37-1.36-.46-1.2-1.11-1.52-1.11-1.52-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.9-1.33 2.74-1.05 2.74-1.05.56 1.41.2 2.46.1 2.72.65.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.95.68 1.92v2.85c0 .28.18.61.69.5A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"/></svg>
              </a>
              <a href={contact.website.url} target="_blank" rel="noopener noreferrer" aria-label="Portfolio" title="Portfolio" className="shrink-0 hover:text-[var(--foreground)] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/></svg>
              </a>
              <span className="whitespace-nowrap">{contact.phone.slice(0, 3)}-***-****</span>
            </div>
          </div>

          <SectionHeader title="Education" />
          {education.map((e, i) => (
            <Entry key={i} primary={e.institution} secondary={e.location} role={e.degree} />
          ))}

          <SectionHeader title="Professional Experience" />
          {experience.map((e, i) => (
            <Entry key={i} primary={e.org} secondary={e.location} role={e.role} dates={e.dates} bullets={e.bullets} />
          ))}

          <SectionHeader title="Projects" />
          {projects.map((p, i) => (
            <Entry key={i} primary={p.name} secondary={p.location} role={p.role} dates={p.dates} bullets={p.bullets} />
          ))}

          <SectionHeader title="Skills" />
          <div className="flex flex-col gap-1.5">
            {skills.map((s, i) => (
              <div key={i} className="flex gap-2 text-xs">
                <span className="font-mono text-[#555] shrink-0 w-36">{s.category}</span>
                <span className="text-[var(--muted)]">{s.items}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "none" }}>
        <a href="mailto:honeytop.in5zn@simplelogin.com">admin</a>
      </div>

      <Footer />
    </main>
  );
}
