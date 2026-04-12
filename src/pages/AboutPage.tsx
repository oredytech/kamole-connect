import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Phone, Mail, Radio } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10">
        <h1 className="section-title text-2xl mb-8">À propos de Kamole FM</h1>

        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <Radio className="text-primary" size={32} />
            <span className="font-heading text-2xl font-bold">96.0 MHz — Au service de la population</span>
          </div>

          <div className="prose prose-lg max-w-none prose-headings:font-heading prose-a:text-primary">
            <p>
              La radio communautaire <strong>KAMOLE FM</strong> est un organisme de communication indépendant, laïc et à but non lucratif, géré et soutenu par la population.
            </p>
            <p>
              Installée en République Démocratique du Congo, au centre commercial de Nyangezi (Munya), dans le groupement de Karhongo, territoire de Walungu, nous couvrons des vastes zones, nous nous rassurons que les messages diffusés sur nos antennes atteignent les milieux les plus reculés de la région.
            </p>
            <p>
              Il sied de rappeler que KAMOLE FM est un projet du <strong>Centre Multimédia pour la communication Sociale (CMCS)</strong> avec l'appui de l'<strong>UNESCO</strong> à travers son programme International pour le développement de la Communication (PIDC). Elle est membre du <strong>RATECO</strong> (Réseau des radios et télévisions communautaires RATECO Sud-Kivu).
            </p>
          </div>

          <div className="mt-10 p-6 bg-muted rounded-md space-y-4">
            <h2 className="font-heading text-lg font-bold uppercase text-primary">Nos coordonnées</h2>
            <div className="flex items-start gap-3">
              <MapPin className="text-primary shrink-0 mt-0.5" size={18} />
              <p className="text-sm">
                Avenue Cishambo (À quelques mètres du monument), Centre commercial Munya à Nyangezi/Chefferie de Ngweshe/Territoire de Walungu/Province du Sud-Kivu/République Démocratique du Congo.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="text-primary shrink-0" size={18} />
              <a href="tel:+243994852924" className="text-sm hover:text-primary transition-colors">+243 994 852 924</a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="text-primary shrink-0" size={18} />
              <a href="mailto:radiocommunautairekamole@gmail.com" className="text-sm hover:text-primary transition-colors">radiocommunautairekamole@gmail.com</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
