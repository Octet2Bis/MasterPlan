import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { useLanguage } from "@/contexts/LanguageContext";
import { categoryColor } from "@/lib/categoryColors";
import { cn } from "@/lib/utils";
import way2techWorkflow from "@/assets/way2tech-workflow.gif";
import gear from "@/assets/hero-icons/gear.png";

const BubbleIcon = ({ src, className }: { src: string; className?: string }) => {
  return (
    <div className={cn("flex items-center justify-center rounded-full bg-[hsl(38,33%,97%)] p-1.5 shadow-sm border border-black/5", className)}>
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
    </div>
  );
};

/* ---------- Chart data ---------- */

const outboundData = [
  { name: "Jan", leads: 1200, taux: 48 },
  { name: "Fév", leads: 3400, taux: 52 },
  { name: "Mar", leads: 5200, taux: 51 },
  { name: "Avr", leads: 8600, taux: 49 },
  { name: "Mai", leads: 12000, taux: 53 },
  { name: "Juin", leads: 15800, taux: 50 },
  { name: "Juil", leads: 20000, taux: 51 },
];

const sectorData = [
  { name: "SaaS & Software", value: 25 },
  { name: "Financial Services", value: 15 },
  { name: "Health & Life Sciences", value: 12 },
  { name: "E-commerce & Retail", value: 10 },
  { name: "Real Estate", value: 8 },
  { name: "Education & EdTech", value: 7 },
  { name: "Legal Services", value: 5 },
  { name: "Manufacturing", value: 5 },
  { name: "Consulting", value: 3 },
  { name: "Energy & Utilities", value: 2 },
  { name: "HR & Recruitment", value: 2 },
  { name: "Logistics", value: 2 },
  { name: "Media", value: 1 },
  { name: "Construction", value: 1 },
  { name: "Tourism", value: 1 },
  { name: "Non-Profit", value: 1 },
];

const SECTOR_COLORS = ["#1a1a1a", "#C2412A", "#555", "#888", "#aaa", "#ccc"];
const DARK_SECTOR_COLORS = ["#C2412A", "#e8e8e8", "#8a8a8a", "#5a5a5a", "#3a3a3a", "#2a2a2a"];

const seoData = [
  { month: "Oct", organic: 120 },
  { month: "Nov", organic: 280 },
  { month: "Déc", organic: 520 },
  { month: "Jan", organic: 950 },
  { month: "Fév", organic: 1400 },
  { month: "Mar", organic: 2100 },
];

/* ---------- Reusable bento card ---------- */

const BentoCard = ({
  children,
  className = "",
  span = "",
}: {
  children: React.ReactNode;
  className?: string;
  span?: string;
}) => (
  <div
    className={cn(
      "border border-foreground bg-background shadow-[6px_6px_0_0_#FFFFFF] p-5 md:p-6 overflow-hidden",
      span,
      className,
    )}
  >
    {children}
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-3">
    {children}
  </h4>
);

/* ---------- Component ---------- */

