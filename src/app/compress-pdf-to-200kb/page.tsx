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

export default function CompressPdfTo200KbPage() {
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
          Compress PDF to <span className="gradient-text">200KB</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Shrink PDF files to under 200KB. Ideal for government forms, job
          applications, and email attachments.
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
        For image-heavy PDFs, try removing unnecessary images before compressing.
      </div>

      <AdPlaceholder slot="in-content" className="mt-12" />

      {/* SEO Content */}
      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
        <h2>How to Compress a PDF to 200KB</h2>
        <p>
          A 200KB PDF limit is one of the most common file size restrictions
          encountered on job application portals, government websites, and
          educational submission forms. Compressly makes it easy to hit this
          target — just upload your file, choose Strong compression, and
          download your reduced PDF instantly.
        </p>
        <p>
          Our engine intelligently resamples embedded images, strips unnecessary
          metadata, and applies optimized stream encoding to shrink your PDF as
          much as possible while keeping text and structural content fully intact.
        </p>

        <h3>Where Is a 200KB PDF Limit Required?</h3>
        <ul>
          <li>
            <strong>Job application portals:</strong> HR platforms and applicant
            tracking systems commonly restrict resumes and cover letters to 200KB.
          </li>
          <li>
            <strong>Government tender submissions:</strong> Procurement portals
            require supporting documents within tight size limits.
          </li>
          <li>
            <strong>College and university applications:</strong> Student portals
            cap uploaded certificates and transcripts at 200KB per file.
          </li>
          <li>
            <strong>Online insurance claims:</strong> Document uploads for claims
            processing often have a 200KB ceiling per attachment.
          </li>
        </ul>

        <h3>Getting the Best Compression Results</h3>
        <p>
          If your PDF is primarily text with minimal graphics, Strong compression
          will typically bring it well under 200KB even from several megabytes.
          For documents with scanned pages or embedded photos, consider these
          additional strategies:
        </p>
        <ul>
          <li>Remove blank or duplicate pages before uploading</li>
          <li>Delete embedded graphics that are not essential to the document</li>
          <li>Use the Strong compression level for the highest reduction ratio</li>
          <li>Re-scan physical documents at 150 DPI instead of 300+ DPI</li>
        </ul>

        <h2>Frequently Asked Questions</h2>

        <h3>Why does my PDF need to be under 200KB?</h3>
        <p>
          Many online portals and application systems enforce file size limits
          to manage server storage, ensure fast uploads on slower connections,
          and standardize submissions. The 200KB limit is widely used across
          government, education, and HR platforms worldwide.
        </p>

        <h3>Does compression affect the content of my PDF?</h3>
        <p>
          No. Compression affects how data is stored, not what it contains.
          All text, fonts, form fields, and hyperlinks are preserved. Only
          embedded images may have their resolution slightly reduced at higher
          compression levels.
        </p>

        <h3>What if my PDF is still over 200KB after compression?</h3>
        <p>
          If the file remains over 200KB after maximum compression, the PDF
          likely contains a large number of high-resolution images. In that
          case, try splitting the document into smaller sections, reducing
          image resolution before embedding, or removing non-essential pages.
        </p>

        <h3>How long does compression take?</h3>
        <p>
          Most PDFs are compressed in under 10 seconds. Larger files or those
          with many embedded images may take slightly longer, but the process
          is fully browser-based and does not require any software installation.
        </p>
      </div>

      <AdPlaceholder slot="sidebar" className="mt-8" />

      <AlsoTry currentSlug="compress-pdf-to-200kb" />
    </div>
  );
}
