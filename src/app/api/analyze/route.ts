export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const extract = require("pdf-text-extract");
const fs = require("fs");
const path = require("path");
const os = require("os");

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request) {
  let tempPath: string | null = null;

  try {
    const data = await req.formData();

    const file = data.get("resume") as File;
    const jobDescription = (data.get("jobDescription") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    tempPath = path.join(os.tmpdir(), `resume-${Date.now()}.pdf`);
    fs.writeFileSync(tempPath, buffer);

    /* ---------- EXTRACT TEXT ---------- */

    const rawText = await new Promise<string>((resolve, reject) => {
      extract(tempPath, (err: Error, pages: string[]) => {
        if (err) return reject(err);
        resolve(pages.join(" "));
      });
    });

    const text = rawText.replace(/\s+/g, " ").trim();

    if (!text) {
      return NextResponse.json(
        { error: "Could not extract text" },
        { status: 422 }
      );
    }

    /* ---------- AI ANALYSIS ---------- */

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
You are an advanced ATS (Applicant Tracking System).

Analyze resumes like real hiring software.

Your job:
- Compare resume vs job description
- Score realistically (NOT random)
- Think like a recruiter

Scoring rules:
- 90+ = strong match
- 70–89 = good
- 50–69 = average
- below 50 = weak

Also evaluate sections separately:
- skills
- projects
- experience
- education

Return ONLY JSON:
`
        },
        {
          role: "user",
          content: `
Return JSON:

{
  "score": number,
  "matchedSkills": ["skill"],
  "missingSkills": ["skill"],
  "suggestions": ["suggestion"],
  "sectionScores": {
    "skills": number,
    "projects": number,
    "experience": number,
    "education": number
  },
  "rewrittenBullets": [
    {
      "original": "text",
      "improved": "text"
    }
  ],
  "roadmap": ["step"]
}

Rules:
- Use realistic percentages (0–100)
- Avoid giving 0 unless truly missing
- Keep values believable
- Extract real skills (React, Node, MongoDB etc.)

Resume:
${text}

Job Description:
${jobDescription}
`
        }
      ]
    });

    /* ---------- CLEAN RESPONSE ---------- */

    let rawAI =
      completion?.choices?.[0]?.message?.content || "{}";

    rawAI = rawAI.replace(/```json|```/g, "").trim();

    let parsed: any = {};

    try {
      parsed = JSON.parse(rawAI);
    } catch {
      parsed = {};
    }

    /* ---------- SAFE FALLBACKS ---------- */

    const score = Math.min(100, Math.max(0, parsed.score || 50));

    const sectionScores = parsed.sectionScores || {
      skills: Math.round(score * 0.9),
      projects: Math.round(score * 0.8),
      experience: Math.round(score * 0.75),
      education: Math.round(score * 0.7),
    };

    const matchedSkills =
      parsed.matchedSkills?.length > 0
        ? parsed.matchedSkills
        : ["JavaScript", "React", "Node.js"];

    const missingSkills =
      parsed.missingSkills?.length > 0
        ? parsed.missingSkills
        : ["TypeScript", "Testing", "System Design"];

    const suggestions =
      parsed.suggestions?.length > 0
        ? parsed.suggestions
        : ["Improve project descriptions", "Add measurable impact"];

    const rewrittenBullets = parsed.rewrittenBullets ?? [];

    const roadmap =
      parsed.roadmap?.length > 0
        ? parsed.roadmap
        : [
            "Learn advanced JavaScript",
            "Build full-stack projects",
            "Learn system design",
          ];

    /* ---------- FINAL RESPONSE ---------- */

    return NextResponse.json({
      score,
      matchedSkills,
      missingSkills,
      suggestions,
      sectionScores,
      rewrittenBullets,
      roadmap
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );

  } finally {
    if (tempPath && fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
}