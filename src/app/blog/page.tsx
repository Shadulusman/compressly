import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllPosts } from "@/lib/blog-data";
import AdPlaceholder from "@/components/AdPlaceholder";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - Image & PDF Compression Tips and Guides",
  description:
    "Learn about image compression, PDF optimization, web performance, and file size reduction. Expert guides and tutorials from Compressly.",
  alternates: {
    canonical: "https://compressly.vercel.app/blog",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold">
          Compressly <span className="gradient-text">Blog</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Expert guides on image compression, PDF optimization, and web performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:border-primary/30 transition-all group"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                {post.category}
              </span>
              <span className="text-xs text-muted-foreground">{post.readTime}</span>
            </div>
            <h2 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
              {post.title}
            </h2>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {post.description}
            </p>
            <div className="flex items-center gap-1 text-sm font-medium text-primary mt-4">
              Read article <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>

      <AdPlaceholder slot="banner" className="mt-12" />
    </div>
  );
}
