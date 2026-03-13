"use client";

import { useCallback, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Upload, FileImage, FileText } from "lucide-react";
import clsx from "clsx";

interface FileDropzoneProps {
  accept: string;
  maxSize: number;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  icon?: ReactNode;
  title: string;
  subtitle: string;
}

export default function FileDropzone({
  accept,
  maxSize,
  multiple = true,
  onFiles,
  icon,
  title,
  subtitle,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((f) => {
        const ext = f.name.split(".").pop()?.toLowerCase();
        const accepted = accept.split(",").map((a) => a.trim().replace(".", "").replace("image/", "").replace("application/", ""));
        return accepted.some((a) => ext === a || f.type.includes(a)) && f.size <= maxSize;
      });
      if (files.length > 0) onFiles(files);
    },
    [accept, maxSize, onFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).filter(
        (f) => f.size <= maxSize
      );
      if (files.length > 0) onFiles(files);
      e.target.value = "";
    },
    [maxSize, onFiles]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={clsx(
          "relative flex flex-col items-center justify-center w-full min-h-[280px] border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300",
          isDragging
            ? "border-primary bg-secondary/50 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <motion.div
          animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
          className="flex flex-col items-center gap-4 p-8"
        >
          <div className="p-4 rounded-2xl bg-secondary/50">
            {icon || <Upload className="w-10 h-10 text-primary" />}
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{title}</p>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className="gradient-bg text-white px-6 py-2.5 rounded-xl text-sm font-medium">
            Choose Files
          </div>
        </motion.div>
      </label>
    </motion.div>
  );
}
