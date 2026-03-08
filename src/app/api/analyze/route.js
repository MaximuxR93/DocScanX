import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";

export async function POST(req) {

  const data = await req.formData();
  const file = data.get("resume");

  const bytes = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {

    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const pageText = content.items.map(item => item.str).join(" ");

    text += pageText + " ";

  }

  return Response.json({
    resumeText: text
  });

}