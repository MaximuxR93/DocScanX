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
      return NextResponse.json(
        { error: "No file uploaded" },
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

    // Extract text from PDF

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

    // Ask Groq AI

    const completion = await groq.chat.completions.create({

      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "user",
          content: `
You are an ATS system.

Return ONLY valid JSON in this format:

{
  "score": number,
  "matchedSkills": ["skill"],
  "missingSkills": ["skill"],
  "suggestions": ["suggestion"]
}

Compare the resume with the job description.

Resume:
${text}

Job Description:
${jobDescription}
`
        }
      ]

    });

    const rawAI =
      completion?.choices?.[0]?.message?.content || "{}";

    let parsed;

    try {
      parsed = JSON.parse(rawAI);
    } catch {
      parsed = {
        score: 0,
        matchedSkills: [],
        missingSkills: [],
        suggestions: []
      };
    }

    // Keyword scanning

    const keywords =
      jobDescription.toLowerCase().match(/\b[a-zA-Z+#.]+\b/g) || [];

    const uniqueKeywords = [...new Set(keywords)];

    const keywordScan = uniqueKeywords.slice(0, 40).map((keyword) => ({
      keyword,
      found: text.toLowerCase().includes(keyword)
    }));

    return NextResponse.json({
      score: parsed.score ?? 0,
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