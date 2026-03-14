"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Moon, Menu, X, Zap, ChevronDown,
  FileDown, ImageDown, FilePlus2, Scissors, RotateCw,
  Minimize2, FileImage, FileText, FileOutput, Stamp,
  Lock, LockOpen, Mail,
} from "lucide-react";

const toolCategories = [
  {
    label: "Compress",
    tools: [
      { href: "/compress-pdf", label: "Compress PDF", icon: FileDown, desc: "Reduce PDF file size" },
      { href: "/compress-image", label: "Compress Image", icon: ImageDown, desc: "Shrink JPG, PNG, WEBP" },
      { href: "/reduce-pdf-size", label: "Reduce PDF Size", icon: Zap, desc: "Maximum PDF compression" },
      { href: "/resize-image", label: "Resize Image", icon: Minimize2, desc: "Change image dimensions" },
    ],
  },
  {
    label: "Organize",
    tools: [
      { href: "/merge-pdf", label: "Merge PDF", icon: FilePlus2, desc: "Combine multiple PDFs" },
      { href: "/split-pdf", label: "Split PDF", icon: Scissors, desc: "Extract PDF pages" },
      { href: "/rotate-pdf", label: "Rotate PDF", icon: RotateCw, desc: "Rotate PDF pages" },
    ],
  },
  {
    label: "Convert",
    tools: [
      { href: "/jpg-to-pdf", label: "JPG to PDF", icon: FileImage, desc: "Convert images to PDF" },
      { href: "/png-to-pdf", label: "PNG to PDF", icon: FileImage, desc: "Convert PNG to PDF" },
      { href: "/pdf-to-word", label: "PDF to Word", icon: FileText, desc: "Convert PDF to DOCX" },
      { href: "/word-to-pdf", label: "Word to PDF", icon: FileOutput, desc: "Convert DOCX to PDF" },
    ],
  },
  {
    label: "Security",
    tools: [
      { href: "/watermark-pdf", label: "Watermark PDF", icon: Stamp, desc: "Add text watermark" },
      { href: "/protect-pdf", label: "Protect PDF", icon: Lock, desc: "Add password protection" },
      { href: "/unlock-pdf", label: "Unlock PDF", icon: LockOpen, desc: "Remove PDF password" },
    ],
  },
];

function DropdownMenu({ category, onClose }: { category: typeof toolCategories[0]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-background border border-border rounded-xl shadow-xl shadow-black/5 overflow-hidden z-50"
    >
      <div className="p-2">
        {category.tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group"
            >
              <div className="p-1.5 rounded-lg bg-secondary/60 group-hover:bg-primary/10 transition-colors">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium leading-tight">{tool.label}</div>
                <div className="text-xs text-muted-foreground">{tool.desc}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      {/* Header ad banner */}
      <div className="bg-muted text-center py-1 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4" id="ad-header-banner">
          {/* Google AdSense Header Banner */}
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="gradient-bg p-2 rounded-xl">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Compressly</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {toolCategories.map((cat) => (
              <div
                key={cat.label}
                className="relative"
                onMouseEnter={() => handleMouseEnter(cat.label)}
                onMouseLeave={handleMouseLeave}
              >
                <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  {cat.label}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === cat.label ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {activeDropdown === cat.label && (
                    <DropdownMenu category={cat} onClose={() => setActiveDropdown(null)} />
                  )}
                </AnimatePresence>
              </div>
            ))}
            <Link
              href="/blog"
              className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Blog
            </Link>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              <Sun className="w-5 h-5 hidden dark:block" />
              <Moon className="w-5 h-5 block dark:hidden" />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-border"
            >
              <div className="py-3 space-y-1">
                {toolCategories.map((cat) => (
                  <div key={cat.label}>
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === cat.label ? null : cat.label)}
                      className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      {cat.label}
                      <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpanded === cat.label ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {mobileExpanded === cat.label && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden ml-4"
                        >
                          {cat.tools.map((tool) => {
                            const Icon = tool.icon;
                            return (
                              <Link
                                key={tool.href}
                                href={tool.href}
                                onClick={() => { setMobileOpen(false); setMobileExpanded(null); }}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              >
                                <Icon className="w-4 h-4 text-primary shrink-0" />
                                {tool.label}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                <Link
                  href="/blog"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Blog
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
