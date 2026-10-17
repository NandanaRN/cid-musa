import React from "react";
import { motion } from "motion/react";
import { ShieldAlert, AlertOctagon, RotateCcw, Skull, XCircle, Clock } from "lucide-react";

interface GameOverModalProps {
  isOpen: boolean;
  cause?: "wrong_arrest" | "timeout";
  accusedName: string;
  actualGuiltyName: string;
  onRestartCareer: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  cause = "wrong_arrest",
  accusedName,
  actualGuiltyName,
  onRestartCareer,
}) => {
  if (!isOpen) return null;
  const isTimeout = cause === "timeout";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl font-rajdhani">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative max-w-lg w-full bg-slate-900 border-4 border-rose-600 rounded-3xl p-6 text-center space-y-6 shadow-[0_0_80px_rgba(225,29,72,0.6)] overflow-hidden"
      >
        {/* Pulsing Red Warning Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-rose-950/60 via-slate-900 to-slate-950 pointer-events-none" />

        {/* Flashing Hazard Stripe */}
        <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 animate-pulse" />

        {/* Header Icon & Title */}
        <div className="relative z-10 flex flex-col items-center space-y-2">
          <div className="p-4 bg-rose-600/20 rounded-full border-2 border-rose-500/50 text-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.8)]">
            <ShieldAlert className="w-12 h-12 animate-bounce" />
          </div>

          <span className="text-xs font-black uppercase tracking-widest text-rose-400 bg-rose-950/90 px-3 py-1 rounded-full border border-rose-500/40">
            CID DEPARTMENTAL PUNISHMENT NOTICE
          </span>

          <h1 className="text-3xl md:text-4xl font-black text-rose-500 uppercase tracking-wider font-cinzel drop-shadow-md">
            {isTimeout ? "CASE TIMED OUT" : "CAREER TERMINATED"}
          </h1>
        </div>

        {/* Dismissal Reason Narrative */}
        <div className="relative z-10 p-4 rounded-2xl bg-slate-950/90 border border-rose-500/30 text-slate-200 font-sans text-xs md:text-sm space-y-3 text-left leading-relaxed">
          {isTimeout ? (
            <>
              <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider font-rajdhani">
                <Clock className="w-4 h-4" />
                <span>Investigation Clock Expired</span>
              </div>
              <p>
                By order of the CID Headquarters: Your <b className="text-white underline">8-minute interrogation window elapsed</b> before you delivered a verdict.
              </p>
              <p className="text-rose-300 font-bold">
                With no arrest warrant executed, the real killer — <b className="text-amber-300 uppercase">{actualGuiltyName}</b> — walked out of the station and escaped the country.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider font-rajdhani">
                <XCircle className="w-4 h-4" />
                <span>Fatal Miscarriage of Justice</span>
              </div>
              <p>
                By order of the CID Headquarters: You wrongfully arrested <b className="text-white underline">{accusedName}</b>, an innocent citizen who has now been unlawfully imprisoned.
              </p>
              <p className="text-rose-300 font-bold">
                The true perpetrator, <b className="text-amber-300 uppercase">{actualGuiltyName}</b>, exploited your blunder and escaped the country.
              </p>
            </>
          )}

          <div className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-rose-200 text-xs font-bold font-mono">
            ⚠️ PUNISHMENT: Officer CID Musa is stripped of rank, badge, and all accumulated detective stars. Your career must be restarted from Level 1.
          </div>
        </div>

        {/* Restart Action */}
        <div className="relative z-10 pt-2">
          <button
            onClick={onRestartCareer}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 hover:from-rose-500 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-rose-600/40 transition transform active:scale-95 cursor-pointer font-rajdhani"
          >
            <RotateCcw className="w-5 h-5 stroke-[3]" />
            <span>RESTART DETECTIVE CAREER (LEVEL 1)</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
