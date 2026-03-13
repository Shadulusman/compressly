"use client";

import { useState, useCallback } from "react";
import { Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileDropzone from "@/components/FileDropzone";
import CompressionResult, { FileResult } from "@/components/CompressionResult";
import CompressionLevelSelector, {
  type CompressionLevel,
} from "@/components/CompressionLevelSelector";
import AdPlaceholder from "@/components/AdPlaceholder";
import { compressPdfClient } from "@/lib/compress-pdf-client";

const MAX_SIZE = 50 * 1024 * 1024;

interface PendingFile {
  file: File;
  id: string;
}

export default function ReducePdfSizePage() {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [compressionLevel, setCompressionLevel] =
    useState<CompressionLevel>("strong");
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
        let compressed: Blob;

        if (file.size > 10 * 1024 * 1024) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("level", compressionLevel);
          const res = await fetch("/api/compress-pdf", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) throw new Error("Server compression failed");
          compressed = await res.blob();
        } else {
          compressed = await compressPdfClient(file, {
            level: compressionLevel,
          });
        }

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
              ? { ...r, status: "error", error: "Reduction failed" }
              : r
          )
        );
      }
    }

    setIsCompressing(false);
  }, [pendingFiles, compressionLevel, isCompressing]);

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
          Reduce <span className="gradient-text">PDF Size</span> Online
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Maximum compression for the smallest possible PDF file size.
          Perfect for email attachments and uploads.
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
              icon={<Zap className="w-10 h-10 text-primary" />}
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
            <CompressionResult results={results} />
            <div className="mt-6 text-center">
              <button
                onClick={handleReset}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all &amp; reduce more
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AdPlaceholder slot="in-content" className="mt-12" />

      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
        <h2>How to Reduce PDF File Size</h2>
        <p>
          Our advanced PDF reducer applies compression techniques to
          minimize your PDF file size. Choose your compression level, and we will
          optimize internal structures, compress streams, and remove unnecessary metadata.
        </p>
        <h3>When to Use Maximum Compression</h3>
        <ul>
          <li>Email attachments with strict size limits</li>
          <li>Uploading to forms with file size restrictions</li>
          <li>Archiving documents for long-term storage</li>
          <li>Sharing large reports and presentations</li>
        </ul>
      </div>
    </div>
  );
}
