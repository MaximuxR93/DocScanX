export const runtime = "nodejs";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const extract = require("pdf-text-extract");
const fs = require("fs");
const path = require("path");

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get("resume");

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Save temp PDF file
    const tempPath = path.join(process.cwd(), "temp.pdf");
    fs.writeFileSync(tempPath, buffer);

    // Extract text
    const text = await new Promise((resolve, reject) => {
      extract(tempPath, function (err, pages) {
        if (err) reject(err);
        else resolve(pages.join(" "));
      });
    });

    fs.unlinkSync(tempPath);

    if (!text) {
      return Response.json(
        { error: "Could not extract text from PDF" },
        { status: 422 }
      );
    }

    // Send to Ollama
    const aiRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3.1",
        prompt: `You are an ATS resume analyzer.

Analyze this resume and return:

ATS Score: (0-100)

Detected Skills:
- skill

Missing Skills:
- skill

Suggestions:
- suggestion

Resume:
${text}`,
        stream: false
      })
    });

    const result = await aiRes.json();

    return Response.json({
      analysis: result.response || "No analysis returned."
    });

  } catch (error) {
    console.error(error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}