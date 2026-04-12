import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchPosts, fetchCategories, WPPost, WPCategory, getFeaturedImage, formatDate, decodeHtml, stripHtml } from "@/lib/wordpress";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [posts, setPosts] = useState<WPPost[]>([]);
  const [category, setCategory] = useState<WPCategory | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories().then((cats) => {
      const cat = cats.find((c) => c.slug === slug);
      if (cat) setCategory(cat);
    }).catch(console.error);
  }, [slug]);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    fetchPosts({ categories: category.id, page, per_page: 10 })
      .then(({ posts, totalPages }) => {
        setPosts(posts);
        setTotalPages(totalPages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, page]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="section-title text-2xl mb-8">{category?.name || slug}</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} to={`/${post.slug}`} className="group">
                  <div className="relative overflow-hidden aspect-video mb-3">
                    <img src={getFeaturedImage(post)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                  <h2 className="font-heading text-base font-bold group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {decodeHtml(post.title.rendered)}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(post.date)}</p>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{stripHtml(post.excerpt.rendered)}</p>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40"
                >
                  ← Précédent
                </button>
                <span className="text-sm text-muted-foreground px-4">
                  Page {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40"
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
