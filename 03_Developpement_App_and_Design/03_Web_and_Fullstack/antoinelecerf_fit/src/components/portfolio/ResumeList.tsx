import { Briefcase, GraduationCap, MapPin, Calendar } from "lucide-react";
import { useState } from "react";
import { experiences, type Experience, type SkillCategory } from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { categoryColor } from "@/lib/categoryColors";
import { ExperienceDetailDialog } from "./ExperienceDetailDialog";

type Props = { active: SkillCategory | null };

export const ResumeList = ({ active }: Props) => {
  const [open, setOpen] = useState<Experience | null>(null);

  const visible = active === null
    ? experiences
    : experiences.filter((e) => e.categories.includes(active));

  const proExp = visible.filter(e => e.kind === 'company');
  const eduExp = visible.filter(e => e.kind === 'education' || e.kind === 'certification');

  const ResumeSection = ({ title, items, icon: Icon }: { title: string, items: Experience[], icon: any }) => (
    <div className="space-y-8">
      <div className="flex items-center gap-3 border-b border-border pb-2">
        <Icon className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      </div>
      <div className="grid gap-6">
        {items.map((exp) => {
          const primaryCat = active ?? exp.categories[0];
          const c = categoryColor[primaryCat];
          
          return (
            <div 
              key={exp.id}
              className="group relative bg-white/40 backdrop-blur-sm border border-white/60 p-6 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => setOpen(exp)}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {exp.title}
                  </h3>
                  <p className={cn("font-semibold text-lg", c.fg)}>
                    {exp.organization}
                  </p>
                </div>
                <div className="flex flex-col md:items-end gap-1 text-sm text-muted-foreground whitespace-nowrap">
                  <span className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full font-medium">
                    <Calendar className="w-4 h-4" /> {exp.period}
                  </span>
                  {exp.location && (
                    <span className="flex items-center gap-2 px-3">
                      <MapPin className="w-4 h-4" /> {exp.location}
                    </span>
                  )}
                </div>
              </div>
              
              <p className="mt-4 text-muted-foreground leading-relaxed max-w-3xl">
                {exp.summary}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {exp.tools.slice(0, 5).map(tool => (
                  <span key={tool} className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-surface-sunken rounded-md border border-border">
                    {tool}
                  </span>
                ))}
                {exp.tools.length > 5 && (
                  <span className="text-[10px] font-bold text-muted-foreground px-2 py-1">
                    +{exp.tools.length - 5}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-16">
      {proExp.length > 0 && (
        <ResumeSection title="Expériences Professionnelles" items={proExp} icon={Briefcase} />
      )}
      
      {eduExp.length > 0 && (
        <ResumeSection title="Formation & Certifications" items={eduExp} icon={GraduationCap} />
      )}

      {visible.length === 0 && (
        <div className="text-center py-20 bg-muted/30 rounded-[2rem] border border-dashed border-border">
          <p className="text-muted-foreground">Aucun élément ne correspond à cette compétence.</p>
        </div>
      )}

      <ExperienceDetailDialog
        experience={open}
        onClose={() => setOpen(null)}
      />
    </div>
  );
};
