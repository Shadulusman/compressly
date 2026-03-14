"use client";
import { useState, useCallback } from "react";
import { FilePlus2, X, GripVertical, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileDropzone from "@/components/FileDropzone";
import AdPlaceholder from "@/components/AdPlaceholder";
import AlsoTry from "@/components/AlsoTry";

interface PendingFile { file: File; id: string; }

export default function MergePdfPage() {
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((incoming: File[]) => {
    const pdfs = incoming.filter(f => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    setFiles(prev => [...prev, ...pdfs.map(f => ({ file: f, id: Math.random().toString(36).slice(2) }))]);
    setResultUrl(null); setError(null);
  }, []);

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));

  const handleMerge = async () => {
    if (files.length < 2) { setError("Please add at least 2 PDF files."); return; }
    setIsProcessing(true); setError(null); setResultUrl(null);
    try {
      const formData = new FormData();
      files.forEach(pf => formData.append("files", pf.file));
      const res = await fetch("/api/merge-pdf", { method: "POST", body: formData });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (e: any) { setError(e.message || "Merge failed."); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Merge <span className="gradient-text">PDF</span> Files Online</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Combine multiple PDF documents into one file. Free, fast, and secure — no signup required.</p>
      </div>

      <FileDropzone accept="application/pdf,.pdf" maxSize={20*1024*1024} multiple onFiles={handleFiles}
        icon={<FilePlus2 className="w-10 h-10 text-primary" />} title="Drop PDF files here" subtitle="Supports PDF files up to 20MB each" />

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>{files.length} file{files.length > 1 ? "s" : ""} — drag to reorder</span>
              <button onClick={() => { setFiles([]); setResultUrl(null); }} className="text-muted-foreground hover:text-foreground">Clear all</button>
            </div>
            {files.map((pf, i) => (
              <div key={pf.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm flex-1 truncate">{i + 1}. {pf.file.name}</span>
                <span className="text-xs text-muted-foreground">{(pf.file.size/1024).toFixed(0)} KB</span>
                <button onClick={() => removeFile(pf.id)}><X className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>
              </div>
            ))}
            {error && <p className="text-sm text-destructive">{error}</p>}
            {resultUrl ? (
              <a href={resultUrl} download="merged.pdf" className="flex items-center justify-center gap-2 gradient-bg text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                <Download className="w-5 h-5" /> Download Merged PDF
              </a>
            ) : (
              <button onClick={handleMerge} disabled={isProcessing || files.length < 2}
                className="w-full gradient-bg text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
                {isProcessing ? "Merging…" : `Merge ${files.length} PDF${files.length > 1 ? "s" : ""}`}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AdPlaceholder slot="in-content" className="mt-12" />
      <AlsoTry currentSlug="merge-pdf" />

      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
        <h2>How to Merge PDF Files Online</h2>
        <p>Upload two or more PDF files, then click Merge. Your files are combined in the order shown and downloaded instantly.</p>
        <h3>Why Merge PDFs?</h3>
        <ul>
          <li>Combine chapters, reports, or invoices into a single document</li>
          <li>Send fewer email attachments</li>
          <li>Keep related documents organized in one file</li>
        </ul>
      </div>
    </div>
  );
}
