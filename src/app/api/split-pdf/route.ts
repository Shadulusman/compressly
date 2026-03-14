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
    const mode = (formData.get("mode") as string) || "single"; // "single" = one file per page, "range" = custom range
    const rangeStr = (formData.get("range") as string) || "";
    const pageNum = parseInt(formData.get("page") as string) || 1;

    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large. Max 50MB." }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();

    if (mode === "single" && pageNum >= 1 && pageNum <= totalPages) {
      // Extract single page
      const newDoc = await PDFDocument.create();
      const [page] = await newDoc.copyPages(srcDoc, [pageNum - 1]);
      newDoc.addPage(page);
      const result = await newDoc.save();
      return new NextResponse(new Uint8Array(result), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Length": result.byteLength.toString(),
          "Content-Disposition": `attachment; filename="page-${pageNum}.pdf"`,
        },
      });
    }

    // Default: return info about the PDF for frontend to render page selector
    return NextResponse.json({ totalPages, fileName: file.name });
  } catch (error) {
    console.error("Split PDF error:", error);
    return NextResponse.json({ error: "Failed to split PDF." }, { status: 500 });
  }
}
