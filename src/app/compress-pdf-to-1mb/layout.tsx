import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF to 1MB - Reduce PDF Size Online Free",
  description:
    "Compress your PDF file to under 1MB online for free. Perfect for online submissions, portals, and document management systems. No signup required.",
  keywords: [
    "compress pdf to 1mb",
    "reduce pdf to 1mb",
    "pdf 1mb",
    "shrink pdf to 1mb",
    "pdf compressor 1mb",
    "compress pdf under 1mb",
  ],
  alternates: {
    canonical: "https://compressly.vercel.app/compress-pdf-to-1mb",
  },
  openGraph: {
    title: "Compress PDF to 1MB - Free Online Tool",
    description:
      "Reduce your PDF to under 1MB instantly while preserving quality. Free, secure, no signup needed.",
    url: "https://compressly.vercel.app/compress-pdf-to-1mb",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
