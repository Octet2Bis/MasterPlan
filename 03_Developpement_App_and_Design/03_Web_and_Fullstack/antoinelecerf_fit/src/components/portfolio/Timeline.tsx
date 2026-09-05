import { Briefcase, GraduationCap, MapPin, Wrench } from "lucide-react";
import { useState } from "react";
import {
  experiences,
  pills,
  type Experience,
  type SkillCategory,
} from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { categoryColor } from "@/lib/categoryColors";
import { ExperienceDetailDialog } from "./ExperienceDetailDialog";

type Props = { active: SkillCategory | null };

export const Timeline = ({ active }: Props) => {
  const [open, setOpen] = useState<Experience | null>(null);
  const pillLabel = (id: SkillCategory) =>
    pills.find((p) => p.id === id)?.label ?? id;

  // CV sur mesure : on ne montre que les expériences correspondantes
  const visible =
    active === null
      ? experiences
      : experiences.filter((e) => e.categories.includes(active));

  return (
    <section className="relative">
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-1/2" />

      <ol className="space-y-8">
        {visible.map((exp, i) => {
          const isLeft = i % 2 === 0;
          const Icon = exp.kind === "education" ? GraduationCap : Briefcase;
          const primaryCat = active ?? exp.categories[0];
          const c = categoryColor[primaryCat];

          return (
            <li
              key={exp.id}
              id={`exp-${exp.id}`}
              className="relative md:grid md:grid-cols-2 md:gap-8"
            >
              <span
                className={cn(
                  "absolute left-4 md:left-1/2 top-5 -translate-x-1/2 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-background",
                  c.border,
                  c.fg,
                )}
              >
                <Icon className="h-3 w-3" />
              </span>

              <div
                className={cn(
                  "pl-12 md:pl-0",
                  isLeft ? "md:pr-12 md:text-right" : "md:col-start-2 md:pl-12",
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpen(exp)}
                  className={cn(
                    "block w-full cursor-pointer text-left rounded-[1.5rem] border bg-white/40 backdrop-blur-md p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                    isLeft && "md:text-left",
                  )}
                >
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-foreground">
                      {exp.title}
                    </h3>
                    <span className="text-xs font-medium text-muted-foreground">
                      {exp.period}
                    </span>
                  </div>
                  <p className={cn("mt-1 text-sm font-semibold", c.fg)}>
                    {exp.organization}
                  </p>
                  {exp.location && (
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {exp.location}
                    </p>
                  )}
                  <p className="mt-3 text-sm text-muted-foreground">
                    {exp.summary}
                  </p>

                  {exp.tools.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <Wrench className="h-3 w-3" /> Outils
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {exp.tools.map((t) => {
                          const tc = categoryColor[primaryCat];
                          return (
                            <span
                              key={t}
                              className={cn(
                                "rounded-sm px-2 py-0.5 text-[11px] font-medium",
                                tc.bg,
                                tc.fg,
                              )}
                            >
                              {t}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {exp.categories.map((cat) => {
                      const cc = categoryColor[cat];
                      const isActive = active === cat;
                      return (
                        <span
                          key={cat}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-medium border",
                            isActive
                              ? cn(cc.solid, cc.solidText, cc.border)
                              : cn(cc.bg, cc.fg, cc.border),
                          )}
                        >
                          {pillLabel(cat)}
                        </span>
                      );
                    })}
                  </div>
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      {visible.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">
          Aucune expérience pour cette compétence.
        </p>
      )}

      <ExperienceDetailDialog
        experience={open}
        onClose={() => setOpen(null)}
      />
    </section>
  );
};
