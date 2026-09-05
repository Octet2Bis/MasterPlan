import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type SkillCategory, type Experience } from "@/data/portfolio";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import way2techWorkflow from "@/assets/way2tech-workflow.gif";
import aubayWorkflow from "@/assets/aubay-workflow.gif";
import supportWorkflow from "@/assets/support-workflow.gif";
import designWorkflow from "@/assets/design-workflow.gif";
import telusWorkflow from "@/assets/telus-workflow.gif";
import { categoryColor } from "@/lib/categoryColors";
import { cn } from "@/lib/utils";
import { Mail, Linkedin, MapPin, ArrowDown, ArrowRight, Circle, ChevronDown, GraduationCap, Award } from "lucide-react";
import { HeroIconCycler } from "@/components/portfolio/HeroIconCycler";
import { HERO_CYCLE, useHeroCycleIndex } from "@/components/portfolio/heroCycle";
import magnifier from "@/assets/hero-icons/magnifier.png";
import arrow from "@/assets/hero-icons/arrow.png";
import phone from "@/assets/hero-icons/phone.png";
import gear from "@/assets/hero-icons/gear.png";
import Navigation from "@/components/portfolio/Navigation";
import { useReveal } from "@/hooks/useReveal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Way2TechBento } from "@/components/portfolio/Way2TechBento";

/* ---------- Utilities ---------- */

const getCategoryIcon = (catId: string) => {
  switch (catId) {
    case "qa": return { src: magnifier };
    case "support": return { src: phone };
    case "product-ops":
    case "ux-ui": return { src: gear };
    case "crm-growth": return { src: arrow };
    case "education": return { lucide: GraduationCap };
    case "certification": return { lucide: Award };
    default: return null;
  }
};

const BubbleIcon = ({ src, className, lucide: LucideIcon }: { src?: string; className?: string; lucide?: any }) => {
  return (
    <div className={cn("flex items-center justify-center rounded-full bg-[hsl(38,33%,97%)] p-1.5 shadow-sm border border-black/5", className)}>
      {LucideIcon ? (
        <LucideIcon className="w-full h-full text-[hsl(0,0%,12%)]" />
      ) : src ? (
        <div
          className="bg-[hsl(0,0%,12%)] w-full h-full"
          style={{
            WebkitMaskImage: `url(${src})`,
            WebkitMaskPosition: "center",
            WebkitMaskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskImage: `url(${src})`,
            maskPosition: "center",
            maskSize: "contain",
            maskRepeat: "no-repeat",
          }}
        />
      ) : null}
    </div>
  );
};

/* ---------- Atoms ---------- */

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
  subtitle: string;
}) => (
  <div className="flex flex-col gap-3 md:gap-4 mb-8 md:mb-12">
    <div className="flex items-center gap-3 md:gap-4">
      <span className="text-primary font-black text-xl md:text-2xl">{number}.</span>
      <div className="h-px bg-primary flex-grow" />
      <Chip accent>Section {number}</Chip>
    </div>
    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-primary leading-[0.95]">
      {title}
    </h2>
    <p className="text-xs md:text-sm font-light uppercase tracking-[0.25em] text-muted-foreground">
      {subtitle}
    </p>
  </div>
);

const SectionWrap = ({
  children,
  bg,
  id,
  dark = false,
  ghost,
}: {
  children: React.ReactNode;
  bg?: string;
  id?: string;
  dark?: boolean;
  ghost?: string;
}) => (
  <section
    id={id}
    className={cn(
      "w-full border-b border-border/50 relative overflow-hidden",
      dark ? "section-dark grain" : (bg ?? "bg-background"),
    )}
  >
    {ghost && <span aria-hidden className="ghost-number">{ghost}</span>}
    <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 py-16 md:py-24">
      {children}
    </div>
  </section>
);



/* ---------- Hero pieces ---------- */

const RotatingWord = ({ index }: { index: number }) => (
  <span className="relative inline-block align-baseline text-primary">
    <span key={index} className="inline-block animate-fade-in uppercase">
      {HERO_CYCLE[index].word}
    </span>
  </span>
);

