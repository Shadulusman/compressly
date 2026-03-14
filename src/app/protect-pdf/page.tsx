"use client";
import { useState, useCallback } from "react";
import { Lock, Download, FileText, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileDropzone from "@/components/FileDropzone";
import AdPlaceholder from "@/components/AdPlaceholder";
import AlsoTry from "@/components/AlsoTry";

export default function ProtectPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]); setResultUrl(null); setError(null);
  }, []);

  const protect = async () => {
    if (!file || password.length < 4) return;
    setIsProcessing(true); setError(null); setResultUrl(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password);
      const res = await fetch("/api/protect-pdf", { method: "POST", body: formData });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setResultUrl(URL.createObjectURL(await res.blob()));
    } catch (e: any) { setError(e.message || "Failed to protect PDF."); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Protect <span className="gradient-text">PDF</span> Online</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Add security restrictions and metadata protection to your PDF documents.</p>
      </div>

      {!file ? (
        <FileDropzone accept="application/pdf,.pdf" maxSize={50*1024*1024} multiple={false} onFiles={handleFiles}
          icon={<Lock className="w-10 h-10 text-primary" />} title="Drop your PDF here" subtitle="PDF files up to 50MB" />
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
              <FileText className="w-8 h-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0"><p className="font-medium truncate">{file.name}</p><p className="text-sm text-muted-foreground">{(file.size/1024).toFixed(0)} KB</p></div>
              <button onClick={() => { setFile(null); setResultUrl(null); }} className="text-xs text-muted-foreground hover:text-foreground">Change</button>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Protection password (min. 4 characters)</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="Enter password…" />
                <button onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && password.length < 4 && <p className="text-xs text-destructive mt-1">Password must be at least 4 characters</p>}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {resultUrl ? (
              <a href={resultUrl} download={`protected-${file.name}`} className="flex items-center justify-center gap-2 gradient-bg text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                <Download className="w-5 h-5" /> Download Protected PDF
              </a>
            ) : (
              <button onClick={protect} disabled={isProcessing || password.length < 4}
                className="w-full gradient-bg text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
                {isProcessing ? "Protecting…" : "Protect PDF"}
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <AdPlaceholder slot="in-content" className="mt-12" />
      <AlsoTry currentSlug="protect-pdf" />
      <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
        <h2>How to Protect a PDF Online</h2>
        <p>Upload your PDF, enter a password, and click Protect. Your document will have security metadata applied.</p>
        <h3>Why Protect PDFs?</h3>
        <ul>
          <li>Prevent unauthorized access to sensitive documents</li>
          <li>Restrict copying and printing of your content</li>
          <li>Secure contracts, reports, and personal information</li>
        </ul>
      </div>
    </div>
  );
}
