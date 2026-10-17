import React from "react";
import { motion } from "motion/react";
import { AlertTriangle, ShieldCheck, Flame, Activity } from "lucide-react";

interface SuspicionMeterProps {
  score: number; // 0 to 100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showBadge?: boolean;
  className?: string;
}

export const SuspicionMeter: React.FC<SuspicionMeterProps> = ({
  score,
  size = "md",
  showLabel = true,
  showBadge = true,
  className = "",
}) => {
  // Bound score 0 - 100
  const normalizedScore = Math.min(100, Math.max(0, score));

  // Determine threat level metadata
  const getLevelInfo = () => {
    if (normalizedScore >= 70) {
      return {
        label: "CRITICAL GUILT",
        badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
        textGradient: "from-rose-400 to-amber-300",
        icon: Flame,
        pulse: true,
      };
    }
    if (normalizedScore >= 40) {
      return {
        label: "SUSPICIOUS",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        textGradient: "from-amber-300 to-yellow-400",
        icon: AlertTriangle,
        pulse: false,
      };
    }
    return {
      label: "LOW RISK",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      textGradient: "from-emerald-300 to-teal-400",
      icon: ShieldCheck,
      pulse: false,
    };
  };

  const levelInfo = getLevelInfo();
  const IconComponent = levelInfo.icon;

  const heightClass = size === "sm" ? "h-2.5" : size === "lg" ? "h-5" : "h-3.5";

  return (
    <div className={`space-y-1.5 font-rajdhani ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
          <div className="flex items-center gap-1.5 text-amber-200">
            <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Suspicion Gauge</span>
          </div>

          <div className="flex items-center gap-2">
            {showBadge && (
              <span
                className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border flex items-center gap-1 ${levelInfo.badgeColor}`}
              >
                <IconComponent className="w-3 h-3" />
                <span>{levelInfo.label}</span>
              </span>
            )}
            <motion.span
              key={normalizedScore}
              initial={{ scale: 1.3, color: "#f59e0b" }}
              animate={{ scale: 1 }}
              className="text-xs font-mono font-black text-white"
            >
              {normalizedScore}%
            </motion.span>
          </div>
        </div>
      )}

      {/* Meter Bar Container */}
      <div
        className={`relative w-full ${heightClass} bg-slate-950/90 rounded-full p-0.5 border border-amber-400/30 overflow-hidden shadow-inner`}
      >
        {/* Background gradient track */}
        <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-600 rounded-full" />

        {/* Animated Fill Bar */}
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-600 shadow-[0_0_12px_rgba(244,63,94,0.6)] relative"
          initial={{ width: "0%" }}
          animate={{ width: `${normalizedScore}%` }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        >
          {/* Shimmer sweep effect */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12"
          />
        </motion.div>

        {/* Pulsing indicator light at score threshold if critical */}
        {levelInfo.pulse && (
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="absolute inset-0 rounded-full border border-rose-500 pointer-events-none shadow-[0_0_10px_rgba(244,63,94,0.8)]"
          />
        )}
      </div>
    </div>
  );
};
