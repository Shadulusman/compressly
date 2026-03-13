"use client";

import { useState, useCallback } from "react";
import { FileText } from "lucide-react";
import FileDropzone from "@/components/FileDropzone";
import CompressionResult, { FileResult } from "@/components/CompressionResult";
import AdPlaceholder from "@/components/AdPlaceholder";
import { compressPdfClient } from "@/lib/compress-pdf-client";

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export default function CompressPdfPage() {
  const [results, setResults] = useState<FileResult[]>([]);

  const handleFiles = useCallback(async (files: File[]) => {
    const newResults: FileResult[] = files.map((f) => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      originalSize: f.size,
      compressedSize: f.size,
      status: "compressing" as const,
    }));

    setResults((prev) => [...prev, ...newResults]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const resultId = newResults[i].id;

      try {
        let compressed: Blob;

        if (file.size > 10 * 1024 * 1024) {
          // Server-side for large files
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/compress-pdf", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) throw new Error("Server compression failed");
          compressed = await res.blob();
        } else {
          compressed = await compressPdfClient(file);
        }

        const url = URL.createObjectURL(compressed);

        setResults((prev) =>
          prev.map((r) =>
            r.id === resultId
              ? { ...r, status: "done", compressedSize: compressed.size, url }
              : r
          )
        );
      } catch (err) {
        setResults((prev) =>
          prev.map((r) =>
            r.id === resultId
              ? { ...r, status: "error", error: "Compression failed" }
              : r
          )
        );
      }
    }
  }, []);

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

      <FileDropzone
        accept="application/pdf,.pdf"
        maxSize={MAX_SIZE}
        multiple={true}
        onFiles={handleFiles}
        icon={<FileText className="w-10 h-10 text-primary" />}
        title="Drop your PDFs here"
        subtitle="Supports PDF files up to 50MB each"
      />

      {results.length > 0 && (
        <CompressionResult
          results={results}
          onDownloadAll={results.length > 1 ? handleDownloadAll : undefined}
        />
      )}

      {results.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setResults([])}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear all &amp; compress more
          </button>
        </div>
      )}

      <AdPlaceholder slot="in-content" className="mt-12" />

      {/* SEO Content */}
      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
        <h2>How to Compress PDF Files Online</h2>
        <p>
          Compressly provides a fast and easy way to reduce PDF file sizes.
          Upload your PDF documents and our compression engine will optimize them
          while maintaining readability and visual quality.
        </p>

        <h3>Why Compress PDFs?</h3>
        <ul>
          <li>Send PDFs via email without exceeding attachment limits</li>
          <li>Upload documents faster to cloud storage and forms</li>
          <li>Save disk space on your computer and mobile devices</li>
          <li>Share documents more easily through messaging apps</li>
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
