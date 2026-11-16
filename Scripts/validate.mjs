// Usage: node validate.mjs <baseUrl> <outDir> [logsDir]
// Needs WHEREISYASIR_PASSWORD set to the password the server under test was started with.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer-core";

const [baseUrl, outDir, logsDir] = process.argv.slice(2);
if (!baseUrl || !outDir) {
  console.error("usage: node validate.mjs <baseUrl> <outDir> [logsDir]");
  process.exit(2);
}
const password = process.env.WHEREISYASIR_PASSWORD;
if (!password) {
  console.error("WHEREISYASIR_PASSWORD must be set");
  process.exit(2);
}

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appDir = path.join(repo, "portfolio/src/app");
const contentDir = path.join(repo, "portfolio/content");
fs.mkdirSync(outDir, { recursive: true });
const startedAt = new Date();

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
}
function warn(name, detail) {
  results.push({ name, ok: true, warn: true, detail });
  console.log(`WARN  ${name}  (${detail})`);
}

// Every route file must be listed here, so a new route can't go untested.
const KNOWN_ROUTES = new Set([
  "page.tsx", "about/page.tsx", "contact/page.tsx", "now/page.tsx", "setup/page.tsx",
  "posts/page.tsx", "posts/[slug]/page.tsx", "projects/page.tsx", "projects/[slug]/page.tsx",
  "resume/page.tsx", "resume/docx/route.ts", "resume/print/route.ts",
  "whereisyasir/page.tsx", "api/log-headless-access/route.ts",
]);
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}
const routeFiles = walk(appDir)
  .map((f) => path.relative(appDir, f))
  .filter((f) => /(^|\/)(page|route)\.(tsx?|jsx?)$/.test(f));
const unknown = routeFiles.filter((f) => !KNOWN_ROUTES.has(f));
check("route inventory matches validate.mjs", unknown.length === 0, unknown.join(", "));
for (const f of KNOWN_ROUTES) if (!routeFiles.includes(f)) warn("route removed", f);

const slugs = (kind) => fs.readdirSync(path.join(contentDir, kind))
  .filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, ""));
const pages = [
  "/", "/about", "/contact", "/now", "/setup", "/posts", "/projects", "/resume", "/whereisyasir",
  ...slugs("posts").map((s) => `/posts/${s}`),
  ...slugs("projects").map((s) => `/projects/${s}`),
];

const REQUIRED_HEADERS = {
  "content-security-policy": /default-src 'self'/,
  "x-frame-options": /^DENY$/,
  "x-content-type-options": /^nosniff$/,
  "referrer-policy": /.+/,
};
function checkHeaders(name, res) {
  const missing = Object.entries(REQUIRED_HEADERS)
    .filter(([h, re]) => !re.test(res.headers.get(h) ?? "")).map(([h]) => h);
  check(`${name} security headers`, missing.length === 0, missing.join(", "));
}

// HTTP-level checks
for (const p of pages) {
  const res = await fetch(baseUrl + p);
  const body = await res.text();
  check(`GET ${p}`, res.status === 200 && /<title>/.test(body) && !/Application error/.test(body),
    `status ${res.status}`);
  checkHeaders(`GET ${p}`, res);
}
// The image optimizer is disabled (images.unoptimized); its URL must stay a 404 since it carries RCE advisories.
for (const p of ["/posts/no-such-post-xyz", "/projects/no-such-project-xyz", "/no-such-page-xyz",
  "/_next/image?url=%2Fhomeserver.jpg&w=640&q=75"]) {
  const res = await fetch(baseUrl + p);
  check(`GET ${p} is 404`, res.status === 404, `status ${res.status}`);
}

{
  const res = await fetch(baseUrl + "/resume/docx");
  const buf = Buffer.from(await res.arrayBuffer());
  const ok = res.status === 200 && /wordprocessingml/.test(res.headers.get("content-type") ?? "")
    && buf.subarray(0, 2).toString() === "PK" && buf.length > 5000;
  check("GET /resume/docx", ok, `status ${res.status}, ${buf.length} bytes`);
  check("/resume/docx X-Robots-Tag noindex", /noindex/.test(res.headers.get("x-robots-tag") ?? ""));
  fs.writeFileSync(path.join(outDir, "resume.docx"), buf);
}
{
  const res = await fetch(baseUrl + "/resume/print");
  const body = await res.text();
  check("GET /resume/print", res.status === 200 && /<html/i.test(body), `status ${res.status}`);
}
{
  const res = await fetch(baseUrl + "/api/log-headless-access", { method: "POST" });
  const json = await res.json().catch(() => null);
  check("POST /api/log-headless-access", res.status === 200 && json?.ok === true, `status ${res.status}`);
  const get = await fetch(baseUrl + "/api/log-headless-access");
  check("GET /api/log-headless-access is 405", get.status === 405, `status ${get.status}`);
}

// Browser-level checks
const chromeRoot = path.join(process.env.HOME, ".cache/puppeteer/chrome-headless-shell");
const chromeVer = fs.readdirSync(chromeRoot).sort().at(-1);
const executablePath = process.env.CHROME_PATH
  ?? path.join(chromeRoot, chromeVer, "chrome-headless-shell-linux64/chrome-headless-shell");
const browser = await puppeteer.launch({ executablePath, headless: true });
const origin = new URL(baseUrl).origin;

