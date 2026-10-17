import React from "react";
import { motion } from "motion/react";
import { ShieldAlert, RotateCcw, Skull, XCircle, ArrowRight } from "lucide-react";

interface FailureSequenceProps {
  accusedName: string;
  actualGuiltyName: string;
  onRetry: () => void;
  onViewReport?: () => void;
  className?: string;
}

export const FailureSequence: React.FC<FailureSequenceProps> = ({
  accusedName,
  actualGuiltyName,
  onRetry,
  onViewReport,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        x: [0, -18, 18, -14, 14, -8, 8, -3, 3, 0],
        y: [0, 8, -8, 6, -6, 3, -3, 0],
      }}
      transition={{
        duration: 0.65,
        ease: "easeInOut",
      }}
      className={`absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 border-4 border-rose-600/80 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(225,29,72,0.6)] ${className}`}
    >
      {/* Red Pulsing Warning Vignette Background */}
      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-t from-rose-950 via-rose-900/40 to-slate-950 pointer-events-none"
      />

      {/* Flashing Red Warning Siren Lines */}
      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-transparent via-rose-500 to-transparent animate-pulse" />

      {/* Giant Slamming CASE FAILED Stamp */}
      <motion.div
        initial={{ scale: 4, opacity: 0, rotate: 12 }}
        animate={{ scale: 1, opacity: 1, rotate: -3 }}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 15,
          delay: 0.2,
        }}
        className="relative z-10 mb-4"
      >
        <div className="bg-slate-950 border-4 border-rose-600 px-8 py-3.5 rounded-2xl shadow-[0_0_30px_rgba(225,29,72,0.8)] text-rose-500 font-cinzel">
          <div className="flex items-center gap-2 justify-center text-xs font-black tracking-widest text-rose-400 font-rajdhani uppercase mb-1">
            <XCircle className="w-4 h-4 text-rose-500" />
            <span>WRONGFUL ACCUSATION DETECTED</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-rose-500 drop-shadow-[0_2px_10px_rgba(225,29,72,0.8)]">
            CASE FAILED!
          </h1>
        </div>
      </motion.div>

      {/* Failure Narrative Text */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 max-w-md space-y-3 font-sans"
      >
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-slate-200 text-xs md:text-sm font-medium leading-relaxed shadow-xl">
          <p className="mb-2">
            🚨 <b className="text-white">{accusedName}</b> was completely innocent! Your arrest warrant was rejected in court.
          </p>
          <p className="text-rose-300 font-bold">
            The real killer, <b className="text-amber-300 uppercase underline">{actualGuiltyName}</b>, escaped justice and fled the city!
          </p>
        </div>
      </motion.div>

      {/* Interactive Action Buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-3 font-rajdhani"
      >
        <button
          onClick={onRetry}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xl shadow-amber-500/40 transition transform active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 stroke-[3]" />
          <span>REPLAY CASE & RETRY</span>
        </button>

        {onViewReport && (
          <button
            onClick={onViewReport}
            className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer"
          >
            <span>View Case Dossier</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    </motion.div>
  );
};
