"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { checkPassword, getApproximateCity } from "./actions";
import type { LocationResult, LocationEntry } from "./actions";

// Leaflet accesses window — must be client-side only
const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 2) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function isStale(isoString: string): boolean {
  return Date.now() - new Date(isoString).getTime() > 6 * 3600000;
}

function getDuration(entry: LocationEntry, nextEntry?: LocationEntry): string {
  const start = new Date(entry.arrivedAt).getTime();
  const end = nextEntry ? new Date(nextEntry.arrivedAt).getTime() : Date.now();
  const days = Math.floor((end - start) / 86400000);
  if (days < 1) return "< 1 day";
  if (days === 1) return "1 day";
  return `${days} days`;
}

function LocationView({ data }: { data: LocationResult }) {
  const { location, history } = data;
  const stale = isStale(location.updatedAt);
  const [focusEntry, setFocusEntry] = useState<LocationEntry | null>(null);

  // Most recent entry is last in history array
  const sortedHistory = [...history].reverse();

  return (
    <div className="flex flex-col gap-6">
      {/* Map */}
      <div className="h-72 border border-[var(--border)] overflow-hidden">
        <MapComponent location={location} history={history} focusEntry={focusEntry} />
      </div>

      {/* Current location */}
      <div className="flex items-center gap-2 text-sm font-mono">
        <span
          className={`inline-block w-2 h-2 rounded-full shrink-0 ${
            stale ? "bg-[var(--muted)]" : "bg-[var(--accent)]"
          }`}
        />
        <span className="text-[var(--foreground)] font-semibold">
          {location.city}
        </span>
        <span className="text-[#444]">·</span>
        <span className={stale ? "text-[var(--muted)]" : "text-[#666]"}>
          {stale
            ? `last seen ${formatRelativeTime(location.updatedAt)}, may be outdated`
            : `updated ${formatRelativeTime(location.updatedAt)}`}
        </span>
      </div>

      {/* Navigate link */}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lon}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-mono text-[var(--muted)] hover:text-[var(--foreground)] transition-colors underline underline-offset-2"
      >
        Navigate to me if you&apos;d like →
      </a>

      {/* Timeline */}
      {sortedHistory.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono text-[#555] uppercase tracking-widest mb-2">
            Recent locations
          </span>
          {sortedHistory.map((entry, i) => {
            const isFirst = i === 0;
            const next = sortedHistory[i + 1];
            const isFocused = focusEntry?.arrivedAt === entry.arrivedAt;
            return (
              <button
                key={`${entry.city}-${entry.arrivedAt}`}
                onClick={() => setFocusEntry(entry)}
                className={`flex items-center justify-between py-2 border-b border-[#151515] text-sm font-mono w-full text-left transition-colors cursor-pointer ${
                  isFocused ? "opacity-100" : "hover:opacity-80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs w-16 shrink-0 ${isFocused ? "text-[var(--accent)]" : "text-[#444]"}`}>
                    {new Date(entry.arrivedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <span
                    className={isFirst ? "text-[var(--foreground)]" : "text-[var(--muted)]"}
                  >
                    {entry.city}
                  </span>
                </div>
                <span className="text-[#444] text-xs">
                  {isFirst ? getDuration(entry) : getDuration(entry, next || sortedHistory[i - 1])}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PasswordGate({ onUnlock, approximateCity }: { onUnlock: (data: LocationResult) => void; approximateCity: string | null }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await checkPassword(password);

    setLoading(false);

    if (result.data) {
      onUnlock(result.data);
    } else {
      setError(result.error === "not configured" ? "not available" : "wrong password");
      setPassword("");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-[var(--muted)] font-mono leading-relaxed">
          This page is private. Enter the password to see live location data.
          {approximateCity && (
            <> Yasir is currently somewhere near <span className="text-[var(--foreground)]">{approximateCity}</span>.</>
          )}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            disabled={loading}
            className="flex-1 bg-transparent border border-[var(--border)] px-3 py-2 text-sm font-mono text-[var(--foreground)] placeholder:text-[#444] focus:outline-none focus:border-[var(--muted)] disabled:opacity-50"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !password}
            className="px-4 py-2 bg-[var(--accent)] text-[var(--background)] text-sm font-mono font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {loading ? "..." : "→"}
          </button>
        </div>

        {error && (
          <p className="text-sm font-mono text-[var(--muted)]">{error}</p>
        )}
      </form>
    </div>
  );
}

export default function WhereIsYasir() {
  const [locationData, setLocationData] = useState<LocationResult | null>(null);
  const [approximateCity, setApproximateCity] = useState<string | null>(null);

  useEffect(() => {
    getApproximateCity().then(setApproximateCity);
  }, []);

  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto flex flex-col gap-16">
      <nav className="flex items-center justify-between text-sm text-[var(--muted)] font-mono">
        <Link
          href="/"
          className="text-[var(--foreground)] font-heading font-semibold tracking-tight hover:opacity-80 transition-opacity leading-none"
        >
          Yasir
        </Link>
        <span className="text-[#444]">/whereisyasir</span>
      </nav>

      <div className="flex flex-col gap-4">
        <h1 className="text-2xl md:text-4xl font-heading font-bold tracking-tight">
          Where is Yasir?
        </h1>

        {locationData ? (
          <LocationView data={locationData} />
        ) : (
          <PasswordGate onUnlock={setLocationData} approximateCity={approximateCity} />
        )}
      </div>
    </main>
  );
}
