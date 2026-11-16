import fs from "fs";
import path from "path";

export interface ResumeLink {
  label: string;
  url: string;
}

export interface Resume {
  name: string;
  contact: {
    email: string;
    phone: string;
    linkedin: ResumeLink;
    github: ResumeLink;
    website: ResumeLink;
  };
  education: {
    institution: string;
    location: string;
    degree: string;
  }[];
  experience: {
    org: string;
    location: string;
    role: string;
    dates: string;
    bullets: string[];
  }[];
  projects: {
    name: string;
    location: string;
    role: string;
    dates: string;
    bullets: string[];
    github?: string;
  }[];
  skills: {
    category: string;
    items: string;
  }[];
}

let cached: Resume | null = null;

// resume.json is gitignored (real contact details); the committed example keeps
// clones and CI building. In production, reads from /app/resume (mounted from host).
export function getResume(): Resume {
  if (cached) return cached;

  let file: string;
  if (process.env.NODE_ENV === "production") {
    file = "/app/resume/resume.json";
    if (!fs.existsSync(/*turbopackIgnore: true*/ file)) {
      file = path.join(process.cwd(), "..", "resume.example.json");
    }
  } else {
    const real = path.join(process.cwd(), "resume.json");
    const example = path.join(process.cwd(), "..", "resume.example.json");
    file = fs.existsSync(real) ? real : example;
  }

  cached = JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ file, "utf-8")) as Resume;
  return cached;
}