const ParisClock = () => {
  const [time, setTime] = useState(() =>
    new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Europe/Paris",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date()),
  );
  useEffect(() => {
    const id = setInterval(() => {
      setTime(
        new Intl.DateTimeFormat("fr-FR", {
          timeZone: "Europe/Paris",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
      );
    }, 30_000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{time}</span>;
};



const Hero = ({ onSkillClick }: { onSkillClick: () => void }) => {
  const cycleIndex = useHeroCycleIndex();
  const { t } = useLanguage();
  const { profile } = usePortfolioData();
  return (
  <header className="relative w-full bg-background overflow-hidden border-b border-border/50">
    <div className="absolute inset-0 grid-paper opacity-60 pointer-events-none" />

    <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 pt-10 md:pt-16 pb-10 md:pb-14">

      <div className="flex items-stretch gap-6 md:gap-10">
        <div className="flex-1 min-w-0">
          <h1 className="font-black text-foreground leading-[0.85] tracking-tight">
            <span className="block text-[clamp(2.5rem,9vw,7.5rem)]">ANTOINE</span>
            <span className="block text-[clamp(2.5rem,9vw,7.5rem)]">LECERF</span>
            <span className="block text-[clamp(1.5rem,5vw,3.5rem)] mt-3 md:mt-5">
              {t("hero.profil")} <RotatingWord index={cycleIndex} />
            </span>
          </h1>

          <p
            className="mt-8 max-w-2xl text-lg md:text-2xl italic text-foreground/80"
            style={{ fontFamily: "'Alegreya Sans', sans-serif" }}
          >
            {t("hero.subtitle")}<br />
            {t("hero.subtitle2")}
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-center">
          <HeroIconCycler
            index={cycleIndex}
            className="!w-[20vw] sm:!w-[28vw] !h-full !max-w-[420px] !min-w-[80px] sm:!min-w-[160px]"
          />
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={onSkillClick}
          className="group inline-flex items-center justify-between gap-4 bg-primary text-primary-foreground px-5 py-3 border border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-background hover:text-primary transition-all duration-150"
        >
          <span className="text-sm font-bold uppercase tracking-widest">
            {t("hero.explore")}
          </span>
          <ArrowDown className="size-4 group-hover:translate-y-1 transition-transform" />
        </button>
        <a
          href={`mailto:${profile.email}`}
          className="inline-flex items-center gap-3 px-5 py-3 border border-foreground bg-background shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:text-primary transition-all duration-150 text-sm font-bold uppercase tracking-widest"
        >
          <Mail className="size-4" /> {t("hero.contact")}
        </a>
      </div>

      <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <a href={`mailto:${profile.email}`} className="flex items-center gap-2 hover:text-primary">
          <Mail className="size-3.5" /> {profile.email}
        </a>
        <a href={profile.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary">
          <Linkedin className="size-3.5" /> LinkedIn
        </a>
        <span className="flex items-center gap-2">
          <MapPin className="size-3.5" /> {profile.location}
        </span>
      </div>
    </div>
  </header>
  );
};

/* ---------- Experience detail dialog ---------- */

// Source unique de vérité pour la numérotation EXP-XXX (partagée Parcours <-> Dialog)
const EXP_INDEX: Record<string, string> = {
  way2tech: "001",
  aubay: "002",
  "support-tech": "003",
  "graphisme-ux": "004",
  telus: "005",
};

const ExperienceDialog = ({
  experience,
  onClose,
}: {
  experience: Experience | null;
  onClose: () => void;
}) => {
  const e = experience;
  const c = e ? categoryColor[e.categories[0]] : null;
  const isWay2Tech = e?.id === "way2tech";

  return (
    <Dialog open={!!e} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className={cn(
          isWay2Tech
            ? "max-w-[100vw] h-[100dvh] w-screen m-0 p-0 border-0 rounded-none bg-background overflow-x-hidden"
            : "max-w-2xl p-0 gap-0 border-l-4 bg-background overflow-hidden",
          !isWay2Tech && c?.border,
        )}
      >
        {isWay2Tech ? (
          <Way2TechBento onClose={onClose} />
        ) : (
          e && c && (
            <>
              {/* Bandeau accessibilité (titre/description requis pour Radix) */}
              <DialogHeader className="sr-only">
                <DialogTitle>{e.organization} — {e.title}</DialogTitle>
                <DialogDescription>
                  {e.period}{e.location ? ` · ${e.location}` : ""}
                </DialogDescription>
              </DialogHeader>

              <div className="dialog-scroll p-5 md:p-8 pt-12 md:pt-12 max-h-[85vh] overflow-y-auto space-y-6">
                {/* Carte Parcours réutilisée → contenu toujours synchronisé */}
                <ExperienceCard expId={e.id} index={EXP_INDEX[e.id] ?? "—"} />

                {/* Soft skills (complément du dialog) */}
                <div className="border border-border bg-background p-5 md:p-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-3">
                    Soft skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {e.softSkills.map((s) => (
                      <span
                        key={s}
                        className={cn("px-2 py-1 text-[11px] font-medium border bg-background", c.border, c.fg)}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

/* ---------- Skills explorer ---------- */

const SkillsExplorer = ({
  active,
  setActive,
  onOpenExperience,
}: {
  active: SkillCategory;
  setActive: (c: SkillCategory) => void;
  onOpenExperience: (e: Experience) => void;
}) => {
  const { t } = useLanguage();
  const { pills, experiences } = usePortfolioData();
  const pill = pills.find((p) => p.id === active)!;
  const c = categoryColor[active];
  const matching = useMemo(
    () => experiences.filter((e) => e.categories.includes(active)),
    [active, experiences],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-12">
      {/* tabs */}
      <div className="relative lg:contents">
        <nav
          aria-label="Catégories de compétences"
          className="flex lg:flex-col gap-2 overflow-x-auto hide-scrollbar lg:overflow-visible -mx-2 px-2 lg:mx-0 lg:px-0 scroll-smooth snap-x snap-mandatory lg:snap-none"
        >
          {pills.map((p) => {
            const isActive = p.id === active;
            const cc = categoryColor[p.id];
            return (
              <button
                key={p.id}
                onClick={() => setActive(p.id)}
                className={cn(
                  "shrink-0 lg:shrink text-left border-l-4 px-4 py-3 transition-all whitespace-nowrap lg:whitespace-normal snap-start",
                  isActive
                    ? cn(cc.border, "bg-background shadow-sm")
                    : "border-transparent hover:border-border hover:bg-background/50",
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", cc.solid)} />
                  <span
                    className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      isActive ? cc.fg : "text-foreground/70",
                    )}
                  >
                    {p.label}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
        {/* scroll hint mobile */}
        <div
          aria-hidden
          className="lg:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent"
        />
        <div className="lg:hidden flex items-center gap-2 mt-2 px-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="animate-pulse">{t("skills.scroll")}</span>
          <ArrowRight className="size-3 text-primary animate-pulse" />
        </div>
      </div>

      {/* panel */}
      <article
        key={active}
        className={cn(
          "min-w-0 border-l-4 border border-border bg-background animate-fade-in overflow-hidden",
          c.border,
        )}
      >
        <div className="section-dark p-6 md:p-8 border-b border-border relative">
          <div className="absolute inset-1 border border-[hsl(38,33%,97%)]/20 pointer-events-none" />
          <div className="relative flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-4 z-10">
              {getCategoryIcon(pill.id) && (
                 <BubbleIcon {...getCategoryIcon(pill.id)!} className="size-9" />
              )}
              {!getCategoryIcon(pill.id) && (
                 <span className={cn("size-2.5 rounded-full", c.solid)} />
              )}
              <h3
                className={cn("text-2xl md:text-3xl font-semibold", c.fg)}
                style={{ fontFamily: "'Alegreya Sans', sans-serif" }}
              >
                {pill.label}
              </h3>
            </div>
            <Chip accent>{matching.length} {matching.length > 1 ? t("skills.experiences_plural") : t("skills.experiences")}</Chip>
          </div>

          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
            {pill.description}
          </p>
        </div>

        <div className="p-6 md:p-8 pt-6 md:pt-8">

        <div className="grid sm:grid-cols-2 gap-6 mt-6">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-2">
              {t("skills.tools")}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {pill.tools.map((t) => (
                <span
                  key={t}
                  className={cn("px-2 py-1 text-[11px] font-medium", c.bg, c.fg)}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-2">
              {t("skills.softskills")}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {pill.softSkills.map((s) => (
                <span
                  key={s}
                  className={cn(
                    "px-2 py-1 text-[11px] font-medium border bg-background",
                    c.border,
                    c.fg,
                  )}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-7 pt-6 border-t border-border">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-3">
            {t("skills.linked")}
          </h4>
          <ul className="space-y-3">
            {matching.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => onOpenExperience(e)}
                  className="group w-full text-left flex items-center justify-between gap-4 px-4 py-3 border border-foreground bg-background shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-primary hover:text-primary-foreground transition-all duration-150"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest shrink-0", c.fg, "group-hover:text-primary-foreground")}>
                      {e.kind === "education" ? t("exp.formation") : e.kind === "certification" ? t("exp.certification") : "EXP"}
                    </span>
                    <span className="font-bold text-sm truncate">
                      {e.organization}
                    </span>
                    <span className="text-xs text-muted-foreground truncate hidden sm:inline group-hover:text-primary-foreground/80">
                      · {e.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-muted-foreground tabular-nums hidden md:inline group-hover:text-primary-foreground/80">
                      {e.period}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-primary group-hover:text-primary-foreground">
                      {t("skills.more")}
                    </span>
                    <ArrowRight className="size-4 text-primary group-hover:text-primary-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
        </div>
      </article>
    </div>
  );
};

/* ---------- Experience ticket card ---------- */

const ExperienceCard = ({
  expId,
  index,
  collapsible = false,
  defaultOpen = true,
}: {
  expId: string;
  index: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) => {
  const { t } = useLanguage();
  const { experiences, pills } = usePortfolioData();
  const e = experiences.find((x) => x.id === expId);
  const [open, setOpen] = useState(defaultOpen);
  const [toolsOpen, setToolsOpen] = useState(false);
  if (!e) return null;
  const primaryCat = e.categories[0];
  const c = categoryColor[primaryCat];
  const isOpen = !collapsible || open;
  const HeaderTag: any = collapsible ? "button" : "div";
  return (
    <div id={`exp-${e.id}`} className="scroll-mt-24">
      <div className={cn("ticket-card border border-border bg-background transition-colors")}>
        {/* ticket header */}
        <HeaderTag
          {...(collapsible
            ? {
                type: "button",
                onClick: () => setOpen((o) => !o),
                "aria-expanded": isOpen,
                "aria-controls": `exp-body-${e.id}`,
              }
            : {})}
          className={cn(
            "section-dark w-full flex items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-border text-left relative",
            collapsible && "cursor-pointer hover:bg-muted/10 transition-colors"
          )}
        >
          <div className="absolute inset-1 border border-[hsl(38,33%,97%)]/20 pointer-events-none" />
          <div className="relative flex items-center gap-4 min-w-0 z-10">
            {getCategoryIcon(primaryCat) ? (
              <BubbleIcon {...getCategoryIcon(primaryCat)!} className="size-8 shrink-0" />
            ) : (
              <span className={cn("size-2 rounded-full shrink-0", c.solid)} />
            )}
            <span className={cn("text-[10px] font-bold uppercase tracking-widest truncate", c.fg)}>
              EXP-{index} · {pills.find((p) => p.id === primaryCat)?.label}
            </span>
          </div>
          <div className="relative flex items-center gap-3 shrink-0 z-10">
            <span className="text-[11px] text-muted-foreground tabular-nums hidden sm:inline">
              {e.period}{e.location ? ` · ${e.location}` : ""}
            </span>
            {collapsible && (
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            )}
          </div>
        </HeaderTag>

        <div className={cn(collapsible ? "p-4 md:p-6" : "p-5 md:p-8")}>
          <h3
            className={cn(
              "font-semibold text-foreground",
              collapsible ? "text-xl md:text-2xl" : "text-2xl md:text-3xl"
            )}
            style={{ fontFamily: "'Alegreya Sans', sans-serif" }}
          >
            {e.organization}
          </h3>
          <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-primary font-bold mt-1">
            {e.title}
          </p>
          {collapsible && (
            <p className="mt-2 text-[11px] text-muted-foreground tabular-nums sm:hidden">
              {e.period}{e.location ? ` · ${e.location}` : ""}
            </p>
          )}

          {isOpen && (<>

          <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
            {e.summary}
          </p>

          <ul className="mt-5 space-y-2">
            {e.missions.map((m, i) => (
              <li key={i} className="flex gap-3 text-sm text-foreground/90 leading-relaxed">
                <span className="text-primary font-black tabular-nums shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{m}</span>
              </li>
            ))}
          </ul>

          {e.results && e.results.length > 0 && (
            <div className="mt-5 border-l-4 border-primary pl-4 py-2 bg-muted/20">
              {e.results.map((r, i) => (
                <p key={i} className="text-sm font-bold text-foreground">
                  → {r}
                </p>
              ))}
            </div>
          )}

          {["way2tech", "aubay", "support-tech", "graphisme-ux", "telus"].includes(e.id) && (
            <div className="mt-6 pt-5 border-t border-border">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-3">
                {t("exp.usecase")}
              </h4>
              {e.id === "way2tech" && (
                <figure className="border border-border bg-muted/20 p-3">
                  <img
                    src={way2techWorkflow}
                    alt="Workflow Growth Way2Tech : ICP Mapping, Enrichissement, Segmentation, Outreach personnalisé, Création contenu, Analytics"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                  <figcaption className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                    Growth Workflow — de l'identification ICP au pilotage full-funnel.
                  </figcaption>
                </figure>
              )}
              {e.id === "aubay" && (
                <div className="space-y-4">
                  <p className="text-sm text-foreground">
                    <span className="font-bold">Recette d'un logiciel GED</span> (Gestion Électronique de Documents) pour un acteur bancaire : workflow QA complet, de la stratégie de test à la livraison, sur des parcours d'indexation, classement, recherche full-text et gestion des droits documentaires.
                  </p>
                  <figure className="border border-border bg-muted/20 p-3">
                    <img
                      src={aubayWorkflow}
                      alt="Workflow QA Aubay sur logiciel GED : Stratégie, Conception, Environnement, Exécution, Anomalies, Reporting"
                      className="w-full h-auto"
                      loading="lazy"
                    />
                    <figcaption className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                      QA Workflow — de la stratégie de test à la recette livrée.
                    </figcaption>
                  </figure>
                  <ul className="text-sm text-foreground list-disc pl-5 space-y-1.5">
                    <li><span className="font-semibold">Stratégie</span> : cadrage du périmètre GED, analyse de risques, plan de test aligné aux exigences métier & conformité.</li>
                    <li><span className="font-semibold">Conception</span> : cas de tests fonctionnels et de régression, jeux de données documentaires, scénarios d'indexation et de workflow d'approbation.</li>
                    <li><span className="font-semibold">Environnement</span> : préparation des bases, profils utilisateurs, droits, documents témoins (PDF, Office, scans) pour rejouabilité.</li>
                    <li><span className="font-semibold">Exécution</span> : tests manuels + automatisation Playwright sur les parcours critiques (upload, OCR, recherche, partage).</li>
                    <li><span className="font-semibold">Anomalies</span> : tri, reproduction, qualification et suivi via Jira / Xray, échanges réguliers PO ↔ dev.</li>
                    <li><span className="font-semibold">Reporting</span> : KPIs qualité (couverture, défauts par sévérité), PV de recette et go/no-go de mise en production.</li>
                  </ul>
                </div>
              )}
              {e.id === "support-tech" && (
                <div className="space-y-4">
                  <p className="text-sm text-foreground">
                    <span className="font-bold text-primary">Support utilisateurs SaaS santé</span> (Acteurs leaders du secteur) et plateformes B2B/B2C : pipeline de résolution d'incidents multicanal, alliant écoute client et rigueur technique (analyse APIs REST, lecture de logs, console réseau) pour respecter les SLA et nourrir la roadmap produit.
                  </p>
                  <ul className="text-sm text-foreground list-disc pl-5 space-y-1.5">
                    <li><span className="font-semibold">Réception</span> : tickets entrants par chat, email ou téléphone, déclenchement SLA et accusé de prise en charge.</li>
                    <li><span className="font-semibold">Qualification</span> : catégorisation, priorisation, contexte utilisateur et compte concerné.</li>
                    <li><span className="font-semibold">Reproduction</span> : replay du parcours, captures, vérification environnement et device.</li>
                    <li><span className="font-semibold">Investigation</span> : tests d'endpoints REST avec Postman, lecture de logs applicatifs, console réseau.</li>
                    <li><span className="font-semibold">Résolution / Escalade</span> : fix N1-N2 ou escalade structurée vers les équipes dev avec contexte enrichi.</li>
                    <li><span className="font-semibold">Capitalisation</span> : article de base de connaissances, scripts de réponses et remontée des pain points produit.</li>
                  </ul>
                </div>
              )}
              {e.id === "graphisme-ux" && (
                <div className="space-y-4">
                  <p className="text-sm text-foreground">
                    <span className="font-bold">Process de design freelance</span> appliqué à l'identité visuelle, l'UI et le motion : du cadrage produit jusqu'à la livraison de supports cohérents print & digital, avec une approche orientée parcours et hiérarchie de l'information.
                  </p>
                  <figure className="border border-border bg-muted/20 p-3">
                    <img
                      src={designWorkflow}
                      alt="Design Workflow : Brief & Recherche, Wireframes, UI Design, Livraison"
                      className="w-full h-auto"
                      loading="lazy"
                    />
                    <figcaption className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                      Design Workflow — du brief à la livraison.
                    </figcaption>
                  </figure>
                </div>
              )}
              {e.id === "telus" && (
                <div className="space-y-4">
                  <p className="text-sm text-foreground">
                    <span className="font-bold">Première immersion en relation client par chat</span> sur un produit digital à fort volume, en environnement international à Sofia : 6 mois centrés sur la réactivité, la satisfaction et la remontée structurée vers le produit.
                  </p>
                  <figure className="border border-border bg-muted/20 p-3">
                    <img
                      src={telusWorkflow}
                      alt="Chat Support Flow Telus : Connexion chat, Diagnostic, Réponse, Feedback"
                      className="w-full h-auto"
                      loading="lazy"
                    />
                    <figcaption className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                      Chat Support Flow — temps réel, multilingue, orienté satisfaction.
                    </figcaption>
                  </figure>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-border">
            <button
              type="button"
              onClick={() => setToolsOpen((o) => !o)}
              className="w-full flex items-start justify-between gap-4 text-left group"
            >
              <div
                className={cn(
                  "flex gap-1.5 overflow-hidden relative flex-1",
                  !toolsOpen ? "flex-nowrap" : "flex-wrap"
                )}
              >
                {e.tools.map((t) => (
                  <Chip key={t} className="shrink-0">
                    {t}
                  </Chip>
                ))}
                {!toolsOpen && (
                  <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" />
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 pt-0.5 pl-2 bg-background z-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                  {e.tools.length} {t("exp.tools_count")}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground group-hover:text-foreground transition-transform",
                    toolsOpen && "rotate-180"
                  )}
                />
              </div>
            </button>
          </div>
          </>)}
        </div>
      </div>
    </div>
  );
};

/* ---------- Page ---------- */

const Index = () => {
  const { t } = useLanguage();
  const { profile, experiences, pills } = usePortfolioData();
  const [active, setActive] = useState<SkillCategory>("crm-growth");
  const [openExp, setOpenExp] = useState<Experience | null>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const revealRef = useReveal();
  const scrollToSkills = () =>
    skillsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div ref={revealRef} className="min-h-screen w-full selection:bg-primary selection:text-white">
      <Navigation />
      <ExperienceDialog experience={openExp} onClose={() => setOpenExp(null)} />

      {/* 1. HERO */}
      <Hero onSkillClick={scrollToSkills} />

      {/* Accent separator */}
      <div className="accent-bar" aria-hidden />

      {/* 01. COMPÉTENCES */}
      <div ref={skillsRef}>
        <SectionWrap ghost="01">
          <div className="reveal">
            <SectionHeader
              number="01"
              title={t("section.skills.title")}
              subtitle={t("section.skills.subtitle")}
            />
          </div>
          <div className="reveal reveal-delay-1">
            <SkillsExplorer
              active={active}
              setActive={setActive}
              onOpenExperience={setOpenExp}
            />
          </div>
        </SectionWrap>
      </div>

      {/* Accent separator */}
      <div className="accent-bar" aria-hidden />

      {/* 02. PARCOURS */}
      <SectionWrap bg="bg-[hsl(38,33%,95%)]" ghost="02">
        <div className="reveal">
          <SectionHeader
            number="02"
            title={t("section.parcours.title")}
            subtitle={t("section.parcours.subtitle")}
          />
        </div>
        <div className="relative reveal reveal-delay-1">
          {/* Red timeline line */}
          <div
            aria-hidden
            className="absolute left-3 md:left-4 top-3 bottom-3 w-[2px] bg-primary"
          />
          <div className="space-y-8 pl-10 md:pl-14">
            {experiences
              .filter((e) => e.kind === "company")
              .map((e, i) => (
                <div key={e.id} className={cn("reveal", i % 2 === 0 ? "reveal-delay-1" : "reveal-delay-2")}>
                  <ExperienceCard 
                    expId={e.id} 
                    index={String(i + 1).padStart(3, "0")} 
                    collapsible={true} 
                    defaultOpen={false} 
                  />
                </div>
              ))}
          </div>
        </div>
      </SectionWrap>

      <div className="accent-bar" aria-hidden />

      <div ref={stackRef}>
        <SectionWrap bg="bg-[hsl(38,33%,95%)]" ghost="03">
          <div className="reveal">
            <SectionHeader
              number="03"
              title={t("section.stack.title")}
              subtitle={t("section.stack.subtitle")}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pills.map((pill, i) => {
              const c = categoryColor[pill.id];
              const iconSrc = getCategoryIcon(pill.id);
              return (
                <div
                  key={pill.id}
                  className={cn("reveal ticket-card border border-border bg-background flex flex-col", i < 2 ? "reveal-delay-1" : "reveal-delay-2")}
                >
                  <div className="flex items-center px-5 py-3 border-b border-border section-dark relative">
                    <div className="absolute inset-1 border border-[hsl(38,33%,97%)]/20 pointer-events-none" />
                    <div className="relative flex items-center gap-4 z-10 min-w-0">
                      {getCategoryIcon(pill.id) && (
                        <BubbleIcon {...getCategoryIcon(pill.id)!} className="size-8 shrink-0" />
                      )}
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest truncate", c.fg)}>
                        {pill.label}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1">
                    <div className="flex flex-wrap gap-1.5">
                      {pill.tools.map((t) => (
                        <span
                          key={t}
                          className={cn("px-2 py-1 text-[11px] font-medium", c.bg, c.fg)}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionWrap>
      </div>

      <div className="accent-bar" aria-hidden />

      {/* 04. FORMATION & CERTIFICATIONS */}
      <SectionWrap ghost="04">
        <SectionHeader
          number="04"
          title={t("section.formation.title")}
          subtitle={t("section.formation.subtitle")}
        />

        {/* Sous-section : Formations */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-primary font-black text-sm tabular-nums">04.A</span>
          <h3 className="text-xl md:text-2xl font-semibold text-foreground" style={{ fontFamily: "'Alegreya Sans', sans-serif" }}>
            {t("formation.sub_a")}
          </h3>
          <div className="h-px bg-border flex-grow" />
          <Chip>{experiences.filter((e) => e.kind === "education").length} {t("formation.count")}</Chip>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {experiences.filter((e) => e.kind === "education").map((e) => {
            return (
              <div key={e.id} className="group ticket-card block border border-border bg-background transition-colors">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border section-dark relative">
                  <div className="absolute inset-1 border border-[hsl(38,33%,97%)]/20 pointer-events-none" />
                  <div className="flex items-center gap-3 relative z-10">
                    <BubbleIcon {...getCategoryIcon(e.categories[0])!} className="size-7" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t("exp.formation")}</span>
                  </div>
                  <span className="relative z-10 text-[11px] text-muted-foreground tabular-nums">{e.period}</span>
                </div>
                <div className="p-5">
                  <h4 className="text-xl font-semibold">{e.organization}</h4>
                  <p className="text-xs uppercase tracking-wider text-primary font-bold mt-1">{e.title}</p>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{e.summary}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Séparateur */}
        <div className="my-12 flex items-center gap-4" aria-hidden>
          <div className="h-px bg-border flex-grow" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">◆ ◆ ◆</span>
          <div className="h-px bg-border flex-grow" />
        </div>

        {/* Sous-section : Certifications */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-primary font-black text-sm tabular-nums">04.B</span>
          <h3 className="text-xl md:text-2xl font-semibold text-foreground" style={{ fontFamily: "'Alegreya Sans', sans-serif" }}>
            {t("formation.sub_b")}
          </h3>
          <div className="h-px bg-border flex-grow" />
          <Chip>{experiences.filter((e) => e.kind === "certification").length} {t("formation.count")}</Chip>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {experiences.filter((e) => e.kind === "certification").map((e) => {
            return (
              <div key={e.id} className="group ticket-card block border border-border bg-background transition-colors">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border section-dark relative">
                  <div className="absolute inset-1 border border-[hsl(38,33%,97%)]/20 pointer-events-none" />
                  <div className="flex items-center gap-3 relative z-10">
                    <BubbleIcon {...getCategoryIcon(e.categories[0])!} className="size-7" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t("exp.certification")}</span>
                  </div>
                  <span className="relative z-10 text-[11px] text-muted-foreground tabular-nums">{e.period}</span>
                </div>
                <div className="p-5">
                  <h4 className="text-xl font-semibold">{e.organization}</h4>
                  <p className="text-xs uppercase tracking-wider text-primary font-bold mt-1">{e.title}</p>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{e.summary}</p>
                </div>
              </div>
            );
          })}
        </div>
      </SectionWrap>

      {/* Accent separator */}
      <div className="accent-bar" aria-hidden />

      {/* 6. OUTRO */}
      <SectionWrap dark>
        <div className="text-center space-y-10 py-8 md:py-16 reveal">
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-black text-primary leading-none tracking-tighter">
            {t("outro.merci")}
          </h1>
          <div className="inline-flex flex-col sm:flex-row gap-3 sm:gap-4 border border-primary/40 p-4 md:p-6 bg-transparent">
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-5 py-3 hover:brightness-110 transition-all text-sm font-bold uppercase tracking-widest"
            >
              <Mail className="size-4" /> {profile.email}
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 border border-foreground/30 px-5 py-3 hover:border-primary hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest"
            >
              <Linkedin className="size-4" /> LinkedIn
            </a>
          </div>
          <div className="pt-12 opacity-30 text-[11px] uppercase tracking-widest">
            Antoine Lecerf · 2026
          </div>
        </div>
      </SectionWrap>
    </div>
  );
};

export default Index;
