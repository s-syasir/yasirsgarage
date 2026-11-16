"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.open("/resume/print", "_blank")}
      className="px-4 py-2 bg-[var(--accent)] text-[var(--background)] text-sm font-mono font-semibold hover:opacity-90 transition-opacity cursor-pointer"
    >
      Preview →
    </button>
  );
}
