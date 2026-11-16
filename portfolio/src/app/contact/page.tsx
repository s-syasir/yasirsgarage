import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const links = [
  {
    label: "Email",
    href: undefined,
    display: "portfolio at yasirsgarage dot org",
  },
  {
    label: "Email (backup)",
    href: undefined,
    display: "yasirsyed39 at outlook dot com",
  },
  {
    label: "GitHub",
    href: "https://github.com/s-syasir",
    display: "github.com/s-syasir",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/syed-y-b6b909189/",
    display: "linkedin.com/in/syed-y-b6b909189",
  },
];

export default function Contact() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto flex flex-col gap-16">
      <Nav />

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-4xl font-heading font-bold tracking-tight">
            Contact
          </h1>
          <p className="text-[var(--muted)] text-sm font-mono leading-relaxed">
            Best way to reach me is email.
          </p>
        </div>

        <div className="flex flex-col">
          {links.map((link, i) => {
            const rowClass = `flex items-center justify-between py-4 text-sm ${
              i < links.length - 1 ? "border-b border-[var(--border)]" : ""
            }`;

            const inner = (
              <>
                <span className="font-mono text-[var(--muted)]">
                  {link.label}
                </span>
                <span className="font-mono text-[#444] text-xs">
                  {link.display}
                  {link.href && " →"}
                </span>
              </>
            );

            return link.href ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${rowClass} group hover:cursor-pointer`}
              >
                <span className="font-mono text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
                  {link.label}
                </span>
                <span className="font-mono text-[#444] group-hover:text-[var(--muted)] transition-colors text-xs">
                  {link.display} →
                </span>
              </a>
            ) : (
              <div key={link.label} className={rowClass}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </main>
  );
}
