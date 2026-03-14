import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_SIZE = 30 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) return NextResponse.json({ error: "No images provided." }, { status: 400 });

    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      // Convert any image to JPEG first using sharp for consistency
      const jpegBuffer = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();
      const meta = await sharp(jpegBuffer).metadata();
      const w = meta.width || 595;
      const h = meta.height || 842;

      const embeddedImage = await pdfDoc.embedJpg(jpegBuffer);

      // A4 size or image size, whichever fits nicely
      const pageW = 595.28;
      const pageH = 841.89;
      const scale = Math.min(pageW / w, pageH / h);
      const drawW = w * scale;
      const drawH = h * scale;
      const x = (pageW - drawW) / 2;
      const y = (pageH - drawH) / 2;

      const page = pdfDoc.addPage([pageW, pageH]);
      page.drawImage(embeddedImage, { x, y, width: drawW, height: drawH });
    }

    const result = await pdfDoc.save();
    return new NextResponse(new Uint8Array(result), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": result.byteLength.toString(),
        "Content-Disposition": 'attachment; filename="converted.pdf"',
      },
    });
  } catch (error) {
    console.error("Image to PDF error:", error);
    return NextResponse.json({ error: "Failed to convert images to PDF." }, { status: 500 });
  }
}
