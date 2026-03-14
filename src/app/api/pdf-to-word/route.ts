import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_SIZE = 20 * 1024 * 1024;

// Simple text extraction from PDF using pdf-lib content streams
async function extractTextFromPDF(buffer: Buffer): Promise<string[]> {
  try {
    // Use dynamic import for pdf-parse (handles both CJS and ESM exports)
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (pdfParseModule as any).default ?? pdfParseModule;
    const data = await pdfParse(buffer);
    // Split by form-feed character or double newline to get pages
    const pages = data.text.split(/\f/).filter((p: string) => p.trim().length > 0);
    return pages.length > 0 ? pages : [data.text];
  } catch {
    return ["[Text extraction failed. This PDF may contain scanned images rather than text.]"];
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large. Max 20MB." }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const pages = await extractTextFromPDF(buffer);

    // Build a Word document
    const sections: Paragraph[] = [
      new Paragraph({
        text: file.name.replace(/\.pdf$/i, ""),
        heading: HeadingLevel.TITLE,
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `Converted by Compressly | compressly.vercel.app`, color: "888888", size: 18 })],
        spacing: { after: 600 },
      }),
    ];

    pages.forEach((pageText, i) => {
      if (pages.length > 1) {
        sections.push(new Paragraph({
          text: `Page ${i + 1}`,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }));
      }
      const lines = pageText.split("\n").filter((l) => l.trim());
      lines.forEach((line) => {
        sections.push(new Paragraph({
          children: [new TextRun({ text: line.trim(), size: 24 })],
          spacing: { after: 120 },
        }));
      });
    });

    const doc = new Document({
      sections: [{ children: sections }],
      creator: "Compressly",
      title: file.name.replace(/\.pdf$/i, ""),
    });

    const docxBuffer = await Packer.toBuffer(doc);
    const outputName = file.name.replace(/\.pdf$/i, "") + ".docx";

    return new NextResponse(new Uint8Array(docxBuffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Length": docxBuffer.byteLength.toString(),
        "Content-Disposition": `attachment; filename="${outputName}"`,
      },
    });
  } catch (error) {
    console.error("PDF to Word error:", error);
    return NextResponse.json({ error: "Failed to convert PDF to Word." }, { status: 500 });
  }
}
