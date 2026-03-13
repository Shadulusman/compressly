import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateImageType } from "@/lib/validate-file";

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

type CompressionLevel = "light" | "balanced" | "strong";

const LEVEL_QUALITY: Record<CompressionLevel, number> = {
  light: 85,
  balanced: 65,
  strong: 45,
};

const LEVEL_PNG_COMPRESSION: Record<CompressionLevel, number> = {
  light: 6,
  balanced: 8,
  strong: 9,
};

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
        { error: "File too large. Maximum size is 20MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!validateImageType(buffer)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WEBP are supported." },
        { status: 400 }
      );
    }

    const image = sharp(buffer);
    const metadata = await image.metadata();
    const quality = LEVEL_QUALITY[level] || LEVEL_QUALITY.balanced;
    const pngCompression = LEVEL_PNG_COMPRESSION[level] || LEVEL_PNG_COMPRESSION.balanced;

    let compressed: Buffer;
    const format = metadata.format;

    if (format === "jpeg" || format === "jpg") {
      compressed = await image.jpeg({ quality, mozjpeg: true }).toBuffer();
    } else if (format === "png") {
      compressed = await image
        .png({ compressionLevel: pngCompression, palette: level !== "light" })
        .toBuffer();
    } else if (format === "webp") {
      compressed = await image.webp({ quality }).toBuffer();
    } else {
      compressed = await image.jpeg({ quality, mozjpeg: true }).toBuffer();
    }

    // Only return compressed if it's actually smaller
    const result = compressed.length < buffer.length ? compressed : buffer;

    return new NextResponse(new Uint8Array(result), {
      headers: {
        "Content-Type": file.type || "image/jpeg",
        "Content-Length": result.length.toString(),
        "Content-Disposition": `attachment; filename="compressed-${file.name}"`,
      },
    });
  } catch (error) {
    console.error("Image compression error:", error);
    return NextResponse.json(
      { error: "Failed to compress image" },
      { status: 500 }
    );
  }
}
