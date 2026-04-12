import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPosts, WPPost, decodeHtml } from "@/lib/wordpress";

const BreakingNewsTicker = () => {
  const [posts, setPosts] = useState<WPPost[]>([]);

  useEffect(() => {
    fetchPosts({ per_page: 10 }).then(({ posts }) => setPosts(posts)).catch(console.error);
  }, []);

  if (!posts.length) return null;

  return (
    <div className="bg-muted border-b border-border overflow-hidden">
      <div className="container mx-auto flex items-center">
        <span className="breaking-badge shrink-0 z-10">Breaking News</span>
        <div className="overflow-hidden flex-1">
          <div className="animate-ticker whitespace-nowrap flex items-center gap-12 py-2 px-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/article/${post.slug}`}
                className="text-sm text-foreground hover:text-primary transition-colors inline-block"
              >
                {decodeHtml(post.title.rendered)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsTicker;
