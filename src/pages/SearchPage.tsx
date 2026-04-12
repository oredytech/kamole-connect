import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchPosts, WPPost, getFeaturedImage, formatDate, decodeHtml, stripHtml } from "@/lib/wordpress";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [posts, setPosts] = useState<WPPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetchPosts({ search: query, per_page: 20 })
      .then(({ posts }) => setPosts(posts))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="section-title text-2xl mb-2">Résultats de recherche</h1>
        <p className="text-muted-foreground mb-8">Pour : « {query} » — {posts.length} résultat{posts.length !== 1 ? "s" : ""}</p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center py-20 text-muted-foreground">Aucun article trouvé.</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link key={post.id} to={`/article/${post.slug}`} className="flex gap-4 group border-b border-border pb-6">
                <img src={getFeaturedImage(post)} alt="" className="w-32 h-24 md:w-48 md:h-32 object-cover shrink-0" loading="lazy" />
                <div>
                  <h2 className="font-heading text-base md:text-lg font-bold group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {decodeHtml(post.title.rendered)}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(post.date)}</p>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2 hidden sm:block">{stripHtml(post.excerpt.rendered)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
