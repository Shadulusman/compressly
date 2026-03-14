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

export default function CompressPdfTo500KbPage() {
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
          Compress PDF to <span className="gradient-text">500KB</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Reduce PDF size to 500KB or less. Great for presentations, reports,
          and document sharing.
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
        💡 Tip: Balanced compression keeps your document looking sharp while
        meaningfully reducing file size. Switch to Strong for even smaller output.
      </div>

      <AdPlaceholder slot="in-content" className="mt-12" />

      {/* SEO Content */}
      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
        <h2>How to Compress a PDF to 500KB</h2>
        <p>
          A 500KB limit strikes the ideal balance between file size and quality,
          making it common for cloud storage uploads, intranet document portals,
          and team collaboration tools. Upload your PDF above, select Balanced
          or Strong compression based on your quality preference, and download
          your optimized file in moments.
        </p>
        <p>
          Our compression algorithm reduces image resolution, removes embedded
          thumbnails and hidden metadata layers, and applies Flate encoding to
          all content streams. The result is a noticeably smaller PDF that still
          looks great on screen and when printed.
        </p>

        <h3>Common Use Cases for 500KB PDFs</h3>
        <ul>
          <li>
            <strong>Business reports and proposals:</strong> Sharing polished
            reports via email or through client portals without hitting size caps.
          </li>
          <li>
            <strong>Presentation handouts:</strong> Slide decks exported as PDFs
            are often large; compressing to 500KB makes them easy to distribute.
          </li>
          <li>
            <strong>Legal and compliance documents:</strong> Many document
            management systems cap uploads at 500KB per file.
          </li>
          <li>
            <strong>E-learning and training materials:</strong> Course platforms
            restrict module PDFs to keep pages loading quickly on mobile devices.
          </li>
        </ul>

        <h3>Choosing the Right Compression Level</h3>
        <p>
          For most business documents with a mix of text and images, Balanced
          compression will achieve 500KB or less from files up to around 2MB.
          For larger source files or those with many full-page screenshots and
          diagrams, use Strong compression to maximize the reduction ratio.
        </p>
        <ul>
          <li><strong>Light:</strong> 10&ndash;20% reduction, maximum quality retained</li>
          <li><strong>Balanced:</strong> 25&ndash;45% reduction, ideal for most documents</li>
          <li><strong>Strong:</strong> 50&ndash;70% reduction, best for hitting tight size targets</li>
        </ul>

        <h2>Frequently Asked Questions</h2>

        <h3>Will compressing to 500KB make the PDF look blurry?</h3>
        <p>
          At Balanced compression, images are resampled to a comfortable screen
          resolution, and the result looks sharp on displays at normal zoom levels.
          Printed output remains clear for standard document use. Only at Strong
          compression on very image-heavy PDFs might fine detail in photos appear
          slightly softer.
        </p>

        <h3>Can I compress multiple PDFs at once to 500KB?</h3>
        <p>
          Yes. The tool supports batch uploads. Add multiple PDFs to the queue,
          set your compression level, and all files will be processed and
          individually available for download. Each file is compressed independently
          to achieve the best possible reduction.
        </p>

        <h3>Does the tool work on mobile devices?</h3>
        <p>
          Yes. Compressly works on any modern browser including Safari on iOS
          and Chrome on Android. The upload, compression, and download steps are
          all fully supported on mobile without requiring any app installation.
        </p>

        <h3>Are there any limits on how many files I can compress?</h3>
        <p>
          You can add as many files as you need in a single session. Each file
          can be up to 50MB before compression. There is no daily limit or
          account required to use the tool.
        </p>
      </div>

      <AdPlaceholder slot="sidebar" className="mt-8" />

      <AlsoTry currentSlug="compress-pdf-to-500kb" />
    </div>
  );
}
