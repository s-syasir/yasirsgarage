import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

dotenv.config({ path: join(homedir(), "yasirsgarageData", ".env") });

const app = express();
app.use(express.json());

const PORT = parseInt(process.env.PORT ?? "3001");
const PORT_DOCKER = parseInt(process.env.PORT_DOCKER ?? "3002");
const DATA_DIR = process.env.DATA_DIR;
if (!DATA_DIR) {
  throw new Error("DATA_DIR environment variable is required");
}
const LOCATION_FILE = join(DATA_DIR, "location.json");
const HISTORY_FILE = join(DATA_DIR, "location-history.json");

interface LocationEntry {
  city: string;
  lat: number;
  lon: number;
  arrivedAt: string;
}

function readCurrentCity(): string | null {
  try {
    const data = JSON.parse(readFileSync(LOCATION_FILE, "utf-8"));
    return data.city ?? null;
  } catch {
    return null;
  }
}

const HISTORY_MAX_AGE_MS = 40 * 24 * 60 * 60 * 1000;

function appendHistory(entry: LocationEntry): void {
  let history: LocationEntry[] = [];
  if (existsSync(HISTORY_FILE)) {
    try {
      history = JSON.parse(readFileSync(HISTORY_FILE, "utf-8"));
    } catch {
      history = [];
    }
  }
  history.push(entry);
  const cutoff = Date.now() - HISTORY_MAX_AGE_MS;
  history = history.filter((e) => new Date(e.arrivedAt).getTime() >= cutoff);
  writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
  const res = await fetch(url, {
    headers: { "User-Agent": "yasirsgarage-portfolio/1.0" }
  });
  const data = await res.json() as any;
  return data.address?.city
    || data.address?.town
    || data.address?.village
    || data.address?.county
    || "Unknown";
}

app.post("/location", async (req, res) => {
  const { lat, lon } = req.body;
  console.log("[location] received body:", JSON.stringify(req.body));

  if (typeof lat !== "number" || typeof lon !== "number") {
    console.log("[location] rejected: lat type=%s lon type=%s", typeof lat, typeof lon);
    res.status(400).json({ error: "Invalid coordinates" });
    return;
  }

  try {
    const city = await reverseGeocode(lat, lon);
    const now = new Date().toISOString();

    mkdirSync(DATA_DIR, { recursive: true });

    // Append to history when the city changes
    const previousCity = readCurrentCity();
    if (previousCity !== city) {
      appendHistory({ city, lat, lon, arrivedAt: now });
    }

    writeFileSync(LOCATION_FILE, JSON.stringify({ city, lat, lon, updatedAt: now }));
    res.json({ success: true, city });
  } catch (err) {
    res.status(500).json({ error: "Failed to process location" });
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Location service running on 127.0.0.1:${PORT}`);
});

// Second listener for the reverse proxy, which runs on a different machine. Restrict this port with a firewall.
const HOST_DOCKER = process.env.HOST_DOCKER ?? "0.0.0.0";
createServer(app).listen(PORT_DOCKER, HOST_DOCKER, () => {
  console.log(`Location service running on ${HOST_DOCKER}:${PORT_DOCKER}`);
}).on("error", (err: NodeJS.ErrnoException) => {
  console.warn(`Warning: could not bind to ${HOST_DOCKER}:${PORT_DOCKER} - ${err.message}`);
});
