"use client";
import { useState, useCallback } from "react";
import { Scissors, Download, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileDropzone from "@/components/FileDropzone";
import AdPlaceholder from "@/components/AdPlaceholder";
import AlsoTry from "@/components/AlsoTry";

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPage, setSelectedPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ url: string; name: string }[]>([]);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0]; if (!f) return;
    setFile(f); setError(null); setResults([]); setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("file", f);
      formData.append("mode", "info");
      const res = await fetch("/api/split-pdf", { method: "POST", body: formData });
      const data = await res.json();
      if (data.totalPages) { setTotalPages(data.totalPages); setSelectedPage(1); }
      else throw new Error(data.error || "Could not read PDF");
    } catch (e: any) { setError(e.message); }
    finally { setIsAnalyzing(false); }
  }, []);

  const extractPage = async (page: number) => {
    if (!file) return;
    setIsProcessing(true); setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", "single");
      formData.append("page", page.toString());
      const res = await fetch("/api/split-pdf", { method: "POST", body: formData });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResults(prev => [...prev, { url, name: `page-${page}.pdf` }]);
    } catch (e: any) { setError(e.message || "Extraction failed."); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Split <span className="gradient-text">PDF</span> Online</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Extract individual pages from your PDF. Download any page as a separate PDF file.</p>
      </div>

      {!file ? (
        <FileDropzone accept="application/pdf,.pdf" maxSize={50*1024*1024} multiple={false} onFiles={handleFiles}
          icon={<Scissors className="w-10 h-10 text-primary" />} title="Drop your PDF here" subtitle="Supports PDF files up to 50MB" />
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-0 space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
              <FileText className="w-8 h-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">{isAnalyzing ? "Analyzing…" : `${totalPages} pages · ${(file.size/1024).toFixed(0)} KB`}</p>
              </div>
              <button onClick={() => { setFile(null); setTotalPages(0); setResults([]); }} className="text-xs text-muted-foreground hover:text-foreground">Change</button>
            </div>

            {totalPages > 0 && (
              <div>
                <p className="text-sm font-medium mb-3">Select a page to extract:</p>
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => extractPage(p)} disabled={isProcessing}
                      className="py-2 rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 text-sm font-medium transition-all disabled:opacity-50">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
            {isProcessing && <p className="text-sm text-muted-foreground">Extracting page…</p>}

            {results.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Extracted pages:</p>
                {results.map((r, i) => (
                  <a key={i} href={r.url} download={r.name} className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors">
                    <Download className="w-4 h-4 text-primary" />
                    <span className="text-sm">{r.name}</span>
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <AdPlaceholder slot="in-content" className="mt-12" />
      <AlsoTry currentSlug="split-pdf" />
      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
        <h2>How to Split a PDF Online</h2>
        <p>Upload your PDF, then click any page number to download it as a separate file. No registration required.</p>
        <h3>Common Uses for PDF Splitting</h3>
        <ul>
          <li>Extract a specific chapter from a book</li>
          <li>Separate invoices from a batch statement</li>
          <li>Share only one section of a report</li>
        </ul>
      </div>
    </div>
  );
}
