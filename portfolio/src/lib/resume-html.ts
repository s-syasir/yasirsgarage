import { getResume } from "./resume";

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function bullets(items: string[]): string {
  if (!items.length) return "";
  return `<ul class="bullets">${items.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;
}

export function getResumeHtml({ printButton = false }: { printButton?: boolean } = {}): string {
  const { name, contact, education, experience, projects, skills } = getResume();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(name)} | Resume</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: "Times New Roman", Times, serif;
      font-size: 11pt;
      color: #000;
      background: #fff;
      max-width: 760px;
      margin: 0 auto;
      padding: 40px 48px;
    }

    .print-bar {
      text-align: right;
      margin-bottom: 16px;
    }

    .print-bar button {
      background: #1a5ca8;
      color: #fff;
      border: none;
      padding: 6px 12px;
      font-family: inherit;
      font-size: 9.5pt;
      cursor: pointer;
    }

    .r-name {
      text-align: center;
      font-size: 22pt;
      font-weight: 700;
      margin-bottom: 3pt;
    }

    .r-contact {
      text-align: center;
      font-size: 10pt;
      margin-bottom: 6pt;
      white-space: nowrap;
    }

    .r-contact a { color: #1a5ca8; text-decoration: none; }

    .r-sep { margin: 0 3pt; color: #888; }

    .r-nowrap { white-space: nowrap; }

    .r-section { margin-top: 6pt; }

    .r-section-title {
      font-size: 12pt;
      font-weight: 700;
      text-transform: uppercase;
      border-bottom: 1.5px solid #000;
      padding-bottom: 1pt;
      margin-bottom: 3pt;
    }

    .r-entry {
      margin-bottom: 4pt;
      page-break-inside: avoid;
    }

    .r-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 12pt;
    }

    .bullets {
      margin: 1.5pt 0 0 14pt;
      list-style: disc;
    }

    .bullets li {
      font-size: 11pt;
      margin-bottom: 1pt;
      line-height: 1.25;
    }

    .skills-row {
      display: flex;
      gap: 8pt;
      font-size: 11pt;
      margin-bottom: 1.5pt;
    }

    .skills-cat {
      font-style: italic;
      min-width: 100pt;
      flex-shrink: 0;
    }

    @media print {
      .print-bar { display: none; }
      body { padding: 0; max-width: 100%; }
      @page { margin: 0.2in 0.5in; }
    }
  </style>
</head>
<body>
  ${
    printButton
      ? `<div class="print-bar">
    <button onclick="window.print()">Print / Save as PDF</button>
    <button onclick="alert('NOTE: Browser MAY/MIGHT add header/footer info. Use the Download buttons on the Resume page for a cleaner output.')" style="background:#c0392b;color:#fff;">NOTE</button>
  </div>`
      : ""
  }

  <div class="r-name">${esc(name)}</div>
  <div class="r-contact">
    <a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>
    <span class="r-sep">|</span>
    <a href="${esc(contact.linkedin.url)}">${esc(contact.linkedin.label)}</a>
    <span class="r-sep">|</span>
    <a href="${esc(contact.github.url)}">${esc(contact.github.label)}</a>
    <span class="r-sep">|</span>
    <a href="${esc(contact.website.url)}">${esc(contact.website.label)}</a>
    <span class="r-sep">|</span>
    <span class="r-nowrap">${esc(contact.phone)}</span>
  </div>

  <div class="r-section">
    <div class="r-section-title">Education</div>
    ${education
      .map(
        (e) => `
    <div class="r-entry">
      <div class="r-row">
        <strong>${esc(e.institution)}</strong>
        <span>${esc(e.location)}</span>
      </div>
      <div><em>${esc(e.degree)}</em></div>
    </div>`
      )
      .join("")}
  </div>

  <div class="r-section">
    <div class="r-section-title">Professional Experience</div>
    ${experience
      .map(
        (e) => `
    <div class="r-entry">
      <div class="r-row">
        <strong>${esc(e.org)}</strong>
        <strong>${esc(e.location)}</strong>
      </div>
      <div class="r-row">
        <em>${esc(e.role)}</em>
        <em>${esc(e.dates)}</em>
      </div>
      ${bullets(e.bullets)}
    </div>`
      )
      .join("")}
  </div>

  <div class="r-section">
    <div class="r-section-title">Projects</div>
    ${projects
      .map(
        (p) => `
    <div class="r-entry">
      <div class="r-row">
        <strong>${esc(p.name)}</strong>
        <strong>${
          "github" in p && p.github
            ? `<a href="${esc(p.github)}">${esc(p.location)}</a>`
            : esc(p.location)
        }</strong>
      </div>
      <div class="r-row">
        <em>${esc(p.role)}</em>
        <em>${esc(p.dates)}</em>
      </div>
      ${bullets(p.bullets)}
    </div>`
      )
      .join("")}
  </div>

  <div class="r-section">
    <div class="r-section-title">Skills</div>
    ${skills
      .map(
        (s) => `
    <div class="skills-row">
      <span class="skills-cat">${esc(s.category)}:</span>
      <span>${esc(s.items)}</span>
    </div>`
      )
      .join("")}
  </div>
</body>
</html>`;
}
