import { NextResponse } from "next/server";
import {
  Document,
  ExternalHyperlink,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  TabStopType,
  BorderStyle,
  convertInchesToTwip,
} from "docx";
import { logAccess } from "@/lib/access-log";
import { getResume } from "@/lib/resume";

const PT = (pt: number) => pt * 2; // half-points
const TWIP = (pt: number) => pt * 20; // twips

const SUBHEADER = PT(12); // company names, roles, section titles
const BODY = PT(11);      // bullets, skills
const SMALL = PT(11);     // contact info
const CONTACT = PT(10);   // contact line only, sized to fit on one line

// Tab stop must match actual content width (page - both margins)
const RIGHT_TAB = convertInchesToTwip(8.5) - 2 * convertInchesToTwip(0.5);

function sectionHeader(title: string): Paragraph {
  return new Paragraph({
    spacing: { before: TWIP(5), after: TWIP(2) },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 } },
    children: [new TextRun({ text: title.toUpperCase(), bold: true, size: SUBHEADER })],
  });
}

function entryRow(left: string, right: string, bold = false, rightUrl?: string): Paragraph {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
    spacing: { before: 0, after: 0 },
    children: [
      new TextRun({ text: left, bold, size: SUBHEADER }),
      new TextRun({ text: "\t" }),
      rightUrl
        ? new ExternalHyperlink({
            link: rightUrl,
            children: [new TextRun({ text: right, bold, size: SUBHEADER, color: "1a5ca8" })],
          })
        : new TextRun({ text: right, bold, size: SUBHEADER }),
    ],
  });
}

function roleRow(left: string, right: string): Paragraph {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
    spacing: { before: 0, after: TWIP(1.5) },
    children: [
      new TextRun({ text: left, italics: true, size: SUBHEADER }),
      new TextRun({ text: "\t" }),
      new TextRun({ text: right, italics: true, size: SUBHEADER }),
    ],
  });
}

function bullet(text: string, spacingAfter = TWIP(1)): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 0, after: spacingAfter },
    children: [new TextRun({ text, size: SMALL })],
  });
}

function entryBullets(items: string[]): Paragraph[] {
  return items.map((text, i) => bullet(text, i === items.length - 1 ? TWIP(6) : TWIP(1)));
}

export async function GET() {
  await logAccess("resume-access", "docx");
  const { name, contact, education, experience, projects, skills } = getResume();

  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: TWIP(2) },
      children: [new TextRun({ text: name, bold: true, size: PT(22) })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: TWIP(5) },
      children: [
        new ExternalHyperlink({
          link: `mailto:${contact.email}`,
          children: [new TextRun({ text: contact.email, size: CONTACT, color: "1a5ca8" })],
        }),
        new TextRun({ text: " | ", size: CONTACT, color: "888888" }),
        new ExternalHyperlink({
          link: contact.linkedin.url,
          children: [new TextRun({ text: contact.linkedin.label, size: CONTACT, color: "1a5ca8" })],
        }),
        new TextRun({ text: " | ", size: CONTACT, color: "888888" }),
        new ExternalHyperlink({
          link: contact.github.url,
          children: [new TextRun({ text: contact.github.label, size: CONTACT, color: "1a5ca8" })],
        }),
        new TextRun({ text: " | ", size: CONTACT, color: "888888" }),
        new ExternalHyperlink({
          link: contact.website.url,
          children: [new TextRun({ text: contact.website.label, size: CONTACT, color: "1a5ca8" })],
        }),
        new TextRun({ text: " | ", size: CONTACT, color: "888888" }),
        new TextRun({ text: contact.phone, size: CONTACT }),
      ],
    }),

    sectionHeader("Education"),
    ...education.flatMap((e) => [
      entryRow(e.institution, e.location),
      new Paragraph({
        spacing: { before: 0, after: TWIP(3) },
        children: [new TextRun({ text: e.degree, italics: true, size: BODY })],
      }),
    ]),

    sectionHeader("Professional Experience"),
    ...experience.flatMap((e) => [
      entryRow(e.org, e.location, true),
      roleRow(e.role, e.dates),
      ...entryBullets(e.bullets),
    ]),

    sectionHeader("Projects"),
    ...projects.flatMap((p) => [
      entryRow(p.name, p.location, true, "github" in p ? p.github : undefined),
      roleRow(p.role, p.dates),
      ...entryBullets(p.bullets),
    ]),

    sectionHeader("Skills"),
    ...skills.map(
      (s) =>
        new Paragraph({
          spacing: { before: 0, after: TWIP(1.5) },
          children: [
            new TextRun({ text: `${s.category}: `, italics: true, size: SMALL }),
            new TextRun({ text: s.items, size: SMALL }),
          ],
        })
    ),
    new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [
        new ExternalHyperlink({
          link: "mailto:honeytop.in5zn@simplelogin.com",
          children: [new TextRun({ text: "a", size: 1, color: "ffffff" })],
        }),
      ],
    }),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: convertInchesToTwip(8.5),
              height: convertInchesToTwip(11),
            },
            margin: {
              top: convertInchesToTwip(0.2),
              right: convertInchesToTwip(0.5),
              bottom: convertInchesToTwip(0.2),
              left: convertInchesToTwip(0.5),
            },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${name} - Resume.docx"`,
    },
  });
}
