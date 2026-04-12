import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { WPPost, getFeaturedImage, getCategories, formatDate, decodeHtml } from "@/lib/wordpress";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroGridProps {
  posts: WPPost[];
}

const HeroGrid = ({ posts }: HeroGridProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const mainPosts = posts.slice(0, 5);
  const side = posts.slice(1, 5);

  const nextSlide = useCallback(() => {
    setCurrentSlide((s) => (s + 1) % mainPosts.length);
  }, [mainPosts.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((s) => (s - 1 + mainPosts.length) % mainPosts.length);
  }, [mainPosts.length]);

  useEffect(() => {
    if (mainPosts.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, mainPosts.length]);

  if (!posts.length) return null;

  const main = mainPosts[currentSlide];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
      {/* Main article - Slideshow */}
      <div className="relative group overflow-hidden aspect-[4/3] lg:aspect-auto lg:row-span-2">
        {mainPosts.map((post, index) => (
          <Link
            key={post.id}
            to={`/${post.slug}`}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide ? "opacity-100 translate-x-0" : index < currentSlide ? "opacity-0 -translate-x-full" : "opacity-0 translate-x-full"
            }`}
          >
            <img
              src={getFeaturedImage(post)}
              alt={decodeHtml(post.title.rendered)}
              className="absolute inset-0 w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />
            <div className="article-card-overlay" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10">
              <div className="flex gap-2 mb-2">
                {getCategories(post).map((cat) => (
                  <span key={cat.id} className="category-badge">{cat.name}</span>
                ))}
              </div>
              <h2 className="font-heading text-xl md:text-2xl lg:text-3xl font-bold text-primary-foreground leading-tight">
                {decodeHtml(post.title.rendered)}
              </h2>
              <p className="text-xs text-primary-foreground/70 mt-2">{formatDate(post.date)}</p>
            </div>
          </Link>
        ))}

        {/* Slide controls */}
        {mainPosts.length > 1 && (
          <>
            <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {mainPosts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentSlide ? "bg-primary" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Side articles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {side.map((post) => (
          <Link key={post.id} to={`/${post.slug}`} className="relative group overflow-hidden aspect-video">
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
