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

// ============= Revalidation robuste =============
// - Déduplication : une seule requête en vol par slug
// - Throttle : pas plus d'un check toutes les 60s par slug
// - Comparaison stricte : id + modified (timestamp normalisé)
// - Notification optionnelle via évènement "wp-post-updated"

const REVALIDATE_THROTTLE = 60 * 1000; // 60s entre 2 checks pour le même slug
const lastRevalidateAt = new Map<string, number>();
const inflightRevalidate = new Map<string, Promise<WPPost | null>>();
const inflightFetchPost = new Map<string, Promise<WPPost>>();

function normalizeModified(m?: string): string {
  if (!m) return "";
  // WordPress renvoie parfois "2026-05-01T10:20:30" sans Z, on normalise
  return new Date(m).toISOString();
}

function isCachedFresh(cached: CacheEntry<WPPost>, remoteModified?: string, remoteId?: number): boolean {
  if (!remoteModified) return true; // pas d'info → on garde
  if (remoteId != null && cached.data.id !== remoteId) return false;
  return normalizeModified(cached.modified) === normalizeModified(remoteModified);
}

function notifyPostUpdated(slug: string, post: WPPost) {
  try {
    window.dispatchEvent(new CustomEvent("wp-post-updated", { detail: { slug, post } }));
  } catch {}
}

export async function fetchPost(slug: string): Promise<WPPost> {
  const key = `post_${slug}`;
  const cached = readCache<WPPost>(key);

  if (cached) {
    // SWR : on retourne le cache et on revalide en arrière-plan (throttlé + dédupé)
    revalidatePost(slug).catch(() => {});
    return cached.data;
  }

  // Pas de cache : déduplique les requêtes simultanées
  const pending = inflightFetchPost.get(slug);
  if (pending) return pending;

  const p = (async () => {
    const res = await fetch(`${WP_API}/posts?slug=${slug}&_embed=true`);
    if (!res.ok) throw new Error("Failed to fetch post");
    const posts: WPPost[] = await res.json();
    if (!posts.length) throw new Error("Post not found");
    const post = posts[0];
    writeCache(key, post, post.modified);
    lastRevalidateAt.set(slug, Date.now());
    return post;
  })().finally(() => inflightFetchPost.delete(slug));

  inflightFetchPost.set(slug, p);
  return p;
}

async function revalidatePost(slug: string): Promise<WPPost | null> {
  // Throttle
  const last = lastRevalidateAt.get(slug) || 0;
  if (Date.now() - last < REVALIDATE_THROTTLE) return null;

  // Déduplication
  const inflight = inflightRevalidate.get(slug);
  if (inflight) return inflight;

  const key = `post_${slug}`;

  const task = (async (): Promise<WPPost | null> => {
    try {
      // 1) Requête légère pour comparer id + modified
      const headRes = await fetch(`${WP_API}/posts?slug=${slug}&_fields=id,modified`);
      if (!headRes.ok) return null;
      const head = await headRes.json();
      const remote = head?.[0];
      if (!remote) return null;

      const cached = readCache<WPPost>(key);
      if (cached && isCachedFresh(cached, remote.modified, remote.id)) {
        // Cache toujours valide : on rafraîchit juste le timestamp pour éviter
        // de reposer la même question trop tôt
        lastRevalidateAt.set(slug, Date.now());
        return cached.data;
      }

      // 2) L'article a réellement changé → on récupère la version complète
      const fresh = await fetch(`${WP_API}/posts?slug=${slug}&_embed=true`);
      if (!fresh.ok) return null;
      const posts: WPPost[] = await fresh.json();
      if (!posts.length) return null;

      const post = posts[0];
      writeCache(key, post, post.modified);
      lastRevalidateAt.set(slug, Date.now());
      notifyPostUpdated(slug, post);
      return post;
    } catch {
      return null;
    } finally {
      inflightRevalidate.delete(slug);
    }
  })();

  inflightRevalidate.set(slug, task);
  return task;
}

/** Force la revalidation d'un article (ignore le throttle). */
export async function forceRevalidatePost(slug: string): Promise<WPPost | null> {
  lastRevalidateAt.delete(slug);
  return revalidatePost(slug);
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
