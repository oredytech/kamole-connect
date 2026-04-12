import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchPost, fetchComments, WPPost, WPComment, getFeaturedImage, getCategories, getAuthor, formatDate, decodeHtml } from "@/lib/wordpress";
import { Facebook, Twitter, Linkedin, Link2, MessageCircle, Calendar, User } from "lucide-react";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

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

  const shareUrl = typeof window !== "undefined" ? window.location.origin + "/" + (post?.slug || "") : "";
  const shareTitle = post ? decodeHtml(post.title.rendered) : "";

  const shareLinks = [
    { icon: Facebook, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, label: "Facebook" },
    { icon: Twitter, url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, label: "Twitter" },
    { icon: Linkedin, url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, label: "LinkedIn" },
    { icon: WhatsAppIcon, url: `https://wa.me/?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`, label: "WhatsApp" },
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

            {/* Title BEFORE image */}
            <h1 className="font-heading text-2xl md:text-4xl font-bold leading-tight mb-4">
              {decodeHtml(post.title.rendered)}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
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

            {/* Featured image AFTER title */}
            <div className="relative aspect-video overflow-hidden mb-6">
              <img src={getFeaturedImage(post)} alt={decodeHtml(post.title.rendered)} className="w-full h-full object-cover rounded-md" />
            </div>

            {/* Share bar */}
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
              <span className="text-sm font-semibold">Partager :</span>
              {shareLinks.map(({ icon: Icon, url, label }) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center bg-primary text-primary-foreground rounded-full hover:opacity-80 transition-opacity" title={label}>
                  <Icon />
                </a>
              ))}
              <button onClick={copyLink} className="w-9 h-9 flex items-center justify-center bg-secondary text-secondary-foreground rounded-full hover:opacity-80 transition-opacity" title="Copier le lien">
                <Link2 size={16} />
              </button>
            </div>

            {/* Content */}
            <article
              className="prose prose-lg max-w-none prose-headings:font-heading prose-a:text-primary prose-img:rounded-md dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />

            {/* Share bottom */}
            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-border">
              <span className="text-sm font-semibold">Partager cet article :</span>
              {shareLinks.map(({ icon: Icon, url, label }) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center bg-primary text-primary-foreground rounded-full hover:opacity-80 transition-opacity" title={label}>
                  <Icon />
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
