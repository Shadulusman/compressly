import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF to 200KB - Reduce PDF Size Online Free",
  description:
    "Compress your PDF file to under 200KB online for free. Ideal for government forms, job applications, and email attachments with size limits. No signup required.",
  keywords: [
    "compress pdf to 200kb",
    "reduce pdf to 200kb",
    "pdf 200kb",
    "shrink pdf to 200kb",
    "pdf compressor 200kb",
  ],
  alternates: {
    canonical: "https://compressly.vercel.app/compress-pdf-to-200kb",
  },
  openGraph: {
    title: "Compress PDF to 200KB - Free Online Tool",
    description:
      "Reduce your PDF to under 200KB instantly. Free, secure, no signup needed.",
    url: "https://compressly.vercel.app/compress-pdf-to-200kb",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
