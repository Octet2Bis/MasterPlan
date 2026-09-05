import { Link } from "react-router-dom";
import { profile } from "@/data/portfolio";

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-border bg-surface-sunken">
      <div className="container max-w-6xl py-10 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <p className="font-semibold text-foreground">{profile.name}</p>
          <p className="mt-1 text-muted-foreground">{profile.location}</p>
          <a
            href={`mailto:${profile.email}`}
            className="mt-2 block text-primary hover:underline"
          >
            {profile.email}
          </a>
          <a href={`tel:${profile.phone.replace(/\s/g, "")}`} className="block text-muted-foreground">
            {profile.phone}
          </a>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Langues
          </p>
          <ul className="mt-2 space-y-1 text-foreground">
            {profile.languages.map((l) => (
              <li key={l.name}>
                <span className="font-medium">{l.name}</span>{" "}
                <span className="text-muted-foreground">· {l.level}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Plus
          </p>
          <ul className="mt-2 space-y-1">
            <li>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <Link to="/contact" className="text-primary hover:underline">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/mentions-legales" className="text-primary hover:underline">
                Mentions légales
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container max-w-6xl py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {profile.name}. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};
