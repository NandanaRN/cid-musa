import React, { useEffect, useState } from "react";
import { GameScreen } from "../types";

interface SpookyBloodOverlayProps {
  contradictionCount: number;
  suspicionScore: number;
  screen: GameScreen;
  lastContradictionTime?: number;
}

export const SpookyBloodOverlay: React.FC<SpookyBloodOverlayProps> = ({
  contradictionCount,
  suspicionScore,
  screen,
  lastContradictionTime = 0,
}) => {
  const [showFlash, setShowFlash] = useState(false);

  // Trigger dramatic screen flash when a new contradiction is discovered
  useEffect(() => {
    if (lastContradictionTime > 0) {
      setShowFlash(true);
      const timer = setTimeout(() => setShowFlash(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [lastContradictionTime]);

  // Calculate dynamic blood intensity (0.0 to 1.0) based on contradictions and suspicion
  const contradictionFactor = Math.min(1.0, contradictionCount * 0.3);
  const suspicionFactor = Math.min(1.0, suspicionScore / 100 * 0.4);
  const totalIntensity = Math.min(0.95, 0.15 + contradictionFactor + suspicionFactor);

  // Determine pulse speed based on tension level
  let pulseClass = "animate-pulse-slow";
  if (contradictionCount >= 3 || suspicionScore >= 80) {
    pulseClass = "animate-pulse-fast";
  } else if (contradictionCount >= 1 || suspicionScore >= 40) {
    pulseClass = "animate-pulse-medium";
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden select-none">
      {/* 1. DYNAMIC RED-TINTED BLOOD VIGNETTE (Intensifies with contradictions) */}
      <div
        className={`absolute inset-0 transition-all duration-700 ${pulseClass}`}
        style={{
          boxShadow: `inset 0 0 ${80 + totalIntensity * 120}px rgba(${
            Math.floor(140 + totalIntensity * 115)
          }, 0, 0, ${0.2 + totalIntensity * 0.6})`,
          background: `radial-gradient(circle at center, transparent 40%, rgba(120, 0, 0, ${
            totalIntensity * 0.35
          }) 100%)`,
        }}
      />

      {/* 2. ATMOSPHERIC SPOOKY MIST & DRIFTING CRIMSON EMBERS */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-color-dodge transition-opacity duration-1000"
        style={{ opacity: 0.2 + totalIntensity * 0.4 }}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-900/30 via-transparent to-transparent animate-subtle-drift" />
      </div>

      {/* 3. CORNER BLOOD SPLATTER ACCENTS */}
      <div className="absolute top-0 left-0 w-48 h-48 opacity-60 transition-all duration-500" style={{ opacity: 0.3 + totalIntensity * 0.6 }}>
        <svg viewBox="0 0 200 200" className="w-full h-full fill-rose-950/80 filter drop-shadow-md">
          <path d="M0,0 L120,0 C100,20 110,40 90,50 C70,60 80,90 50,80 C30,70 20,110 0,120 Z" />
          <circle cx="130" cy="25" r="4" className="fill-rose-900/90" />
          <circle cx="100" cy="65" r="6" className="fill-rose-900/90" />
          <circle cx="60" cy="105" r="3" className="fill-rose-900/90" />
          <path d="M45,100 C45,115 48,120 48,125 C48,128 45,130 45,130 C45,130 42,128 42,125 C42,120 45,115 45,100 Z" className="fill-rose-900/90" />
        </svg>
      </div>

      <div className="absolute top-0 right-0 w-48 h-48 opacity-60 transition-all duration-500 scale-x-[-1]" style={{ opacity: 0.3 + totalIntensity * 0.6 }}>
        <svg viewBox="0 0 200 200" className="w-full h-full fill-rose-950/80 filter drop-shadow-md">
          <path d="M0,0 L130,0 C110,30 100,50 80,60 C60,70 70,100 40,90 C20,80 10,120 0,140 Z" />
          <circle cx="140" cy="35" r="5" className="fill-rose-900/90" />
          <circle cx="90" cy="75" r="4" className="fill-rose-900/90" />
          <circle cx="50" cy="115" r="3" className="fill-rose-900/90" />
        </svg>
      </div>

      {/* Bottom Corner Splatters */}
      <div className="absolute bottom-0 left-0 w-56 h-56 opacity-50 transition-all duration-500 scale-y-[-1]" style={{ opacity: 0.2 + totalIntensity * 0.6 }}>
        <svg viewBox="0 0 200 200" className="w-full h-full fill-rose-950/70">
          <path d="M0,0 L110,0 C90,25 100,45 80,55 C60,65 70,85 40,80 C20,70 10,100 0,110 Z" />
        </svg>
      </div>

      <div className="absolute bottom-0 right-0 w-56 h-56 opacity-50 transition-all duration-500 scale-x-[-1] scale-y-[-1]" style={{ opacity: 0.2 + totalIntensity * 0.6 }}>
        <svg viewBox="0 0 200 200" className="w-full h-full fill-rose-950/70">
          <path d="M0,0 L110,0 C90,25 100,45 80,55 C60,65 70,85 40,80 C20,70 10,100 0,110 Z" />
        </svg>
      </div>

      {/* 4. CONTRADICTION EXPOSED VIVID FLASH SHOCKWAVE */}
      {showFlash && (
        <div className="absolute inset-0 bg-rose-600/35 backdrop-brightness-125 animate-blood-flash flex items-center justify-center">
          <div className="text-center px-6 py-3 rounded-2xl bg-black/80 border-2 border-rose-500 shadow-2xl shadow-rose-600/80 animate-bounce">
            <span className="text-rose-400 font-black tracking-widest text-lg md:text-2xl uppercase drop-shadow-lg flex items-center gap-2">
              🩸 CONTRADICTION UNCOVERED! 🩸
            </span>
            <p className="text-rose-200 text-xs font-mono font-bold mt-1 uppercase">
              The alibi is crumbling... truth exposed!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
