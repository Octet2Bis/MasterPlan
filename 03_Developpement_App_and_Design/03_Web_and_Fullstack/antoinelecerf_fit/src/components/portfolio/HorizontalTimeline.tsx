import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  experiences,
  type Experience,
  type SkillCategory,
} from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { ExperienceDetailDialog } from "./ExperienceDetailDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = { active: SkillCategory | null };

// Parse "YYYY-MM" → months since year 0 (relative scale)
const parseMonth = (s: string) => {
  const [y, m] = s.split("-").map(Number);
  return y * 12 + (m - 1);
};

const getStart = (e: Experience) =>
  e.startDate ? parseMonth(e.startDate) : null;
const getEnd = (e: Experience) =>
  e.endDate ? parseMonth(e.endDate) : e.startDate ? parseMonth(e.startDate) : null;

const catVar = (cat: SkillCategory) =>
  cat === "crm-growth"
    ? "--cat-crm"
    : cat === "product-ops"
      ? "--cat-product"
      : cat === "ux-ui"
        ? "--cat-uxui"
        : cat === "qa"
          ? "--cat-qa"
          : "--cat-support";

const catColor = (cat: SkillCategory) => `hsl(var(${catVar(cat)}))`;

const buildBackground = (cats: SkillCategory[]) => {
  if (cats.length === 0) return catColor("crm-growth");
  if (cats.length === 1) return catColor(cats[0]);
  
  const step = 100 / cats.length;
  const stops = cats
    .map((c, i) => {
      const color = catColor(c);
      const start = i * step;
      const end = (i + 1) * step;
      return `${color} ${start}%, ${color} ${end}%`;
    })
    .join(", ");
    
  return `linear-gradient(to bottom, ${stops})`;
};


