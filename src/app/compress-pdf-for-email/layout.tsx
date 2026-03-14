import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF for Email - Reduce PDF for Gmail & Outlook",
  description:
    "Compress PDF files for email attachments. Gmail limits attachments to 25MB, Outlook to 20MB. Reduce your PDF size instantly so it gets through every time. No signup required.",
  keywords: [
    "compress pdf for email",
    "reduce pdf for email",
    "pdf email attachment",
    "compress pdf gmail",
    "compress pdf outlook",
    "shrink pdf for email",
  ],
  alternates: {
    canonical: "https://compressly.vercel.app/compress-pdf-for-email",
  },
  openGraph: {
    title: "Compress PDF for Email - Gmail & Outlook Ready",
    description:
      "Shrink your PDF so it fits email attachment limits. Free, fast, no signup needed.",
    url: "https://compressly.vercel.app/compress-pdf-for-email",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
