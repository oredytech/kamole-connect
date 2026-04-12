import { Link } from "react-router-dom";
import { WPPost, getFeaturedImage, getCategories, formatDate, decodeHtml } from "@/lib/wordpress";

interface HeroGridProps {
  posts: WPPost[];
}

const HeroGrid = ({ posts }: HeroGridProps) => {
  if (!posts.length) return null;

  const main = posts[0];
  const side = posts.slice(1, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
      {/* Main article */}
      <Link to={`/article/${main.slug}`} className="relative group overflow-hidden aspect-[4/3] lg:aspect-auto lg:row-span-2">
        <img
          src={getFeaturedImage(main)}
          alt={decodeHtml(main.title.rendered)}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="article-card-overlay" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10">
          <div className="flex gap-2 mb-2">
            {getCategories(main).map((cat) => (
              <span key={cat.id} className="category-badge">{cat.name}</span>
            ))}
          </div>
          <h2 className="font-heading text-xl md:text-2xl lg:text-3xl font-bold text-primary-foreground leading-tight">
            {decodeHtml(main.title.rendered)}
          </h2>
          <p className="text-xs text-primary-foreground/70 mt-2">{formatDate(main.date)}</p>
        </div>
      </Link>

      {/* Side articles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {side.map((post) => (
          <Link key={post.id} to={`/article/${post.slug}`} className="relative group overflow-hidden aspect-video">
            <img
              src={getFeaturedImage(post)}
              alt={decodeHtml(post.title.rendered)}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="article-card-overlay" />
            <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
              <div className="flex gap-1 mb-1">
                {getCategories(post).slice(0, 1).map((cat) => (
                  <span key={cat.id} className="category-badge text-[10px]">{cat.name}</span>
                ))}
              </div>
              <h3 className="font-heading text-sm md:text-base font-bold text-primary-foreground leading-snug line-clamp-2">
                {decodeHtml(post.title.rendered)}
              </h3>
              <p className="text-[10px] text-primary-foreground/70 mt-1">{formatDate(post.date)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HeroGrid;
