import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import HeroGrid from "@/components/HeroGrid";
import CategorySection from "@/components/CategorySection";
import { fetchPosts, WPPost } from "@/lib/wordpress";

const Index = () => {
  const [heroPosts, setHeroPosts] = useState<WPPost[]>([]);

  useEffect(() => {
    fetchPosts({ per_page: 5 }).then(({ posts }) => setHeroPosts(posts)).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <BreakingNewsTicker />
      <main className="flex-1">
        <HeroGrid posts={heroPosts} />
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
