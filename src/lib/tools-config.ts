export interface Tool {
  name: string;
  slug: string;
  description: string;
  icon: string; // lucide icon name
  category: "compress" | "convert" | "organize" | "security";
  color: string; // tailwind color class for the icon bg
}

export const ALL_TOOLS: Tool[] = [
  { name: "Compress PDF", slug: "compress-pdf", description: "Reduce PDF file size up to 90%", icon: "FileDown", category: "compress", color: "bg-blue-100 text-blue-600" },
  { name: "Compress Image", slug: "compress-image", description: "Shrink JPG, PNG and WEBP files", icon: "ImageDown", category: "compress", color: "bg-indigo-100 text-indigo-600" },
  { name: "Merge PDF", slug: "merge-pdf", description: "Combine multiple PDFs into one", icon: "FilePlus2", category: "organize", color: "bg-green-100 text-green-600" },
  { name: "Split PDF", slug: "split-pdf", description: "Extract pages from your PDF", icon: "Scissors", category: "organize", color: "bg-yellow-100 text-yellow-600" },
  { name: "Rotate PDF", slug: "rotate-pdf", description: "Rotate PDF pages to any angle", icon: "RotateCw", category: "organize", color: "bg-orange-100 text-orange-600" },
  { name: "Resize Image", slug: "resize-image", description: "Resize images to any dimension", icon: "Minimize2", category: "compress", color: "bg-purple-100 text-purple-600" },
  { name: "JPG to PDF", slug: "jpg-to-pdf", description: "Convert JPG images to PDF", icon: "FileImage", category: "convert", color: "bg-pink-100 text-pink-600" },
  { name: "PNG to PDF", slug: "png-to-pdf", description: "Convert PNG images to PDF", icon: "FileImage", category: "convert", color: "bg-rose-100 text-rose-600" },
  { name: "PDF to Word", slug: "pdf-to-word", description: "Convert PDF to editable Word doc", icon: "FileText", category: "convert", color: "bg-cyan-100 text-cyan-600" },
  { name: "Word to PDF", slug: "word-to-pdf", description: "Convert Word documents to PDF", icon: "FileOutput", category: "convert", color: "bg-teal-100 text-teal-600" },
  { name: "Watermark PDF", slug: "watermark-pdf", description: "Add text watermark to PDF pages", icon: "Stamp", category: "security", color: "bg-violet-100 text-violet-600" },
  { name: "Protect PDF", slug: "protect-pdf", description: "Add password to your PDF", icon: "Lock", category: "security", color: "bg-red-100 text-red-600" },
  { name: "Unlock PDF", slug: "unlock-pdf", description: "Remove password from PDF", icon: "LockOpen", category: "security", color: "bg-emerald-100 text-emerald-600" },
  { name: "Reduce PDF Size", slug: "reduce-pdf-size", description: "Maximum compression for PDFs", icon: "Zap", category: "compress", color: "bg-amber-100 text-amber-600" },
];

export function getRelatedTools(currentSlug: string, count = 4): Tool[] {
  const current = ALL_TOOLS.find((t) => t.slug === currentSlug);
  if (!current) return ALL_TOOLS.slice(0, count);
  // Prefer same category first, then others
  const sameCategory = ALL_TOOLS.filter((t) => t.slug !== currentSlug && t.category === current.category);
  const others = ALL_TOOLS.filter((t) => t.slug !== currentSlug && t.category !== current.category);
  return [...sameCategory, ...others].slice(0, count);
}
