"use client";
import { useState, useCallback } from "react";
import { FileText, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileDropzone from "@/components/FileDropzone";
import AdPlaceholder from "@/components/AdPlaceholder";
import AlsoTry from "@/components/AlsoTry";

export default function PdfToWordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("converted.docx");
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
      const res = await fetch("/api/pdf-to-word", { method: "POST", body: formData });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
      setResultName(file.name.replace(/\.pdf$/i, "") + ".docx");
    } catch (e: any) { setError(e.message || "Conversion failed."); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold">PDF to <span className="gradient-text">Word</span> Converter</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Convert PDF documents to editable Word (.docx) files. Extract text and structure instantly.</p>
      </div>

      {!file ? (
        <FileDropzone accept="application/pdf,.pdf" maxSize={20*1024*1024} multiple={false} onFiles={handleFiles}
          icon={<FileText className="w-10 h-10 text-primary" />} title="Drop your PDF here" subtitle="PDF files up to 20MB" />
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
              <FileText className="w-8 h-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0"><p className="font-medium truncate">{file.name}</p><p className="text-sm text-muted-foreground">{(file.size/1024).toFixed(0)} KB</p></div>
              <button onClick={() => { setFile(null); setResultUrl(null); }} className="text-xs text-muted-foreground hover:text-foreground">Change</button>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300">Works best with text-based PDFs. Scanned documents (image PDFs) may have limited text extraction.</p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {resultUrl ? (
              <a href={resultUrl} download={resultName} className="flex items-center justify-center gap-2 gradient-bg text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                <Download className="w-5 h-5" /> Download Word Document
              </a>
            ) : (
              <button onClick={convert} disabled={isProcessing}
                className="w-full gradient-bg text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
                {isProcessing ? "Converting…" : "Convert to Word"}
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <AdPlaceholder slot="in-content" className="mt-12" />
      <AlsoTry currentSlug="pdf-to-word" />
      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
        <h2>How to Convert PDF to Word</h2>
        <p>Upload your PDF and click Convert. The text content is extracted and formatted into a .docx file you can edit in Microsoft Word, Google Docs, or any word processor.</p>
        <h3>PDF to Word Conversion Tips</h3>
        <ul>
          <li>Text-based PDFs convert with best results</li>
          <li>Scanned PDFs need OCR for full text extraction</li>
          <li>Formatting is simplified — complex layouts may differ</li>
        </ul>
      </div>
    </div>
  );
}
