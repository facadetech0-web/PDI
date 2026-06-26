import * as React from "react";
import Link from "next/link";
import { BookOpen, User, Clock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BlogService } from "@/lib/services/blog.service";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils/format";

import type { BlogPost } from "@/lib/types";

export const metadata = {
  title: "Expert Car Inspection Articles & Blog | PreCar Inspect",
  description: "Read expert pre-purchase inspections tips, buyer checklists, auto valuation updates, and vehicle guides.",
};

export default async function BlogListingPage() {
  const supabase = await createClient();
  const blogService = new BlogService(supabase);

  let posts: BlogPost[] = [];
  try {
    posts = await blogService.listBlogPosts("published");
  } catch (err) {
    console.error("Error loading blog posts:", err);
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-6 sm:px-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <BookOpen className="h-3 w-3" />
          Guides & Insights
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-gradient">
          PreCar Inspect Blog
        </h1>
        <p className="text-base text-muted-foreground">
          Your source for pre-owned car valuation tips, expert inspection checklists, maintenance guides, and auto industry reports.
        </p>
      </div>

      {/* Grid of Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-20 bg-card/25 border border-white/5 rounded-2xl max-w-md mx-auto">
          <BookOpen className="h-12 w-12 text-muted-foreground/45 mb-3 mx-auto" />
          <h3 className="text-base font-semibold text-foreground">No Articles Published</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Check back soon for insights from our certified inspectors.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="flex flex-col overflow-hidden border-white/5 bg-card/45 backdrop-blur-xl group hover:border-primary/30 transition-all duration-300"
            >
              {/* Cover Image */}
              <div className="h-48 w-full bg-white/[0.02] border-b border-white/5 relative overflow-hidden flex items-center justify-center">
                {post.cover_image ? (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <BookOpen className="h-12 w-12 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                )}
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(post.published_at || post.created_at)}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-white/10" />
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author?.full_name || "Inspector Team"}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all"
                  >
                    Read Full Article
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
