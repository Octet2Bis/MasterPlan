import { useEffect, useRef } from "react";

interface AsciiBackgroundProps {
  className?: string;
}

export const AsciiBackground = ({ className = "" }: AsciiBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    let mouseX = width * 0.5;
    let mouseY = height * 0.4;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;
    let time = 0;

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    // 3D Perspective Grid parameters
    const cols = 42;
    const rows = 28;
    const glyphs = ["·", "•", "°", "×", "+", "*", "■"];

    const render = () => {
      time += 0.02;
      // Damping
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Deep CAD background with soft radial glow around mouse
      const gradient = ctx.createRadialGradient(
        mouseX,
        mouseY,
        40,
        mouseX,
        mouseY,
        Math.max(width, height) * 0.75,
      );
      gradient.addColorStop(0, "rgba(194, 65, 42, 0.08)"); // primary accent subtle warm glow
      gradient.addColorStop(0.4, "rgba(15, 17, 23, 0.4)");
      gradient.addColorStop(1, "rgba(8, 9, 12, 0.95)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // CAD Blueprint guide lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);

      // Vertical perspective lines converging to vanishing point
      const vanishX = width * 0.5 + (mouseX - width * 0.5) * 0.12;
      const vanishY = height * 0.35 + (mouseY - height * 0.35) * 0.12;

      for (let i = 0; i <= 8; i++) {
        const x = (width / 8) * i;
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.lineTo(vanishX + (x - vanishX) * 0.1, vanishY);
        ctx.stroke();
      }

      ctx.setLineDash([]); // Reset dash

      // Render 3D wavy ASCII dot matrix
      ctx.font = '10px "Metrophobic", "Courier New", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const originX = width * 0.5;
      const originY = height * 0.48;

      for (let r = 0; r < rows; r++) {
        const rowNorm = r / rows;
        // Perspective depth mapping: further rows are compressed towards horizon
        const depth = 0.35 + rowNorm * 0.85;
        const yBase = originY + (rowNorm - 0.5) * height * 0.9;

        for (let c = 0; c < cols; c++) {
          const colNorm = (c - cols * 0.5) / (cols * 0.5);
          const xBase = originX + colNorm * (width * 0.58) * depth;

          // Wave equation modulated by distance to cursor
          const dx = xBase - mouseX;
          const dy = yBase - mouseY;
          const distToMouse = Math.sqrt(dx * dx + dy * dy);
          const mouseInfluence = Math.max(0, 1 - distToMouse / 320);

          const wave =
            Math.sin(c * 0.35 + time * 1.2) * 8 +
            Math.cos(r * 0.4 - time * 0.9) * 6 +
            mouseInfluence * 24;

          const screenX = xBase + (mouseX - width * 0.5) * (1 - depth) * 0.15;
          const screenY = yBase + wave * depth;

          // Select ASCII glyph based on wave intensity
          const intensity = Math.min(
            1,
            Math.max(0, (wave + 14) / 40 + mouseInfluence * 0.4),
          );
          const glyphIndex = Math.floor(intensity * (glyphs.length - 1));
          const glyph = glyphs[glyphIndex];

          // Alpha and color based on depth and mouse proximity
          const alpha = Math.min(0.85, 0.12 + depth * 0.3 + mouseInfluence * 0.55);
          if (mouseInfluence > 0.4) {
            ctx.fillStyle = `rgba(235, 94, 69, ${alpha})`; // Primary highlight near cursor
          } else {
            ctx.fillStyle = `rgba(220, 225, 235, ${alpha})`;
          }

          ctx.fillText(glyph, screenX, screenY);
        }
      }

      // Technical HUD corner crosshairs
      const pad = 24;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;

      // Top-left cross
      ctx.beginPath();
      ctx.moveTo(pad - 6, pad); ctx.lineTo(pad + 6, pad);
      ctx.moveTo(pad, pad - 6); ctx.lineTo(pad, pad + 6);
      ctx.stroke();

      // Top-right cross
      ctx.beginPath();
      ctx.moveTo(width - pad - 6, pad); ctx.lineTo(width - pad + 6, pad);
      ctx.moveTo(width - pad, pad - 6); ctx.lineTo(width - pad, pad + 6);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Subtle scanline / vignette texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
    </div>
  );
};
