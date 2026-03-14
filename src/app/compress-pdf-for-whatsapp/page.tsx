"use client";

import { useState, useCallback } from "react";
import { MessageCircle } from "lucide-react";
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

export default function CompressPdfForWhatsappPage() {
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
          Compress PDF for <span className="gradient-text">WhatsApp</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          WhatsApp limits document sharing to 100MB. Compress your PDF to share
          it easily on WhatsApp and other messaging apps.
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
              icon={<MessageCircle className="w-10 h-10 text-primary" />}
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
        💡 Tip: WhatsApp&rsquo;s 100MB document limit applies per file. If you&rsquo;re sharing
        on mobile data, a smaller file also means faster upload and delivery for
        the recipient.
      </div>

      <AdPlaceholder slot="in-content" className="mt-12" />

      {/* SEO Content */}
      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
        <h2>How to Compress a PDF to Share on WhatsApp</h2>
        <p>
          WhatsApp allows users to share documents up to 100MB per file, but
          in practice, large PDFs can be slow to upload and download on mobile
          connections, especially in areas with limited bandwidth. Compressing
          your PDF before sharing ensures instant delivery and makes it easy
          for recipients to open the file without waiting.
        </p>
        <p>
          To compress a PDF for WhatsApp, upload your file using the tool above,
          select Strong compression for the most compact result, and download
          the optimized PDF. Then attach it directly in your WhatsApp chat or
          group message.
        </p>

        <h3>Document Sharing Limits on Messaging Apps</h3>
        <ul>
          <li>
            <strong>WhatsApp:</strong> 100MB per document on most platforms.
            On older versions or low-storage devices, the effective limit may
            be lower as the app needs to buffer the file before sending.
          </li>
          <li>
            <strong>Telegram:</strong> 2GB per file for regular accounts, 4GB
            for Premium subscribers. Compression is rarely needed for Telegram,
            but smaller files load faster in chats.
          </li>
          <li>
            <strong>Signal:</strong> 100MB per file. Signal also end-to-end
            encrypts all attachments, meaning smaller files transfer more quickly.
          </li>
          <li>
            <strong>Instagram DMs:</strong> Does not support PDF attachments
            natively. PDFs must be shared via a link or converted to images first.
          </li>
          <li>
            <strong>Facebook Messenger:</strong> 25MB per file. Messenger is
            more restrictive than WhatsApp, so compression to well under 25MB
            is recommended.
          </li>
        </ul>

        <h3>Why File Size Matters on Mobile Messaging</h3>
        <p>
          Most WhatsApp usage happens on mobile devices over cellular data
          connections. A large PDF that takes 30 seconds to upload can also
          take 30 seconds for the recipient to download before they can open it.
          Compressing your PDF to a few hundred kilobytes or a couple of
          megabytes makes sharing feel instant on both ends.
        </p>
        <p>
          Additionally, recipients with limited phone storage may not be able
          to receive very large files. A compressed PDF is more accessible to
          everyone in a group chat, regardless of their device or connection.
        </p>

        <h3>Best Practices for Sharing PDFs on Messaging Apps</h3>
        <ul>
          <li>Keep PDFs under 5MB for fast delivery on any mobile connection</li>
          <li>Use Strong compression for documents that are primarily text</li>
          <li>Use Balanced compression if your PDF contains important images or diagrams</li>
          <li>Split long documents into smaller chapters before sharing in group chats</li>
          <li>Rename your file to something descriptive before sending so recipients know what it is</li>
        </ul>

        <h2>Frequently Asked Questions</h2>

        <h3>What is the WhatsApp document file size limit?</h3>
        <p>
          WhatsApp allows document attachments up to 100MB per file. This applies
          to PDFs, Word documents, spreadsheets, and other file types sent as
          documents. Note that this is the theoretical maximum; practical
          performance is best when files are well under 20MB.
        </p>

        <h3>Can I send a compressed PDF on WhatsApp Web?</h3>
        <p>
          Yes. WhatsApp Web and WhatsApp Desktop both support the same 100MB
          document limit. After compressing your PDF with Compressly, simply
          save it and attach it in WhatsApp Web via the attachment icon in any
          chat window.
        </p>

        <h3>Does compressing a PDF affect how it opens on mobile?</h3>
        <p>
          No. Compressed PDFs open identically to uncompressed ones in any PDF
          viewer. WhatsApp uses the device&rsquo;s built-in PDF viewer (such as
          Adobe Acrobat, Files, or Google Drive Viewer on Android) to display
          documents, and all of these handle compressed PDFs perfectly.
        </p>

        <h3>Can I compress a PDF directly on my phone?</h3>
        <p>
          Yes. Compressly is a web-based tool that works fully in mobile browsers.
          Open the site in Chrome or Safari on your phone, upload your PDF from
          your device storage, compress it, and download the result directly to
          your phone — then attach it in WhatsApp without leaving your browser.
        </p>
      </div>

      <AdPlaceholder slot="sidebar" className="mt-8" />

      <AlsoTry currentSlug="compress-pdf-for-whatsapp" />
    </div>
  );
}
