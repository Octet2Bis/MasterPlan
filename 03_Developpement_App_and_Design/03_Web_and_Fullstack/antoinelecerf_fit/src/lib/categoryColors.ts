import type { SkillCategory } from "@/data/portfolio";

export const categoryColor: Record<
  SkillCategory,
  { fg: string; bg: string; border: string; solid: string; solidText: string; ring: string }
> = {
  "crm-growth": {
    fg: "text-[hsl(var(--cat-crm))]",
    bg: "bg-[hsl(var(--cat-crm-bg))]",
    border: "border-[hsl(var(--cat-crm))]",
    solid: "bg-[hsl(var(--cat-crm))]",
    solidText: "text-white",
    ring: "ring-[hsl(var(--cat-crm))]",
  },
  "product-ops": {
    fg: "text-[hsl(var(--cat-product))]",
    bg: "bg-[hsl(var(--cat-product-bg))]",
    border: "border-[hsl(var(--cat-product))]",
    solid: "bg-[hsl(var(--cat-product))]",
    solidText: "text-white",
    ring: "ring-[hsl(var(--cat-product))]",
  },
  "ux-ui": {
    fg: "text-[hsl(var(--cat-uxui))]",
    bg: "bg-[hsl(var(--cat-uxui-bg))]",
    border: "border-[hsl(var(--cat-uxui))]",
    solid: "bg-[hsl(var(--cat-uxui))]",
    solidText: "text-white",
    ring: "ring-[hsl(var(--cat-uxui))]",
  },
  qa: {
    fg: "text-[hsl(var(--cat-qa))]",
    bg: "bg-[hsl(var(--cat-qa-bg))]",
    border: "border-[hsl(var(--cat-qa))]",
    solid: "bg-[hsl(var(--cat-qa))]",
    solidText: "text-white",
    ring: "ring-[hsl(var(--cat-qa))]",
  },
  support: {
    fg: "text-[hsl(var(--cat-support))]",
    bg: "bg-[hsl(var(--cat-support-bg))]",
    border: "border-[hsl(var(--cat-support))]",
    solid: "bg-[hsl(var(--cat-support))]",
    solidText: "text-white",
    ring: "ring-[hsl(var(--cat-support))]",
  },
};
