"use client";

import { useState, useCallback } from "react";
import { Image as ImageIcon } from "lucide-react";
import FileDropzone from "@/components/FileDropzone";
import CompressionResult, { FileResult } from "@/components/CompressionResult";
import AdPlaceholder from "@/components/AdPlaceholder";
import { compressImageClient } from "@/lib/compress-image-client";

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export default function CompressImagePage() {
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
        let compressed: File | Blob;

        // Use server-side compression for large files, client-side for small ones
        if (file.size > 5 * 1024 * 1024) {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/compress-image", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) throw new Error("Server compression failed");
          compressed = await res.blob();
        } else {
          compressed = await compressImageClient(file, {
            maxSizeMB: Math.max(0.1, file.size / 1024 / 1024 * 0.3),
            quality: 0.8,
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
          Compress <span className="gradient-text">Images</span> Online
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Reduce JPG, PNG, and WEBP file sizes by up to 90% without losing quality.
          Fast, free, and works in your browser.
        </p>
      </div>

      <FileDropzone
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        maxSize={MAX_SIZE}
        multiple={true}
        onFiles={handleFiles}
        icon={<ImageIcon className="w-10 h-10 text-primary" />}
        title="Drop your images here"
        subtitle="Supports JPG, PNG, WEBP up to 20MB each"
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
        <h2>How to Compress Images Online</h2>
        <p>
          Compressly makes it easy to reduce image file sizes without sacrificing quality.
          Simply drag and drop your JPG, PNG, or WEBP files and our tool will automatically
          compress them using smart algorithms that preserve visual fidelity.
        </p>

        <h3>Why Compress Images?</h3>
        <ul>
          <li>Faster website loading times and better Core Web Vitals</li>
          <li>Reduced storage space and bandwidth costs</li>
          <li>Easier sharing via email and messaging apps</li>
          <li>Better SEO rankings with optimized page speed</li>
        </ul>

        <h3>Supported Image Formats</h3>
        <p>
          Our image compressor supports the most popular web image formats:
          <strong> JPEG/JPG</strong> for photographs, <strong>PNG</strong> for graphics
          with transparency, and <strong>WEBP</strong> for modern web optimization.
        </p>

        <h3>How Does Image Compression Work?</h3>
        <p>
          Image compression uses lossy and lossless algorithms to reduce file sizes.
          Lossy compression selectively removes data that is less noticeable to the human eye,
          while lossless compression restructures data more efficiently without any quality loss.
          Compressly uses a combination of both to achieve optimal results.
        </p>
      </div>

      <AdPlaceholder slot="sidebar" className="mt-8" />
    </div>
  );
}
