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

    const file = data.get("resume") as File | null;
    const jobDescription = (data.get("jobDescription") as string) || "";

    if (!file) {
      return NextResponse.json(
        { error: "No resume uploaded" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    tempPath = path.join(os.tmpdir(), `resume-${Date.now()}.pdf`);
    fs.writeFileSync(tempPath, buffer);

    /* -----------------------------
       Extract text from PDF
    ----------------------------- */

    const rawText = await new Promise<string>((resolve, reject) => {

      extract(tempPath, (err: Error, pages: string[]) => {
        if (err) return reject(err);
        resolve(pages.join(" "));
      });

    });

    const text = rawText
      .replace(/\s+/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .trim();

    if (!text) {
      return NextResponse.json(
        { error: "Could not extract text from PDF" },
        { status: 422 }
      );
    }

    /* -----------------------------
       Ask Groq AI
    ----------------------------- */

    const completion = await groq.chat.completions.create({

      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content: "You are an ATS resume analyzer."
        },
        {
          role: "user",
          content: `
You are an ATS system.

Extract relevant technical skills from the resume and compare them
with the job description.

Return ONLY JSON in this format:

{
  "matchedSkills": ["skill"],
  "missingSkills": ["skill"],
  "suggestions": ["suggestion"]
}

Important rules:
- Only include REAL technical skills.
- Ignore generic words like "developer".
- Normalize skill names (JS -> JavaScript).

Resume:
${text}

Job Description:
${jobDescription}
`
        }
      ]

    });

    /* -----------------------------
       Clean AI output
    ----------------------------- */

    let rawAI =
      completion?.choices?.[0]?.message?.content || "{}";

    // remove markdown code blocks if AI adds them

    rawAI = rawAI.replace(/```json|```/g, "").trim();

    let parsed;

    try {
      parsed = JSON.parse(rawAI);
    } catch {
      parsed = {
        score: 0,
        matchedSkills: [],
        missingSkills: [],
        suggestions: ["AI response parsing failed"]
      };
    }

    /* -----------------------------
       Safe score validation
    ----------------------------- */

    let score = Number(parsed.score) || 0;

    if (score < 0) score = 0;
    if (score > 100) score = 100;

    /* -----------------------------
       Keyword Scanner
    ----------------------------- */

    const keywords =
      jobDescription
        .toLowerCase()
        .match(/\b[a-zA-Z+#.]+\b/g) || [];

    const uniqueKeywords = [...new Set(keywords)];

    const keywordScan = uniqueKeywords
      .slice(0, 40)
      .map((keyword) => ({
        keyword,
        found: text.toLowerCase().includes(keyword)
      }));

    /* -----------------------------
       Response
    ----------------------------- */

    const matched = parsed.matchedSkills?.length || 0;
const missing = parsed.missingSkills?.length || 0;

const total = matched + missing;

const calculatedScore =
  total > 0 ? Math.round((matched / total) * 100) : 0;

return NextResponse.json({
  score: calculatedScore,
  matchedSkills: parsed.matchedSkills ?? [],
  missingSkills: parsed.missingSkills ?? [],
  suggestions: parsed.suggestions ?? [],
  keywordScan
});

  } catch (error) {

    console.error("Resume analysis error:", error);

    return NextResponse.json(
      { error: "Resume analysis failed." },
      { status: 500 }
    );

  } finally {

    if (tempPath && fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }

  }
}