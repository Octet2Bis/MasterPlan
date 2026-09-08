import { useState } from "react";
import { ArrowDown, Mail, MapPin, Linkedin, Sparkles, Terminal } from "lucide-react";
import { HERO_CYCLE, useHeroCycleIndex } from "./heroCycle";
import { HeroIconCycler } from "./HeroIconCycler";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { CascadeTypeCore, type CascadeParams } from "./CascadeTypeCore";
import { CascadeControls } from "./CascadeControls";
import presetsData from "@/data/kineticPresets.json";

interface HeroCascadeProps {
  onSkillClick: () => void;
}

export const HeroCascade = ({ onSkillClick }: HeroCascadeProps) => {
  const cycleIndex = useHeroCycleIndex();
  const current = HERO_CYCLE[cycleIndex];
  const { t } = useLanguage();
  const { profile } = usePortfolioData();

  const defaultPreset = presetsData.presets[0];
  const [params, setParams] = useState<CascadeParams>({
    text: presetsData.defaultText,
    speed: defaultPreset.speed,
    gooey: defaultPreset.gooey,
    blur: defaultPreset.blur,
    bgColor: defaultPreset.bgColor,
    liquidColor: defaultPreset.liquidColor,
    outerFrameColor: defaultPreset.outerFrameColor,
    textColor: defaultPreset.textColor,
    drawInner: true,
  });

  const [showControls, setShowControls] = useState(true);

  const handleUpdate = (updated: Partial<CascadeParams>) => {
    setParams((prev) => ({ ...prev, ...updated }));
  };

  const handleReset = () => {
    setParams({
      text: presetsData.defaultText,
      speed: defaultPreset.speed,
      gooey: defaultPreset.gooey,
      blur: defaultPreset.blur,
      bgColor: defaultPreset.bgColor,
      liquidColor: defaultPreset.liquidColor,
      outerFrameColor: defaultPreset.outerFrameColor,
      textColor: defaultPreset.textColor,
      drawInner: true,
    });
  };

  return (
    <header
      className="relative w-full min-h-screen text-white overflow-hidden flex flex-col justify-between transition-colors duration-700 select-none pt-4 pb-8"
      style={{ backgroundColor: params.bgColor }}
    >
      {/* Background subtle noise & radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.65)_100%)] pointer-events-none" />

      {/* Top Laboratory Header Bar */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-10 flex items-center justify-between font-mono text-[11px] tracking-widest text-white/60">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white font-bold text-[10px] uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LABORATOIRE LIVE
          </span>
          <span className="hidden md:inline text-white/40">|</span>
          <span className="hidden md:inline">EXPÉRIMENTATION 04 // CASCADE TYPE BRIK.DA</span>
        </div>

        <button
          onClick={() => setShowControls(!showControls)}
          className="px-3 py-1 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white font-mono text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="size-3 text-amber-300" />
          {showControls ? "Masquer Contrôles" : "Ouvrir Contrôles Lab"}
        </button>
      </div>

      {/* Main Dual Stage (Interactive Cascade Visualizer + Profile & Lab Controls) */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-10 py-8 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: The Kinetic Typography Cascade Organ */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <CascadeTypeCore params={params} />
          </div>

          {/* Right Column: Hero Profile Presentation + Lab Controls */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Identity Title */}
            <div className="flex items-center gap-3 font-mono text-xs text-white/50 tracking-widest uppercase mb-2">
              <span>ANTOINE LECERF</span>
              <span>—</span>
              <span className="text-white/80">LABORATOIRE DE CRÉATION DIGITALE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight uppercase font-sans">
              INGÉNIERIE & CROISSANCE
            </h1>

            {/* Dynamic Competency Cycler */}
            <div className="flex flex-wrap items-center gap-3 my-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md font-mono text-xs text-white">
                <Terminal className="size-3.5 text-amber-400" />
                <span className="text-white/60">{t("hero.profil")}</span>
                <span key={current.key} className="text-white font-bold uppercase animate-fade-in">
                  [ {current.word} ]
                </span>
              </div>
              <HeroIconCycler index={cycleIndex} className="!w-6 !h-6" />
            </div>

            <p className="text-sm sm:text-base text-white/80 leading-relaxed font-sans mb-6 max-w-lg">
              {t("hero.subtitle")} {t("hero.subtitle2")}
            </p>

            {/* Call To Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <button
                onClick={onSkillClick}
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider text-black bg-white hover:bg-white/90 shadow-[0_10px_30px_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <span>{t("hero.explore")}</span>
                <ArrowDown className="size-4" />
              </button>

              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider border border-white/30 text-white hover:bg-white/10 transition-all duration-200"
              >
                <Mail className="size-4" />
                <span>{t("hero.contact")}</span>
              </a>
            </div>

            {/* Collapsible Lab Controls */}
            {showControls && (
              <CascadeControls
                params={params}
                onChange={handleUpdate}
                onReset={handleReset}
                className="w-full mt-2"
              />
            )}

            {/* Micro Details (Email, LinkedIn, Location) */}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-white/50">
              <a href={`mailto:${profile.email}`} className="hover:text-white transition-colors flex items-center gap-1.5">
                <Mail className="size-3.5" /> {profile.email}
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Linkedin className="size-3.5 text-[#0A66C2]" /> LinkedIn
              </a>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" /> {profile.location}
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Telemetry HUD Bar */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between font-mono text-[10px] tracking-widest text-white/40 gap-2">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold">KINETIC.ENGINE // ACTIVE</span>
          <span>•</span>
          <span>STAGGER: 180ms</span>
          <span>•</span>
          <span>FILTER: SVG_METABALL_FECOLORMATRIX</span>
        </div>
        <div>
          <span>SMOOTH_SCROLL: LENIS_RAF // 60 FPS</span>
        </div>
      </div>
    </header>
  );
};
