import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import HeroGrid from "@/components/HeroGrid";
import CategorySection from "@/components/CategorySection";
import { fetchPosts, WPPost } from "@/lib/wordpress";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [heroPosts, setHeroPosts] = useState<WPPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts({ per_page: 5 })
      .then(({ posts }) => setHeroPosts(posts))
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10">
            <CategorySection categorySlug="totalementsport" title="Sport" layout="list" />
            <CategorySection categorySlug="totalementculture" title="Culture" layout="list" />
          </div>
          <CategorySection categorySlug="totalementsociete" title="Société" layout="grid" />
          <CategorySection categorySlug="totalementpolitique" title="Politique" layout="grid" />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
