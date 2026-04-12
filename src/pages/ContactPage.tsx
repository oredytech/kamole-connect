import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Phone, Mail } from "lucide-react";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10">
        <h1 className="section-title text-2xl mb-8">Contactez-nous</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl">
          {/* Form */}
          <div>
            <p className="text-sm text-muted-foreground mb-6">
              Vous avez une question, une suggestion ou vous souhaitez collaborer avec Kamole FM ? Remplissez le formulaire ci-dessous.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Votre nom *"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-border bg-background text-foreground text-sm outline-none focus:border-primary transition-colors"
              />
              <input
                type="email"
                placeholder="Votre email *"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-border bg-background text-foreground text-sm outline-none focus:border-primary transition-colors"
              />
              <input
                type="text"
                placeholder="Sujet"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-2.5 border border-border bg-background text-foreground text-sm outline-none focus:border-primary transition-colors"
              />
              <textarea
                placeholder="Votre message *"
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-2.5 border border-border bg-background text-foreground text-sm outline-none focus:border-primary transition-colors resize-none"
              />
              <button type="submit" className="bg-primary text-primary-foreground px-6 py-2.5 font-heading font-semibold uppercase text-sm hover:opacity-90 transition-opacity">
                Envoyer le message
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div className="p-6 bg-muted rounded-md space-y-4">
              <h2 className="font-heading text-lg font-bold uppercase text-primary">Informations</h2>
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
                <a href="mailto:radiocommunautairekamole@gmail.com" className="text-sm hover:text-primary transition-colors break-all">
                  radiocommunautairekamole@gmail.com
                </a>
              </div>
            </div>

            <div className="overflow-hidden rounded-md">
              <iframe
                title="Localisation Kamole FM"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15952.5!2d28.85!3d-2.72!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMsKwNDMnMTIuMCJTIDI4wrA1MScwMC4wIkU!5e0!3m2!1sfr!2scd!4v1"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
