import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LegoAvatar } from "./LegoAvatar";
import { soundEffects } from "../utils/audio";
import {
  Play,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Search,
  Zap,
  Radio,
  Fingerprint,
  UserCheck,
  Footprints,
  Eye,
  Award,
  Flame,
  Volume2,
  ChevronRight
} from "lucide-react";

interface DetectiveEntranceAnimationProps {
  onStartGame?: () => void;
  isGenerating?: boolean;
}

export const DetectiveEntranceAnimation: React.FC<DetectiveEntranceAnimationProps> = ({
  onStartGame,
  isGenerating = false,
}) => {
  // Sequence phases: "walking" | "pausing" | "reveal" | "ready"
  const [phase, setPhase] = useState<"walking" | "pausing" | "reveal" | "ready">("walking");
  const [typedMessage, setTypedMessage] = useState("");
  const fullGreeting = "SALUTE DETECTIVE! I AM OFFICER CID MUSA. CRIME RESTS FOR NO ONE IN THIS CITY. ARE YOU READY TO UNCOVER THE TRUTH?";

  // Animation timeline control
  useEffect(() => {
    if (phase === "walking") {
      const timer1 = setTimeout(() => {
        setPhase("pausing");
        soundEffects.playEvidenceScan();
      }, 2800);
      return () => clearTimeout(timer1);
    } else if (phase === "pausing") {
      const timer2 = setTimeout(() => {
        setPhase("reveal");
        soundEffects.playContradictionBoom();
      }, 1800);
      return () => clearTimeout(timer2);
    } else if (phase === "reveal") {
      let charIdx = 0;
      setTypedMessage("");
      const interval = setInterval(() => {
        if (charIdx < fullGreeting.length) {
          setTypedMessage(fullGreeting.substring(0, charIdx + 1));
          charIdx++;
        } else {
          clearInterval(interval);
          setPhase("ready");
          soundEffects.playSirenSound();
        }
      }, 25);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleReplay = () => {
    soundEffects.playClick();
    setTypedMessage("");
    setPhase("walking");
  };

  const handleSkipToReady = () => {
    soundEffects.playClick();
    setTypedMessage(fullGreeting);
    setPhase("ready");
  };

  return (
    <div className="w-full bg-slate-950/95 border-2 border-amber-400/60 rounded-3xl p-4 md:p-6 mb-8 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden font-rajdhani text-left">
      {/* Background Animated Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/40 via-slate-950/90 to-black pointer-events-none" />

      {/* Header Info Tag */}
      <div className="relative z-10 flex items-center justify-between border-b border-amber-500/30 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
            <UserCheck className="w-5 h-5 animate-pulse text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-amber-300">
                CID MUSA CINEMATIC ENTRANCE
              </h2>
              <span className="text-[9px] bg-amber-400 text-slate-950 font-mono px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                CINEMATIC INTRO
              </span>
            </div>
            <p className="text-xs text-amber-200/80 font-medium">
              Watch Officer CID Musa step out of the shadows to brief your investigation team.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {phase !== "ready" && (
            <button
              onClick={handleSkipToReady}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-black uppercase border border-amber-400/40 flex items-center gap-1 transition cursor-pointer"
            >
              <span>Skip Intro</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          )}

          <button
            onClick={handleReplay}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-black uppercase border border-amber-400/40 flex items-center gap-1.5 transition cursor-pointer"
            title="Replay Entrance Animation"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Replay Sequence</span>
          </button>
        </div>
      </div>

      {/* STAGE CONTAINER */}
      <div className="relative z-10 w-full h-72 md:h-80 rounded-2xl bg-gradient-to-b from-stone-950 via-slate-950 to-neutral-950 border-2 border-amber-500/40 overflow-hidden shadow-2xl flex flex-col items-center justify-center">
        
        {/* Crime Tape Header */}
        <div className="absolute top-0 left-0 right-0 bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-widest py-1 px-4 flex items-center justify-between select-none opacity-90 z-20">
          <span className="flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-slate-950" />
            SPECIAL INVESTIGATION DIVISION • OFFICER CID MUSA
          </span>
          <span className="font-mono">STATUS: {phase.toUpperCase()}</span>
        </div>

        {/* Ambient Fog Grid */}
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        {/* Rain / Dust Particles Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, 300],
                x: [Math.random() * 20 - 10, Math.random() * 20 - 10],
                opacity: [0.2, 0.7, 0],
              }}
              transition={{
                duration: 1.5 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              style={{ left: `${(i * 8.5) % 100}%` }}
              className="absolute top-0 w-0.5 h-8 bg-gradient-to-b from-amber-300 to-transparent rounded-full"
            />
          ))}
        </div>

        {/* DRAMATIC SPOTLIGHT BEAM */}
        {(phase === "pausing" || phase === "reveal" || phase === "ready") && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 0.8, scaleY: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-0 w-64 md:w-80 h-full bg-gradient-to-b from-amber-300/40 via-amber-400/15 to-transparent blur-md pointer-events-none transform -skew-x-6 z-10"
          />
        )}

        {/* GROUND RIPPLE / COBBLESTONE BASE */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-950 via-stone-900 to-transparent border-t border-amber-500/30 flex items-center justify-center">
          {/* Spotlight Ground Oval */}
          {(phase === "pausing" || phase === "reveal" || phase === "ready") && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.8 }}
              transition={{ duration: 0.6 }}
              className="w-48 h-10 bg-amber-400/20 rounded-full blur-md shadow-[0_0_30px_rgba(245,158,11,0.6)]"
            />
          )}
        </div>

        {/* SILHOUETTE & CHARACTER STAGE */}
        <div className="relative z-20 flex flex-col items-center justify-end h-full pb-8">
          
          {/* PHASE 1 & 2: DETECTIVE SILHOUETTE (WALKING & PAUSING) */}
          {(phase === "walking" || phase === "pausing") && (
            <motion.div
              initial={{ x: -280 }}
              animate={
                phase === "walking"
                  ? { x: 0, y: [0, -6, 0, -6, 0] }
                  : { x: 0, y: 0, scale: [1, 1.05, 1] }
              }
              transition={
                phase === "walking"
                  ? {
                      x: { duration: 2.8, ease: "easeInOut" },
                      y: { duration: 0.5, repeat: 5, ease: "easeInOut" },
                    }
                  : { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
              }
              className="relative flex flex-col items-center"
            >
              {/* Silhouette Glowing Eyewear / Magnifying Glass Glint */}
              {phase === "pausing" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0.8], scale: [0, 1.5, 1] }}
                  transition={{ duration: 0.5 }}
                  className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-cyan-300 blur-xs shadow-[0_0_15px_#22d3ee] z-30"
                />
              )}

              {/* DETECTIVE VECTOR SILHOUETTE SVG ARTWORK */}
              <div className="relative filter drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]">
                <svg
                  width="110"
                  height="140"
                  viewBox="0 0 110 140"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-amber-400"
                >
                  {/* Fedora Hat */}
                  <path
                    d="M20 45 C 20 30, 40 20, 55 20 C 70 20, 90 30, 90 45 L 102 48 C 105 49, 105 53, 98 53 L 12 53 C 5 53, 5 49, 8 48 Z"
                    fill="#0f172a"
                    stroke="#fbbf24"
                    strokeWidth="2.5"
                  />
                  {/* Hat Ribbon */}
                  <path
                    d="M22 43 C 35 38, 75 38, 88 43 L 89 47 L 21 47 Z"
                    fill="#f59e0b"
                  />

                  {/* Detective Face Silhouette */}
                  <path
                    d="M32 50 C 32 50, 40 72, 55 72 C 70 72, 78 50, 78 50 Z"
                    fill="#020617"
                    stroke="#fbbf24"
                    strokeWidth="2"
                  />

                  {/* Trench Coat Collars */}
                  <path
                    d="M25 70 L 15 90 L 40 85 L 55 125 L 70 85 L 95 90 L 85 70 Z"
                    fill="#0f172a"
                    stroke="#fbbf24"
                    strokeWidth="2.5"
                  />

                  {/* Flared Trench Coat Body */}
                  <path
                    d="M22 88 L 10 135 L 100 135 L 88 88 Z"
                    fill="#020617"
                    stroke="#fbbf24"
                    strokeWidth="2.5"
                  />

                  {/* Magnifying Glass held in hand */}
                  <circle
                    cx="85"
                    cy="80"
                    r="14"
                    fill="rgba(34, 211, 238, 0.25)"
                    stroke="#f59e0b"
                    strokeWidth="3"
                  />
                  <line
                    x1="95"
                    y1="90"
                    x2="106"
                    y2="102"
                    stroke="#f59e0b"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Footprint Indicator */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[9px] font-mono font-bold text-amber-300 bg-black/90 px-2 py-0.5 rounded-full border border-amber-400">
                  <Footprints className="w-3 h-3 text-amber-400 animate-bounce" />
                  <span>OFFICER CID MUSA INCOMING</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* PHASE 3 & 4: REVEAL & GREETING */}
          {(phase === "reveal" || phase === "ready") && (
            <motion.div
              initial={{ scale: 0.4, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.7, type: "spring", stiffness: 120 }}
              className="flex flex-col items-center z-20"
            >
              {/* SPEECH BUBBLE WITH TYPED GREETING */}
              <div className="bg-amber-300 text-slate-950 font-black text-xs md:text-sm px-4 py-2.5 rounded-2xl shadow-2xl border-2 border-slate-950 mb-3 relative max-w-md text-center uppercase tracking-wide leading-snug">
                <p className="flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-slate-950 shrink-0" />
                  <span>{typedMessage}</span>
                </p>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-amber-300 rotate-45 border-r-2 border-b-2 border-slate-950" />
              </div>

              {/* REVEALED 3D DETECTIVE LEGO MINIFIGURE */}
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 blur-lg opacity-80 animate-pulse" />
                <LegoAvatar
                  seedKey="CID_MUSA_HERO"
                  sizePx={85}
                  avatarMode="photo"
                  className="relative border-4 border-amber-300 shadow-2xl rounded-full"
                  isSpeaking={phase === "reveal"}
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-widest shadow-xl border border-amber-200 flex items-center gap-1 whitespace-nowrap">
                  <Award className="w-3 h-3 text-slate-950" /> LEAD DETECTIVE
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
