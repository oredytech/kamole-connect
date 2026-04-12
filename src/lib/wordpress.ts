const WP_API = "https://totalementactus.net/wp-json/wp/v2";

export interface WPPost {
  id: number;
  date: string;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  featured_media: number;
  categories: number[];
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    "wp:term"?: Array<Array<{
      id: number;
      name: string;
      slug: string;
    }>>;
    author?: Array<{
      name: string;
      avatar_urls?: Record<string, string>;
    }>;
  };
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface WPComment {
  id: number;
  post: number;
  author_name: string;
  date: string;
  content: { rendered: string };
  author_avatar_urls?: Record<string, string>;
}

export async function fetchPosts(params: {
  page?: number;
  per_page?: number;
  categories?: number;
  search?: string;
} = {}): Promise<{ posts: WPPost[]; totalPages: number }> {
  const searchParams = new URLSearchParams();
  searchParams.set("_embed", "true");
  searchParams.set("per_page", String(params.per_page || 10));
  searchParams.set("page", String(params.page || 1));
  if (params.categories) searchParams.set("categories", String(params.categories));
  if (params.search) searchParams.set("search", params.search);

  const res = await fetch(`${WP_API}/posts?${searchParams}`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  const posts: WPPost[] = await res.json();
  const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1");
  return { posts, totalPages };
}

export async function fetchPost(slug: string): Promise<WPPost> {
  const res = await fetch(`${WP_API}/posts?slug=${slug}&_embed=true`);
  if (!res.ok) throw new Error("Failed to fetch post");
  const posts: WPPost[] = await res.json();
  if (!posts.length) throw new Error("Post not found");
  return posts[0];
}

export async function fetchCategories(): Promise<WPCategory[]> {
  const res = await fetch(`${WP_API}/categories?per_page=50`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function fetchComments(postId: number): Promise<WPComment[]> {
  const res = await fetch(`${WP_API}/comments?post=${postId}&per_page=50`);
  if (!res.ok) return [];
  return res.json();
}

export function getFeaturedImage(post: WPPost): string {
  return post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/placeholder.svg";
}

export function getCategories(post: WPPost) {
  return post._embedded?.["wp:term"]?.[0] || [];
}

export function getAuthor(post: WPPost) {
  return post._embedded?.author?.[0];
}

export function decodeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