async function openPage(width, height) {
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  page.problems = [];
  page.on("pageerror", (e) => page.problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") page.problems.push(`console: ${m.text()}`); });
  page.on("requestfailed", (r) => {
    const msg = `requestfailed: ${r.url()} ${r.failure()?.errorText}`;
    // Navigating away aborts in-flight prefetches; that's noise, not a failure.
    if (r.failure()?.errorText !== "net::ERR_ABORTED") page.problems.push(msg);
  });
  return page;
}
const fileName = (p) => (p === "/" ? "home" : p.slice(1).replaceAll("/", "_"));

for (const [label, w, h] of [["desktop", 1280, 900], ["mobile", 390, 844]]) {
  for (const p of pages) {
    const page = await openPage(w, h);
    await page.goto(baseUrl + p, { waitUntil: "networkidle0", timeout: 30000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    await page.screenshot({ path: path.join(outDir, `${fileName(p)}-${label}.png`), fullPage: true });
    const sameOrigin = page.problems.filter((m) => m.includes(origin) || !m.startsWith("requestfailed"));
    const external = page.problems.filter((m) => !sameOrigin.includes(m));
    check(`render ${p} [${label}]`, sameOrigin.length === 0, sameOrigin.join(" | "));
    if (external.length) warn(`render ${p} [${label}] external`, external.join(" | "));
    if (overflow) warn(`render ${p} [${label}]`, "horizontal overflow");
    await page.close();
  }
}

{
  const page = await openPage(1280, 900);
  await page.goto(baseUrl + "/resume/print", { waitUntil: "networkidle0" });
  await page.pdf({ path: path.join(outDir, "resume-print.pdf"), format: "Letter", printBackground: true });
  check("print /resume/print to PDF", fs.statSync(path.join(outDir, "resume-print.pdf")).size > 5000);
  await page.close();
}

// Password gate. The server action has a per-IP limit of 10 attempts per 60s, so a rerun within a
// minute (against the same server) fails here.
async function submit(page, pw) {
  const input = 'input[type="password"]:not([disabled])';
  await page.waitForSelector(input, { timeout: 15000 });
  await page.$eval(input, (el) => { el.value = ""; });
  await page.type(input, pw);
  const done = page.waitForResponse((r) => r.request().method() === "POST", { timeout: 15000 });
  await page.click('button[type="submit"]');
  await done;
  await new Promise((r) => setTimeout(r, 300));
}
{
  const page = await openPage(1280, 900);
  await page.goto(baseUrl + "/whereisyasir", { waitUntil: "networkidle0" });
  const tileEtags = [];
  page.on("response", (r) => {
    if (r.request().resourceType() === "image" && r.url() !== baseUrl && !r.url().startsWith(origin)) {
      tileEtags.push(r.headers().etag ?? "");
    }
  });
  await submit(page, "definitely-wrong");
  check("whereisyasir wrong password rejected",
    await page.evaluate(() => document.body.innerText.includes("wrong password")));
  await submit(page, password);
  let mapOk = true;
  try {
    await page.waitForSelector(".leaflet-container", { timeout: 15000 });
    await page.waitForSelector(".leaflet-tile-loaded", { timeout: 15000 });
  } catch { mapOk = false; }
  check("whereisyasir correct password shows map with tiles", mapOk);
  // CARTO serves 200 "API KEY REQUIRED" placeholder tiles, marked only by a wm- etag. Accepted by the user.
  const watermarked = tileEtags.filter((e) => /"?wm-/.test(e)).length;
  if (watermarked) warn("whereisyasir map tiles", `${watermarked}/${tileEtags.length} are CARTO watermark placeholders`);
  await page.screenshot({ path: path.join(outDir, "whereisyasir-unlocked.png"), fullPage: true });
  await page.close();

  const limited = await openPage(1280, 900);
  await limited.goto(baseUrl + "/whereisyasir", { waitUntil: "networkidle0" });
  for (let i = 0; i < 10; i++) await submit(limited, `wrong-${i}`);
  await limited.close();
}
await browser.close();

// Log format is a contract with the production log shipping and alerting.
if (logsDir) {
  const lines = fs.readdirSync(logsDir).filter((f) => f.endsWith(".log")).flatMap((f) =>
    fs.readFileSync(path.join(logsDir, f), "utf-8").split("\n").filter(Boolean)
      .map((line) => ({ file: f, line })));
  check("log files match <name>-YYYY-MM.log",
    lines.every(({ file }) => /^[a-z-]+-\d{4}-\d{2}\.log$/.test(file)));
  const bad = lines.filter(({ line }) => !/^\S+ [A-Z0-9_-]+ ip=\S+( \S+)*$/.test(line));
  check("log lines match '<iso> <EVENT> ip=<ip>'", bad.length === 0, bad.slice(0, 3).map((b) => b.line).join(" | "));
  const recent = lines.filter(({ line }) => new Date(line.split(" ")[0]) >= startedAt);
  const seen = new Set(recent.map(({ file, line }) => `${file.replace(/-\d{4}-\d{2}\.log$/, "")} ${line.split(" ")[1]}`));
  for (const want of [
    "resume-access DOCX", "resume-access PRINT", "resume-access HEADLESS-BROWSER-DETECTED",
    "location-access ATTEMPT", "location-access SUCCESS", "location-access RATE-LIMITED",
  ]) check(`log event ${want}`, seen.has(want));
} else {
  warn("log contract", "skipped, no logsDir given");
}

const failed = results.filter((r) => !r.ok);
fs.writeFileSync(path.join(outDir, "results.json"), JSON.stringify(results, null, 2));
console.log(`\n${results.length - failed.length}/${results.length} passed, ${results.filter((r) => r.warn).length} warnings`);
process.exit(failed.length ? 1 : 0);
