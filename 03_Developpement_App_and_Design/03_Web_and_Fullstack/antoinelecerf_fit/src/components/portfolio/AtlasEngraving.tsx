interface AtlasEngravingProps {
  className?: string;
}

export const AtlasEngraving = ({ className = "" }: AtlasEngravingProps) => {
  return (
    <div className={`relative select-none ${className}`}>
      {/* Outer CAD Blueprint Construction Lines extending beyond frame */}
      <div className="relative border border-white/20 bg-black/50 backdrop-blur-sm p-4 sm:p-6 w-full max-w-[440px]">
        {/* Extended crosshair construction axes */}
        <div className="absolute -top-3 left-0 right-0 h-px bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-3 left-0 right-0 h-px bg-white/10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 -left-3 w-px bg-white/10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 -right-3 w-px bg-white/10 pointer-events-none" />

        {/* CAD Corner tick crosses */}
        <div className="absolute -top-1.5 -left-1.5 text-white/60 font-mono text-[11px] leading-none">+</div>
        <div className="absolute -top-1.5 -right-1.5 text-white/60 font-mono text-[11px] leading-none">+</div>
        <div className="absolute -bottom-1.5 -left-1.5 text-white/60 font-mono text-[11px] leading-none">+</div>
        <div className="absolute -bottom-1.5 -right-1.5 text-white/60 font-mono text-[11px] leading-none">+</div>

        {/* Top CAD Measurement Header */}
        <div className="flex items-center justify-between font-mono text-[10px] tracking-widest text-white/40 mb-3 border-b border-white/10 pb-2">
          <span>DIM: 340.00 × 520.00 mm</span>
          <span className="text-white/70">ARCHETYPE.ATLAS // 01</span>
        </div>

        {/* Main Vector Engraving Canvas */}
        <svg
          viewBox="0 0 340 500"
          className="w-full h-auto overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Halftone stipple pattern for the celestial sphere */}
            <pattern id="stipple-dense" width="6" height="6" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.1" fill="rgba(255,255,255,0.75)" />
            </pattern>
            <pattern id="stipple-sparse" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="0.75" fill="rgba(255,255,255,0.35)" />
            </pattern>
            {/* Radial gradient mask for spherical 3D shading */}
            <radialGradient id="sphere-shade" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#fff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
            <mask id="sphere-mask">
              <circle cx="170" cy="150" r="110" fill="url(#sphere-shade)" />
            </mask>
          </defs>

          {/* 1. Celestial Sphere / Boulder Outer Rings */}
          <circle cx="170" cy="150" r="114" stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="170" cy="150" r="110" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />

          {/* Dense Stipple Shading inside Sphere */}
          <circle cx="170" cy="150" r="110" fill="url(#stipple-dense)" mask="url(#sphere-mask)" />
          <circle cx="170" cy="150" r="110" fill="url(#stipple-sparse)" opacity="0.5" />

          {/* Sphere Equatorial & Meridian Astronomical Ellipses */}
          <ellipse cx="170" cy="150" rx="110" ry="38" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" strokeDasharray="2 3" />
          <ellipse cx="170" cy="150" rx="42" ry="110" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" strokeDasharray="2 3" />

          {/* 2. Atlas Classical Muscular Silhouette & Hatching */}
          {/* Head bowed */}
          <path
            d="M 160 230 C 150 220, 140 230, 142 245 C 145 260, 155 265, 168 258 C 172 250, 170 240, 160 230 Z"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="1.5"
            fill="rgba(0,0,0,0.6)"
          />

          {/* Left Arm raised under boulder */}
          <path
            d="M 152 235 C 130 215, 110 190, 100 155 C 98 150, 108 145, 112 152 C 122 178, 140 205, 158 225"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="1.6"
          />
          {/* Left forearm muscles hatching */}
          <path d="M 112 165 L 120 175 M 118 178 L 128 188 M 126 190 L 138 202" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />

          {/* Right Arm grasping globe */}
          <path
            d="M 175 235 C 205 215, 235 185, 245 145 C 248 142, 252 148, 248 155 C 238 190, 212 222, 185 242"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="1.6"
          />
          {/* Right arm hatching */}
          <path d="M 235 160 L 225 170 M 225 175 L 212 188 M 210 192 L 195 208" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />

          {/* Muscular Torso & Back straining under weight */}
          <path
            d="M 158 250 C 148 275, 145 305, 150 335 C 160 350, 180 348, 192 335 C 198 305, 195 270, 182 248"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="1.8"
            fill="rgba(0,0,0,0.5)"
          />
          {/* Spinal contour & Latissimus dorsi striations */}
          <path d="M 170 252 C 168 280, 168 310, 171 334" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
          <path d="M 158 280 C 164 285, 175 285, 182 280" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
          <path d="M 155 298 C 163 304, 176 304, 185 298" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
          <path d="M 153 318 C 162 322, 178 322, 187 318" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />

          {/* Crouched Knees and Calves */}
          {/* Left leg kneeling */}
          <path
            d="M 150 335 C 135 355, 115 375, 105 405 C 100 420, 110 440, 130 445 C 145 448, 155 435, 158 415 C 160 395, 162 365, 165 345"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="1.6"
          />
          {/* Right leg planted for resistance */}
          <path
            d="M 192 335 C 210 360, 225 390, 230 425 C 232 445, 218 460, 198 465 C 185 468, 178 455, 180 435 C 182 405, 180 375, 175 345"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="1.6"
          />
          {/* Calves & Thigh hatching */}
          <path d="M 125 385 L 140 395 M 120 405 L 138 415 M 205 385 L 190 395 M 210 405 L 195 418" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />

          {/* 3. Fibonacci Golden Ratio Spiral Construction */}
          {/* Golden subdivision rectangles */}
          <rect x="25" y="40" width="290" height="420" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" strokeDasharray="2 3" />
          <line x1="205" y1="40" x2="205" y2="460" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" strokeDasharray="2 3" />
          <line x1="205" y1="300" x2="315" y2="300" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" strokeDasharray="2 3" />
          <line x1="247" y1="300" x2="247" y2="460" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" strokeDasharray="2 3" />

          {/* The Iconic Golden Ratio Spiral Curve */}
          <path
            d="M 25 460 A 290 290 0 0 1 315 170 A 180 180 0 0 1 135 350 A 110 110 0 0 1 245 460 A 70 70 0 0 1 315 390 A 45 45 0 0 1 270 345"
            stroke="rgba(255,255,255,0.65)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Target Focal Crosshairs */}
          <circle cx="270" cy="345" r="3" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
          <line x1="262" y1="345" x2="278" y2="345" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" />
          <line x1="270" y1="337" x2="270" y2="353" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" />
        </svg>

        {/* Bottom CAD Metadata strip */}
        <div className="flex items-center justify-between font-mono text-[9px] tracking-wider text-white/40 mt-3 pt-2 border-t border-white/10">
          <span>PHI: 1.6180339887</span>
          <span className="text-white/60">SISYPHUS.ENGRAVING // REV.2</span>
        </div>
      </div>
    </div>
  );
};
