import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_FILES = 10;
const MAX_TOTAL = 100 * 1024 * 1024; // 100MB total

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length < 2) return NextResponse.json({ error: "Please upload at least 2 PDF files." }, { status: 400 });
    if (files.length > MAX_FILES) return NextResponse.json({ error: `Maximum ${MAX_FILES} files allowed.` }, { status: 400 });

    const totalSize = files.reduce((a, f) => a + f.size, 0);
    if (totalSize > MAX_TOTAL) return NextResponse.json({ error: "Total file size exceeds 100MB." }, { status: 400 });

    const mergedDoc = await PDFDocument.create();

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      try {
        const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const pageIndices = srcDoc.getPageIndices();
        const pages = await mergedDoc.copyPages(srcDoc, pageIndices);
        pages.forEach((page) => mergedDoc.addPage(page));
      } catch {
        return NextResponse.json({ error: `Failed to read ${file.name}. Make sure it is a valid PDF.` }, { status: 400 });
      }
    }

    const merged = await mergedDoc.save({ useObjectStreams: true });
    return new NextResponse(new Uint8Array(merged), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": merged.byteLength.toString(),
        "Content-Disposition": 'attachment; filename="merged.pdf"',
      },
    });
  } catch (error) {
    console.error("Merge PDF error:", error);
    return NextResponse.json({ error: "Failed to merge PDFs." }, { status: 500 });
  }
}
