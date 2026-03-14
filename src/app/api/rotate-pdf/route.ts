import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, degrees } from "pdf-lib";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const rotation = parseInt(formData.get("rotation") as string) || 90;

    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large. Max 50MB." }, { status: 400 });
    if (![90, 180, 270].includes(rotation)) return NextResponse.json({ error: "Invalid rotation. Use 90, 180, or 270." }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();

    pages.forEach((page) => {
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + rotation) % 360));
    });

    // Strip metadata
    pdfDoc.setTitle(""); pdfDoc.setAuthor(""); pdfDoc.setProducer(""); pdfDoc.setCreator("");

    const result = await pdfDoc.save({ useObjectStreams: true });
    return new NextResponse(new Uint8Array(result), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": result.byteLength.toString(),
        "Content-Disposition": `attachment; filename="rotated-${file.name}"`,
      },
    });
  } catch (error) {
    console.error("Rotate PDF error:", error);
    return NextResponse.json({ error: "Failed to rotate PDF." }, { status: 500 });
  }
}
