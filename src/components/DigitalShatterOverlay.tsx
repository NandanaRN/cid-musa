import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

export interface DigitalShatterHandle {
  triggerShatter: (xPercent?: number, yPercent?: number, customText?: string) => void;
}

interface ShardParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
  shape: "triangle" | "square" | "shard";
}

interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  opacity: number;
}

interface ShatterText {
  x: number;
  y: number;
  text: string;
  opacity: number;
  scale: number;
  life: number;
}

export const DigitalShatterOverlay = forwardRef<DigitalShatterHandle, { className?: string }>(
  ({ className = "" }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const particlesRef = useRef<ShardParticle[]>([]);
    const shockwavesRef = useRef<ShockwaveRing[]>([]);
    const textsRef = useRef<ShatterText[]>([]);
    const animRef = useRef<number | null>(null);

    const triggerShatter = (xPercent = 50, yPercent = 50, customText?: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const cx = (xPercent / 100) * canvas.width;
      const cy = (yPercent / 100) * canvas.height;

      const colors = ["#38bdf8", "#fbbf24", "#34d399", "#f43f5e", "#c084fc", "#ffffff"];

      // Generate 45 digital glass shard particles
      const newParticles: ShardParticle[] = [];
      for (let i = 0; i < 45; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 12;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shapes: ("triangle" | "square" | "shard")[] = ["triangle", "square", "shard"];

        newParticles.push({
          x: cx + (Math.random() - 0.5) * 20,
          y: cy + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          size: 4 + Math.random() * 10,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.3,
          color,
          opacity: 1,
          life: 0,
          maxLife: 30 + Math.random() * 25,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
        });
      }

      particlesRef.current.push(...newParticles);

      // Add shockwave rings
      shockwavesRef.current.push(
        {
          x: cx,
          y: cy,
          radius: 10,
          maxRadius: 140,
          color: "#38bdf8",
          opacity: 0.9,
        },
        {
          x: cx,
          y: cy,
          radius: 5,
          maxRadius: 90,
          color: "#fbbf24",
          opacity: 0.8,
        }
      );

      // Add holographic text
      if (customText) {
        textsRef.current.push({
          x: cx,
          y: cy - 25,
          text: customText,
          opacity: 1,
          scale: 0.6,
          life: 0,
        });
      }
    };

    useImperativeHandle(ref, () => ({
      triggerShatter,
    }));

    // Animation loop
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const resize = () => {
        if (canvas.parentElement) {
          canvas.width = canvas.parentElement.clientWidth;
          canvas.height = canvas.parentElement.clientHeight;
        }
      };

      resize();
      window.addEventListener("resize", resize);

      const updateAndDraw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Render Shockwaves
        shockwavesRef.current.forEach((sw) => {
          sw.radius += 4.5;
          sw.opacity *= 0.92;

          ctx.save();
          ctx.strokeStyle = sw.color;
          ctx.lineWidth = 3;
          ctx.globalAlpha = sw.opacity;
          ctx.shadowColor = sw.color;
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        });
        shockwavesRef.current = shockwavesRef.current.filter(
          (sw) => sw.radius < sw.maxRadius && sw.opacity > 0.05
        );

        // Render Shard Particles
        particlesRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15; // light gravity
          p.rotation += p.vRot;
          p.life += 1;
          p.opacity = 1 - p.life / p.maxLife;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;

          ctx.beginPath();
          if (p.shape === "triangle") {
            ctx.moveTo(0, -p.size);
            ctx.lineTo(p.size * 0.8, p.size);
            ctx.lineTo(-p.size * 0.8, p.size);
          } else if (p.shape === "square") {
            ctx.rect(-p.size / 2, -p.size / 2, p.size, p.size);
          } else {
            // Elongated glass shard
            ctx.moveTo(0, -p.size * 1.5);
            ctx.lineTo(p.size * 0.5, 0);
            ctx.lineTo(0, p.size * 1.5);
            ctx.lineTo(-p.size * 0.5, 0);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        });

        particlesRef.current = particlesRef.current.filter(
          (p) => p.life < p.maxLife && p.opacity > 0
        );

        // Render Holographic Text
        textsRef.current.forEach((txt) => {
          txt.life += 1;
          txt.y -= 0.8;
          txt.scale = Math.min(1.2, txt.scale + 0.04);
          txt.opacity = 1 - txt.life / 40;

          ctx.save();
          ctx.font = "black 14px 'Rajdhani', sans-serif";
          ctx.fillStyle = "#38bdf8";
          ctx.strokeStyle = "#020617";
          ctx.lineWidth = 3;
          ctx.textAlign = "center";
          ctx.globalAlpha = Math.max(0, txt.opacity);
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 12;

          ctx.strokeText(txt.text, txt.x, txt.y);
          ctx.fillText(txt.text, txt.x, txt.y);
          ctx.restore();
        });

        textsRef.current = textsRef.current.filter((t) => t.life < 40 && t.opacity > 0);

        animRef.current = requestAnimationFrame(updateAndDraw);
      };

      updateAndDraw();

      return () => {
        window.removeEventListener("resize", resize);
        if (animRef.current) cancelAnimationFrame(animRef.current);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 pointer-events-none z-30 ${className}`}
      />
    );
  }
);

DigitalShatterOverlay.displayName = "DigitalShatterOverlay";
