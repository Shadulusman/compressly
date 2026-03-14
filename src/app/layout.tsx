import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://compressly.vercel.app"),
  title: {
    default: "Compressly - Free Online PDF & Image Tools",
    template: "%s | Compressly",
  },
  description:
    "Compress images and PDFs instantly for free. Reduce file sizes up to 90% without losing quality. Support for JPG, PNG, WEBP, and PDF files. Fast, secure, and easy to use.",
  keywords: [
    "image compression",
    "pdf compression",
    "compress image online",
    "compress pdf online",
    "reduce file size",
    "image optimizer",
    "pdf reducer",
    "tinypng alternative",
    "compress jpg",
    "compress png",
    "free compression tool",
    "merge pdf",
    "split pdf",
    "pdf to word",
  ],
  authors: [{ name: "Compressly" }],
  creator: "Compressly",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://compressly.vercel.app",
    siteName: "Compressly",
    title: "Compressly - Free Online PDF & Image Tools",
    description:
      "Compress images and PDFs instantly for free. Reduce file sizes up to 90% without losing quality.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Compressly - Free PDF & Image Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compressly - Free Online PDF & Image Tools",
    description: "Compress images and PDFs instantly for free. Reduce file sizes up to 90%.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://compressly.vercel.app",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Compressly",
    url: "https://compressly.vercel.app",
    description: "Free online PDF and image tools — compress, merge, convert, and secure files",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>

        {/* Vercel Analytics */}
        <Analytics />
        <SpeedInsights />

        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
