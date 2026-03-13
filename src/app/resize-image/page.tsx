"use client";

import { useState, useCallback } from "react";
import { Minimize2 } from "lucide-react";
import FileDropzone from "@/components/FileDropzone";
import CompressionResult, { FileResult } from "@/components/CompressionResult";
import AdPlaceholder from "@/components/AdPlaceholder";
import { compressImageClient } from "@/lib/compress-image-client";

const MAX_SIZE = 20 * 1024 * 1024;

export default function ResizeImagePage() {
  const [results, setResults] = useState<FileResult[]>([]);
  const [maxDimension, setMaxDimension] = useState(1920);

  const handleFiles = useCallback(
    async (files: File[]) => {
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
          const compressed = await compressImageClient(file, {
            maxSizeMB: 10,
            maxWidthOrHeight: maxDimension,
            quality: 0.9,
          });

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
    },
    [maxDimension]
  );

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

      <div className="mb-6 flex items-center justify-center gap-4">
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

      <FileDropzone
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        maxSize={MAX_SIZE}
        multiple={true}
        onFiles={handleFiles}
        icon={<Minimize2 className="w-10 h-10 text-primary" />}
        title="Drop your images here"
        subtitle="Supports JPG, PNG, WEBP up to 20MB each"
      />

      {results.length > 0 && <CompressionResult results={results} />}

      {results.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setResults([])}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear all &amp; resize more
          </button>
        </div>
      )}

      <AdPlaceholder slot="in-content" className="mt-12" />

      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
        <h2>How to Resize Images Online</h2>
        <p>
          Select your desired maximum dimension and upload your images.
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
