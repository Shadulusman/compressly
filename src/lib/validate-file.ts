const IMAGE_MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/webp": [0x52, 0x49, 0x46, 0x46], // RIFF header
};

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46]; // %PDF

export function validateImageType(buffer: Buffer): boolean {
  for (const magic of Object.values(IMAGE_MAGIC_BYTES)) {
    if (magic.every((byte, i) => buffer[i] === byte)) {
      return true;
    }
  }
  return false;
}

export function validatePdfType(buffer: Buffer): boolean {
  return PDF_MAGIC.every((byte, i) => buffer[i] === byte);
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
}
