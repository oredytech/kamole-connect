import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, Facebook, Phone } from "lucide-react";
import logo from "@/assets/logo-light.jpg";

const navItems = [
  { label: "Accueil", path: "/" },
  { label: "Sport", path: "/categorie/totalementsport" },
  { label: "Culture", path: "/categorie/totalementculture" },
  { label: "Société", path: "/categorie/totalementsociete" },
  { label: "Politique", path: "/categorie/totalementpolitique" },
  { label: "À propos", path: "/a-propos" },
  { label: "Contact", path: "/contact" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/recherche?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header>
      {/* Top bar */}
      <div className="bg-header text-header-foreground">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Kamole FM" className="h-12 md:h-16 w-auto" />
            <div className="hidden sm:block">
              <p className="text-xs uppercase tracking-wider text-primary font-semibold">Radio Communautaire</p>
              <p className="text-xs text-muted-foreground">Au service de la population</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-header-foreground hover:text-primary transition-colors">
              <Facebook size={18} />
            </a>
            <a href="tel:+243994852924" className="text-header-foreground hover:text-primary transition-colors">
              <Phone size={18} />
            </a>
            <button onClick={() => setSearchOpen(!searchOpen)} className="text-header-foreground hover:text-primary transition-colors">
              <Search size={18} />
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-header-foreground">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-secondary px-4 py-2">
            <form onSubmit={handleSearch} className="container mx-auto flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="flex-1 bg-secondary text-secondary-foreground px-3 py-2 text-sm outline-none"
                autoFocus
              />
              <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold">
                Rechercher
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="bg-primary">
        <div className="container mx-auto px-4">
          <ul className="hidden md:flex items-center gap-0">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="block px-4 py-2.5 text-sm font-heading font-semibold uppercase text-primary-foreground hover:bg-black/20 transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-header border-t border-secondary">
          <ul className="flex flex-col">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-heading font-semibold uppercase text-header-foreground hover:bg-primary hover:text-primary-foreground transition-colors border-b border-secondary/30"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
