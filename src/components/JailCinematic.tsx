import React, { useEffect, useState } from "react";
import { SuspectState } from "../types";
import { LegoAvatar } from "./LegoAvatar";
import { VictoryCelebration } from "./VictoryCelebration";
import { FailureSequence } from "./FailureSequence";
import { soundEffects } from "../utils/audio";
import { Lock, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";

interface JailCinematicProps {
  accusedSuspect: SuspectState;
  actualGuiltySuspect: SuspectState;
  isCorrect: boolean;
  onContinueToEnding: () => void;
  onRetryGame?: () => void;
}

export const JailCinematic: React.FC<JailCinematicProps> = ({
  accusedSuspect,
  actualGuiltySuspect,
  isCorrect,
  onContinueToEnding,
  onRetryGame,
}) => {
  const [barsDropped, setBarsDropped] = useState(false);

  useEffect(() => {
    if (isCorrect) {
      soundEffects.playVictoryFanfare();
    } else {
      soundEffects.playWrongArrest();
    }

    const timer = setTimeout(() => {
      setBarsDropped(true);
    }, 400);
    return () => clearTimeout(timer);
  }, [isCorrect]);

  return (
    <div className="relative min-h-[550px] w-full flex flex-col items-center justify-center text-center p-6 rounded-3xl bg-slate-950 gold-filigree-border overflow-hidden shadow-2xl">
      {/* Victory Celebration Overlay with Confetti & Case Closed Badge */}
      {isCorrect && <VictoryCelebration showBadge={true} />}

      {/* Dramatic Failure Animation Sequence if Wrong Suspect */}
      {!isCorrect && (
        <FailureSequence
          accusedName={accusedSuspect.name}
          actualGuiltyName={actualGuiltySuspect.name}
          onRetry={onRetryGame || onContinueToEnding}
          onViewReport={onContinueToEnding}
        />
      )}

      {/* Flashing Police Siren Lights */}
      <div className="absolute inset-0 pointer-events-none opacity-25 flex">
        <div className="w-1/2 h-full bg-rose-600 blur-3xl animate-pulse" />
        <div className="w-1/2 h-full bg-amber-500 blur-3xl animate-pulse delay-300" />
      </div>

      {/* Jail Bar Stage */}
      <div className="relative w-64 h-64 my-4 flex items-center justify-center">
        {/* Suspect Avatar */}
        <LegoAvatar
          seedKey={accusedSuspect.avatarSeed}
          sizePx={180}
          expression={isCorrect ? "angry" : "nervous"}
          avatarMode="photo"
          className="border-4 border-amber-400 shadow-2xl"
        />

        {/* Dropping Jail Bars */}
        {isCorrect && (
          <div className="absolute inset-0 flex justify-between px-4 pointer-events-none">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`w-3.5 bg-gradient-to-b from-amber-600 via-slate-800 to-slate-950 rounded-full shadow-2xl transition-all duration-700 ease-bounce ${
                  barsDropped ? "h-full translate-y-0" : "h-0 -translate-y-full"
                }`}
                style={{ transitionDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        )}

        {/* Lock Icon */}
        {isCorrect && barsDropped && (
          <div className="absolute -bottom-4 bg-amber-400 text-slate-950 p-3 rounded-full shadow-xl border-2 border-amber-300 animate-bounce">
            <Lock className="w-8 h-8 stroke-[3]" />
          </div>
        )}
      </div>

      {/* Outcome Title */}
      <div className="relative z-10 space-y-2 max-w-lg mt-4 font-rajdhani">
        {isCorrect ? (
          <>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest">
              <CheckCircle2 className="w-4 h-4" />
              <span>ARREST WARRANT EXECUTED SUCCESSFULLY</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-amber-400 font-cinzel">
              CASE SOLVED!
            </h2>
            <p className="text-slate-200 text-sm font-medium leading-relaxed font-sans">
              You caught the contradiction! <b className="text-amber-300">{accusedSuspect.name}</b>'s fake alibi collapsed and they are now going behind bars for murder!
            </p>
          </>
        ) : (
          <>
            <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-400 border border-rose-500/40 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest">
              <ShieldAlert className="w-4 h-4" />
              <span>WRONGFUL ARREST - YOU LOST!</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-rose-500 font-cinzel">
              WRONG SUSPECT!
            </h2>
            <p className="text-slate-200 text-sm font-medium leading-relaxed font-sans">
              <b className="text-amber-300">{accusedSuspect.name}</b> was actually innocent! The real killer, <b className="text-rose-400">{actualGuiltySuspect.name}</b>, escaped scot-free. Try again!
            </p>
          </>
        )}
      </div>

      <button
        onClick={onContinueToEnding}
        className="relative z-10 mt-8 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xl shadow-amber-500/30 transition transform active:scale-95 cursor-pointer font-rajdhani"
      >
        <span>View CID Final Dossier Report</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
