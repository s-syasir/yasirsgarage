"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { PostMeta } from "@/lib/mdx";

export function ProjectList({ projects }: { projects: PostMeta[] }) {
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const allTags = Array.from(new Set(projects.flatMap((p) => p.tags))).sort();

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));

    const matchesTags =
      activeTags.length === 0 || activeTags.some((t) => p.tags.includes(t));

    return matchesSearch && matchesTags;
  });

  const hasFilters = search || activeTags.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="search projects..."
        className="bg-transparent border border-[var(--border)] px-3 py-2 text-sm font-mono text-[var(--foreground)] placeholder:text-[#444] focus:outline-none focus:border-[var(--muted)] w-full"
      />

      {/* Tag filter chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`text-[9px] font-mono px-1.5 py-0.5 border uppercase tracking-wider transition-colors cursor-pointer ${
                activeTags.includes(tag)
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[#555] hover:border-[#444] hover:text-[#888]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <p className="text-sm text-[#444] font-mono">No projects match.</p>
        )}

        {filtered.map((project) => (
          <div
            key={project.slug}
            className="border border-[var(--border)] p-4 flex flex-col gap-2 hover:border-[#333] transition-colors group"
          >
            <Link href={`/projects/${project.slug}`} className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <span className="font-heading font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                  {project.title}
                </span>
                <span className="text-xs font-mono text-[#444] shrink-0">
                  {project.date.slice(0, 4)}
                </span>
              </div>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                {project.description}
              </p>
            </Link>

            {/* Tags — clicking toggles the filter, separate from the Link */}
            <div className="flex gap-2 flex-wrap">
              {project.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-[9px] font-mono px-1.5 py-0.5 border uppercase tracking-wider transition-colors cursor-pointer ${
                    activeTags.includes(tag)
                      ? "border-[var(--accent)] text-[var(--accent)]"
                      : "border-[var(--border)] text-[#555] hover:border-[#444] hover:text-[#888]"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {hasFilters && (
        <button
          onClick={() => { setSearch(""); setActiveTags([]); }}
          className="text-xs font-mono text-[#444] hover:text-[var(--muted)] transition-colors self-start"
        >
          clear filters ×
        </button>
      )}
    </div>
  );
}
