import { pills, experiences, type SkillCategory } from "@/data/portfolio";
import { categoryColor } from "@/lib/categoryColors";
import { cn } from "@/lib/utils";

type Props = { active: SkillCategory };

export const ActiveSkillPanel = ({ active }: Props) => {
  const pill = pills.find((p) => p.id === active);
  if (!pill) return null;
  const c = categoryColor[active];
  const matching = experiences.filter((e) => e.categories.includes(active));

  return (
    <section
      aria-live="polite"
      className={cn(
        "rounded-md border-l-4 border border-border bg-card shadow-card p-6",
        c.border,
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn("inline-block h-2.5 w-2.5 rounded-full", c.solid)} />
        <h2 className={cn("text-xl font-semibold", c.fg)}>{pill.label}</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
        {pill.description}
      </p>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Outils
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {pill.tools.map((t) => (
              <span
                key={t}
                className={cn(
                  "rounded-sm px-2 py-0.5 text-xs font-medium",
                  c.bg,
                  c.fg,
                )}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Soft skills
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {pill.softSkills.map((s) => (
              <span
                key={s}
                className={cn(
                  "rounded-sm border px-2 py-0.5 text-xs font-medium bg-background",
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

      {matching.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {matching.length} expérience{matching.length > 1 ? "s" : ""} concernée{matching.length > 1 ? "s" : ""}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {matching.map((e) => (
              <a
                key={e.id}
                href={`#exp-${e.id}`}
                className={cn("text-sm font-medium hover:underline", c.fg)}
              >
                {e.organization}
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
