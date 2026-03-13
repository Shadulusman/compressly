import imageCompression from "browser-image-compression";

export interface CompressImageOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
}

export async function compressImageClient(
  file: File,
  options: CompressImageOptions = {}
): Promise<File> {
  const { maxSizeMB = 1, maxWidthOrHeight = 4096, quality = 0.8 } = options;

  const compressed = await imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    initialQuality: quality,
    fileType: file.type as string,
  });

  return new File([compressed], file.name, { type: compressed.type });
}
