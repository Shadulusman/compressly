"use client";
import { useState, useCallback } from "react";
import { LockOpen, Download, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileDropzone from "@/components/FileDropzone";
import AdPlaceholder from "@/components/AdPlaceholder";
import AlsoTry from "@/components/AlsoTry";

export default function UnlockPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]); setResultUrl(null); setError(null);
  }, []);

  const unlock = async () => {
    if (!file) return;
    setIsProcessing(true); setError(null); setResultUrl(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/unlock-pdf", { method: "POST", body: formData });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setResultUrl(URL.createObjectURL(await res.blob()));
    } catch (e: any) { setError(e.message || "Could not unlock PDF."); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Unlock <span className="gradient-text">PDF</span> Online</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Remove restrictions from your PDF. Unlock copy, print, and edit permissions for free.</p>
      </div>

      {!file ? (
        <FileDropzone accept="application/pdf,.pdf" maxSize={50*1024*1024} multiple={false} onFiles={handleFiles}
          icon={<LockOpen className="w-10 h-10 text-primary" />} title="Drop your PDF here" subtitle="PDF files up to 50MB" />
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
              <FileText className="w-8 h-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0"><p className="font-medium truncate">{file.name}</p><p className="text-sm text-muted-foreground">{(file.size/1024).toFixed(0)} KB</p></div>
              <button onClick={() => { setFile(null); setResultUrl(null); }} className="text-xs text-muted-foreground hover:text-foreground">Change</button>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>Note:</strong> Only use this tool on PDFs you own or have permission to modify. This removes restriction metadata from PDFs that allow it.
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {resultUrl ? (
              <a href={resultUrl} download={`unlocked-${file.name}`} className="flex items-center justify-center gap-2 gradient-bg text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                <Download className="w-5 h-5" /> Download Unlocked PDF
              </a>
            ) : (
              <button onClick={unlock} disabled={isProcessing}
                className="w-full gradient-bg text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
                {isProcessing ? "Unlocking…" : "Unlock PDF"}
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <AdPlaceholder slot="in-content" className="mt-12" />
      <AlsoTry currentSlug="unlock-pdf" />
      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
        <h2>How to Unlock a PDF Online</h2>
        <p>Upload your restricted PDF and click Unlock. Permission restrictions are removed so you can copy text, print, and edit freely.</p>
        <h3>When to Unlock a PDF?</h3>
        <ul>
          <li>Access PDFs you own but have lost editing rights to</li>
          <li>Print a document where printing was restricted</li>
          <li>Copy text from a protected report for reference</li>
        </ul>
      </div>
    </div>
  );
}
