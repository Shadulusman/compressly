"use client";
import { useState, useCallback } from "react";
import { Stamp, Download, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileDropzone from "@/components/FileDropzone";
import AdPlaceholder from "@/components/AdPlaceholder";
import AlsoTry from "@/components/AlsoTry";

export default function WatermarkPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(0.2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]); setResultUrl(null); setError(null);
  }, []);

  const apply = async () => {
    if (!file || !text.trim()) return;
    setIsProcessing(true); setError(null); setResultUrl(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("text", text.trim());
      formData.append("opacity", opacity.toString());
      const res = await fetch("/api/watermark-pdf", { method: "POST", body: formData });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setResultUrl(URL.createObjectURL(await res.blob()));
    } catch (e: any) { setError(e.message || "Failed to add watermark."); }
    finally { setIsProcessing(false); }
  };

  const PRESETS = ["CONFIDENTIAL", "DRAFT", "SAMPLE", "DO NOT COPY", "INTERNAL USE"];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Watermark <span className="gradient-text">PDF</span> Online</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Add a diagonal text watermark to every page of your PDF. Perfect for drafts, samples, and confidential documents.</p>
      </div>

      {!file ? (
        <FileDropzone accept="application/pdf,.pdf" maxSize={50*1024*1024} multiple={false} onFiles={handleFiles}
          icon={<Stamp className="w-10 h-10 text-primary" />} title="Drop your PDF here" subtitle="PDF files up to 50MB" />
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
              <FileText className="w-8 h-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0"><p className="font-medium truncate">{file.name}</p><p className="text-sm text-muted-foreground">{(file.size/1024).toFixed(0)} KB</p></div>
              <button onClick={() => { setFile(null); setResultUrl(null); }} className="text-xs text-muted-foreground hover:text-foreground">Change</button>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Watermark text</label>
              <input value={text} onChange={e => setText(e.target.value.toUpperCase())} maxLength={50}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="e.g. CONFIDENTIAL" />
              <div className="flex flex-wrap gap-2 mt-2">
                {PRESETS.map(p => <button key={p} onClick={() => setText(p)} className={`text-xs px-3 py-1 rounded-full border transition-colors ${text === p ? "border-primary bg-primary/5 text-primary" : "border-border"}`}>{p}</button>)}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Opacity: {Math.round(opacity * 100)}%</label>
              <input type="range" min={5} max={60} value={Math.round(opacity*100)} onChange={e => setOpacity(parseInt(e.target.value)/100)}
                className="w-full accent-primary" />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {resultUrl ? (
              <a href={resultUrl} download={`watermarked-${file.name}`} className="flex items-center justify-center gap-2 gradient-bg text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                <Download className="w-5 h-5" /> Download Watermarked PDF
              </a>
            ) : (
              <button onClick={apply} disabled={isProcessing || !text.trim()}
                className="w-full gradient-bg text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
                {isProcessing ? "Adding Watermark…" : "Add Watermark"}
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <AdPlaceholder slot="in-content" className="mt-12" />
      <AlsoTry currentSlug="watermark-pdf" />
      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
        <h2>How to Watermark a PDF Online</h2>
        <p>Upload your PDF, type your watermark text, adjust the opacity, and click Add Watermark. The watermark appears diagonally on every page.</p>
        <h3>Why Add a Watermark?</h3>
        <ul>
          <li>Mark confidential or draft documents</li>
          <li>Brand your PDF reports and proposals</li>
          <li>Deter unauthorized redistribution of your content</li>
        </ul>
      </div>
    </div>
  );
}
