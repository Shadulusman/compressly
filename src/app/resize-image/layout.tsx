import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resize Images Online Free - Change Image Dimensions",
  description:
    "Resize images online for free. Change dimensions for social media, web, and email. Maintains quality and aspect ratio. No signup required.",
  keywords: [
    "resize image",
    "image resizer",
    "change image size",
    "resize photo",
    "reduce image dimensions",
    "online image resizer",
  ],
  alternates: {
    canonical: "https://compressly.vercel.app/resize-image",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
