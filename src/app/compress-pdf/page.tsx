"use client";

import { useState, useCallback } from "react";
import { FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileDropzone from "@/components/FileDropzone";
import CompressionResult, { FileResult } from "@/components/CompressionResult";
import CompressionLevelSelector, {
  type CompressionLevel,
} from "@/components/CompressionLevelSelector";
import AdPlaceholder from "@/components/AdPlaceholder";

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

interface PendingFile {
  file: File;
  id: string;
}

export default function CompressPdfPage() {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [compressionLevel, setCompressionLevel] =
    useState<CompressionLevel>("balanced");
  const [results, setResults] = useState<FileResult[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFiles = useCallback((files: File[]) => {
    const newPending: PendingFile[] = files.map((f) => ({
      file: f,
      id: Math.random().toString(36).slice(2),
    }));
    setPendingFiles((prev) => [...prev, ...newPending]);
  }, []);

  const handleCompress = useCallback(async () => {
    if (pendingFiles.length === 0 || isCompressing) return;
    setIsCompressing(true);

    const newResults: FileResult[] = pendingFiles.map((pf) => ({
      id: pf.id,
      name: pf.file.name,
      originalSize: pf.file.size,
      compressedSize: pf.file.size,
      status: "compressing" as const,
    }));

    setResults(newResults);

    for (let i = 0; i < pendingFiles.length; i++) {
      const { file, id: resultId } = pendingFiles[i];

      try {
        // Always use server-side API for real compression (recompresses embedded images)
        const formData = new FormData();
        formData.append("file", file);
        formData.append("level", compressionLevel);
        const res = await fetch("/api/compress-pdf", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Compression failed");
        }
        const compressed = await res.blob();

        const url = URL.createObjectURL(compressed);

        setResults((prev) =>
          prev.map((r) =>
            r.id === resultId
              ? { ...r, status: "done", compressedSize: compressed.size, url }
              : r
          )
        );
      } catch {
        setResults((prev) =>
          prev.map((r) =>
            r.id === resultId
              ? { ...r, status: "error", error: "Compression failed" }
              : r
          )
        );
      }
    }

    setIsCompressing(false);
  }, [pendingFiles, compressionLevel, isCompressing]);

  const handleDownloadAll = useCallback(() => {
    results
      .filter((r) => r.status === "done" && r.url)
      .forEach((r) => {
        const a = document.createElement("a");
        a.href = r.url!;
        a.download = r.name;
        a.click();
      });
  }, [results]);

  const handleReset = useCallback(() => {
    setPendingFiles([]);
    setResults([]);
    setIsCompressing(false);
  }, []);

  const totalFileSize = pendingFiles.reduce((a, pf) => a + pf.file.size, 0);
  const hasResults = results.length > 0;
  const hasPending = pendingFiles.length > 0 && !hasResults;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold">
          Compress <span className="gradient-text">PDFs</span> Online
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Reduce PDF file sizes for easier sharing and faster uploads.
          No quality loss, no signup required.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!hasPending && !hasResults && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <FileDropzone
              accept="application/pdf,.pdf"
              maxSize={MAX_SIZE}
              multiple={true}
              onFiles={handleFiles}
              icon={<FileText className="w-10 h-10 text-primary" />}
              title="Drop your PDFs here"
              subtitle="Supports PDF files up to 50MB each"
            />
          </motion.div>
        )}

        {hasPending && (
          <motion.div
            key="pending"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* File list preview */}
            <div className="p-4 rounded-xl border border-border bg-card mb-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">
                  {pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""} selected
                </h3>
                <button
                  onClick={() => setPendingFiles([])}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {pendingFiles.map((pf) => (
                  <div
                    key={pf.id}
                    className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-muted/50"
                  >
                    <span className="truncate flex-1 mr-2">{pf.file.name}</span>
                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                      {(pf.file.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                ))}
              </div>
              {/* Add more files */}
              <label className="mt-3 inline-flex items-center gap-2 text-xs text-primary cursor-pointer hover:underline">
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []).filter(
                      (f) => f.size <= MAX_SIZE
                    );
                    if (files.length > 0) handleFiles(files);
                    e.target.value = "";
                  }}
                />
                + Add more files
              </label>
            </div>

            {/* Level selector */}
            <CompressionLevelSelector
              selectedLevel={compressionLevel}
              onSelectLevel={setCompressionLevel}
              totalFileSize={totalFileSize}
              fileType="pdf"
              onCompress={handleCompress}
              isCompressing={isCompressing}
              fileCount={pendingFiles.length}
            />
          </motion.div>
        )}

        {hasResults && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <CompressionResult
              results={results}
              onDownloadAll={results.length > 1 ? handleDownloadAll : undefined}
            />
            <div className="mt-6 text-center">
              <button
                onClick={handleReset}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all &amp; compress more
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AdPlaceholder slot="in-content" className="mt-12" />

      {/* SEO Content */}
      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
        <h2>How to Compress PDF Files Online</h2>
        <p>
          Compressly provides a fast and easy way to reduce PDF file sizes.
          Upload your PDF documents, choose your compression level, and our engine
          will optimize them while maintaining readability and visual quality.
        </p>

        <h3>Why Compress PDFs?</h3>
        <ul>
          <li>Send PDFs via email without exceeding attachment limits</li>
          <li>Upload documents faster to cloud storage and forms</li>
          <li>Save disk space on your computer and mobile devices</li>
          <li>Share documents more easily through messaging apps</li>
        </ul>

        <h3>Compression Levels Explained</h3>
        <ul>
          <li><strong>Light:</strong> Preserves maximum quality with 10-20% size reduction. Ideal for documents with detailed images.</li>
          <li><strong>Balanced:</strong> Optimal compression with 25-40% reduction. Best for general use.</li>
          <li><strong>Strong:</strong> Maximum compression with 50-60% reduction. Perfect for email attachments.</li>
        </ul>

        <h3>How PDF Compression Works</h3>
        <p>
          PDF compression works by optimizing internal structures, removing redundant data,
          compressing embedded images, and using efficient encoding. Our tool maintains
          text quality and document structure while significantly reducing file size.
        </p>
      </div>

      <AdPlaceholder slot="sidebar" className="mt-8" />
    </div>
  );
}
