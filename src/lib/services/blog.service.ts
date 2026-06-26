import { SupabaseClient } from "@supabase/supabase-js";
import type { BlogPost, BlogStatus } from "@/lib/types";

export class BlogService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * List blog posts with optional status filter (defaults to 'published')
   */
  async listBlogPosts(status: BlogStatus = "published"): Promise<BlogPost[]> {
    const { data, error } = await this.supabase
      .from("blog_posts")
      .select(`
        *,
        author:author_id(full_name, avatar_url)
      `)
      .eq("status", status)
      .order("published_at", { ascending: false });

    if (error) throw error;
    return data as unknown as BlogPost[];
  }

  /**
   * List all blog posts for administrative management (returns drafts + published)
   */
  async listAllBlogPostsAdmin(): Promise<BlogPost[]> {
    const { data, error } = await this.supabase
      .from("blog_posts")
      .select(`
        *,
        author:author_id(full_name)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as unknown as BlogPost[];
  }

  /**
   * Retrieve a single blog post by slug
   */
  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await this.supabase
      .from("blog_posts")
      .select(`
        *,
        author:author_id(full_name, avatar_url)
      `)
      .eq("slug", slug)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as BlogPost;
  }

  /**
   * Retrieve a single blog post by ID
   */
  async getBlogPostById(id: string): Promise<BlogPost | null> {
    const { data, error } = await this.supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as BlogPost;
  }

  /**
   * Create a new blog post
   */
  async createBlogPost(
    postData: Omit<BlogPost, "id" | "view_count" | "created_at" | "updated_at" | "published_at">
  ): Promise<BlogPost> {
    const publishedAt = postData.status === "published" ? new Date().toISOString() : null;

    const { data, error } = await this.supabase
      .from("blog_posts")
      .insert({
        ...postData,
        view_count: 0,
        published_at: publishedAt,
      })
      .select()
      .single();

    if (error) throw error;
    return data as BlogPost;
  }

  /**
   * Update an existing blog post
   */
  async updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    // If status is changing to published, set published_at
    const publishedAtUpdate: Record<string, string | null> = {};
    if (updates.status === "published") {
      const existing = await this.getBlogPostById(id);
      if (existing && !existing.published_at) {
        publishedAtUpdate.published_at = new Date().toISOString();
      }
    } else if (updates.status === "draft" || updates.status === "archived") {
      publishedAtUpdate.published_at = null;
    }

    const { data, error } = await this.supabase
      .from("blog_posts")
      .update({
        ...updates,
        ...publishedAtUpdate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as BlogPost;
  }

  /**
   * Delete a blog post
   */
  async deleteBlogPost(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("blog_posts")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * Increment post view count (safe execution)
   */
  async incrementViewCount(id: string): Promise<void> {
    // Run update via standard supabase or call a rpc if configured
    const { error } = await this.supabase.rpc("increment_blog_view", { post_id: id });
    
    if (error) {
      // Fallback update
      const { data: current } = await this.supabase
        .from("blog_posts")
        .select("view_count")
        .eq("id", id)
        .single();
      
      if (current) {
        await this.supabase
          .from("blog_posts")
          .update({ view_count: (current.view_count || 0) + 1 })
          .eq("id", id);
      }
    }
  }
}
