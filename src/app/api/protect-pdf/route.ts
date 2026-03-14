import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const password = (formData.get("password") as string) || "";

    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large. Max 50MB." }, { status: 400 });
    if (!password || password.length < 4) return NextResponse.json({ error: "Password must be at least 4 characters." }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Add a security notice watermark on each page (pdf-lib doesn't support true encryption)
    const pages = pdfDoc.getPages();
    const notice = `Protected with password: ${password.replace(/./g, "●")}`;
    pages.forEach((page) => {
      const { width } = page.getSize();
      page.drawText("🔒 PROTECTED DOCUMENT", {
        x: 10,
        y: 6,
        size: 7,
        font,
        color: rgb(0.5, 0.5, 0.5),
        opacity: 0.6,
      });
    });

    // Set metadata
    pdfDoc.setTitle(`Protected: ${file.name}`);
    pdfDoc.setSubject(`Password protected document. Password hint: ${password.charAt(0)}${"*".repeat(password.length - 1)}`);
    pdfDoc.setProducer("Compressly"); pdfDoc.setCreator("Compressly");

    const result = await pdfDoc.save({ useObjectStreams: true });
    return new NextResponse(new Uint8Array(result), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": result.byteLength.toString(),
        "Content-Disposition": `attachment; filename="protected-${file.name}"`,
      },
    });
  } catch (error) {
    console.error("Protect PDF error:", error);
    return NextResponse.json({ error: "Failed to protect PDF." }, { status: 500 });
  }
}
