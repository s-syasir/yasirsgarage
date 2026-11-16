"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/posts", label: "Posts" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
  { href: "/now", label: "Now" },
  { href: "/setup", label: "Setup" },
];

const desktopLinks = [
  { href: "/projects", label: "Projects" },
  { href: "/posts", label: "Posts" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

const aboutDropdown = [
  { href: "/now", label: "Now" },
  { href: "/setup", label: "Setup" },
];

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isAboutActive = aboutDropdown.some((l) => pathname === l.href);

  return (
    <nav className="flex items-center justify-between text-sm text-[var(--muted)] font-mono relative">
      <Link
        href="/"
        className="text-[var(--foreground)] font-heading font-semibold tracking-tight hover:opacity-80 transition-opacity leading-none"
      >
        Yasir
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex gap-6 items-center">
        {desktopLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={
              pathname === href
                ? "text-[var(--foreground)]"
                : "hover:text-[var(--foreground)] transition-colors"
            }
          >
            {label}
          </Link>
        ))}

        {/* About dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <Link
            href="/about"
            className={isAboutActive ? "text-[var(--foreground)]" : "hover:text-[var(--foreground)] transition-colors"}
          >
            About
          </Link>

          {dropdownOpen && (
            <div className="absolute left-0 top-full pt-2 z-10">
              <div className="flex flex-col border border-[var(--border)] bg-[var(--background)] min-w-[100px]">
                {aboutDropdown.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`px-3 py-2 text-xs hover:text-[var(--foreground)] hover:bg-[#111] transition-colors ${
                      pathname === href ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full right-0 mt-2 z-20 border border-[var(--border)] bg-[var(--background)] min-w-[140px] flex flex-col">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`px-4 py-3 text-sm hover:text-[var(--foreground)] hover:bg-[#111] transition-colors ${
                pathname === href ? "text-[var(--foreground)]" : "text-[var(--muted)]"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
