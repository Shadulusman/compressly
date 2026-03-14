import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const text = ((formData.get("text") as string) || "CONFIDENTIAL").toUpperCase().slice(0, 50);
    const opacity = Math.min(1, Math.max(0.05, parseFloat(formData.get("opacity") as string) || 0.2));

    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large. Max 50MB." }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();

    pages.forEach((page) => {
      const { width, height } = page.getSize();
      const fontSize = Math.max(20, Math.min(60, width / (text.length * 0.55)));
      const textWidth = font.widthOfTextAtSize(text, fontSize);

      page.drawText(text, {
        x: (width - textWidth) / 2,
        y: (height - fontSize) / 2,
        size: fontSize,
        font,
        color: rgb(0.5, 0.5, 0.5),
        opacity,
        rotate: degrees(45),
      });
    });

    pdfDoc.setTitle(""); pdfDoc.setProducer(""); pdfDoc.setCreator("");
    const result = await pdfDoc.save({ useObjectStreams: true });
    return new NextResponse(new Uint8Array(result), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": result.byteLength.toString(),
        "Content-Disposition": `attachment; filename="watermarked-${file.name}"`,
      },
    });
  } catch (error) {
    console.error("Watermark PDF error:", error);
    return NextResponse.json({ error: "Failed to add watermark." }, { status: 500 });
  }
}
