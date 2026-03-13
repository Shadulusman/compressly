import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, PDFName, PDFRawStream, PDFRef } from "pdf-lib";
import sharp from "sharp";
import { checkRateLimit } from "@/lib/rate-limit";
import { validatePdfType } from "@/lib/validate-file";

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

type CompressionLevel = "light" | "balanced" | "strong";

// Quality for recompressing JPEG images embedded inside PDFs
const LEVEL_IMAGE_QUALITY: Record<CompressionLevel, number> = {
  light: 70,
  balanced: 45,
  strong: 25,
};

// Max dimension for embedded images (downscale large images inside PDFs)
const LEVEL_IMAGE_MAX_DIM: Record<CompressionLevel, number | null> = {
  light: null,
  balanced: 1500,
  strong: 1200,
};

async function recompressEmbeddedImages(
  pdfDoc: PDFDocument,
  level: CompressionLevel
): Promise<number> {
  const quality = LEVEL_IMAGE_QUALITY[level];
  const maxDim = LEVEL_IMAGE_MAX_DIM[level];
  let savedBytes = 0;

  const context = pdfDoc.context;

  for (const [ref, obj] of context.enumerateIndirectObjects()) {
    // Only process raw streams (which contain image data)
    if (!(obj instanceof PDFRawStream)) continue;

    const dict = obj.dict;

    // Check if this is an image XObject
    const subtype = dict.get(PDFName.of("Subtype"));
    if (!subtype || subtype !== PDFName.of("Image")) continue;

    // Get the filter — we can only handle DCTDecode (JPEG) images
    const filter = dict.get(PDFName.of("Filter"));
    if (!filter) continue;

    const isDCT =
      filter === PDFName.of("DCTDecode") ||
      (filter.toString && filter.toString() === "/DCTDecode");

    if (!isDCT) continue;

    // Get the raw JPEG bytes
    const originalBytes = obj.contents;
    if (!originalBytes || originalBytes.length < 1000) continue; // skip tiny images

    try {
      let sharpInstance = sharp(Buffer.from(originalBytes));
      const meta = await sharpInstance.metadata();

      // Downscale large images if level requires it
      if (
        maxDim &&
        meta.width &&
        meta.height &&
        (meta.width > maxDim || meta.height > maxDim)
      ) {
        sharpInstance = sharpInstance.resize({
          width: meta.width > meta.height ? maxDim : undefined,
          height: meta.height >= meta.width ? maxDim : undefined,
          fit: "inside",
          withoutEnlargement: true,
        });

        // Update the width/height in the PDF dict
        const newMeta = await sharpInstance.clone().metadata();
        // We'll get actual dims after toBuffer
      }

      const recompressed = await sharpInstance
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();

      // Only replace if we actually saved space
      if (recompressed.length < originalBytes.length) {
        const savings = originalBytes.length - recompressed.length;
        savedBytes += savings;

        // Get new dimensions if we resized
        const newMeta = await sharp(recompressed).metadata();

        // Create replacement stream with updated dict
        const newDict = dict;

        // Update dimensions if they changed
        if (newMeta.width && newMeta.height) {
          const origWidth = dict.get(PDFName.of("Width"));
          const origHeight = dict.get(PDFName.of("Height"));
          if (origWidth && origHeight) {
            newDict.set(
              PDFName.of("Width"),
              context.obj(newMeta.width)
            );
            newDict.set(
              PDFName.of("Height"),
              context.obj(newMeta.height)
            );
          }
        }

        // Update length
        newDict.set(
          PDFName.of("Length"),
          context.obj(recompressed.length)
        );

        // Replace the stream object
        const newStream = PDFRawStream.of(newDict, new Uint8Array(recompressed));
        context.assign(ref as PDFRef, newStream);
      }
    } catch {
      // Skip images that can't be processed (corrupted, unusual format, etc.)
      continue;
    }
  }

  return savedBytes;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const level = (formData.get("level") as CompressionLevel) || "balanced";

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

    // Step 1: Recompress embedded JPEG images with sharp
    await recompressEmbeddedImages(pdfDoc, level);

    // Step 2: Remove metadata
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer("");
    pdfDoc.setCreator("");

    // Step 3: Reset dates for balanced/strong
    if (level === "balanced" || level === "strong") {
      pdfDoc.setCreationDate(new Date(0));
      pdfDoc.setModificationDate(new Date(0));
    }

    // Step 4: Save with object streams for structural optimization
    const compressed = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
    });

    // Return compressed if smaller, otherwise original
    const result =
      compressed.length < buffer.length
        ? new Uint8Array(compressed)
        : new Uint8Array(buffer);

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
