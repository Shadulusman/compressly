"use client";

import { useState, useCallback } from "react";
import { Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileDropzone from "@/components/FileDropzone";
import CompressionResult, { FileResult } from "@/components/CompressionResult";
import CompressionLevelSelector, {
  type CompressionLevel,
} from "@/components/CompressionLevelSelector";
import AdPlaceholder from "@/components/AdPlaceholder";

const MAX_SIZE = 20 * 1024 * 1024;

interface PendingFile {
  file: File;
  id: string;
}

export default function ResizeImagePage() {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [compressionLevel, setCompressionLevel] =
    useState<CompressionLevel>("balanced");
  const [results, setResults] = useState<FileResult[]>([]);
  const [maxDimension, setMaxDimension] = useState(1920);
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
        // Always use server-side sharp for real compression + resize
        const formData = new FormData();
        formData.append("file", file);
        formData.append("level", compressionLevel);
        formData.append("maxDimension", maxDimension.toString());
        const res = await fetch("/api/resize-image", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Resize failed");
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
              ? { ...r, status: "error", error: "Resize failed" }
              : r
          )
        );
      }
    }

    setIsCompressing(false);
  }, [pendingFiles, maxDimension, compressionLevel, isCompressing]);

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
          Resize <span className="gradient-text">Images</span> Online
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Resize images to specific dimensions. Perfect for social media, web, and email.
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
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              maxSize={MAX_SIZE}
              multiple={true}
              onFiles={handleFiles}
              icon={<Minimize2 className="w-10 h-10 text-primary" />}
              title="Drop your images here"
              subtitle="Supports JPG, PNG, WEBP up to 20MB each"
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
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
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

            {/* Dimension selector */}
            <div className="mt-4 mb-2 flex items-center justify-center gap-4">
              <label className="text-sm font-medium">Max dimension (px):</label>
              <select
                value={maxDimension}
                onChange={(e) => setMaxDimension(Number(e.target.value))}
                className="px-4 py-2 rounded-lg border border-border bg-card text-sm"
              >
                <option value={640}>640px</option>
                <option value={800}>800px</option>
                <option value={1024}>1024px</option>
                <option value={1280}>1280px</option>
                <option value={1920}>1920px (Full HD)</option>
                <option value={2560}>2560px (2K)</option>
              </select>
            </div>

            {/* Level selector */}
            <CompressionLevelSelector
              selectedLevel={compressionLevel}
              onSelectLevel={setCompressionLevel}
              totalFileSize={totalFileSize}
              fileType="image"
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
                Clear all &amp; resize more
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AdPlaceholder slot="in-content" className="mt-12" />

      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
        <h2>How to Resize Images Online</h2>
        <p>
          Select your desired maximum dimension, choose a compression level, and upload your images.
          Compressly will resize them while maintaining the original aspect ratio
          and optimizing file size.
        </p>
        <h3>Common Image Sizes</h3>
        <ul>
          <li><strong>Social media:</strong> 1080px for Instagram, 1200px for Facebook</li>
          <li><strong>Web:</strong> 1920px for full-width hero images</li>
          <li><strong>Email:</strong> 640-800px for email-safe images</li>
          <li><strong>Thumbnails:</strong> 300-400px for preview images</li>
        </ul>
      </div>
    </div>
  );
}
