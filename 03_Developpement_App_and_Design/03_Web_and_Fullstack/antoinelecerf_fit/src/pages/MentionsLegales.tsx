import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { profile } from "@/data/portfolio";

const MentionsLegales = () => {
  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-3xl py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <h1 className="mt-6 text-4xl font-bold text-foreground">
          Mentions légales
        </h1>

        <div className="mt-8 space-y-6 text-sm text-foreground">
          <section>
            <h2 className="text-lg font-semibold">Éditeur du site</h2>
            <p className="mt-2 text-muted-foreground">
              {profile.name} — {profile.location}
              <br />
              Email : {profile.email}
              <br />
              Téléphone : {profile.phone}
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Hébergement</h2>
            <p className="mt-2 text-muted-foreground">
              Site hébergé par Vercel.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Propriété intellectuelle</h2>
            <p className="mt-2 text-muted-foreground">
              L'ensemble des contenus présents sur ce site (textes, visuels,
              logos) est la propriété exclusive de leur auteur, sauf mention
              contraire.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default MentionsLegales;
