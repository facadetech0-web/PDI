import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Clock, Eye, Calendar, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BlogService } from "@/lib/services/blog.service";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/format";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const blogService = new BlogService(supabase);
  const post = await blogService.getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | PreCar Inspect",
    };
  }

  return {
    title: `${post.seo_title || post.title} | PreCar Inspect`,
    description: post.seo_description || post.excerpt || "Expert car inspection insights.",
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const blogService = new BlogService(supabase);
  const post = await blogService.getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Increment view count in the background
  blogService.incrementViewCount(post.id).catch((err) => {
    console.error("Failed to increment view count:", err);
  });

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-6 sm:px-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:translate-x-[-4px] transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>
      </div>

      {/* Article Body */}
      <article className="space-y-8">
        {/* Header Metadata */}
        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.published_at || post.created_at)}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-white/10" />
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {post.author?.full_name || "Inspector Team"}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-white/10" />
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {post.view_count || 0} views
            </span>
          </div>
        </div>

        {/* Cover Image */}
        {post.cover_image && (
          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02]">
            <img
              src={post.cover_image}
              alt={post.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        {/* Text Content */}
        <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-base space-y-6 pt-4">
          {post.content.split("\n\n").map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-6 border-t border-white/5 flex flex-wrap items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground/60 mr-1" />
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-muted-foreground border border-white/10"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
