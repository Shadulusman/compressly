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

export default function CompressPdfTo1MbPage() {
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
          Compress PDF to <span className="gradient-text">1MB</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Compress your PDF to under 1MB while preserving quality. Perfect for
          online submissions and portals.
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
        💡 Tip: Balanced compression delivers excellent quality at a fraction of
        the original size. Switch to Strong if you still need a smaller file.
      </div>

      <AdPlaceholder slot="in-content" className="mt-12" />

      {/* SEO Content */}
      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
        <h2>How to Compress a PDF to Under 1MB</h2>
        <p>
          The 1MB threshold is one of the most frequently encountered limits on
          government portals, HR systems, and document management platforms.
          Whether you&rsquo;re submitting a contract, uploading a portfolio, or
          attaching a report to an online form, keeping your PDF under 1MB ensures
          a smooth, error-free submission.
        </p>
        <p>
          Compressly uses server-side optimization to reprocess your PDF&rsquo;s
          internal structure — downsampling embedded images, removing redundant
          object references, and applying efficient stream compression throughout.
          The process takes just seconds and preserves all text, fonts, and
          document navigation perfectly.
        </p>

        <h3>Why Portals and Systems Set a 1MB Limit</h3>
        <ul>
          <li>
            <strong>Server performance:</strong> Smaller file uploads complete
            faster and reduce processing time on shared hosting infrastructure.
          </li>
          <li>
            <strong>Storage costs:</strong> Systems handling thousands of
            document submissions per day rely on per-file limits to manage
            cumulative storage.
          </li>
          <li>
            <strong>Email forwarding:</strong> Documents that will be auto-forwarded
            to reviewers via email must stay within attachment size limits.
          </li>
          <li>
            <strong>Mobile-friendliness:</strong> Restricting uploads to 1MB
            ensures the system remains responsive for users on mobile data.
          </li>
        </ul>

        <h3>What Types of PDFs Compress to Under 1MB Easily?</h3>
        <p>
          Text-based PDFs such as CVs, contracts, invoices, and legal documents
          almost always compress to well under 1MB. PDFs created from Word
          documents or spreadsheets typically compress from several megabytes
          down to a few hundred kilobytes. Scanned documents and image-heavy
          reports require more aggressive settings but can still hit the 1MB
          target in most cases.
        </p>

        <h2>Frequently Asked Questions</h2>

        <h3>How much can a PDF be compressed?</h3>
        <p>
          Compression ratios vary widely depending on content. A 10MB PDF of
          a scanned brochure with high-resolution photos might compress to 2MB
          at best. A 10MB Word-to-PDF export with images and text might reach
          800KB. The more images your PDF contains, the more it can be compressed
          — text itself is already stored efficiently in the PDF format.
        </p>

        <h3>Is my document quality preserved at 1MB?</h3>
        <p>
          Yes, for the vast majority of documents. At Balanced compression, text
          remains pixel-perfect and images retain screen-ready clarity. At Strong
          compression, fine photographic detail may show minor softening, but
          documents remain fully legible and professional-looking.
        </p>

        <h3>Can I compress password-protected PDFs?</h3>
        <p>
          Password-protected PDFs cannot be processed without the owner password.
          If your PDF is locked, use our PDF unlock tool first to remove the
          password, then compress it to under 1MB.
        </p>

        <h3>Do I need to create an account to compress PDFs?</h3>
        <p>
          No account or signup is required. Compressly is completely free to use.
          Simply upload your PDF, choose your compression level, and download
          the result — no email address, registration, or payment needed.
        </p>
      </div>

      <AdPlaceholder slot="sidebar" className="mt-8" />

      <AlsoTry currentSlug="compress-pdf-to-1mb" />
    </div>
  );
}
