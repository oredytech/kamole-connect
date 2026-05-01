const WP_API = "https://kamolemedia.com/wp-json/wp/v2";

// ============= Cache System =============
// Cache local basé sur la date de modification/publication
// TTL: 10 minutes pour la liste, invalidation auto si "modified" change pour un article

const CACHE_PREFIX = "kamole_cache_";
const CACHE_VERSION = "v1";
const LIST_TTL = 10 * 60 * 1000; // 10 min

interface CacheEntry<T> {
  v: string;
  ts: number;
  modified?: string;
  data: T;
}

function cacheKey(key: string): string {
  return `${CACHE_PREFIX}${CACHE_VERSION}_${key}`;
}

function readCache<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(cacheKey(key));
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (entry.v !== CACHE_VERSION) return null;
    return entry;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T, modified?: string): void {
  try {
    const entry: CacheEntry<T> = {
      v: CACHE_VERSION,
      ts: Date.now(),
      modified,
      data,
    };
    localStorage.setItem(cacheKey(key), JSON.stringify(entry));
  } catch {
    // Quota dépassé : on purge les anciennes entrées
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(CACHE_PREFIX))
        .forEach((k) => localStorage.removeItem(k));
    } catch {}
  }
}

export function clearWPCache(): void {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(CACHE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
}

// ============= Types =============

export interface WPPost {
  id: number;
  date: string;
  modified: string;
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

// ============= Fetchers avec cache =============

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

  const key = `posts_${searchParams.toString()}`;
  const cached = readCache<{ posts: WPPost[]; totalPages: number }>(key);

  // Cache frais : on retourne directement
  if (cached && Date.now() - cached.ts < LIST_TTL) {
    return cached.data;
  }

  try {
    const res = await fetch(`${WP_API}/posts?${searchParams}`);
    if (!res.ok) throw new Error("Failed to fetch posts");
    const posts: WPPost[] = await res.json();
    const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1");
    const data = { posts, totalPages };
    writeCache(key, data);

    // Met aussi en cache chaque article individuellement
    posts.forEach((p) => {
      if (p.slug) writeCache(`post_${p.slug}`, p, p.modified);
    });

    return data;
  } catch (e) {
    // Fallback sur cache périmé en cas d'échec réseau
    if (cached) return cached.data;
    throw e;
  }
}

export async function fetchPost(slug: string): Promise<WPPost> {
  const key = `post_${slug}`;
  const cached = readCache<WPPost>(key);

  // Si on a un cache, on le retourne immédiatement, mais on revalide en arrière-plan
  // via la date "modified"
  if (cached) {
    // Revalidation asynchrone : si la date a changé, on remplace le cache
    revalidatePost(slug, cached.modified).catch(() => {});
    return cached.data;
  }

  const res = await fetch(`${WP_API}/posts?slug=${slug}&_embed=true`);
  if (!res.ok) throw new Error("Failed to fetch post");
  const posts: WPPost[] = await res.json();
  if (!posts.length) throw new Error("Post not found");
  const post = posts[0];
  writeCache(key, post, post.modified);
  return post;
}

async function revalidatePost(slug: string, cachedModified?: string): Promise<void> {
  try {
    // On demande seulement les champs nécessaires pour comparer
    const res = await fetch(`${WP_API}/posts?slug=${slug}&_fields=id,modified`);
    if (!res.ok) return;
    const list = await res.json();
    const remoteModified = list?.[0]?.modified;
    if (remoteModified && remoteModified !== cachedModified) {
      // Article modifié côté serveur : on rafraîchit
      const fresh = await fetch(`${WP_API}/posts?slug=${slug}&_embed=true`);
      if (!fresh.ok) return;
      const posts: WPPost[] = await fresh.json();
      if (posts.length) writeCache(`post_${slug}`, posts[0], posts[0].modified);
    }
  } catch {}
}

export async function fetchCategories(): Promise<WPCategory[]> {
  const key = "categories";
  const cached = readCache<WPCategory[]>(key);
  if (cached && Date.now() - cached.ts < LIST_TTL) {
    return cached.data;
  }

  try {
    const res = await fetch(`${WP_API}/categories?per_page=50`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data: WPCategory[] = await res.json();
    writeCache(key, data);
    return data;
  } catch (e) {
    if (cached) return cached.data;
    throw e;
  }
}

export async function fetchComments(postId: number): Promise<WPComment[]> {
  const key = `comments_${postId}`;
  const cached = readCache<WPComment[]>(key);
  // TTL court pour les commentaires (2 min)
  if (cached && Date.now() - cached.ts < 2 * 60 * 1000) {
    return cached.data;
  }

  try {
    const res = await fetch(`${WP_API}/comments?post=${postId}&per_page=50`);
    if (!res.ok) return cached?.data || [];
    const data: WPComment[] = await res.json();
    writeCache(key, data);
    return data;
  } catch {
    return cached?.data || [];
  }
}

// ============= Helpers =============

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
