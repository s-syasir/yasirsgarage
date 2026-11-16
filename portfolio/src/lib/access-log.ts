import fs from "fs";
import path from "path";
import { headers } from "next/headers";

export async function logAccess(logName: string, event: string) {
  try {
    const h = await headers();
    const ip = h.get("cf-connecting-ip") ?? h.get("x-forwarded-for") ?? "unknown";
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const dir = process.env.LOGS_DIR ?? path.join(process.cwd(), "data", "logs");
    const logFile = path.join(dir, `${logName}-${month}.log`);
    const line = `${now.toISOString()} ${event.toUpperCase()} ip=${ip}\n`;
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(logFile, line);
  } catch {
    // logging is best-effort, never block the request
  }
}
