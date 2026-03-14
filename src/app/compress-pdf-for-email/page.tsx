"use client";

import { useState, useCallback } from "react";
import { Mail } from "lucide-react";
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

export default function CompressPdfForEmailPage() {
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
          Compress PDF for <span className="gradient-text">Email</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Reduce PDF file size for email attachments. Gmail and Outlook limit
          attachments to 25MB &mdash; make sure your PDF gets through.
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
              icon={<Mail className="w-10 h-10 text-primary" />}
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
        💡 Tip: If you&rsquo;re sending multiple PDFs in one email, compress each one
        individually to stay well under your email provider&rsquo;s total attachment limit.
      </div>

      <AdPlaceholder slot="in-content" className="mt-12" />

      {/* SEO Content */}
      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
        <h2>Compress PDF Files for Email Attachments</h2>
        <p>
          Every major email provider enforces a maximum attachment size. If your
          PDF exceeds the limit, the email will either fail to send or your
          recipient will receive a link to download the file from a third-party
          service instead. Compressing your PDF before attaching it ensures
          reliable delivery and a better experience for the recipient.
        </p>

        <h3>Email Attachment Size Limits by Provider</h3>
        <ul>
          <li>
            <strong>Gmail:</strong> 25MB per email (total for all attachments).
            Files over 25MB must be shared via Google Drive.
          </li>
          <li>
            <strong>Outlook / Hotmail:</strong> 20MB per email for most accounts.
            Microsoft 365 business accounts may have different limits set by
            their organization&rsquo;s Exchange configuration.
          </li>
          <li>
            <strong>Yahoo Mail:</strong> 25MB per email. Files over 25MB are
            automatically converted to a Yahoo Files link.
          </li>
          <li>
            <strong>Apple Mail / iCloud:</strong> 20MB per email. Mail Drop
            feature can handle larger files but recipients must click a link
            rather than receiving the file directly.
          </li>
          <li>
            <strong>Corporate mail servers:</strong> Many organizations set
            their own limits, commonly between 5MB and 15MB, to manage storage
            and network bandwidth.
          </li>
        </ul>

        <h3>Why Compressed PDFs Send Better</h3>
        <p>
          Even when your PDF is technically under the size limit, smaller files
          improve the email experience in practical ways. They upload faster on
          slow connections, take less time for the recipient to download on
          mobile, and are less likely to be blocked by corporate spam filters
          that treat large attachments with additional scrutiny.
        </p>
        <p>
          Compressly compresses your PDF server-side using intelligent image
          downsampling and stream optimization. The result is a professional-looking
          document that opens cleanly and prints clearly, but takes a fraction
          of the original storage space.
        </p>

        <h3>Sending Multiple PDFs in One Email</h3>
        <p>
          Email size limits apply to the total size of all attachments combined,
          not just individual files. If you need to send several PDFs in a single
          email, compress each one before attaching. Our batch mode lets you add
          multiple files to the queue and download all compressed versions at once.
        </p>

        <h2>Frequently Asked Questions</h2>

        <h3>What happens if I send a PDF that&rsquo;s too large for email?</h3>
        <p>
          The behavior depends on your email client. Gmail automatically converts
          the attachment to a Google Drive link. Outlook may refuse to send the
          message with an error. Some corporate mail servers silently block the
          message without notifying the sender. Compressing beforehand prevents
          all of these scenarios.
        </p>

        <h3>How small should my PDF be for email?</h3>
        <p>
          For reliable delivery across all email systems, aim for under 5MB per
          attachment and under 10MB total per email. While major services allow
          up to 25MB, corporate recipients are often on stricter networks. A
          compressed PDF under 2MB is ideal for universal compatibility.
        </p>

        <h3>Does compression change the appearance of my PDF?</h3>
        <p>
          At Balanced compression, the visual difference is minimal. Text remains
          sharp, charts and diagrams stay clear, and the document looks
          professional. At Strong compression, high-resolution photos may appear
          slightly less detailed, but the document is fully readable and printable.
        </p>

        <h3>Can I compress a PDF that already has a password?</h3>
        <p>
          Password-protected PDFs cannot be processed directly. You will need
          to unlock the PDF first using our PDF unlock tool, then compress it
          for email attachment.
        </p>
      </div>

      <AdPlaceholder slot="sidebar" className="mt-8" />

      <AlsoTry currentSlug="compress-pdf-for-email" />
    </div>
  );
}
