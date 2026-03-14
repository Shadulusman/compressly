import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_SIZE = 20 * 1024 * 1024;
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large. Max 20MB." }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    // Use mammoth to extract text from docx
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer: buffer as Buffer });
    const text = result.value || "Could not extract text from this document.";

    // Build a PDF
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 11;
    const lineHeight = fontSize * 1.5;
    const maxWidth = PAGE_WIDTH - MARGIN * 2;

    const wrapText = (str: string, maxW: number, fSize: number): string[] => {
      const words = str.split(" ");
      const lines: string[] = [];
      let current = "";
      for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (font.widthOfTextAtSize(test, fSize) <= maxW) {
          current = test;
        } else {
          if (current) lines.push(current);
          current = word;
        }
      }
      if (current) lines.push(current);
      return lines;
    };

    const allLines: { text: string; isHeading?: boolean }[] = [];
    // Add title
    const docTitle = file.name.replace(/\.(docx|doc)$/i, "");
    allLines.push({ text: docTitle, isHeading: true });
    allLines.push({ text: "" });

    const paragraphs = text.split(/\n+/).filter((p) => p.trim());
    for (const para of paragraphs) {
      const wrapped = wrapText(para.trim(), maxWidth, fontSize);
      wrapped.forEach((l) => allLines.push({ text: l }));
      allLines.push({ text: "" }); // paragraph spacing
    }

    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT - MARGIN;

    for (const line of allLines) {
      if (y < MARGIN + lineHeight) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        y = PAGE_HEIGHT - MARGIN;
      }
      if (line.text.trim() === "") {
        y -= lineHeight * 0.5;
        continue;
      }
      page.drawText(line.text, {
        x: MARGIN,
        y,
        size: line.isHeading ? 16 : fontSize,
        font: line.isHeading ? boldFont : font,
        color: rgb(0, 0, 0),
        maxWidth,
      });
      y -= line.isHeading ? lineHeight * 1.6 : lineHeight;
    }

    // Footer on last page
    page.drawText("Converted by Compressly | compressly.vercel.app", {
      x: MARGIN,
      y: MARGIN / 2,
      size: 8,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });

    pdfDoc.setTitle(docTitle);
    pdfDoc.setCreator("Compressly");
    const output = await pdfDoc.save();
    const outputName = file.name.replace(/\.(docx|doc)$/i, "") + ".pdf";

    return new NextResponse(new Uint8Array(output), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": output.byteLength.toString(),
        "Content-Disposition": `attachment; filename="${outputName}"`,
      },
    });
  } catch (error) {
    console.error("Word to PDF error:", error);
    return NextResponse.json({ error: "Failed to convert Word document to PDF." }, { status: 500 });
  }
}
