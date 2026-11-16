"use server";

import fs from "fs";
import path from "path";
import { logAccess } from "@/lib/access-log";

export interface LocationData {
  city: string;
  lat: number;
  lon: number;
  updatedAt: string;
}

export interface LocationEntry {
  city: string;
  lat: number;
  lon: number;
  arrivedAt: string;
}

export interface LocationResult {
  location: LocationData;
  history: LocationEntry[];
}

export interface CheckPasswordResult {
  data?: LocationResult;
  error?: string;
}

export async function getApproximateCity(): Promise<string | null> {
  try {
    const locationPath = path.join(process.cwd(), "data", "location.json");
    const data: LocationData = JSON.parse(fs.readFileSync(locationPath, "utf-8"));

    // Reverse geocode at state/region level (zoom=5) for the password gate hint —
    // coarser than the city stored in location.json
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${data.lat}&lon=${data.lon}&format=json&zoom=10`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      headers: { "User-Agent": "yasirsgarage-portfolio/1.0" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const geo = await res.json() as { name?: string; address?: { state?: string; country?: string } };
    return geo.name ?? geo.address?.state ?? geo.address?.country ?? data.city ?? null;
  } catch {
    return null;
  }
}

const attemptRateLimit = new Map<string, { count: number; resetAt: number }>();

export async function checkPassword(
  password: string
): Promise<CheckPasswordResult> {
  const correct = process.env.WHEREISYASIR_PASSWORD;

  if (!correct) {
    return { error: "not configured" };
  }

  const h = await (await import("next/headers")).headers();
  const ip = h.get("cf-connecting-ip") ?? h.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  const record = attemptRateLimit.get(ip) ?? { count: 0, resetAt: now + 60000 };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + 60000;
  }

  record.count++;
  attemptRateLimit.set(ip, record);

  if (record.count > 10) {
    await logAccess("location-access", "rate-limited");
    return { error: "too many attempts" };
  }

  if (password !== correct) {
    await logAccess("location-access", "attempt");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { error: "wrong password" };
  }

  await logAccess("location-access", "success");

  try {
    const locationPath = path.join(process.cwd(), "data", "location.json");
    const historyPath = path.join(process.cwd(), "data", "location-history.json");

    const location: LocationData = JSON.parse(
      fs.readFileSync(locationPath, "utf-8")
    );

    let history: LocationEntry[] = [];
    try {
      history = JSON.parse(fs.readFileSync(historyPath, "utf-8"));
    } catch {
      // history file missing or malformed — treat as empty
    }

    return { data: { location, history } };
  } catch {
    return { error: "location data unavailable" };
  }
}
