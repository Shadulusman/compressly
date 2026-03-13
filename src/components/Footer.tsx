import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      {/* Ad placeholder - footer */}
      <div className="max-w-7xl mx-auto px-4 py-3 text-center" id="ad-footer-banner">
        {/* Google AdSense Footer Ad Placeholder */}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="gradient-bg p-2 rounded-xl">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Compressly</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Fast, free online file compression. Reduce image and PDF sizes without losing quality.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Tools</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/compress-image" className="hover:text-foreground transition-colors">Compress Image</Link></li>
              <li><Link href="/compress-pdf" className="hover:text-foreground transition-colors">Compress PDF</Link></li>
              <li><Link href="/resize-image" className="hover:text-foreground transition-colors">Resize Image</Link></li>
              <li><Link href="/reduce-pdf-size" className="hover:text-foreground transition-colors">Reduce PDF Size</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="/blog/how-to-compress-images-without-losing-quality" className="hover:text-foreground transition-colors">Image Compression Guide</Link></li>
              <li><Link href="/blog/best-way-to-reduce-pdf-file-size" className="hover:text-foreground transition-colors">PDF Size Reduction</Link></li>
              <li><Link href="/blog/png-vs-jpg-file-size-comparison" className="hover:text-foreground transition-colors">PNG vs JPG</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/blog" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="/blog" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/blog" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/blog" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Compressly. All rights reserved. Free online file compression tools.</p>
        </div>
      </div>
    </footer>
  );
}
