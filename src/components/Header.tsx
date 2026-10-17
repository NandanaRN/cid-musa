import React from "react";
import { GameScreen } from "../types";
import { LegoAvatar } from "./LegoAvatar";
import { Clock, HelpCircle, RefreshCw, Star, Stethoscope, Trophy } from "lucide-react";

interface HeaderProps {
  currentScreen: GameScreen;
  caseNumber: string;
  caseTitle: string;
  totalQuestionsAsked: number;
  maxQuestions: number;
  clockRemaining: number;
  detectiveStars?: number;
  currentLevel?: number;
  onReset: () => void;
  onOpenAutopsy?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  caseNumber,
  caseTitle,
  totalQuestionsAsked,
  maxQuestions,
  clockRemaining,
  detectiveStars = 0,
  currentLevel = 1,
  onReset,
  onOpenAutopsy,
}) => {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const isWarn = clockRemaining <= 90;

  const getRankBadge = (stars: number) => {
    if (stars >= 12) return { label: "MASTER DETECTIVE", color: "text-amber-300 bg-amber-950/90 border-amber-400/80 shadow-amber-500/20" };
    if (stars >= 9) return { label: "CHIEF INVESTIGATOR", color: "text-purple-300 bg-purple-950/90 border-purple-400/80" };
    if (stars >= 6) return { label: "SENIOR DETECTIVE", color: "text-sky-300 bg-sky-950/90 border-sky-400/80" };
    if (stars >= 3) return { label: "JUNIOR INSPECTOR", color: "text-emerald-300 bg-emerald-950/90 border-emerald-400/80" };
    return { label: "ROOKIE CADET", color: "text-slate-300 bg-slate-900/90 border-slate-600" };
  };

  const rankBadge = getRankBadge(detectiveStars);

  return (
    <header className="bg-gradient-to-r from-amber-950/90 via-rose-950/90 to-slate-900/95 backdrop-blur-xl gold-filigree-border rounded-2xl p-3.5 mb-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {/* Officer Musa Lego Avatar Badge */}
        <div className="relative group cursor-pointer">
          <LegoAvatar
            seedKey="CID_MUSA_OFFICER"
            sizePx={48}
            avatarMode="photo"
            className="border-2 border-amber-400 shadow-lg shadow-amber-500/30"
          />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-slate-900 animate-pulse" />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black tracking-widest text-amber-300 uppercase px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 font-rajdhani">
              {caseNumber ? `CID DOSSIER #${caseNumber}` : "CID MUSA SPECIAL HQ"}
            </span>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border flex items-center gap-1 font-rajdhani shadow-sm ${rankBadge.color}`}>
              <Trophy className="w-3 h-3" /> {rankBadge.label}
            </span>
            <span className="text-[10px] font-black text-amber-400 bg-amber-950/90 px-2 py-0.5 rounded-md border border-amber-500/40 flex items-center gap-1 font-rajdhani">
              LEVEL {currentLevel}
            </span>
            <span className="text-[10px] font-black text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded-md border border-emerald-500/40 flex items-center gap-1 font-rajdhani">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {detectiveStars} STARS
            </span>
          </div>
          <h1 className="text-lg md:text-xl font-black text-amber-100 leading-tight tracking-wide mt-0.5 font-rajdhani uppercase drop-shadow-md">
            {caseTitle || "GLITCH IN THE ALIBI: CID MUSA CASE"}
          </h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs font-bold font-rajdhani">
        {/* Autopsy Report Quick Access Button */}
        {currentScreen !== "intro" && onOpenAutopsy && (
          <button
            onClick={onOpenAutopsy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/90 hover:bg-rose-900 text-rose-300 hover:text-white transition border border-rose-500/50 text-xs font-black shadow-lg cursor-pointer uppercase tracking-wider"
            title="Inspect Deceased Autopsy Report & Pathology Diagram"
          >
            <Stethoscope className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>AUTOPSY REPORT</span>
          </button>
        )}

        {currentScreen === "interrogation" && (
          <>
            <div className="flex items-center gap-2 bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-amber-400/30 shadow-md">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span className="text-slate-200 uppercase tracking-wider text-[11px]">
                Questions:{" "}
                <b className="text-amber-300 font-mono text-sm">
                  {totalQuestionsAsked}/{maxQuestions}
                </b>
              </span>
            </div>

            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 font-mono font-black text-sm shadow-md ${
                isWarn
                  ? "bg-rose-950/90 text-rose-300 border-rose-500 animate-pulse shadow-rose-500/30"
                  : "bg-emerald-950/90 text-emerald-300 border-emerald-400/50"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(clockRemaining)}</span>
            </div>
          </>
        )}

        {currentScreen !== "intro" && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition border border-slate-700 text-xs font-extrabold shadow-md cursor-pointer uppercase tracking-wider"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Abandon Case</span>
          </button>
        )}
      </div>
    </header>
  );
};
