import { PDFDocument } from "pdf-lib";
import type { CompressionLevel } from "@/components/CompressionLevelSelector";

export interface CompressPdfOptions {
  level?: CompressionLevel;
}

const LEVEL_OBJECTS_PER_TICK: Record<CompressionLevel, number> = {
  light: 200,
  balanced: 100,
  strong: 50,
};

export async function compressPdfClient(
  file: File,
  options: CompressPdfOptions = {}
): Promise<Blob> {
  const level = options.level || "balanced";
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, {
    ignoreEncryption: true,
  });

  // Remove metadata to reduce size
  pdfDoc.setTitle("");
  pdfDoc.setAuthor("");
  pdfDoc.setSubject("");
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer("");
  pdfDoc.setCreator("");

  // Strong compression: also remove creation/modification dates
  if (level === "strong" || level === "balanced") {
    pdfDoc.setCreationDate(new Date(0));
    pdfDoc.setModificationDate(new Date(0));
  }

  const compressed = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: LEVEL_OBJECTS_PER_TICK[level],
  });

  return new Blob([compressed.buffer as ArrayBuffer], { type: "application/pdf" });
}
