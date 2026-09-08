import { useEffect, useRef } from "react";

export interface CascadeParams {
  text: string;
  speed: number;
  gooey: boolean;
  blur: number;
  bgColor: string;
  liquidColor: string;
  outerFrameColor: string;
  textColor: string;
  drawInner: boolean;
}

interface CascadeTypeCoreProps {
  params: CascadeParams;
  className?: string;
}

export const CascadeTypeCore = ({ params, className = "" }: CascadeTypeCoreProps) => {
  const textPathRefs = useRef<(SVGTextPathElement | null)[]>([]);
  const animRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);

  // 6 concentric organic track paths
  const tracks = [
    { id: "tr-0", rx: 170, ry: 130, dir: 1, textScale: 28 },
    { id: "tr-1", rx: 240, ry: 180, dir: -1, textScale: 32 },
    { id: "tr-2", rx: 310, ry: 235, dir: 1, textScale: 36 },
    { id: "tr-3", rx: 380, ry: 290, dir: -1, textScale: 40 },
    { id: "tr-4", rx: 450, ry: 345, dir: 1, textScale: 44 },
  ];

  // Continuous animation of textPath offsets
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      offsetRef.current += dt * params.speed * 85;

      textPathRefs.current.forEach((el, idx) => {
        if (!el) return;
        const track = tracks[idx];
        const stagger = idx * 180;
        const currentOffset = (offsetRef.current * track.dir + stagger) % 4000;
        el.setAttribute("startOffset", `${currentOffset}px`);
      });

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [params.speed]);

  // Generate repeating text string to wrap around track seamlessly
  const repeatedText = `${params.text} • `.repeat(8);

  // Generate smooth squircle/organic pill path for each ring
  const getPathD = (rx: number, ry: number) => {
    const cx = 500;
    const cy = 500;
    // Four smooth bezier quadrants forming an organic squircle
    return `M ${cx - rx} ${cy}
      C ${cx - rx} ${cy - ry * 0.95}, ${cx - rx * 0.95} ${cy - ry}, ${cx} ${cy - ry}
      C ${cx + rx * 0.95} ${cy - ry}, ${cx + rx} ${cy - ry * 0.95}, ${cx + rx} ${cy}
      C ${cx + rx} ${cy + ry * 0.95}, ${cx + rx * 0.95} ${cy + ry}, ${cx} ${cy + ry}
      C ${cx - rx * 0.95} ${cy + ry}, ${cx - rx} ${cy + ry * 0.95}, ${cx - rx} ${cy} Z`;
  };

  return (
    <div
      className={`relative w-full aspect-square max-w-[620px] mx-auto select-none overflow-hidden rounded-[2.5rem] shadow-[0_20px_70px_rgba(0,0,0,0.5)] transition-colors duration-500 ${className}`}
      style={{ backgroundColor: params.bgColor }}
    >
      <svg
        viewBox="0 0 1000 1000"
        className="w-full h-full block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Authentic Gooey Metaball SVG Filter */}
          <filter id="brik-gooey" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={params.gooey ? params.blur : 0} result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values={
                params.gooey
                  ? "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 45 -18"
                  : "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
              }
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>

          {/* Define concentric track paths */}
          {tracks.map((t) => (
            <path key={t.id} id={t.id} d={getPathD(t.rx, t.ry)} fill="none" />
          ))}
        </defs>

        {/* 1. Base Organic Liquid Backdrop Frame (Fluo Pink Envelope) */}
        <g filter="url(#brik-gooey)">
          {/* Liquid outer contour stroke */}
          {tracks.map((t, i) => (
            <path
              key={`stroke-${t.id}`}
              d={getPathD(t.rx, t.ry)}
              stroke={params.outerFrameColor}
              strokeWidth={i === tracks.length - 1 ? 48 : 28}
              fill="none"
              opacity={0.92}
            />
          ))}

          {/* Liquid Vermilion Gooey Text Layer */}
          {tracks.map((t, i) => (
            <text
              key={`liquid-text-${t.id}`}
              fill={params.liquidColor}
              fontSize={t.textScale * 1.35}
              fontWeight="900"
              fontFamily="'Catamaran', 'Impact', sans-serif"
              letterSpacing="0.06em"
              className="uppercase"
            >
              <textPath
                ref={(el) => (textPathRefs.current[i] = el)}
                href={`#${t.id}`}
                startOffset="0px"
              >
                {repeatedText}
              </textPath>
            </text>
          ))}
        </g>

        {/* 2. Top Crisp Text Layer for 100% Legibility (Silver/White) */}
        {params.drawInner && (
          <g>
            {tracks.map((t, i) => (
              <text
                key={`crisp-text-${t.id}`}
                fill={params.textColor}
                fontSize={t.textScale * 0.72}
                fontWeight="800"
                fontFamily="'Metrophobic', sans-serif"
                letterSpacing="0.12em"
                className="uppercase pointer-events-none"
                opacity={0.95}
              >
                <textPath
                  href={`#${t.id}`}
                  startOffset={textPathRefs.current[i]?.getAttribute("startOffset") || "0px"}
                >
                  {repeatedText}
                </textPath>
              </text>
            ))}
          </g>
        )}

        {/* Center Live Laboratory Core Emblem */}
        <g className="pointer-events-none">
          <circle cx="500" cy="500" r="85" fill={params.bgColor} stroke={params.outerFrameColor} strokeWidth="4" />
          <circle cx="500" cy="500" r="75" fill={params.liquidColor} opacity={0.2} />
          <text
            x="500"
            y="492"
            textAnchor="middle"
            fill={params.textColor}
            fontSize="18"
            fontWeight="900"
            fontFamily="'Catamaran', sans-serif"
            letterSpacing="0.2em"
          >
            LAB.LIVE
          </text>
          <text
            x="500"
            y="515"
            textAnchor="middle"
            fill={params.textColor}
            fontSize="12"
            fontWeight="600"
            fontFamily="'Metrophobic', sans-serif"
            opacity={0.8}
            letterSpacing="0.15em"
          >
            CASCADE TYPE
          </text>
        </g>
      </svg>
    </div>
  );
};
