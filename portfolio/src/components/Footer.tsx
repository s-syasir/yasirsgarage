import Link from "next/link";

export default function Footer() {
  return (
    <footer className="text-base text-[var(--muted)] font-mono">
      <Link href="/whereisyasir" className="hover:text-[var(--foreground)] transition-colors">
        /whereisyasir
      </Link>
    </footer>
  );
}
