import { useEffect, useState } from "react";
import { HERO_CYCLE, useHeroCycleIndex } from "./heroCycle";
import { HeroIconCycler } from "./HeroIconCycler";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { OrbitalDotGrid } from "./OrbitalDotGrid";
import { AtlasEngraving } from "./AtlasEngraving";

interface HeroAsciiProps {
  onSkillClick: () => void;
}

export const HeroAscii = ({ onSkillClick }: HeroAsciiProps) => {
  const cycleIndex = useHeroCycleIndex();
  const current = HERO_CYCLE[cycleIndex];
  const { t } = useLanguage();
  const { profile } = usePortfolioData();
  const [frameNumber, setFrameNumber] = useState(1048);

  useEffect(() => {
    const id = setInterval(() => {
      setFrameNumber((n) => (n + 1) % 999999);
    }, 120);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="relative w-full min-h-screen bg-black text-white overflow-hidden flex flex-col justify-between select-none">
      {/* 1. Authentic Astronomical Orbital Dot Perspective Grid */}
      <OrbitalDotGrid />

      {/* 2. Top hairline navigation reference */}
      <div className="relative z-10 w-full px-6 sm:px-12 pt-6 flex items-center justify-between font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>SYS.ACTIVE // LAB.LIVE</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-white/30">
          <span>PARIS [48.8566° N, 2.3522° E]</span>
          <span>•</span>
          <span>LENIS.INERTIAL</span>
        </div>
      </div>

      {/* 3. Main Split Stage (Atlas Engraving + Typography) */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-10 py-8 lg:py-12 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center w-full">
          
          {/* Left: Authentic Atlas & Celestial Sphere Engraving Frame */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <AtlasEngraving className="w-full" />
          </div>

          {/* Right: Architectural Monospace Hero Typography & Buttons */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Top Hairline with Infinity Symbol */}
            <div className="w-full flex items-center gap-3 text-white/30 font-mono text-[11px] mb-4">
              <span className="flex-1 h-px bg-white/20" />
              <span className="tracking-[0.3em] text-white/50">— ∞ —</span>
              <span className="flex-1 h-px bg-white/20" />
            </div>

            {/* Monumental Headline */}
            <h1 className="font-mono font-bold tracking-[0.16em] text-white uppercase leading-[1.05] text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">ANTOINE</span>
              <span className="block text-white/95">LECERF</span>
            </h1>

            {/* Subtle Dotted Divider */}
            <div className="my-5 w-full text-white/25 font-mono text-xs tracking-[0.35em] overflow-hidden select-none">
              ················································································
            </div>

            {/* Cycler Badge: Role & Focus */}
            <div className="inline-flex items-center gap-3 px-3.5 py-1.5 border border-white/20 bg-white/5 font-mono text-xs tracking-[0.2em] text-white/90 mb-5">
              <span className="text-white/40">PROFIL //</span>
              <span key={current.key} className="text-white font-bold animate-fade-in uppercase">
                [ {current.word} ]
              </span>
              <HeroIconCycler index={cycleIndex} className="!w-5 !h-5 !filter !invert ml-1" />
            </div>

            {/* Editorial Monospace Subtitle echoing the Sisyphus quote */}
            <p className="max-w-xl font-mono text-xs sm:text-sm text-zinc-400 leading-relaxed tracking-wide">
              Comme Sisyphe, nous bâtissons chaque produit avec rigueur —
              non pas malgré l&apos;effort, mais guidé par lui. Chaque itération,
              chaque pixel, chaque ligne de code est notre levier.
            </p>

            {/* Action Buttons in Sharp CAD Wireframe Format */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button
                onClick={onSkillClick}
                className="w-full sm:w-auto rounded-none border border-white/40 bg-transparent text-white font-mono text-xs font-semibold tracking-[0.2em] px-8 py-3.5 hover:bg-white hover:text-black transition-all duration-200 uppercase"
              >
                [ {t("hero.explore")} ]
              </button>

              <a
                href={`mailto:${profile.email}`}
                className="w-full sm:w-auto rounded-none border border-white/40 bg-transparent text-white font-mono text-xs font-semibold tracking-[0.2em] px-8 py-3.5 hover:bg-white hover:text-black transition-all duration-200 uppercase text-center"
              >
                [ {t("hero.contact")} ]
              </a>
            </div>

            {/* Lower Technical Hairline with Protocol Tag */}
            <div className="w-full flex items-center gap-3 text-white/20 font-mono text-[10px] mt-8 pt-2">
              <span className="flex-1 h-px bg-white/15" />
              <span className="tracking-[0.25em] text-white/40">SISYPHUS.PROTOCOL ●</span>
            </div>

            {/* Muted Contact Coordinates */}
            <div className="mt-3 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-1 font-mono text-[10px] tracking-widest text-white/40">
              <a href={`mailto:${profile.email}`} className="hover:text-white transition-colors">
                {profile.email}
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                LINKEDIN
              </a>
              <span>PARIS, FRANCE</span>
            </div>

          </div>
        </div>
      </div>

      {/* 4. Bottom Telemetry Bar (Pixel-perfect to screenshot) */}
      <div className="relative z-10 w-full border-t border-white/15 bg-black px-6 sm:px-12 py-3 flex items-center justify-between font-mono text-[10px] tracking-[0.25em] text-white/50">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-white/80 font-bold">SYSTEM.ACTIVE</span>
          <span className="tracking-widest text-white/40">||||||||</span>
          <span className="text-white/40">V1.0.0</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-white/80">◐ RENDERING</span>
          <span className="text-white/30">• • •</span>
          <span className="text-white/40">FRAME: {frameNumber}</span>
        </div>
      </div>
    </header>
  );
};
