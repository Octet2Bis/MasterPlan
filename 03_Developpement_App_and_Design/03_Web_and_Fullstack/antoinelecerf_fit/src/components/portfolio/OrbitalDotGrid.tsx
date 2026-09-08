import { useEffect, useRef } from "react";

interface OrbitalDotGridProps {
  className?: string;
}

export const OrbitalDotGrid = ({ className = "" }: OrbitalDotGridProps) => {
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
    let mouseY = height * 0.5;
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

    // Orbital concentric rings configuration (like an astronomical star map)
    const ringCount = 26;
    const dotsPerRingBase = 44;

    const render = () => {
      time += 0.003;
      // Smooth mouse damping
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      // Pure deep black
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      // Center of gravity / focal point offset slightly towards the top-right
      const focalX = width * 0.62 + (mouseX - width * 0.5) * 0.08;
      const focalY = height * 0.42 + (mouseY - height * 0.5) * 0.08;

      // Draw orbital perspective curved dot lines
      for (let i = 1; i <= ringCount; i++) {
        // Logarithmic ring radius expansion
        const baseRadius = Math.pow(i / ringCount, 1.4) * Math.max(width, height) * 1.15 + 40;
        const dotCount = Math.floor(dotsPerRingBase * (i / ringCount * 1.6 + 0.5));
        const ringSpeed = (i % 2 === 0 ? 1 : -1) * 0.0006;
        const ringRotation = time * ringSpeed + i * 0.2;

        // Elliptical perspective aspect ratio
        const radiusX = baseRadius * 1.25;
        const radiusY = baseRadius * 0.72;

        for (let d = 0; d < dotCount; d++) {
          const angle = (d / dotCount) * Math.PI * 2 + ringRotation;
          const x = focalX + Math.cos(angle) * radiusX;
          const y = focalY + Math.sin(angle) * radiusY;

          // Only render points in or near viewport
          if (x < -40 || x > width + 40 || y < -40 || y > height + 40) continue;

          // Distance to mouse for interactive radiance
          const dx = x - mouseX;
          const dy = y - mouseY;
          const distToMouse = Math.sqrt(dx * dx + dy * dy);
          const mouseGlow = Math.max(0, 1 - distToMouse / 280);

          // Dot size and brightness
          const isStippleHero = (i + d) % 9 === 0;
          const radius = isStippleHero ? 1.6 + mouseGlow * 1.2 : 0.85 + mouseGlow * 0.8;
          const alpha = Math.min(
            0.95,
            (isStippleHero ? 0.35 : 0.14) + mouseGlow * 0.65 + (Math.sin(angle * 3 + time * 2) * 0.08)
          );

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();
        }
      }

      // Background subtle CAD coordinate marks (+)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1;
      const cadStepX = width / 6;
      const cadStepY = height / 4;

      for (let cx = 1; cx < 6; cx++) {
        for (let cy = 1; cy < 4; cy++) {
          const px = cx * cadStepX;
          const py = cy * cadStepY;
          ctx.beginPath();
          ctx.moveTo(px - 3, py);
          ctx.lineTo(px + 3, py);
          ctx.moveTo(px, py - 3);
          ctx.lineTo(px, py + 3);
          ctx.stroke();
        }
      }

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
      {/* Precision vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />
    </div>
  );
};
