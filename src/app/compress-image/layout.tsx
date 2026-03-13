import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress Images Online Free - JPG, PNG, WEBP",
  description:
    "Compress JPG, PNG, and WEBP images online for free. Reduce image file sizes by up to 90% without losing quality. Fast, secure, no signup required.",
  keywords: [
    "compress image",
    "compress jpg",
    "compress png",
    "compress webp",
    "image compression",
    "reduce image size",
    "image optimizer",
    "online image compressor",
  ],
  alternates: {
    canonical: "https://compressly.vercel.app/compress-image",
  },
  openGraph: {
    title: "Compress Images Online Free - Compressly",
    description: "Reduce image file sizes by up to 90% without losing quality.",
    url: "https://compressly.vercel.app/compress-image",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
