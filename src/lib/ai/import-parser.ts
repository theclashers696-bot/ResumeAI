import { generateJSON } from "./gemini";
import type { ParsedResume } from "@/lib/resume-parser";

const SYSTEM_INSTRUCTION = `You are a professional resume parser. Given raw text extracted from a resume, extract structured information accurately. Return ONLY valid JSON. Normalize dates to "Month YYYY" or "YYYY" format. For current positions, set endDate to null and current to true. Infer skill levels from context (BEGINNER/INTERMEDIATE/ADVANCED/EXPERT). Deduplicate skills. Fix grammar and punctuation in descriptions. Separate achievements from descriptions for work experience.`;

const PROMPT_TEMPLATE = (text: string) => `
Parse the following resume text and return a JSON object with this exact structure:

{
  "fullName": string | null,
  "headline": string | null,
  "email": string | null,
  "phone": string | null,
  "location": string | null,
  "website": string | null,
  "portfolio": string | null,
  "github": string | null,
  "linkedin": string | null,
  "twitter": string | null,
  "summary": string | null,
  "workExperiences": [
    {
      "company": string,
      "position": string,
      "location": string | null,
      "startDate": string,
      "endDate": string | null,
      "current": boolean,
      "description": string | null,
      "achievements": string[],
      "technologies": string[]
    }
  ],
  "educations": [
    {
      "institution": string,
      "degree": string,
      "fieldOfStudy": string | null,
      "location": string | null,
      "startDate": string,
      "endDate": string | null,
      "current": boolean,
      "gpa": string | null,
      "description": string | null
    }
  ],
  "skills": [
    {
      "name": string,
      "category": string | null,
      "level": "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT"
    }
  ],
  "projects": [
    {
      "name": string,
      "description": string | null,
      "url": string | null,
      "github": string | null,
      "technologies": string[],
      "startDate": string | null,
      "endDate": string | null
    }
  ],
  "certifications": [
    {
      "name": string,
      "issuer": string,
      "issueDate": string,
      "expiryDate": string | null,
      "credentialId": string | null,
      "url": string | null
    }
  ],
  "languages": [
    {
      "name": string,
      "proficiency": string
    }
  ],
  "awards": [
    {
      "title": string,
      "issuer": string | null,
      "date": string | null,
      "description": string | null
    }
  ],
  "achievements": [
    {
      "title": string,
      "description": string | null,
      "date": string | null
    }
  ],
  "references": [
    {
      "name": string,
      "company": string | null,
      "position": string | null,
      "phone": string | null,
      "email": string | null
    }
  ]
}

Resume text:
---
${text.slice(0, 12000)}
---

Return ONLY the JSON object, no markdown, no explanation.
`;

export async function aiParseResume(rawText: string): Promise<ParsedResume> {
  const prompt = PROMPT_TEMPLATE(rawText);
  const result = await generateJSON<ParsedResume>(prompt, {
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: 0.2,
    maxOutputTokens: 4096,
  });
  return result;
}

export async function aiEnhanceResume(parsed: ParsedResume): Promise<ParsedResume> {
  const prompt = `
You are a professional resume writer. Review and improve this parsed resume data.
Fix any errors, improve professional language, normalize dates, remove duplicates, and fill in obvious gaps.

Current data:
${JSON.stringify(parsed, null, 2).slice(0, 8000)}

Return the improved version as valid JSON with the exact same structure. No markdown, no explanation.
`;

  const result = await generateJSON<ParsedResume>(prompt, {
    systemInstruction: "You are a professional resume editor. Return only valid JSON.",
    temperature: 0.3,
    maxOutputTokens: 4096,
  });
  return result;
}
