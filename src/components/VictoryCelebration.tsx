import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Award, Sparkles, CheckCircle2 } from "lucide-react";

interface VictoryCelebrationProps {
  showBadge?: boolean;
  className?: string;
}

// Generate random confetti particle data
interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  scale: number;
  color: string;
  shape: "rect" | "circle" | "star";
}

const COLORS = [
  "#f59e0b", // Amber
  "#fbbf24", // Yellow
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#f43f5e", // Rose
];

export const VictoryCelebration: React.FC<VictoryCelebrationProps> = ({
  showBadge = true,
  className = "",
}) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    // Generate ~60 confetti particles bursting from center bottom/middle
    const initialParticles: ConfettiParticle[] = Array.from({ length: 60 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 60 + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 250 + 100;
      return {
        id: i,
        x: (Math.random() - 0.5) * 40,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: -Math.abs(Math.sin(angle)) * speed - 100, // Upward initial velocity
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 720,
        scale: Math.random() * 0.6 + 0.7,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: i % 3 === 0 ? "star" : i % 2 === 0 ? "circle" : "rect",
      };
    });

    setParticles(initialParticles);
  }, []);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden z-30 flex items-center justify-center ${className}`}>
      {/* Confetti Burst Particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: p.x,
              y: p.y,
              opacity: 1,
              scale: 0,
              rotate: 0,
            }}
            animate={{
              x: p.vx * 1.5,
              y: p.vy * 1.5 + 250, // Gravity pull downwards
              opacity: [1, 1, 0.8, 0],
              scale: [0, p.scale, p.scale * 0.8, 0.2],
              rotate: p.rot + p.rotSpeed,
            }}
            transition={{
              duration: 2.8,
              ease: "easeOut",
              delay: (p.id % 10) * 0.03,
            }}
            className="absolute shadow-sm"
            style={{
              backgroundColor: p.shape !== "star" ? p.color : "transparent",
              color: p.color,
              width: p.shape === "circle" ? "12px" : "14px",
              height: p.shape === "circle" ? "12px" : "8px",
              borderRadius: p.shape === "circle" ? "50%" : "2px",
            }}
          >
            {p.shape === "star" && (
              <Sparkles className="w-5 h-5 -mt-1 -ml-1 fill-current stroke-none" />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Case Closed Badge Animation */}
      {showBadge && (
        <motion.div
          initial={{ scale: 3, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: -5 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 12,
            delay: 0.3,
          }}
          className="relative z-40 my-2"
        >
          {/* Badge Glow Aura */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-400 to-yellow-500 blur-xl opacity-60"
          />

          <div className="relative bg-slate-950/95 border-4 border-amber-400 rounded-2xl px-6 py-3 shadow-[0_0_35px_rgba(245,158,11,0.6)] flex items-center gap-3 text-amber-300 font-cinzel">
            <div className="bg-amber-400 text-slate-950 p-2 rounded-xl font-black shadow-md">
              <Trophy className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="text-left font-rajdhani">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 uppercase tracking-widest">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CID OFFICIAL VERDICT</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-amber-400 tracking-wider font-cinzel uppercase drop-shadow-md">
                CASE CLOSED!
              </h1>
            </div>

            <Award className="w-8 h-8 text-amber-400 ml-2 animate-pulse" />
          </div>
        </motion.div>
      )}
    </div>
  );
};
