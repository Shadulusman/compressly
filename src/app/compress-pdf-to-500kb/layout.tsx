import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF to 500KB - Reduce PDF Size Online Free",
  description:
    "Compress your PDF file to under 500KB online for free. Great for presentations, reports, and document sharing platforms. No signup required.",
  keywords: [
    "compress pdf to 500kb",
    "reduce pdf to 500kb",
    "pdf 500kb",
    "shrink pdf to 500kb",
    "pdf compressor 500kb",
  ],
  alternates: {
    canonical: "https://compressly.vercel.app/compress-pdf-to-500kb",
  },
  openGraph: {
    title: "Compress PDF to 500KB - Free Online Tool",
    description:
      "Reduce your PDF to under 500KB instantly. Free, secure, no signup needed.",
    url: "https://compressly.vercel.app/compress-pdf-to-500kb",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