export const HorizontalTimeline = ({ active }: Props) => {
  const [open, setOpen] = useState<Experience | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setContainerW] = useState<number>(800);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () => setContainerW(el.getBoundingClientRect().width || 800);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const visible = useMemo(
    () =>
      (active === null
        ? experiences
        : experiences.filter((e) => e.categories.includes(active))
      )
        .slice()
        .sort((a, b) => (getStart(a) ?? 0) - (getStart(b) ?? 0)),
    [active],
  );

  const pillExps = visible.filter((e) => e.kind !== "certification");
  const certExps = visible.filter((e) => e.kind === "certification");

  // Year axis bounds (always full timeline range, in years)
  const { minY, maxY, years } = useMemo(() => {
    const all = experiences
      .flatMap((e) => [getStart(e), getEnd(e)])
      .filter((v): v is number => v !== null);
    const minMonth = Math.min(...all);
    const maxMonth = Math.max(...all);
    const minY = Math.floor(minMonth / 12);
    const maxY = Math.ceil(maxMonth / 12);
    const years: number[] = [];
    for (let y = minY; y <= maxY; y++) years.push(y);
    return { minY, maxY, years };
  }, []);

  const minMonth = minY * 12;
  const spanMonths = Math.max(1, (maxY - minY) * 12);
  const pctMonth = (m: number) => ((m - minMonth) / spanMonths) * 100;
  const pctYear = (y: number) => ((y - minY) / (maxY - minY)) * 100;

  type Placed = {
    exp: Experience;
    cats: SkillCategory[];
    side: "top" | "bottom";
    row: number;
    leftPct: number;
    widthPct: number;
    dashed?: boolean;
  };

  const placed: Placed[] = useMemo(() => {
    const out: Placed[] = [];
    const rowsTop: number[] = [];
    const rowsBot: number[] = [];
    pillExps.forEach((exp) => {
      const sM = getStart(exp);
      const eM = getEnd(exp);
      if (sM === null || eM === null) return;

      const isSupportTech = exp.id === "support-tech";
      // Clamp support-tech display window to 2020–2023
      const dispS = isSupportTech ? Math.max(sM, parseMonth("2020-01")) : sM;
      const dispE = isSupportTech ? Math.min(eM, parseMonth("2023-12")) : eM;

      const left = pctMonth(dispS);
      const right = pctMonth(Math.max(dispE, dispS));
      const fullWidth = Math.max(right - left, 0.4);

      const side: "top" | "bottom" =
        exp.kind === "education" ? "bottom" : "top";
      const rows = side === "top" ? rowsTop : rowsBot;

      const cats = exp.categories.slice();
      if (active && cats.includes(active)) {
        cats.sort((a, b) => (a === active ? -1 : b === active ? 1 : 0));
      }

      let row = 0;
      while (row < rows.length && rows[row] > left - 0.3) row++;
      rows[row] = left + fullWidth;

      out.push({
        exp,
        cats,
        side,
        row,
        leftPct: left,
        widthPct: fullWidth,
        dashed: isSupportTech,
      });
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pillExps, active, minMonth, spanMonths]);

  const PILL_H = 32;
  const ROW_GAP = 14;
  const ROW_H = PILL_H + ROW_GAP;
  const AXIS_GAP_TOP = 44;
  // Year labels sit ~22px below the axis; add the same visual breathing room
  // as the top side so bottom pills clear the year labels symmetrically.
  const YEAR_LABEL_SPACE = 22;
  const AXIS_GAP_BOT = AXIS_GAP_TOP + YEAR_LABEL_SPACE;
  const maxTopRow = Math.max(0, ...placed.filter((p) => p.side === "top").map((p) => p.row));
  const maxBotRow = Math.max(0, ...placed.filter((p) => p.side === "bottom").map((p) => p.row));
  const heightTop = AXIS_GAP_TOP + (maxTopRow + 1) * ROW_H;
  const heightBot = AXIS_GAP_BOT + (maxBotRow + 1) * ROW_H;
  const totalH = heightTop + heightBot + 36;

  return (
    <section>
      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          Aucune expérience pour cette compétence.
        </p>
      ) : (
        <TooltipProvider delayDuration={80}>
          <div
            ref={containerRef}
            className="relative w-full"
            style={{ height: `${totalH}px` }}
          >
            {/* Center axis */}
            <div
              className="absolute left-0 right-0 rounded-full bg-gradient-to-r from-[hsl(var(--cat-crm))] via-[hsl(var(--cat-uxui))] to-[hsl(var(--cat-support))] shadow-card"
              style={{ top: `${heightTop}px`, height: "3px", transform: "translateY(-1.5px)" }}
            />

            {/* Year ticks */}
            {years.map((y) => (
              <span
                key={`t-${y}`}
                className="absolute h-2.5 w-2.5 rounded-full bg-background border-2 border-foreground/30"
                style={{
                  left: `${pctYear(y)}%`,
                  top: `${heightTop}px`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}
            {years.map((y, i) => {
              const showAll = years.length <= 8;
              if (!showAll && i % 2 !== 0 && i !== years.length - 1) return null;
              return (
                <span
                  key={`l-${y}`}
                  className="absolute text-[10px] font-bold text-muted-foreground tabular-nums"
                  style={{
                    left: `${pctYear(y)}%`,
                    top: `${heightTop + 10}px`,
                    transform: "translateX(-50%)",
                  }}
                >
                  {y}
                </span>
              );
            })}

            {/* Certification dots */}
            {certExps.map((exp) => {
              const sM = getStart(exp);
              if (sM === null) return null;
              const primaryCat = active ?? exp.categories[0];
              const colorVar = catColor(primaryCat);
              return (
                <Tooltip key={`cert-${exp.id}`}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setOpen(exp)}
                      aria-label={`${exp.title} (certification)`}
                      className="absolute h-3.5 w-3.5 rounded-full bg-background shadow-card transition-transform hover:scale-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                      style={{
                        left: `${pctMonth(sM)}%`,
                        top: `${heightTop}px`,
                        transform: "translate(-50%, -50%)",
                        border: `2px solid ${colorVar}`,
                        boxShadow: `0 0 0 2px ${colorVar}33`,
                        zIndex: 20,
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <div className="font-semibold">{exp.title}</div>
                    <div className="text-muted-foreground">
                      {exp.organization} · {exp.period}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}

            {/* Pills */}
            {placed.map(({ exp, cats, side, row, leftPct, widthPct, dashed }) => {
              const top =
                side === "top"
                  ? heightTop - AXIS_GAP_TOP - (row + 1) * ROW_H + ROW_GAP
                  : heightTop + AXIS_GAP_BOT + row * ROW_H;
              const background = dashed
                ? `repeating-linear-gradient(90deg, ${catColor(cats[0] ?? "support")} 0 6px, transparent 6px 12px)`
                : buildBackground(cats);

              return (
                <Tooltip key={exp.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setOpen(exp)}
                      aria-label={`${exp.title} — ${exp.organization}`}
                      className={cn(
                        "group absolute rounded-full shadow-card",
                        "transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        "hover:shadow-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
                        "origin-center hover:scale-y-[1.18] hover:scale-x-[1.01] hover:-translate-y-[2px] hover:z-30",
                      )}
                      style={{
                        left: `${leftPct}%`,
                        top: `${top}px`,
                        width: `${widthPct}%`,
                        height: `${PILL_H}px`,
                        background,
                        zIndex: 10,
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent
                    side={side === "top" ? "top" : "bottom"}
                    className="text-xs"
                  >
                    <div className="font-semibold">{exp.title}</div>
                    <div className="text-muted-foreground">
                      {exp.organization} · {exp.period}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      )}

      <div className="mt-6 text-xs text-muted-foreground text-center">
        Survolez une barre pour voir l'expérience, cliquez pour le détail · La longueur représente la durée exacte
      </div>

      <ExperienceDetailDialog experience={open} onClose={() => setOpen(null)} />
    </section>
  );
};
