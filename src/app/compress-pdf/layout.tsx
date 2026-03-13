import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF Online Free - Reduce PDF Size",
  description:
    "Compress PDF files online for free. Reduce PDF size by up to 90% without losing quality. Fast, secure, no signup required.",
  keywords: [
    "compress pdf",
    "pdf compression",
    "reduce pdf size",
    "shrink pdf",
    "pdf compressor",
    "online pdf compressor",
    "pdf optimizer",
  ],
  alternates: {
    canonical: "https://compressly.vercel.app/compress-pdf",
  },
  openGraph: {
    title: "Compress PDF Online Free - Compressly",
    description: "Reduce PDF file sizes by up to 90% without losing quality.",
    url: "https://compressly.vercel.app/compress-pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
