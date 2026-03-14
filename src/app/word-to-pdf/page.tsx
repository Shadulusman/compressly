"use client";
import { useState, useCallback } from "react";
import { FileOutput, Download, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileDropzone from "@/components/FileDropzone";
import AdPlaceholder from "@/components/AdPlaceholder";
import AlsoTry from "@/components/AlsoTry";

export default function WordToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("converted.pdf");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]); setResultUrl(null); setError(null);
  }, []);

  const convert = async () => {
    if (!file) return;
    setIsProcessing(true); setError(null); setResultUrl(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/word-to-pdf", { method: "POST", body: formData });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.(docx|doc)$/i, "") + ".pdf");
    } catch (e: any) { setError(e.message || "Conversion failed."); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Word to <span className="gradient-text">PDF</span> Converter</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Convert Word documents (.docx) to PDF format. Share, print, and archive your documents universally.</p>
      </div>

      {!file ? (
        <FileDropzone accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document" maxSize={20*1024*1024} multiple={false} onFiles={handleFiles}
          icon={<FileOutput className="w-10 h-10 text-primary" />} title="Drop your Word document here" subtitle=".docx and .doc files up to 20MB" />
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
              <FileText className="w-8 h-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0"><p className="font-medium truncate">{file.name}</p><p className="text-sm text-muted-foreground">{(file.size/1024).toFixed(0)} KB</p></div>
              <button onClick={() => { setFile(null); setResultUrl(null); }} className="text-xs text-muted-foreground hover:text-foreground">Change</button>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {resultUrl ? (
              <a href={resultUrl} download={resultName} className="flex items-center justify-center gap-2 gradient-bg text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                <Download className="w-5 h-5" /> Download PDF
              </a>
            ) : (
              <button onClick={convert} disabled={isProcessing}
                className="w-full gradient-bg text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
                {isProcessing ? "Converting…" : "Convert to PDF"}
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <AdPlaceholder slot="in-content" className="mt-12" />
      <AlsoTry currentSlug="word-to-pdf" />
      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
        <h2>How to Convert Word to PDF</h2>
        <p>Upload your .docx file and click Convert. Your Word document is transformed into a clean, universally compatible PDF.</p>
        <h3>Why Convert Word to PDF?</h3>
        <ul>
          <li>PDF format looks the same on every device</li>
          <li>Prevent accidental edits to your document</li>
          <li>Share resumes, contracts, and reports professionally</li>
        </ul>
      </div>
    </div>
  );
}
