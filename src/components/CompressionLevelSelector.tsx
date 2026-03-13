"use client";

import { motion } from "framer-motion";
import { Feather, Scale, Zap, Info } from "lucide-react";
import clsx from "clsx";
import { useState, type ReactNode } from "react";

export type CompressionLevel = "light" | "balanced" | "strong";

export interface CompressionLevelConfig {
  level: CompressionLevel;
  label: string;
  description: string;
  icon: ReactNode;
  quality: number;
  imageReduction: string;
  pdfReduction: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const COMPRESSION_LEVELS: CompressionLevelConfig[] = [
  {
    level: "light",
    label: "Light",
    description: "Best quality, smaller reduction",
    icon: <Feather className="w-6 h-6" />,
    quality: 0.85,
    imageReduction: "20-30%",
    pdfReduction: "10-20%",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-300 dark:border-emerald-700",
  },
  {
    level: "balanced",
    label: "Balanced",
    description: "Optimal quality and size",
    icon: <Scale className="w-6 h-6" />,
    quality: 0.65,
    imageReduction: "40-60%",
    pdfReduction: "25-40%",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-300 dark:border-blue-700",
  },
  {
    level: "strong",
    label: "Strong",
    description: "Maximum compression",
    icon: <Zap className="w-6 h-6" />,
    quality: 0.45,
    imageReduction: "70-80%",
    pdfReduction: "50-60%",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-300 dark:border-orange-700",
  },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function estimateCompressedSize(
  originalSize: number,
  level: CompressionLevel,
  type: "image" | "pdf"
): { min: number; max: number } {
  const reductions: Record<CompressionLevel, Record<"image" | "pdf", { min: number; max: number }>> = {
    light: {
      image: { min: 0.20, max: 0.30 },
      pdf: { min: 0.10, max: 0.20 },
    },
    balanced: {
      image: { min: 0.40, max: 0.60 },
      pdf: { min: 0.25, max: 0.40 },
    },
    strong: {
      image: { min: 0.70, max: 0.80 },
      pdf: { min: 0.50, max: 0.60 },
    },
  };

  const r = reductions[level][type];
  return {
    min: Math.round(originalSize * (1 - r.max)),
    max: Math.round(originalSize * (1 - r.min)),
  };
}

interface CompressionLevelSelectorProps {
  selectedLevel: CompressionLevel;
  onSelectLevel: (level: CompressionLevel) => void;
  totalFileSize?: number;
  fileType: "image" | "pdf";
  onCompress: () => void;
  isCompressing?: boolean;
  fileCount?: number;
}

export default function CompressionLevelSelector({
  selectedLevel,
  onSelectLevel,
  totalFileSize,
  fileType,
  onCompress,
  isCompressing = false,
  fileCount = 1,
}: CompressionLevelSelectorProps) {
  const [hoveredLevel, setHoveredLevel] = useState<CompressionLevel | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mt-8"
    >
      <h3 className="text-lg font-semibold text-center mb-2">
        Choose Compression Level
      </h3>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Select how much you want to compress your {fileCount > 1 ? "files" : "file"}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {COMPRESSION_LEVELS.map((config, index) => {
          const isSelected = selectedLevel === config.level;
          const isHovered = hoveredLevel === config.level;
          const estimate = totalFileSize
            ? estimateCompressedSize(totalFileSize, config.level, fileType)
            : null;

          return (
            <motion.button
              key={config.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectLevel(config.level)}
              onMouseEnter={() => setHoveredLevel(config.level)}
              onMouseLeave={() => setHoveredLevel(null)}
              className={clsx(
                "relative p-5 rounded-2xl border-2 transition-all duration-300 text-left",
                isSelected
                  ? `${config.borderColor} ${config.bgColor} shadow-lg`
                  : "border-border hover:border-primary/30 bg-card hover:bg-muted/50"
              )}
            >
              {/* Recommended badge for balanced */}
              {config.level === "balanced" && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-0.5 rounded-full gradient-bg text-white">
                  Recommended
                </span>
              )}

              <div className="flex items-center gap-3 mb-3">
                <div
                  className={clsx(
                    "p-2 rounded-xl transition-colors",
                    isSelected ? config.bgColor : "bg-secondary/50"
                  )}
                >
                  <span className={isSelected ? config.color : "text-muted-foreground"}>
                    {config.icon}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-base">{config.label}</h4>
                  <p className="text-xs text-muted-foreground">
                    {config.description}
                  </p>
                </div>
              </div>

              {/* Reduction range */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <Info className="w-3 h-3" />
                <span>
                  ~{fileType === "image" ? config.imageReduction : config.pdfReduction} smaller
                </span>
              </div>

              {/* Estimated output size */}
              {estimate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className={clsx(
                    "mt-2 pt-2 border-t text-xs",
                    isSelected ? "border-current/10" : "border-border"
                  )}
                >
                  <span className="text-muted-foreground">Est. output: </span>
                  <span className={clsx("font-semibold", isSelected ? config.color : "text-foreground")}>
                    {formatBytes(estimate.min)} – {formatBytes(estimate.max)}
                  </span>
                </motion.div>
              )}

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  layoutId="level-indicator"
                  className={clsx(
                    "absolute inset-0 rounded-2xl border-2",
                    config.borderColor
                  )}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Quality visualization bar */}
      <div className="mt-6 px-2">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Higher Quality</span>
          <span>Smaller Size</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                selectedLevel === "light"
                  ? "linear-gradient(90deg, #10b981, #34d399)"
                  : selectedLevel === "balanced"
                  ? "linear-gradient(90deg, #3b82f6, #60a5fa)"
                  : "linear-gradient(90deg, #f97316, #fb923c)",
            }}
            initial={{ width: "50%" }}
            animate={{
              width:
                selectedLevel === "light"
                  ? "30%"
                  : selectedLevel === "balanced"
                  ? "60%"
                  : "90%",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        </div>
      </div>

      {/* Compress button */}
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={onCompress}
          disabled={isCompressing}
          className={clsx(
            "gradient-bg text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 inline-flex items-center gap-2",
            isCompressing
              ? "opacity-60 cursor-not-allowed"
              : "hover:opacity-90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          {isCompressing ? (
            <>
              <motion.div
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
              Compressing...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Compress {fileCount > 1 ? `${fileCount} Files` : "File"}
            </>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}
