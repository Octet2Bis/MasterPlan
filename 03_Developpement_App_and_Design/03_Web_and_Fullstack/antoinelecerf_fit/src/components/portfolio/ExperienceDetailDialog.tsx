import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Experience } from "@/data/portfolio";
import way2techWorkflow from "@/assets/way2tech-workflow.gif";

type Props = {
  experience: Experience | null;
  onClose: () => void;
};

export const ExperienceDetailDialog = ({ experience, onClose }: Props) => {
  return (
    <Dialog open={!!experience} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        {experience && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">{experience.title}</DialogTitle>
              <DialogDescription className="text-sm">
                <span className="font-medium text-foreground">
                  {experience.organization}
                </span>
                {" · "}
                {experience.period}
                {experience.location ? ` · ${experience.location}` : ""}
              </DialogDescription>
            </DialogHeader>

            <p className="text-sm text-muted-foreground">{experience.summary}</p>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Missions clés
              </h4>
              <ul className="mt-2 space-y-1.5 text-sm text-foreground list-disc pl-5">
                {experience.missions.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>

            {experience.results && experience.results.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Résultats
                </h4>
                <ul className="mt-2 space-y-1.5 text-sm text-foreground list-disc pl-5">
                  {experience.results.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {experience.id === "way2tech" && (
              <figure>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Growth Workflow
                </h4>
                <img
                  src={way2techWorkflow}
                  alt="Workflow Growth Way2Tech : ICP Mapping, Enrichissement, Segmentation, Outreach personnalisé, Création contenu, Analytics"
                  className="w-full border border-border bg-background"
                  loading="lazy"
                />
              </figure>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Outils
                </h4>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {experience.tools.map((t) => (
                    <span
                      key={t}
                      className="rounded-sm bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Soft skills
                </h4>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {experience.softSkills.map((s) => (
                    <span
                      key={s}
                      className="rounded-sm border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
