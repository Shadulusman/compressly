import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large. Max 50MB." }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

    // Remove metadata + save without encryption
    pdfDoc.setTitle(""); pdfDoc.setAuthor(""); pdfDoc.setProducer(""); pdfDoc.setCreator("");

    const result = await pdfDoc.save({ useObjectStreams: true });
    return new NextResponse(new Uint8Array(result), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": result.byteLength.toString(),
        "Content-Disposition": `attachment; filename="unlocked-${file.name}"`,
      },
    });
  } catch (error) {
    console.error("Unlock PDF error:", error);
    return NextResponse.json({ error: "Failed to unlock PDF. The file may be heavily encrypted." }, { status: 500 });
  }
}
