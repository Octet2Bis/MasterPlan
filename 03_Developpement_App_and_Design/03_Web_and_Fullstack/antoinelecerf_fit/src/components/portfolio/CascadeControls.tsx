import { RotateCcw, Sliders, Sparkles } from "lucide-react";
import { type CascadeParams } from "./CascadeTypeCore";
import presetsData from "@/data/kineticPresets.json";

interface CascadeControlsProps {
  params: CascadeParams;
  onChange: (updated: Partial<CascadeParams>) => void;
  onReset: () => void;
  className?: string;
}

export const CascadeControls = ({
  params,
  onChange,
  onReset,
  className = "",
}: CascadeControlsProps) => {
  return (
    <div
      className={`rounded-2xl border border-white/20 bg-black/60 backdrop-blur-xl p-5 text-white font-sans shadow-2xl ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-white">
          <Sliders className="size-4 text-primary" />
          <span>Lab Controls // Cascade Type</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors"
          title="Réinitialiser les paramètres"
        >
          <RotateCcw className="size-3" /> Reset
        </button>
      </div>

      {/* Preset Selector */}
      <div className="mb-4">
        <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Sparkles className="size-3 text-amber-400" /> Presets de Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          {presetsData.presets.map((p) => {
            const isSelected = params.bgColor === p.bgColor && params.liquidColor === p.liquidColor;
            return (
              <button
                key={p.id}
                onClick={() =>
                  onChange({
                    bgColor: p.bgColor,
                    liquidColor: p.liquidColor,
                    outerFrameColor: p.outerFrameColor,
                    textColor: p.textColor,
                    blur: p.blur,
                    speed: p.speed,
                  })
                }
                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all text-center flex flex-col items-center gap-1 ${
                  isSelected
                    ? "border-primary bg-primary/20 text-white shadow-[0_0_12px_rgba(253,70,18,0.4)]"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/30 hover:text-white"
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-white/40"
                  style={{ backgroundColor: p.liquidColor }}
                />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Text Input */}
      <div className="mb-4">
        <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
          Texte en boucle
        </label>
        <input
          type="text"
          value={params.text}
          onChange={(e) => onChange({ text: e.target.value })}
          className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-primary transition-colors"
          placeholder="Entrez votre texte..."
        />
      </div>

      {/* Sliders Grid */}
      <div className="space-y-3 pt-2 border-t border-white/10 text-xs">
        {/* Speed */}
        <div>
          <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
            <span>Vitesse de rotation</span>
            <span className="text-white font-bold">{params.speed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={params.speed}
            onChange={(e) => onChange({ speed: parseFloat(e.target.value) })}
            className="w-full accent-primary h-1.5 bg-white/20 rounded-lg cursor-pointer"
          />
        </div>

        {/* Gooey Blur */}
        <div>
          <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
            <span>Fusion Liquide (Metaball Blur)</span>
            <span className="text-white font-bold">{params.blur}px</span>
          </div>
          <input
            type="range"
            min="8"
            max="32"
            step="1"
            value={params.blur}
            onChange={(e) => onChange({ blur: parseInt(e.target.value, 10) })}
            className="w-full accent-primary h-1.5 bg-white/20 rounded-lg cursor-pointer"
          />
        </div>

        {/* Toggles */}
        <div className="pt-2 flex items-center justify-between">
          <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={params.gooey}
              onChange={(e) => onChange({ gooey: e.target.checked })}
              className="rounded accent-primary size-3.5"
            />
            Effet Gooey Metaball
          </label>

          <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={params.drawInner}
              onChange={(e) => onChange({ drawInner: e.target.checked })}
              className="rounded accent-primary size-3.5"
            />
            Texte net
          </label>
        </div>
      </div>
    </div>
  );
};
