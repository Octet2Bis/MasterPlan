import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { pills as pillsFr, experiences as experiencesFr, profile as profileFr } from "@/data/portfolio";
import { pillsEn, experiencesEn, profileEn } from "@/data/portfolio.en";

/** Returns the correct dataset (pills, experiences, profile) for the active language. */
export const usePortfolioData = () => {
  const { lang } = useLanguage();

  return useMemo(
    () => ({
      pills: lang === "en" ? pillsEn : pillsFr,
      experiences: lang === "en" ? experiencesEn : experiencesFr,
      profile: lang === "en" ? profileEn : profileFr,
    }),
    [lang],
  );
};
