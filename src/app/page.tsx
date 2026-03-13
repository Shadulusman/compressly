"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap,
  Image,
  FileText,
  ArrowRight,
  Shield,
  Clock,
  Minimize2,
  Upload,
  Settings,
  Download,
  ChevronDown,
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
              Compress Files{" "}
              <span className="gradient-text">Instantly</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Reduce image and PDF file sizes by up to 90% without losing quality.
              Fast, free, and works right in your browser.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/compress-image"
                className="gradient-bg text-white px-8 py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
              >
                <Image className="w-5 h-5" />
                Compress Images
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/compress-pdf"
                className="border-2 border-border bg-card px-8 py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-2 hover:border-primary/50 hover:bg-muted transition-all"
              >
                <FileText className="w-5 h-5" />
                Compress PDFs
              </Link>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Supports JPG, PNG, WEBP, and PDF &middot; Up to 20MB for images &middot; Up to 50MB for PDFs
            </p>
          </motion.div>
        </div>
      </section>

      <AdPlaceholder slot="banner" className="max-w-4xl mx-auto" />

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Why Choose <span className="gradient-text">Compressly</span>?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for speed and simplicity. Compress your files in seconds.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Lightning Fast",
                desc: "Files compress in seconds using advanced algorithms. No waiting, no queues.",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Secure & Private",
                desc: "Files are processed in your browser. Nothing is uploaded to our servers for small files.",
              },
              {
                icon: <Minimize2 className="w-6 h-6" />,
                title: "Up to 90% Smaller",
                desc: "Advanced compression reduces file sizes dramatically while preserving visual quality.",
              },
              {
                icon: <Image className="w-6 h-6" />,
                title: "Multi-Format Support",
                desc: "Compress JPG, PNG, WEBP images and PDF documents all in one place.",
              },
              {
                icon: <Upload className="w-6 h-6" />,
                title: "Bulk Processing",
                desc: "Upload and compress multiple files at once. Save time on batch operations.",
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "No Signup Needed",
                desc: "Start compressing immediately. No registration, no email, completely free.",
              },
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
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three simple steps to smaller files
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <Upload className="w-8 h-8" />,
                title: "Upload Your Files",
                desc: "Drag and drop your images or PDFs, or click to browse. Supports bulk uploads.",
              },
              {
                step: "02",
                icon: <Settings className="w-8 h-8" />,
                title: "Auto-Compress",
                desc: "Our algorithms automatically find the best compression level for your files.",
              },
              {
                step: "03",
                icon: <Download className="w-8 h-8" />,
                title: "Download Results",
                desc: "Get your compressed files instantly. Download individually or all at once.",
              },
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

      {/* Tools Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Our <span className="gradient-text">Tools</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to optimize your files
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                href: "/compress-image",
                icon: <Image className="w-8 h-8" />,
                title: "Image Compressor",
                desc: "Compress JPG, PNG, and WEBP images without losing quality. Reduce sizes by up to 90%.",
                formats: "JPG, PNG, WEBP",
              },
              {
                href: "/compress-pdf",
                icon: <FileText className="w-8 h-8" />,
                title: "PDF Compressor",
                desc: "Shrink PDF file sizes for easier sharing and faster uploads. Perfect for email attachments.",
                formats: "PDF",
              },
              {
                href: "/resize-image",
                icon: <Minimize2 className="w-8 h-8" />,
                title: "Image Resizer",
                desc: "Resize images to exact dimensions. Perfect for social media, web, and print.",
                formats: "JPG, PNG, WEBP",
              },
              {
                href: "/reduce-pdf-size",
                icon: <Zap className="w-8 h-8" />,
                title: "PDF Size Reducer",
                desc: "Advanced PDF reduction with maximum compression for the smallest possible file size.",
                formats: "PDF",
              },
            ].map((tool, i) => (
              <motion.div
                key={tool.href}
                {...stagger}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link
                  href={tool.href}
                  className="block p-8 rounded-2xl border border-border bg-card hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start gap-5">
                    <div className="p-3 rounded-xl bg-secondary/50 group-hover:bg-primary/10 transition-colors">
                      <div className="text-primary">{tool.icon}</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-muted-foreground mb-3">{tool.desc}</p>
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                        {tool.formats}
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-1" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </motion.div>

          <div className="space-y-3">
            {[
              {
                q: "Is Compressly free to use?",
                a: "Yes, Compressly is completely free. No signup, no hidden fees, no watermarks. Just upload your files and compress them instantly.",
              },
              {
                q: "Does compression reduce image quality?",
                a: "Our smart compression algorithms reduce file size while maintaining visual quality. In most cases, the difference is imperceptible to the human eye, with file sizes reduced by 50-90%.",
              },
              {
                q: "What file formats are supported?",
                a: "We support JPG, PNG, and WEBP for images, and PDF for documents. More formats are coming soon.",
              },
              {
                q: "Is there a file size limit?",
                a: "Images can be up to 20MB each, and PDFs up to 50MB. You can upload multiple files at once for bulk compression.",
              },
              {
                q: "Are my files secure?",
                a: "Yes. Small files are compressed entirely in your browser and never leave your device. Larger files are processed on our secure servers and automatically deleted after compression.",
              },
              {
                q: "Can I compress multiple files at once?",
                a: "Absolutely! Our bulk compression feature lets you upload and compress dozens of files simultaneously. All results can be downloaded individually or as a single ZIP file.",
              },
            ].map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      <AdPlaceholder slot="in-content" className="max-w-4xl mx-auto" />

      {/* Blog Preview */}
      <section className="py-24">
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
              {
                slug: "how-to-compress-images-without-losing-quality",
                title: "How to Compress Images Without Losing Quality",
                excerpt: "Learn the best techniques to reduce image file sizes while maintaining visual fidelity for web and print.",
              },
              {
                slug: "best-way-to-reduce-pdf-file-size",
                title: "Best Way to Reduce PDF File Size",
                excerpt: "Discover proven methods to shrink your PDFs for easier email sharing and faster uploads.",
              },
              {
                slug: "how-image-compression-improves-website-speed",
                title: "How Image Compression Improves Website Speed",
                excerpt: "Understand the impact of optimized images on page load times and user experience.",
              },
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
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
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
              Ready to Compress Your Files?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
              Start reducing your file sizes now. Free, fast, and no signup required.
            </p>
            <Link
              href="/compress-image"
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

function FAQItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
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
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
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
