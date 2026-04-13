import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPosts, fetchCategories, WPPost, WPCategory, getFeaturedImage, decodeHtml, formatDate } from "@/lib/wordpress";

const ArticleSidebar = ({ currentPostId }: { currentPostId?: number }) => {
  const [recentPosts, setRecentPosts] = useState<WPPost[]>([]);
  const [categories, setCategories] = useState<WPCategory[]>([]);

  useEffect(() => {
    fetchPosts({ per_page: 5 })
      .then(({ posts }) => setRecentPosts(posts.filter((p) => p.id !== currentPostId).slice(0, 4)))
      .catch(console.error);
    fetchCategories()
      .then((cats) => setCategories(cats.filter((c) => c.count > 0).slice(0, 10)))
      .catch(console.error);
  }, [currentPostId]);

  return (
    <aside className="space-y-8">
      {/* Recent Posts */}
      <div className="bg-card border border-border rounded-md p-5">
        <h3 className="font-heading text-lg font-bold mb-4 pb-2 border-b border-border">
          Articles récents
        </h3>
        <div className="space-y-4">
          {recentPosts.map((p) => (
            <Link key={p.id} to={`/${p.slug}`} className="flex gap-3 group">
              <img
                src={getFeaturedImage(p)}
                alt={decodeHtml(p.title.rendered)}
                className="w-20 h-16 object-cover rounded shrink-0"
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
          {categories.map((cat) => (
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
