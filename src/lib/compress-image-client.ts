import imageCompression from "browser-image-compression";
import type { CompressionLevel } from "@/components/CompressionLevelSelector";

export interface CompressImageOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
  level?: CompressionLevel;
}

const LEVEL_QUALITY: Record<CompressionLevel, number> = {
  light: 0.85,
  balanced: 0.65,
  strong: 0.45,
};

const LEVEL_MAX_SIZE: Record<CompressionLevel, number> = {
  light: 5,
  balanced: 1,
  strong: 0.3,
};

export async function compressImageClient(
  file: File,
  options: CompressImageOptions = {}
): Promise<File> {
  const level = options.level || "balanced";
  const {
    maxSizeMB = LEVEL_MAX_SIZE[level],
    maxWidthOrHeight = 4096,
    quality = LEVEL_QUALITY[level],
  } = options;

  const compressed = await imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    initialQuality: quality,
    fileType: file.type as string,
  });

  return new File([compressed], file.name, { type: compressed.type });
}
