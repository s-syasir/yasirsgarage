import { NextResponse } from "next/server";
import { getResumeHtml } from "@/lib/resume-html";
import { logAccess } from "@/lib/access-log";

export async function GET() {
  await logAccess("resume-access", "print");
  return new NextResponse(getResumeHtml({ printButton: true }), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
