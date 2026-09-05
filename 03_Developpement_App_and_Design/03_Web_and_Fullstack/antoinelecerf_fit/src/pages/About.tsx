import { Mail, Linkedin, MapPin, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import Navigation from "@/components/portfolio/Navigation";
import { cn } from "@/lib/utils";
import profilePic from "@/assets/profile-pic.jpg";
import { useReveal } from "@/hooks/useReveal";

/* ---------- Local UI Components (matching Index.tsx style) ---------- */

const Chip = ({
  children,
  accent = false,
  className = "",
}: {
  children: React.ReactNode;
  accent?: boolean;
  className?: string;
}) => (
  <span
    className={cn(
      "text-[10px] md:text-[11px] uppercase font-medium tracking-wider px-2 py-1 border",
      accent
        ? "border-primary text-primary bg-background"
        : "border-border text-foreground bg-background",
      className,
    )}
  >
    {children}
  </span>
);

const SectionHeader = ({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle?: string;
}) => (
  <div className="flex flex-col gap-3 md:gap-4 mb-4 md:mb-6">
    <div className="flex items-center gap-3 md:gap-4">
      <span className="text-primary font-black text-xl md:text-2xl">{number}.</span>
      <div className="h-px bg-primary flex-grow" />
    </div>
    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-primary leading-[0.95]">
      {title}
    </h2>
    {subtitle && (
      <p className="text-xs md:text-sm font-light uppercase tracking-[0.25em] text-muted-foreground">
        {subtitle}
      </p>
    )}
  </div>
);

const SectionWrap = ({
  children,
  bg,
  id,
}: {
  children: React.ReactNode;
  bg?: string;
  id?: string;
}) => (
  <section
    id={id}
    className={cn("w-full border-b border-border/50", bg ?? "bg-background")}
  >
    <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 pt-8 md:pt-12 pb-16 md:pb-24">
      {children}
    </div>
  </section>
);

const About = () => {
  const { t } = useLanguage();
  const { profile, experiences } = usePortfolioData();
  const revealRef = useReveal();

  return (
    <main ref={revealRef} className="min-h-screen bg-background selection:bg-primary selection:text-white">
      <Navigation />
      
      <header className="relative w-full bg-background overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 grid-paper opacity-40 pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 pt-20 pb-12 flex flex-col items-center text-center gap-10">
          <SectionHeader 
            number="01" 
            title={t("about.title")} 
          />
          <div className="shrink-0 reveal reveal-delay-2">
            <img 
              src={profilePic} 
              alt="Antoine Lecerf" 
              className="size-40 md:size-56 lg:size-64 rounded-full object-cover object-[center_20%] border-4 border-background shadow-[8px_8px_0_0_hsl(var(--foreground))] grayscale-[20%] hover:grayscale-0 transition-all duration-500" 
            />
          </div>
        </div>
      </header>

      <SectionWrap>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-20">
          <div className="space-y-10">
            <div className="space-y-6">
              <h3 className="text-3xl md:text-4xl font-black text-foreground leading-tight">
                {t("about.headline1")} <br />
                <span className="text-primary">{t("about.headline2")}</span>
              </h3>
              <div className="h-1.5 w-24 bg-primary" />
            </div>

            <div className="prose prose-slate max-w-none space-y-6 text-foreground/70 text-sm md:text-base leading-relaxed [&>p>strong]:font-bold [&>p>strong]:text-foreground">
              <p dangerouslySetInnerHTML={{ __html: t("about.bio1") }} />
              <p dangerouslySetInnerHTML={{ __html: t("about.bio2") }} />
              <p dangerouslySetInnerHTML={{ __html: t("about.bio3") }} />
              <p dangerouslySetInnerHTML={{ __html: t("about.bio4") }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">{t("about.engagements")}</h4>
                <ul className="space-y-3">
                  {[t("about.engagement_1"), t("about.engagement_2"), t("about.engagement_3"), t("about.engagement_4")].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider">
                      <ArrowRight className="size-3.5 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">{t("about.langues")}</h4>
                <div className="flex flex-wrap gap-2">
                  <Chip>{t("about.lang_fr")}</Chip>
                  <Chip>{t("about.lang_en")}</Chip>
                  <Chip>{t("about.lang_es")}</Chip>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="border border-foreground bg-background p-8 shadow-[8px_8px_0_0_hsl(var(--foreground))]">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-6">{t("about.contact_direct")}</h4>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="size-10 flex items-center justify-center border border-border bg-muted/30">
                    <Mail className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{t("about.email")}</p>
                    <a href={`mailto:${profile.email}`} className="text-sm font-bold hover:text-primary transition-colors">{profile.email}</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="size-10 flex items-center justify-center border border-border bg-muted/30">
                    <Linkedin className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">LinkedIn</p>
                    <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-sm font-bold hover:text-primary transition-colors">Antoine Lecerf</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="size-10 flex items-center justify-center border border-border bg-muted/30">
                    <MapPin className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{t("about.localisation")}</p>
                    <p className="text-sm font-bold">{profile.location}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-foreground bg-primary/5 p-8 shadow-[8px_8px_0_0_hsl(var(--foreground))]">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-3 flex items-center gap-2">
                <span>💡</span> Fun fact
              </h4>
              <p className="text-sm font-bold text-foreground leading-relaxed">
                Je suis Superhôte Airbnb ! J'accorde une grande importance à l'hospitalité, à l'expérience voyageur et au sens du détail pour offrir des séjours mémorables.
              </p>
            </div>
          </aside>
        </div>
      </SectionWrap>

      <SectionWrap bg="bg-[#F2F1EC]">
        <SectionHeader 
          number="02" 
          title={t("about.softskills_title")} 
          subtitle={t("about.softskills_subtitle")} 
        />
        <div className="flex flex-wrap gap-3 md:gap-4">
          {Array.from(new Set(experiences.flatMap((e) => e.softSkills))).filter(Boolean).map((skill) => (
            <div 
              key={skill} 
              className="px-4 py-3 border border-foreground bg-background shadow-[4px_4px_0_0_hsl(var(--foreground))] text-xs md:text-sm font-bold uppercase tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:bg-primary hover:text-primary-foreground transition-all duration-150"
            >
              {skill}
            </div>
          ))}
        </div>
      </SectionWrap>

      <SectionWrap bg="bg-[#F2F1EC]">
        <SectionHeader 
          number="03" 
          title="Hobbies" 
          subtitle="Ce qui m'anime en dehors du produit" 
        />
        <div className="flex flex-wrap gap-3 md:gap-4">
          {["Trekking", "Cyclisme", "Bricolage", "Photographie", "Dessin", "Peinture", "Lecture", "Cinéma & Séries", "Bénévolat"].map((hobby) => (
            <div 
              key={hobby} 
              className="px-4 py-3 border border-foreground bg-background shadow-[4px_4px_0_0_hsl(var(--foreground))] text-xs md:text-sm font-bold uppercase tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:bg-primary hover:text-primary-foreground transition-all duration-150"
            >
              {hobby}
            </div>
          ))}
        </div>
      </SectionWrap>

      <footer className="py-12 border-t border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            {t("about.footer")}
          </div>
        </div>
      </footer>
    </main>
  );
};

export default About;
