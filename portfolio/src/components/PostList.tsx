"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { PostMeta } from "@/lib/mdx";

export function PostList({ posts }: { posts: PostMeta[] }) {
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort();

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const filtered = posts.filter((p) => {
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
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="search posts..."
        className="bg-transparent border border-[var(--border)] px-3 py-2 text-sm font-mono text-[var(--foreground)] placeholder:text-[#444] focus:outline-none focus:border-[var(--muted)] w-full"
      />

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

      <div className="flex flex-col">
        {filtered.length === 0 && (
          <p className="text-sm text-[#444] font-mono">No posts match.</p>
        )}

        {filtered.map((post, i) => (
          <div
            key={post.slug}
            className={`flex items-start justify-between gap-6 py-4 ${
              i < filtered.length - 1 ? "border-b border-[var(--border)]" : ""
            }`}
          >
            <div className="flex flex-col gap-1.5">
              <Link
                href={`/posts/${post.slug}`}
                className="text-sm text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
              >
                {post.title}
              </Link>
              <span className="text-xs text-[var(--muted)] font-mono leading-relaxed">
                {post.description}
              </span>
              {post.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {post.tags.map((tag) => (
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
            </div>
            <span className="text-xs font-mono text-[#444] shrink-0 pt-0.5">
              {new Date(post.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone: "UTC",
              })}
            </span>
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
