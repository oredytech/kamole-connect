import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPosts, fetchCategories, WPPost, WPCategory, getFeaturedImage, decodeHtml, formatDate } from "@/lib/wordpress";
import { Skeleton } from "@/components/ui/skeleton";

const ArticleSidebar = ({ currentPostId }: { currentPostId?: number }) => {
  const [recentPosts, setRecentPosts] = useState<WPPost[]>([]);
  const [categories, setCategories] = useState<WPCategory[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    fetchPosts({ per_page: 5 })
      .then(({ posts }) => setRecentPosts(posts.filter((p) => p.id !== currentPostId).slice(0, 4)))
      .catch(console.error)
      .finally(() => setLoadingPosts(false));
    fetchCategories()
      .then((cats) => setCategories(cats.filter((c) => c.count > 0).slice(0, 10)))
      .catch(console.error)
      .finally(() => setLoadingCats(false));
  }, [currentPostId]);

  return (
    <aside className="lg:sticky lg:top-4 space-y-8">
      {/* Recent Posts */}
      <div className="bg-card border border-border rounded-md p-5">
        <h3 className="font-heading text-lg font-bold mb-4 pb-2 border-b border-border">
          Articles récents
        </h3>
        <div className="space-y-4">
          {loadingPosts
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-20 h-16 rounded shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))
            : recentPosts.map((p) => (
                <Link key={p.id} to={`/${p.slug}`} className="flex gap-3 group">
                  <img
                    src={getFeaturedImage(p)}
                    alt={decodeHtml(p.title.rendered)}
                    className="w-20 h-16 object-cover rounded shrink-0"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {decodeHtml(p.title.rendered)}
                    </h4>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {formatDate(p.date)}
                    </span>
                  </div>
                </Link>
              ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-card border border-border rounded-md p-5">
        <h3 className="font-heading text-lg font-bold mb-4 pb-2 border-b border-border">
          Catégories
        </h3>
        <ul className="space-y-2">
          {loadingCats
            ? Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-8 rounded-full" />
                </li>
              ))
            : categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/categorie/${cat.slug}`}
                    className="flex items-center justify-between text-sm hover:text-primary transition-colors"
                  >
                    <span>{cat.name}</span>
                    <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
                      {cat.count}
                    </span>
                  </Link>
                </li>
              ))}
        </ul>
      </div>
    </aside>
  );
};

export default ArticleSidebar;