export const Way2TechBento = ({ onClose }: { onClose: () => void }) => {
  const { t } = useLanguage();
  const { experiences, pills } = usePortfolioData();
  const e = experiences.find((x) => x.id === "way2tech")!;
  const c = categoryColor[e.categories[0]];
  const [toolsExpanded, setToolsExpanded] = useState(false);

  return (
    <div className="relative min-h-[100dvh] w-full bg-background overflow-y-auto flex flex-col">
      {/* Close */}
      <button
        onClick={onClose}
        className="fixed top-5 right-5 md:top-8 md:right-8 z-50 p-3 bg-[hsl(38,33%,97%)] border border-[hsl(0,0%,12%)] shadow-[4px_4px_0_0_hsl(0,0%,12%)] hover:shadow-[2px_2px_0_0_hsl(0,0%,12%)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
      >
        <X className="size-5 text-[hsl(0,0%,12%)]" />
      </button>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 py-10 md:py-16 space-y-8">
        {/* ── Header ── */}
        <header className="border-b border-border/50 pb-8">
          <div className="flex items-center gap-4 mb-4">
            <BubbleIcon src={gear} className="size-8 shrink-0" />
            <span className={cn("text-[10px] font-bold uppercase tracking-widest", c.fg)}>
              EXP-001 · {pills.find((p) => p.id === e.categories[0])?.label}
            </span>
            <span className="text-[11px] text-muted-foreground tabular-nums ml-auto">
              {e.period} · {e.location}
            </span>
          </div>
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground leading-[0.85] tracking-tight uppercase"
          >
            {e.organization}
          </h1>
          <p className="text-sm md:text-base uppercase tracking-[0.2em] text-primary font-bold mt-3">
            {e.title}
          </p>
        </header>
      </div>

      {/* ── Dark section (Summary & Grid) ── */}
      <div className="section-dark grain w-full flex-grow py-10 md:py-16 px-5 sm:px-8 md:px-12 lg:px-16 border-t border-border">
        <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Summary ── */}
        <p className="text-lg md:text-xl text-foreground/80 leading-relaxed max-w-4xl" style={{ fontFamily: "'Alegreya Sans', sans-serif" }}>
          {e.summary}
        </p>

        {/* ── Bento Grid ── */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          style={{ 
            '--background': '38 33% 97%', 
            '--foreground': '0 0% 12%', 
            '--muted': '36 18% 91%', 
            '--muted-foreground': '0 0% 40%', 
            '--border': '30 12% 85%' 
          } as any}
        >

          {/* Missions (spans full width) */}
          <BentoCard span="md:col-span-2 lg:col-span-2">
            <Label>Missions</Label>
            <ul className="space-y-2.5">
              {e.missions.map((m, i) => (
                <li key={i} className="flex gap-3 text-sm text-foreground/90 leading-relaxed">
                  <span className="text-primary font-black tabular-nums shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </BentoCard>

          {/* A/B Testing card */}
          <BentoCard className="flex flex-col">
            <Label>A/B Testing & Expérimentation</Label>
            <div className="flex-1 flex flex-col justify-center space-y-4">
              {/* Arborescence Illustration */}
              <div className="space-y-4 font-bold uppercase tracking-widest text-[9px] md:text-[10px]">
                {/* Campaign 1 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <div className="size-1.5 bg-primary" />
                    <span>Campagne Outbound 01</span>
                  </div>
                  <div className="pl-4 space-y-2 border-l border-primary/30 ml-[3px]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-px bg-primary/30" />
                      <span className="bg-muted px-1.5 py-0.5">Version A : Social Proof</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-px bg-primary/30" />
                      <span className="bg-muted px-1.5 py-0.5">Version B : Direct Value</span>
                    </div>
                  </div>
                </div>

                {/* Campaign 2 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <div className="size-1.5 bg-primary" />
                    <span>Funnel Acquisition 02</span>
                  </div>
                  <div className="pl-4 space-y-2 border-l border-primary/30 ml-[3px]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-px bg-primary/30" />
                      <span className="bg-muted px-1.5 py-0.5">V1 : Onboarding Long</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-px bg-primary/30" />
                      <span className="bg-muted px-1.5 py-0.5">V2 : Fast-Track (One-Click)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-4 font-bold uppercase tracking-widest">
              2 Campagnes · 4 Versions · Data-Driven
            </p>
          </BentoCard>

          {/* Segmentation pie */}
          <BentoCard className="flex flex-col">
            <Label>Segmentation sectorielle</Label>
            <p className="text-xs text-muted-foreground mb-4">16 secteurs ciblés — répartition des leads</p>
            <div className="flex-1 min-h-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    outerRadius="75%"
                    innerRadius="45%"
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {sectorData.map((_, i) => (
                      <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 0, border: "2px solid #1a1a1a", fontWeight: "bold", fontSize: 12 }}
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">
              {sectorData.slice(0, 8).map((s, i) => (
                <span key={s.name} className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider truncate">
                  <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: SECTOR_COLORS[i % SECTOR_COLORS.length] }} />
                  {s.name}
                </span>
              ))}
              <div className="col-span-2 text-[8px] text-muted-foreground mt-1 border-t border-border pt-1">
                + {sectorData.length - 8} autres secteurs (EdTech, HR, Media, etc.)
              </div>
            </div>
          </BentoCard>

          {/* SEO area chart */}
          <BentoCard className="flex flex-col">
            <Label>SEO — Trafic organique</Label>
            <p className="text-xs text-muted-foreground mb-4">Optimisation on-page & WordPress + SEMrush</p>
            <div className="flex-1 min-h-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={seoData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 0, border: "2px solid #1a1a1a", fontWeight: "bold", fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="organic" stroke="#C2412A" strokeWidth={3} fill="#C2412A" fillOpacity={0.15} dot={{ r: 4, fill: "#C2412A", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </BentoCard>


          {/* Use Case — workflow GIF */}
          <BentoCard span="md:col-span-2 lg:col-span-3">
            <Label>{t("exp.usecase")}</Label>
            <figure className="border border-border bg-muted/20 p-3">
              <img
                src={way2techWorkflow}
                alt={t("usecase.way2tech.alt")}
                className="w-full h-auto"
                loading="lazy"
              />
              <figcaption className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                {t("usecase.way2tech.caption")}
              </figcaption>
            </figure>
          </BentoCard>

          {/* Tools */}
          <BentoCard span="md:col-span-2 lg:col-span-2">
            <button
              type="button"
              onClick={() => setToolsExpanded((o) => !o)}
              className="w-full flex items-center justify-between gap-4 text-left group"
            >
              <Label>Stack & Outils ({e.tools.length})</Label>
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground group-hover:text-foreground transition-transform",
                  toolsExpanded && "rotate-180",
                )}
              />
            </button>
            <div
              className={cn(
                "flex gap-2 overflow-hidden relative transition-all",
                toolsExpanded ? "flex-wrap" : "flex-nowrap max-h-8",
              )}
            >
              {e.tools.map((tool) => (
                <span
                  key={tool}
                  className="shrink-0 px-2 py-1 text-[10px] md:text-[11px] uppercase font-medium tracking-wider border border-border text-foreground bg-background"
                >
                  {tool}
                </span>
              ))}
              {!toolsExpanded && (
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" />
              )}
            </div>
          </BentoCard>

          {/* Soft Skills */}
          <BentoCard>
            <Label>Soft skills</Label>
            <div className="flex flex-wrap gap-1.5">
              {e.softSkills.map((s) => (
                <span
                  key={s}
                  className="px-2 py-1 text-[10px] md:text-[11px] uppercase font-medium tracking-wider border border-border text-foreground bg-background"
                >
                  {s}
                </span>
              ))}
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
    </div>
  );
};
