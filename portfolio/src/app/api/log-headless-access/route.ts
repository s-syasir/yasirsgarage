import { NextResponse } from "next/server";
import { logAccess } from "@/lib/access-log";

export async function POST() {
  try {
    await logAccess("resume-access", "headless-browser-detected");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
