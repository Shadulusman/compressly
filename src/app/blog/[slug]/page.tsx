import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { getPostBySlug, getAllPosts } from "@/lib/blog-data";
import AdPlaceholder from "@/components/AdPlaceholder";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `https://compressly.vercel.app/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://compressly.vercel.app/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllPosts().filter((p) => p.slug !== slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "Compressly",
    },
    publisher: {
      "@type": "Organization",
      name: "Compressly",
    },
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Blog
      </Link>

      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
            {post.category}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {post.readTime}
          </span>
        </div>
      </header>

      <AdPlaceholder slot="in-content" />

      <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
        {post.content.split("\n").map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return null;

          if (trimmed.startsWith("## ")) {
            return (
              <h2 key={i} id={trimmed.slice(3).toLowerCase().replace(/\s+/g, "-")}>
                {trimmed.slice(3)}
              </h2>
            );
          }
          if (trimmed.startsWith("### ")) {
            return <h3 key={i}>{trimmed.slice(4)}</h3>;
          }
          if (trimmed.startsWith("- **")) {
            const match = trimmed.match(/^- \*\*(.+?)\*\*:?\s*(.*)$/);
            if (match) {
              return (
                <li key={i}>
                  <strong>{match[1]}</strong>
                  {match[2] ? `: ${match[2]}` : ""}
                </li>
              );
            }
          }
          if (trimmed.startsWith("- ")) {
            return <li key={i}>{renderInlineMarkdown(trimmed.slice(2))}</li>;
          }
          if (trimmed.startsWith("1. ") || /^\d+\.\s/.test(trimmed)) {
            const text = trimmed.replace(/^\d+\.\s*/, "");
            return <li key={i}>{renderInlineMarkdown(text)}</li>;
          }
          if (trimmed.startsWith("- [ ]")) {
            return <li key={i}>{renderInlineMarkdown(trimmed.slice(6))}</li>;
          }

          return <p key={i}>{renderInlineMarkdown(trimmed)}</p>;
        })}
      </div>

      <AdPlaceholder slot="in-content" className="mt-8" />

      {/* CTA */}
      <div className="mt-12 p-8 rounded-2xl gradient-bg text-white text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to Compress Your Files?</h2>
        <p className="opacity-90 mb-6">
          Try Compressly free - no signup required.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/compress-image"
            className="bg-white text-primary px-6 py-3 rounded-xl font-bold hover:bg-white/90 transition-colors"
          >
            Compress Images
          </Link>
          <Link
            href="/compress-pdf"
            className="bg-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-colors"
          >
            Compress PDFs
          </Link>
        </div>
      </div>

      {/* Related Posts */}
      {allPosts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="block p-5 rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all group"
              >
                <span className="text-xs font-medium text-primary">{related.category}</span>
                <h3 className="text-sm font-bold mt-2 group-hover:text-primary transition-colors">
                  {related.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      <AdPlaceholder slot="sidebar" className="mt-8" />
    </article>
  );
}

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
  return parts.map((part, i) => {
    const boldMatch = part.match(/^\*\*(.+?)\*\*$/);
    if (boldMatch) {
      return <strong key={i}>{boldMatch[1]}</strong>;
    }
    const linkMatch = part.match(/^\[(.+?)\]\((.+?)\)$/);
    if (linkMatch) {
      return (
        <Link key={i} href={linkMatch[2]} className="text-primary hover:underline">
          {linkMatch[1]}
        </Link>
      );
    }
    return part;
  });
}
