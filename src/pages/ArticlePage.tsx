import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchPost, fetchComments, WPPost, WPComment, getFeaturedImage, getCategories, getAuthor, formatDate, decodeHtml } from "@/lib/wordpress";
import { Facebook, Twitter, Linkedin, Link2, MessageCircle, Calendar, User } from "lucide-react";

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<WPPost | null>(null);
  const [comments, setComments] = useState<WPComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({ name: "", email: "", content: "" });

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchPost(slug)
      .then((p) => {
        setPost(p);
        return fetchComments(p.id);
      })
      .then(setComments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const shareUrl = window.location.href;
  const shareTitle = post ? decodeHtml(post.title.rendered) : "";

  const shareLinks = [
    { icon: Facebook, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, label: "Facebook" },
    { icon: Twitter, url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, label: "Twitter" },
    { icon: Linkedin, url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, label: "LinkedIn" },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("Lien copié !");
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Merci pour votre commentaire ! Il sera publié après modération.");
    setCommentForm({ name: "", email: "", content: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg text-muted-foreground">Article non trouvé.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const author = getAuthor(post);
  const categories = getCategories(post);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero image */}
        <div className="relative aspect-video max-h-[500px] overflow-hidden">
          <img src={getFeaturedImage(post)} alt={decodeHtml(post.title.rendered)} className="w-full h-full object-cover" />
          <div className="article-card-overlay" />
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Categories */}
            <div className="flex gap-2 mb-3">
              {categories.map((cat) => (
                <Link key={cat.id} to={`/categorie/${cat.slug}`} className="category-badge">
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Title */}
            <h1 className="font-heading text-2xl md:text-4xl font-bold leading-tight mb-4">
              {decodeHtml(post.title.rendered)}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
              {author && (
                <span className="flex items-center gap-1">
                  <User size={14} />
                  {author.name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={14} />
                {comments.length} commentaire{comments.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Share bar */}
            <div className="flex items-center gap-3 mb-8">
              <span className="text-sm font-semibold">Partager :</span>
              {shareLinks.map(({ icon: Icon, url, label }) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center bg-primary text-primary-foreground rounded-full hover:opacity-80 transition-opacity" title={label}>
                  <Icon size={16} />
                </a>
              ))}
              <button onClick={copyLink} className="w-9 h-9 flex items-center justify-center bg-secondary text-secondary-foreground rounded-full hover:opacity-80 transition-opacity" title="Copier le lien">
                <Link2 size={16} />
              </button>
            </div>

            {/* Content */}
            <article
              className="prose prose-lg max-w-none prose-headings:font-heading prose-a:text-primary prose-img:rounded-md"
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />

            {/* Share bottom */}
            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-border">
              <span className="text-sm font-semibold">Partager cet article :</span>
              {shareLinks.map(({ icon: Icon, url, label }) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center bg-primary text-primary-foreground rounded-full hover:opacity-80 transition-opacity" title={label}>
                  <Icon size={16} />
                </a>
              ))}
            </div>

            {/* Comments */}
            <section className="mt-12">
              <h2 className="section-title mb-6">Commentaires ({comments.length})</h2>

              {comments.length > 0 && (
                <div className="space-y-6 mb-10">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-4 bg-muted rounded-md">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                        {comment.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{comment.author_name}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(comment.date)}</span>
                        </div>
                        <div className="text-sm" dangerouslySetInnerHTML={{ __html: comment.content.rendered }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment form */}
              <h3 className="font-heading text-lg font-bold mb-4">Laisser un commentaire</h3>
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Votre nom *"
                    required
                    value={commentForm.name}
                    onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-border bg-background text-foreground text-sm outline-none focus:border-primary transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Votre email *"
                    required
                    value={commentForm.email}
                    onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-border bg-background text-foreground text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
                <textarea
                  placeholder="Votre commentaire *"
                  required
                  rows={5}
                  value={commentForm.content}
                  onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                  className="w-full px-4 py-2 border border-border bg-background text-foreground text-sm outline-none focus:border-primary transition-colors resize-none"
                />
                <button type="submit" className="bg-primary text-primary-foreground px-6 py-2.5 font-heading font-semibold uppercase text-sm hover:opacity-90 transition-opacity">
                  Publier le commentaire
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArticlePage;
