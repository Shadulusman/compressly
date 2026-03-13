"use client";

import { motion } from "framer-motion";
import { Download, Check, Loader2, X } from "lucide-react";
import clsx from "clsx";

export interface FileResult {
  id: string;
  name: string;
  originalSize: number;
  compressedSize: number;
  status: "compressing" | "done" | "error";
  url?: string;
  error?: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getSavingsPercent(original: number, compressed: number): number {
  if (original === 0) return 0;
  return Math.round(((original - compressed) / original) * 100);
}

export default function CompressionResult({
  results,
  onDownloadAll,
}: {
  results: FileResult[];
  onDownloadAll?: () => void;
}) {
  const allDone = results.every((r) => r.status === "done");
  const totalOriginal = results.reduce((a, r) => a + r.originalSize, 0);
  const totalCompressed = results.reduce(
    (a, r) => a + (r.status === "done" ? r.compressedSize : r.originalSize),
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 space-y-4"
    >
      {/* Summary */}
      {results.length > 1 && allDone && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-success/10 border border-success/20">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-success" />
            <span className="font-medium">
              {results.length} files compressed &mdash; saved{" "}
              {getSavingsPercent(totalOriginal, totalCompressed)}% (
              {formatBytes(totalOriginal - totalCompressed)})
            </span>
          </div>
          {onDownloadAll && (
            <button
              onClick={onDownloadAll}
              className="gradient-bg text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Download className="w-4 h-4" />
              Download All
            </button>
          )}
        </div>
      )}

      {/* Individual results */}
      <div className="space-y-3">
        {results.map((result, i) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-card"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={clsx(
                  "p-2 rounded-lg",
                  result.status === "done" && "bg-success/10",
                  result.status === "compressing" && "bg-primary/10",
                  result.status === "error" && "bg-destructive/10"
                )}
              >
                {result.status === "compressing" && (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                )}
                {result.status === "done" && (
                  <Check className="w-4 h-4 text-success" />
                )}
                {result.status === "error" && (
                  <X className="w-4 h-4 text-destructive" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{result.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span>{formatBytes(result.originalSize)}</span>
                  {result.status === "done" && (
                    <>
                      <span>&rarr;</span>
                      <span className="text-success font-medium">
                        {formatBytes(result.compressedSize)}
                      </span>
                    </>
                  )}
                  {result.status === "error" && (
                    <span className="text-destructive">{result.error}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-4">
              {result.status === "done" && (
                <>
                  <span className="text-sm font-bold text-success">
                    -{getSavingsPercent(result.originalSize, result.compressedSize)}%
                  </span>
                  {result.url && (
                    <a
                      href={result.url}
                      download={result.name}
                      className="gradient-bg text-white p-2 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </>
              )}

              {result.status === "compressing" && (
                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full gradient-bg rounded-full animate-pulse w-2/3" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
