import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateImageType } from "@/lib/validate-file";

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

type CompressionLevel = "light" | "balanced" | "strong";

const LEVEL_QUALITY: Record<CompressionLevel, number> = {
  light: 75,
  balanced: 50,
  strong: 30,
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
    const maxDimension = Number(formData.get("maxDimension")) || 1920;

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

    const quality = LEVEL_QUALITY[level] || LEVEL_QUALITY.balanced;

    let image = sharp(buffer);
    const metadata = await image.metadata();

    // Resize to target dimension
    if (
      metadata.width &&
      metadata.height &&
      (metadata.width > maxDimension || metadata.height > maxDimension)
    ) {
      image = image.resize({
        width: metadata.width > metadata.height ? maxDimension : undefined,
        height: metadata.height >= metadata.width ? maxDimension : undefined,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    let compressed: Buffer;
    const format = metadata.format;

    if (format === "jpeg" || format === "jpg") {
      compressed = await image.jpeg({ quality, mozjpeg: true }).toBuffer();
    } else if (format === "png") {
      compressed = await image
        .png({ compressionLevel: 9, palette: level !== "light", colours: level === "strong" ? 128 : 200 })
        .toBuffer();
    } else if (format === "webp") {
      compressed = await image.webp({ quality }).toBuffer();
    } else {
      compressed = await image.jpeg({ quality, mozjpeg: true }).toBuffer();
    }

    const result = compressed.length < buffer.length ? compressed : buffer;

    return new NextResponse(new Uint8Array(result), {
      headers: {
        "Content-Type": file.type || "image/jpeg",
        "Content-Length": result.length.toString(),
        "Content-Disposition": `attachment; filename="resized-${file.name}"`,
      },
    });
  } catch (error) {
    console.error("Image resize error:", error);
    return NextResponse.json(
      { error: "Failed to resize image" },
      { status: 500 }
    );
  }
}
