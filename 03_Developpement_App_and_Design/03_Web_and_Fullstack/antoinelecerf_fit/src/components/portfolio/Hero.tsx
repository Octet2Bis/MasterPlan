import { Mail, MapPin, Linkedin } from "lucide-react";
import { profile } from "@/data/portfolio";
import { HeroIconCycler } from "./HeroIconCycler";
import { HERO_CYCLE, useHeroCycleIndex } from "./heroCycle";

export const Hero = () => {
  const cycleIndex = useHeroCycleIndex();
  const current = HERO_CYCLE[cycleIndex];
  return (
    <header className="relative bg-surface-sunken overflow-hidden border-b border-border/50">
      {/* Decorative blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -left-24 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container max-w-6xl py-14 md:py-24 relative z-10">
        <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(37,99,235,0.07)] rounded-[2rem] p-8 md:p-16 text-center lg:text-left transition-all duration-500 hover:shadow-[0_12px_48px_0_rgba(37,99,235,0.12)]">
          <div className="inline-flex items-center justify-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wide uppercase mb-6">
            <span>{profile.name}</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Laboratoire Live
            </span>
          </div>
          <p className="mt-2 text-xl font-medium text-muted-foreground">{profile.tagline}</p>

          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">
            <HeroIconCycler className="lg:mt-2" index={cycleIndex} />
            <div className="flex-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-foreground max-w-4xl tracking-tight">
              De quelle compétence en{" "}
              <span
                key={current.key}
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary animate-fade-in"
              >
                {current.word}
              </span>{" "}
              avez‑vous besoin aujourd'hui&nbsp;?
            </h1>
          <p className="mt-6 max-w-2xl text-lg lg:text-xl text-muted-foreground mx-auto lg:mx-0 leading-relaxed">
            Sélectionnez une compétence pour voir où et comment je l'ai mise en
            pratique — expériences, outils et soft skills.
          </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-4 text-sm font-medium">
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <Mail className="h-4 w-4" /> {profile.email}
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-border hover:border-primary/30 hover:shadow-md hover:-translate-y-1 text-foreground transition-all duration-300"
            >
              <Linkedin className="h-4 w-4 text-[#0A66C2]" /> LinkedIn
            </a>
            <span className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-surface-sunken text-muted-foreground border border-transparent">
              <MapPin className="h-4 w-4" /> {profile.location}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
