import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://compressly.vercel.app";

  const blogPosts = getAllPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const coreTools = [
    "/compress-pdf",
    "/compress-image",
    "/reduce-pdf-size",
    "/resize-image",
    "/merge-pdf",
    "/split-pdf",
    "/rotate-pdf",
    "/jpg-to-pdf",
    "/png-to-pdf",
    "/pdf-to-word",
    "/word-to-pdf",
    "/watermark-pdf",
    "/protect-pdf",
    "/unlock-pdf",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const seoLandingPages = [
    "/compress-pdf-to-100kb",
    "/compress-pdf-to-200kb",
    "/compress-pdf-to-500kb",
    "/compress-pdf-to-1mb",
    "/compress-pdf-for-email",
    "/compress-pdf-for-whatsapp",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...coreTools,
    ...seoLandingPages,
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogPosts,
  ];
}
