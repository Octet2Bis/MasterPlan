import { useState } from "react";
import asciiData from "@/data/asciiArt.json";

interface AsciiBlueprintFigureProps {
  className?: string;
}

export const AsciiBlueprintFigure = ({ className = "" }: AsciiBlueprintFigureProps) => {
  const [activeTab, setActiveTab] = useState<"figure" | "sisyphus">("sisyphus");
  const lines = activeTab === "sisyphus" ? asciiData.sisyphusAscii : asciiData.figureLines;

  return (
    <div
      className={`relative rounded-none border border-white/15 bg-black/60 backdrop-blur-md p-4 sm:p-5 font-mono text-xs select-none shadow-[0_0_30px_rgba(0,0,0,0.6)] group transition-all duration-300 hover:border-primary/50 ${className}`}
    >
      {/* Corner crosshairs and CAD brackets */}
      <div className="absolute -top-1.5 -left-1.5 text-white/50 text-[11px] leading-none font-mono">┌</div>
      <div className="absolute -top-1.5 -right-1.5 text-white/50 text-[11px] leading-none font-mono">┐</div>
      <div className="absolute -bottom-1.5 -left-1.5 text-white/50 text-[11px] leading-none font-mono">└</div>
      <div className="absolute -bottom-1.5 -right-1.5 text-white/50 text-[11px] leading-none font-mono">┘</div>

      {/* Top CAD Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3 text-[10px] tracking-wider text-white/60">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span className="font-bold text-white/80">{asciiData.meta.spec}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("sisyphus")}
            className={`px-1.5 py-0.5 border ${
              activeTab === "sisyphus"
                ? "border-primary text-primary bg-primary/10"
                : "border-white/10 text-white/40 hover:text-white/80"
            }`}
          >
            SISYPHUS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("figure")}
            className={`px-1.5 py-0.5 border ${
              activeTab === "figure"
                ? "border-primary text-primary bg-primary/10"
                : "border-white/10 text-white/40 hover:text-white/80"
            }`}
          >
            VITRUVIAN
          </button>
        </div>
      </div>

      {/* Canvas Frame with Golden Ratio Spiral SVG & ASCII rendering */}
      <div className="relative overflow-hidden border border-dashed border-white/10 bg-black/40 p-3 sm:p-4 rounded-none flex items-center justify-center">
        {/* Golden Ratio Spiral SVG Overlay */}
        <svg
          viewBox="0 0 320 280"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-25 group-hover:opacity-45 transition-opacity duration-500"
          fill="none"
          stroke="currentColor"
        >
          {/* Fibonacci boxes */}
          <rect x="20" y="20" width="160" height="160" stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
          <rect x="180" y="20" width="100" height="100" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
          <rect x="220" y="120" width="60" height="60" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
          <rect x="180" y="120" width="40" height="40" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
          {/* Golden Spiral Arc */}
          <path
            d="M 20 180 A 160 160 0 0 1 180 20 A 100 100 0 0 1 280 120 A 60 60 0 0 1 220 180 A 40 40 0 0 1 180 140"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="animate-pulse"
          />
          {/* Center target crosshair */}
          <circle cx="195" cy="145" r="4" stroke="hsl(var(--primary))" strokeWidth="1" />
        </svg>

        {/* Dynamic ASCII matrix representation */}
        <pre className="relative z-10 font-mono text-[9px] sm:text-[11px] leading-[1.15] text-white/80 group-hover:text-white transition-colors duration-300 overflow-x-hidden">
          {lines.map((line, idx) => (
            <div key={idx} className="whitespace-pre hover:text-primary transition-colors duration-100">
              {line}
            </div>
          ))}
        </pre>

        {/* CAD Dimension labels */}
        <div className="absolute top-2 right-2 text-[9px] text-white/40 tracking-widest uppercase">
          PHI: {asciiData.meta.phi}
        </div>
        <div className="absolute bottom-2 left-2 text-[9px] text-white/40 tracking-widest uppercase">
          GRID: {asciiData.meta.gridSize}
        </div>
      </div>

      {/* Bottom CAD status strip */}
      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-white/50 tracking-wider">
        <span>LOC: {asciiData.meta.coordinates}</span>
        <span className="text-emerald-400/90 font-bold">{asciiData.meta.status}</span>
      </div>
    </div>
  );
};
