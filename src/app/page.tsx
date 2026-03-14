"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap, ArrowRight, Shield, Clock, Minimize2, Upload, Settings, Download,
  ChevronDown, FileDown, ImageDown, FilePlus2, Scissors, RotateCw,
  FileImage, FileText, FileOutput, Stamp, Lock, LockOpen,
} from "lucide-react";
import { useState } from "react";
import AdPlaceholder from "@/components/AdPlaceholder";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const toolCategories = [
  {
    label: "Compress & Optimize",
    color: "from-blue-500/10 to-indigo-500/10",
    borderColor: "border-blue-200 dark:border-blue-900",
    tools: [
      { href: "/compress-pdf", icon: FileDown, title: "Compress PDF", desc: "Reduce PDF file size up to 90% without losing quality.", iconBg: "bg-blue-100 text-blue-600" },
      { href: "/compress-image", icon: ImageDown, title: "Compress Image", desc: "Shrink JPG, PNG, WEBP images with smart compression.", iconBg: "bg-indigo-100 text-indigo-600" },
      { href: "/reduce-pdf-size", icon: Zap, title: "Reduce PDF Size", desc: "Maximum compression for the smallest possible PDF.", iconBg: "bg-amber-100 text-amber-600" },
      { href: "/resize-image", icon: Minimize2, title: "Resize Image", desc: "Resize images to exact dimensions for any use case.", iconBg: "bg-purple-100 text-purple-600" },
    ],
  },
  {
    label: "Organize PDF",
    color: "from-green-500/10 to-emerald-500/10",
    borderColor: "border-green-200 dark:border-green-900",
    tools: [
      { href: "/merge-pdf", icon: FilePlus2, title: "Merge PDF", desc: "Combine multiple PDFs into one document in seconds.", iconBg: "bg-green-100 text-green-600" },
      { href: "/split-pdf", icon: Scissors, title: "Split PDF", desc: "Extract specific pages or split PDFs into separate files.", iconBg: "bg-yellow-100 text-yellow-600" },
      { href: "/rotate-pdf", icon: RotateCw, title: "Rotate PDF", desc: "Rotate PDF pages 90°, 180° or 270° with one click.", iconBg: "bg-orange-100 text-orange-600" },
    ],
  },
  {
    label: "Convert PDF",
    color: "from-pink-500/10 to-rose-500/10",
    borderColor: "border-pink-200 dark:border-pink-900",
    tools: [
      { href: "/jpg-to-pdf", icon: FileImage, title: "JPG to PDF", desc: "Convert JPG images to PDF documents instantly.", iconBg: "bg-pink-100 text-pink-600" },
      { href: "/png-to-pdf", icon: FileImage, title: "PNG to PDF", desc: "Turn PNG images into professional PDF files.", iconBg: "bg-rose-100 text-rose-600" },
      { href: "/pdf-to-word", icon: FileText, title: "PDF to Word", desc: "Extract text from PDF and convert to editable DOCX.", iconBg: "bg-cyan-100 text-cyan-600" },
      { href: "/word-to-pdf", icon: FileOutput, title: "Word to PDF", desc: "Convert Word documents to PDF for easy sharing.", iconBg: "bg-teal-100 text-teal-600" },
    ],
  },
  {
    label: "PDF Security",
    color: "from-red-500/10 to-violet-500/10",
    borderColor: "border-red-200 dark:border-red-900",
    tools: [
      { href: "/watermark-pdf", icon: Stamp, title: "Watermark PDF", desc: "Add custom text watermarks to every page.", iconBg: "bg-violet-100 text-violet-600" },
      { href: "/protect-pdf", icon: Lock, title: "Protect PDF", desc: "Secure your PDF documents with password protection.", iconBg: "bg-red-100 text-red-600" },
      { href: "/unlock-pdf", icon: LockOpen, title: "Unlock PDF", desc: "Remove password restrictions from PDF files.", iconBg: "bg-emerald-100 text-emerald-600" },
    ],
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 to-transparent dark:from-primary/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Free &middot; Fast &middot; No Signup Required
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
              Your Free{" "}
              <span className="gradient-text">PDF & Image</span>
              {" "}Toolkit
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Compress, convert, merge, split, and secure your files instantly.
              14 free tools. No signup. Works in your browser.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/compress-pdf"
                className="gradient-bg text-white px-8 py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
              >
                <FileDown className="w-5 h-5" />
                Compress PDF
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/compress-image"
                className="border-2 border-border bg-card px-8 py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-2 hover:border-primary/50 hover:bg-muted transition-all"
              >
                <ImageDown className="w-5 h-5" />
                Compress Images
              </Link>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Supports JPG, PNG, WEBP &middot; Up to 20MB for images &middot; Up to 50MB for PDFs
            </p>
          </motion.div>
        </div>
      </section>

      <AdPlaceholder slot="banner" className="max-w-4xl mx-auto" />

      {/* All Tools Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              All <span className="gradient-text">Tools</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to work with PDFs and images — completely free
            </p>
          </motion.div>

          <div className="space-y-12">
            {toolCategories.map((cat, catIdx) => (
              <motion.div
                key={cat.label}
                {...stagger}
                transition={{ delay: catIdx * 0.1, duration: 0.5 }}
              >
                <h3 className="text-lg font-bold mb-4 text-muted-foreground uppercase tracking-wider text-sm">
                  {cat.label}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {cat.tools.map((tool, i) => {
                    const Icon = tool.icon;
                    return (
                      <motion.div
                        key={tool.href}
                        {...stagger}
                        transition={{ delay: catIdx * 0.05 + i * 0.05, duration: 0.4 }}
                      >
                        <Link
                          href={tool.href}
                          className="flex flex-col gap-3 p-5 rounded-2xl border border-border bg-card hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all group h-full"
                        >
                          <div className={`p-2.5 rounded-xl w-fit ${tool.iconBg}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                              {tool.title}
                            </h4>
                            <p className="text-sm text-muted-foreground leading-snug">{tool.desc}</p>
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary mt-auto">
                            Use free <ArrowRight className="w-3 h-3" />
                          </span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Why Choose <span className="gradient-text">Compressly</span>?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for speed and simplicity. Process your files in seconds.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Zap className="w-6 h-6" />, title: "Lightning Fast", desc: "Files are processed in seconds using advanced algorithms. No waiting, no queues." },
              { icon: <Shield className="w-6 h-6" />, title: "Secure & Private", desc: "All processing happens on secure servers. Your files are never stored permanently." },
              { icon: <Minimize2 className="w-6 h-6" />, title: "Up to 90% Smaller", desc: "Advanced compression reduces file sizes dramatically while preserving visual quality." },
              { icon: <FileText className="w-6 h-6" />, title: "14 PDF & Image Tools", desc: "Compress, convert, merge, split, rotate, watermark, protect and more — all free." },
              { icon: <Upload className="w-6 h-6" />, title: "Bulk Processing", desc: "Upload and process multiple files at once. Save time on batch operations." },
              { icon: <Clock className="w-6 h-6" />, title: "No Signup Needed", desc: "Start immediately. No registration, no email, completely free forever." },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                {...stagger}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:shadow-primary/5 transition-all group"
              >
                <div className="p-3 rounded-xl bg-secondary/50 w-fit mb-4 group-hover:bg-primary/10 transition-colors">
                  <div className="text-primary">{feature.icon}</div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three simple steps to smaller, better files
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: <Upload className="w-8 h-8" />, title: "Upload Your Files", desc: "Drag and drop your images or PDFs, or click to browse. Supports bulk uploads." },
              { step: "02", icon: <Settings className="w-8 h-8" />, title: "Choose Settings", desc: "Pick your compression level or conversion options. Defaults are optimized for you." },
              { step: "03", icon: <Download className="w-8 h-8" />, title: "Download Results", desc: "Get your processed files instantly. Download individually or all at once." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                {...stagger}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative text-center p-8"
              >
                <div className="text-7xl font-black text-primary/10 absolute top-0 left-1/2 -translate-x-1/2">
                  {item.step}
                </div>
                <div className="relative pt-10">
                  <div className="mx-auto w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-white mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AdPlaceholder slot="in-content" className="max-w-4xl mx-auto" />

      {/* Popular SEO Targets */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Popular <span className="gradient-text">Use Cases</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { href: "/compress-pdf-for-email", label: "Compress PDF for Email" },
              { href: "/compress-pdf-for-whatsapp", label: "Compress PDF for WhatsApp" },
              { href: "/compress-pdf-to-100kb", label: "PDF to 100KB" },
              { href: "/compress-pdf-to-200kb", label: "PDF to 200KB" },
              { href: "/compress-pdf-to-500kb", label: "PDF to 500KB" },
              { href: "/compress-pdf-to-1mb", label: "PDF to 1MB" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-center px-3 py-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-muted/60 transition-all text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </motion.div>

          <div className="space-y-3">
            {[
              { q: "Is Compressly completely free?", a: "Yes, Compressly is 100% free. No signup, no hidden fees, no watermarks on your files. All 14 tools are permanently free." },
              { q: "Does compression reduce quality?", a: "Our smart compression algorithms reduce file size while preserving visual quality. In most cases, the difference is imperceptible, with file sizes reduced by 50-90%." },
              { q: "What file formats are supported?", a: "We support JPG, PNG, and WEBP for images, and PDF for documents. We also convert between PDF and Word (DOCX) formats." },
              { q: "Is there a file size limit?", a: "Images can be up to 20MB each, and PDFs up to 50MB. You can upload multiple files at once for bulk processing." },
              { q: "Are my files secure?", a: "Yes. Your files are processed on secure servers and automatically deleted after processing. We never store your files permanently." },
              { q: "Can I use Compressly on mobile?", a: "Absolutely! Compressly works on all devices including smartphones and tablets. Our responsive design works great on any screen size." },
            ].map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      <AdPlaceholder slot="in-content" className="max-w-4xl mx-auto" />

      {/* Blog Preview */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              From the <span className="gradient-text">Blog</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tips and guides for optimizing your files
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { slug: "how-to-compress-images-without-losing-quality", title: "How to Compress Images Without Losing Quality", excerpt: "Learn the best techniques to reduce image file sizes while maintaining visual fidelity for web and print." },
              { slug: "best-way-to-reduce-pdf-file-size", title: "Best Way to Reduce PDF File Size", excerpt: "Discover proven methods to shrink your PDFs for easier email sharing and faster uploads." },
              { slug: "how-image-compression-improves-website-speed", title: "How Image Compression Improves Website Speed", excerpt: "Understand the impact of optimized images on page load times and user experience." },
            ].map((post, i) => (
              <motion.div
                key={post.slug}
                {...stagger}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="block p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:border-primary/30 transition-all group"
                >
                  <div className="text-xs font-medium text-primary mb-3">GUIDE</div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                  <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-4">
                    Read more <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:border-primary/50 hover:bg-muted transition-all font-medium"
            >
              View All Articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            className="text-center p-12 rounded-3xl gradient-bg text-white"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              14 Free Tools. Zero Signup.
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
              Compress, convert, merge, split, and secure your PDFs and images instantly.
            </p>
            <Link
              href="/compress-pdf"
              className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl text-lg font-bold hover:bg-white/90 transition-colors"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      {...stagger}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="border border-border rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full p-5 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="font-semibold pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="px-5 pb-5"
        >
          <p className="text-muted-foreground leading-relaxed">{answer}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
