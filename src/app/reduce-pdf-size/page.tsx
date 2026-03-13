"use client";

import { useState, useCallback } from "react";
import { Zap } from "lucide-react";
import FileDropzone from "@/components/FileDropzone";
import CompressionResult, { FileResult } from "@/components/CompressionResult";
import AdPlaceholder from "@/components/AdPlaceholder";
import { compressPdfClient } from "@/lib/compress-pdf-client";

const MAX_SIZE = 50 * 1024 * 1024;

export default function ReducePdfSizePage() {
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
        const compressed = await compressPdfClient(file);
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
              ? { ...r, status: "error", error: "Reduction failed" }
              : r
          )
        );
      }
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold">
          Reduce <span className="gradient-text">PDF Size</span> Online
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Maximum compression for the smallest possible PDF file size.
          Perfect for email attachments and uploads.
        </p>
      </div>

      <FileDropzone
        accept="application/pdf,.pdf"
        maxSize={MAX_SIZE}
        multiple={true}
        onFiles={handleFiles}
        icon={<Zap className="w-10 h-10 text-primary" />}
        title="Drop your PDFs here"
        subtitle="Supports PDF files up to 50MB each"
      />

      {results.length > 0 && <CompressionResult results={results} />}

      {results.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setResults([])}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear all &amp; reduce more
          </button>
        </div>
      )}

      <AdPlaceholder slot="in-content" className="mt-12" />

      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
        <h2>How to Reduce PDF File Size</h2>
        <p>
          Our advanced PDF reducer applies maximum compression techniques to
          minimize your PDF file size. This includes optimizing internal structures,
          compressing streams, and removing unnecessary metadata.
        </p>
        <h3>When to Use Maximum Compression</h3>
        <ul>
          <li>Email attachments with strict size limits</li>
          <li>Uploading to forms with file size restrictions</li>
          <li>Archiving documents for long-term storage</li>
          <li>Sharing large reports and presentations</li>
        </ul>
      </div>
    </div>
  );
}
