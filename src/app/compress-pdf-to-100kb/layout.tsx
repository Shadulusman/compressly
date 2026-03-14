import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF to 100KB - Reduce PDF Size Online Free",
  description:
    "Compress your PDF file to under 100KB online for free. Perfect for email attachments and web forms with strict size limits. No signup required.",
  keywords: [
    "compress pdf to 100kb",
    "reduce pdf to 100kb",
    "pdf 100kb",
    "shrink pdf to 100kb",
    "pdf compressor 100kb",
  ],
  alternates: {
    canonical: "https://compressly.vercel.app/compress-pdf-to-100kb",
  },
  openGraph: {
    title: "Compress PDF to 100KB - Free Online Tool",
    description:
      "Reduce your PDF to under 100KB instantly. Free, secure, no signup needed.",
    url: "https://compressly.vercel.app/compress-pdf-to-100kb",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
