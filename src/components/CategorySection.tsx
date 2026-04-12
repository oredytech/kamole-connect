import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPosts, fetchCategories, WPPost, WPCategory, getFeaturedImage, formatDate, decodeHtml, stripHtml } from "@/lib/wordpress";

interface CategorySectionProps {
  categorySlug: string;
  title: string;
  layout?: "list" | "grid";
}

const CategorySection = ({ categorySlug, title, layout = "list" }: CategorySectionProps) => {
  const [posts, setPosts] = useState<WPPost[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories().then((cats) => {
      const cat = cats.find((c) => c.slug === categorySlug);
      if (cat) setCategoryId(cat.id);
    }).catch(console.error);
  }, [categorySlug]);

  useEffect(() => {
    if (categoryId === null) return;
    fetchPosts({ categories: categoryId, per_page: 4 })
      .then(({ posts }) => setPosts(posts))
      .catch(console.error);
  }, [categoryId]);

  if (!posts.length) return null;

  const mainPost = posts[0];
  const sidePosts = posts.slice(1);

  if (layout === "grid") {
    return (
      <section className="py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">{title}</h2>
          <Link to={`/categorie/${categorySlug}`} className="text-sm text-primary hover:underline font-semibold">
            Plus d'articles →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to={`/${mainPost.slug}`} className="group">
            <div className="relative overflow-hidden aspect-video mb-3">
              <img src={getFeaturedImage(mainPost)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            </div>
            <h3 className="font-heading text-lg font-bold group-hover:text-primary transition-colors leading-snug">
              {decodeHtml(mainPost.title.rendered)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{formatDate(mainPost.date)}</p>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{stripHtml(mainPost.excerpt.rendered)}</p>
          </Link>
          <div className="space-y-4">
            {sidePosts.map((post) => (
              <Link key={post.id} to={`/${post.slug}`} className="flex gap-3 group">
                <img src={getFeaturedImage(post)} alt="" className="w-24 h-20 object-cover shrink-0" loading="lazy" />
                <div>
                  <h4 className="font-heading text-sm font-bold group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {decodeHtml(post.title.rendered)}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(post.date)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title">{title}</h2>
        <Link to={`/categorie/${categorySlug}`} className="text-sm text-primary hover:underline font-semibold">
          Plus d'articles →
        </Link>
      </div>
      <div className="space-y-4">
        {posts.map((post) => (
          <Link key={post.id} to={`/${post.slug}`} className="flex gap-4 group border-b border-border pb-4">
            <img src={getFeaturedImage(post)} alt="" className="w-28 h-20 md:w-36 md:h-24 object-cover shrink-0" loading="lazy" />
            <div>
              <h3 className="font-heading text-sm md:text-base font-bold group-hover:text-primary transition-colors leading-snug line-clamp-2">
                {decodeHtml(post.title.rendered)}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">{formatDate(post.date)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
