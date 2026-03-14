"use client";
import { useState, useCallback } from "react";
import { RotateCw, Download, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileDropzone from "@/components/FileDropzone";
import AdPlaceholder from "@/components/AdPlaceholder";
import AlsoTry from "@/components/AlsoTry";

export default function RotatePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]); setResultUrl(null); setError(null);
  }, []);

  const rotate = async () => {
    if (!file) return;
    setIsProcessing(true); setError(null); setResultUrl(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("rotation", rotation.toString());
      const res = await fetch("/api/rotate-pdf", { method: "POST", body: formData });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (e: any) { setError(e.message || "Rotation failed."); }
    finally { setIsProcessing(false); }
  };

  const ROTATIONS = [
    { value: 90, label: "90° CW" },
    { value: 180, label: "180°" },
    { value: 270, label: "90° CCW" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Rotate <span className="gradient-text">PDF</span> Online</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Fix upside-down or sideways PDF pages. Rotate all pages at once for free.</p>
      </div>

      {!file ? (
        <FileDropzone accept="application/pdf,.pdf" maxSize={50*1024*1024} multiple={false} onFiles={handleFiles}
          icon={<RotateCw className="w-10 h-10 text-primary" />} title="Drop your PDF here" subtitle="PDF files up to 50MB" />
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
              <FileText className="w-8 h-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size/1024).toFixed(0)} KB</p>
              </div>
              <button onClick={() => { setFile(null); setResultUrl(null); }} className="text-xs text-muted-foreground hover:text-foreground">Change</button>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">Rotation angle:</p>
              <div className="grid grid-cols-3 gap-3">
                {ROTATIONS.map(r => (
                  <button key={r.value} onClick={() => setRotation(r.value)}
                    className={`py-3 rounded-xl border-2 font-medium transition-all flex flex-col items-center gap-1 ${rotation === r.value ? "border-primary bg-primary/5 text-primary" : "border-border bg-card"}`}>
                    <RotateCw className="w-5 h-5" style={{ transform: `rotate(${r.value - 90}deg)` }} />
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {resultUrl ? (
              <a href={resultUrl} download={`rotated-${file.name}`} className="flex items-center justify-center gap-2 gradient-bg text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                <Download className="w-5 h-5" /> Download Rotated PDF
              </a>
            ) : (
              <button onClick={rotate} disabled={isProcessing}
                className="w-full gradient-bg text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
                {isProcessing ? "Rotating…" : "Rotate PDF"}
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <AdPlaceholder slot="in-content" className="mt-12" />
      <AlsoTry currentSlug="rotate-pdf" />
      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
        <h2>How to Rotate a PDF Online</h2>
        <p>Upload your PDF, select the rotation angle, and click Rotate. All pages will be rotated simultaneously.</p>
        <h3>Common Use Cases</h3>
        <ul>
          <li>Fix scanned documents that appear sideways</li>
          <li>Correct landscape PDFs for portrait viewing</li>
          <li>Adjust presentation slides for different orientations</li>
        </ul>
      </div>
    </div>
  );
}
