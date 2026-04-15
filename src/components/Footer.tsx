import { Link } from "react-router-dom";
import { Facebook, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-heading text-lg font-bold uppercase text-primary mb-4">Kamole FM</h3>
            <p className="text-sm leading-relaxed">
              La radio communautaire KAMOLE FM est un organisme de communication indépendant, laïc et à but non lucratif, géré et soutenu par la population.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-heading text-lg font-bold uppercase text-primary mb-4">Rubriques</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/categorie/sport" className="footer-link">Sports</Link></li>
              <li><Link to="/categorie/culture" className="footer-link">Culture</Link></li>
              <li><Link to="/categorie/societe" className="footer-link">Société</Link></li>
              <li><Link to="/categorie/politique" className="footer-link">Politique</Link></li>
              <li><Link to="/a-propos" className="footer-link">À propos</Link></li>
              <li><Link to="/contact" className="footer-link">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-lg font-bold uppercase text-primary mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone size={16} className="mt-0.5 shrink-0 text-primary" />
                <a href="tel:+243994852924" className="footer-link">+243 994 852 924</a>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={16} className="mt-0.5 shrink-0 text-primary" />
                <a href="mailto:radiocommunautairekamole@gmail.com" className="footer-link text-xs sm:text-sm break-all">radiocommunautairekamole@gmail.com</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                <span>Avenue Cishambo, Centre commercial Munya, Nyangezi, Walungu, Sud-Kivu, RDC</span>
              </li>
              <li className="flex items-center gap-3 pt-2">
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-footer-foreground hover:text-primary transition-colors">
                  <Facebook size={20} />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-secondary/30 py-4">
        <div className="container mx-auto px-4 text-center text-xs">
          <p>© {new Date().getFullYear()} Kamole FM — Radio Communautaire 96.0 MHz. Tous droits réservés.</p>
          <p className="mt-1">
            Fièrement conçu par{" "}
            <a href="https://oredytech.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
              Oredy TECHNOLOGIES
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
