import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import HeroGrid from "@/components/HeroGrid";
import CategorySection from "@/components/CategorySection";
import { fetchPosts, fetchCategories, WPPost, WPCategory } from "@/lib/wordpress";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [heroPosts, setHeroPosts] = useState<WPPost[]>([]);
  const [categories, setCategories] = useState<WPCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchPosts({ per_page: 5 }),
      fetchCategories(),
    ])
      .then(([{ posts }, cats]) => {
        setHeroPosts(posts);
        // Filter categories that have at least 1 post, exclude "Uncategorized" (id=1)
        setCategories(cats.filter((c) => c.count > 0 && c.slug !== "uncategorized" && c.id !== 1));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <BreakingNewsTicker />
      <main className="flex-1">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
            <Skeleton className="aspect-[4/3] lg:row-span-2" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-video" />
              ))}
            </div>
          </div>
        ) : (
          <HeroGrid posts={heroPosts} />
        )}
        <div className="container mx-auto px-4">
          {/* First two categories side by side as list */}
          {categories.length >= 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10">
              <CategorySection categorySlug={categories[0].slug} title={categories[0].name} layout="list" />
              <CategorySection categorySlug={categories[1].slug} title={categories[1].name} layout="list" />
            </div>
          )}
          {/* Remaining categories as grid */}
          {categories.slice(2).map((cat) => (
            <CategorySection key={cat.id} categorySlug={cat.slug} title={cat.name} layout="grid" />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
