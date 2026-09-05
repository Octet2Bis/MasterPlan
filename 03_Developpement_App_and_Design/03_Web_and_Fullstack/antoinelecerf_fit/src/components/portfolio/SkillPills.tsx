import { pills, type SkillCategory } from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { categoryColor } from "@/lib/categoryColors";

type Props = {
  active: SkillCategory | null;
  onChange: (id: SkillCategory | null) => void;
};

export const SkillPills = ({ active, onChange }: Props) => {
  return (
    <div
      role="tablist"
      aria-label="Filtrer par compétence"
      className="flex flex-wrap gap-2"
    >
      <button
        role="tab"
        aria-selected={active === null}
        onClick={() => onChange(null)}
        className={cn(
          "rounded-full px-4 py-1.5 text-sm font-medium transition-all border",
          active === null
            ? "bg-foreground text-background border-foreground"
            : "bg-background text-foreground border-border hover:bg-muted",
        )}
      >
        Tout voir
      </button>
      {pills.map((p) => {
        const isActive = active === p.id;
        const c = categoryColor[p.id];
        return (
          <button
            key={p.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(isActive ? null : p.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-all border-2",
              c.solid,
              c.solidText,
              c.border,
              isActive ? "shadow-raised scale-[1.04]" : "opacity-90 hover:opacity-100 hover:shadow-card",
            )}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
};
