import { Link } from "react-router-dom";
import { Mail, Phone, Linkedin, ArrowLeft } from "lucide-react";
import { profile } from "@/data/portfolio";

const Contact = () => {
  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-3xl py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <h1 className="mt-6 text-4xl font-bold text-foreground">Contact</h1>
        <p className="mt-2 text-muted-foreground">
          Disponible pour échanger sur vos enjeux produit, CRM, QA ou support.
        </p>

        <div className="mt-8 space-y-4">
          <a
            href={`mailto:${profile.email}`}
            className="flex items-center gap-3 rounded-md border border-border bg-card p-4 shadow-card hover:shadow-raised transition-shadow"
          >
            <Mail className="h-5 w-5 text-primary" />
            <span className="text-foreground">{profile.email}</span>
          </a>
          <a
            href={`tel:${profile.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-3 rounded-md border border-border bg-card p-4 shadow-card hover:shadow-raised transition-shadow"
          >
            <Phone className="h-5 w-5 text-primary" />
            <span className="text-foreground">{profile.phone}</span>
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-md border border-border bg-card p-4 shadow-card hover:shadow-raised transition-shadow"
          >
            <Linkedin className="h-5 w-5 text-primary" />
            <span className="text-foreground">LinkedIn</span>
          </a>
        </div>
      </div>
    </main>
  );
};

export default Contact;
