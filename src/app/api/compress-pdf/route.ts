import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { checkRateLimit } from "@/lib/rate-limit";
import { validatePdfType } from "@/lib/validate-file";

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 50MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!validatePdfType(buffer)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF files are supported." },
        { status: 400 }
      );
    }

    const pdfDoc = await PDFDocument.load(buffer, {
      ignoreEncryption: true,
    });

    // Remove metadata
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer("");
    pdfDoc.setCreator("");

    const compressed = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
    });

    // Return compressed if smaller, otherwise original
    const result =
      compressed.length < buffer.length ? new Uint8Array(compressed) : new Uint8Array(buffer);

    return new NextResponse(result, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": result.length.toString(),
        "Content-Disposition": `attachment; filename="compressed-${file.name}"`,
      },
    });
  } catch (error) {
    console.error("PDF compression error:", error);
    return NextResponse.json(
      { error: "Failed to compress PDF" },
      { status: 500 }
    );
  }
}
