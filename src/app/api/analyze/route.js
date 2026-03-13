import * as pdfParse from "pdf-parse";

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get("resume");

    if (!file) {
      return Response.json({ error: "No file uploaded" });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // dynamic import (fixes turbopack esm issue)
    const pdfParse = (await import("pdf-parse")).default;

    const pdfData = await pdfParse(buffer);

    return Response.json({
      resumeText: pdfData.text
    });

  } catch (error) {
    console.error("PDF ERROR:", error);

    return Response.json({
      error: "PDF parsing failed"
    });
  }
}