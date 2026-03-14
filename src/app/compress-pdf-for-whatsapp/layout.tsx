import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF for WhatsApp - Share PDFs on WhatsApp",
  description:
    "Compress PDF files to share on WhatsApp. WhatsApp limits document sharing to 100MB. Reduce your PDF size instantly to share on WhatsApp, Telegram, and other messaging apps. No signup required.",
  keywords: [
    "compress pdf for whatsapp",
    "share pdf on whatsapp",
    "pdf whatsapp limit",
    "reduce pdf whatsapp",
    "compress pdf messaging",
    "shrink pdf for whatsapp",
  ],
  alternates: {
    canonical: "https://compressly.vercel.app/compress-pdf-for-whatsapp",
  },
  openGraph: {
    title: "Compress PDF for WhatsApp - Share Easily on Messaging Apps",
    description:
      "Shrink your PDF to share on WhatsApp, Telegram, and Signal. Free, fast, no signup needed.",
    url: "https://compressly.vercel.app/compress-pdf-for-whatsapp",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
