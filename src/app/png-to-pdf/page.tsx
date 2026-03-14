"use client";
import { useState, useCallback } from "react";
import { FileImage, Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileDropzone from "@/components/FileDropzone";
import AdPlaceholder from "@/components/AdPlaceholder";
import AlsoTry from "@/components/AlsoTry";

interface PendingFile { file: File; id: string; preview: string; }

export default function PngToPdfPage() {
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((incoming: File[]) => {
    const imgs = incoming.filter(f => f.type.startsWith("image/"));
    setFiles(prev => [...prev, ...imgs.map(f => ({ file: f, id: Math.random().toString(36).slice(2), preview: URL.createObjectURL(f) }))]);
    setResultUrl(null); setError(null);
  }, []);

  const convert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true); setError(null); setResultUrl(null);
    try {
      const formData = new FormData();
      files.forEach(pf => formData.append("files", pf.file));
      const res = await fetch("/api/png-to-pdf", { method: "POST", body: formData });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (e: any) { setError(e.message || "Conversion failed."); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold">PNG to <span className="gradient-text">PDF</span> Converter</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Convert PNG images to PDF instantly. Transparency preserved, no quality loss.</p>
      </div>

      <FileDropzone accept="image/png,.png" maxSize={15*1024*1024} multiple onFiles={handleFiles}
        icon={<FileImage className="w-10 h-10 text-primary" />} title="Drop your PNG images here" subtitle="PNG files up to 15MB each" />

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {files.map(pf => (
                <div key={pf.id} className="relative group rounded-lg overflow-hidden border border-border aspect-square">
                  <img src={pf.preview} alt={pf.file.name} className="w-full h-full object-cover" />
                  <button onClick={() => setFiles(p => p.filter(f => f.id !== pf.id))}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {resultUrl ? (
              <a href={resultUrl} download="converted.pdf" className="flex items-center justify-center gap-2 gradient-bg text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                <Download className="w-5 h-5" /> Download PDF
              </a>
            ) : (
              <button onClick={convert} disabled={isProcessing}
                className="w-full gradient-bg text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
                {isProcessing ? "Converting…" : `Convert ${files.length} PNG${files.length > 1 ? "s" : ""} to PDF`}
              </button>
            )}
            <button onClick={() => { setFiles([]); setResultUrl(null); }} className="w-full text-sm text-muted-foreground hover:text-foreground">Clear all</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AdPlaceholder slot="in-content" className="mt-12" />
      <AlsoTry currentSlug="png-to-pdf" />
      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
        <h2>How to Convert PNG to PDF</h2>
        <p>Upload your PNG images, then click Convert. Each image is placed on its own A4 page with transparency handled correctly, scaled to fit perfectly.</p>
        <h3>Why Convert PNG to PDF?</h3>
        <ul>
          <li>Preserve transparency and lossless quality in a portable format</li>
          <li>Combine multiple screenshots or diagrams into one document</li>
          <li>Submit design assets or UI mockups as a professional PDF</li>
        </ul>
      </div>
    </div>
  );
}
