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
import AlsoTry from "@/components/AlsoTry";

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

interface PendingFile {
  file: File;
  id: string;
}

export default function CompressPdfTo100KbPage() {
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

    for (const { file, id: resultId } of pendingFiles) {
      try {
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
          Compress PDF to <span className="gradient-text">100KB</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Reduce your PDF file size to under 100KB. Best results on text-heavy
          PDFs with embedded images.
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
            <div className="p-4 rounded-xl border border-border bg-card mb-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">
                  {pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""}{" "}
                  selected
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

      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        💡 Tip: Results depend on PDF content. Text-only PDFs compress better.
        For image-heavy PDFs, try removing images first.
      </div>

      <AdPlaceholder slot="in-content" className="mt-12" />

      {/* SEO Content */}
      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
        <h2>How to Compress a PDF to 100KB</h2>
        <p>
          Compressing a PDF to under 100KB is a common requirement for government
          portals, job application forms, and email systems with strict size limits.
          Upload your PDF using the tool above, select &ldquo;Strong&rdquo; compression
          for maximum reduction, and download your optimized file in seconds.
        </p>
        <p>
          Our compression engine targets embedded images, removes redundant metadata,
          and applies lossless stream compression across the entire PDF structure.
          Text content, hyperlinks, and document outlines are preserved throughout
          the process.
        </p>

        <h3>When Is a 100KB PDF Limit Common?</h3>
        <ul>
          <li>
            <strong>Government job portals:</strong> Many public-sector recruitment
            platforms cap resume and certificate uploads at 100KB.
          </li>
          <li>
            <strong>University admission forms:</strong> Academic portals often
            require supporting documents under 100KB per file.
          </li>
          <li>
            <strong>Online banking KYC:</strong> Identity document submissions
            on banking platforms frequently have a 100KB ceiling.
          </li>
          <li>
            <strong>Mobile form submissions:</strong> Apps and mobile web forms
            enforce tight limits to reduce server storage costs.
          </li>
        </ul>

        <h3>Tips for Achieving 100KB</h3>
        <p>
          The final compressed size depends heavily on your PDF&rsquo;s content.
          Text-only PDFs with standard fonts can often be reduced to well under
          100KB even from several megabytes. PDFs that contain high-resolution
          photographs or scanned pages are harder to reduce to 100KB without
          visible quality loss. In those cases, consider:
        </p>
        <ul>
          <li>Removing unnecessary pages before compressing</li>
          <li>Replacing embedded high-res images with lower-resolution versions</li>
          <li>Using the Strong compression level for maximum size reduction</li>
          <li>Splitting a multi-page PDF and compressing pages individually</li>
        </ul>

        <h2>Frequently Asked Questions</h2>

        <h3>Can every PDF be compressed to 100KB?</h3>
        <p>
          Not always. A PDF containing multiple full-page scanned images or
          high-resolution photos may not reach 100KB even at maximum compression
          without noticeable quality degradation. Text-based PDFs, on the other
          hand, compress very well and can often reach 100KB from 1MB or more.
        </p>

        <h3>Will compressing to 100KB affect text readability?</h3>
        <p>
          No. Text in PDFs is stored as vector data and is not affected by
          compression. Only embedded raster images are resampled. All fonts,
          hyperlinks, form fields, and text layers remain intact at full quality
          after compression.
        </p>

        <h3>Is there a file size limit for uploading?</h3>
        <p>
          You can upload PDF files up to 50MB. The tool will then compress them
          as aggressively as the chosen level allows. If your source file is
          extremely large, compression may reduce it significantly but may not
          always reach the 100KB target.
        </p>

        <h3>Is my PDF data safe when I upload it?</h3>
        <p>
          Yes. Files are processed server-side over an encrypted HTTPS connection
          and are automatically deleted after your session. We do not store,
          share, or analyze the content of your uploaded documents.
        </p>
      </div>

      <AdPlaceholder slot="sidebar" className="mt-8" />

      <AlsoTry currentSlug="compress-pdf-to-100kb" />
    </div>
  );
}
