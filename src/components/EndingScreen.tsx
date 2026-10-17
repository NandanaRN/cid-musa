import React, { useState } from "react";
import { CaseData, SuspectState } from "../types";
import { LegoAvatar } from "./LegoAvatar";
import { VictoryCelebration } from "./VictoryCelebration";
import { CharacterStudioModal } from "./CharacterStudioModal";
import { EmoteSystem } from "./EmoteSystem";
import { FileText, RotateCcw, Trophy, AlertTriangle } from "lucide-react";

interface EndingScreenProps {
  caseData: CaseData;
  suspects: [SuspectState, SuspectState];
  verdictIdx: number;
  evidenceFoundCount: number;
  totalQuestionsAsked: number;
  suspicion: [number, number];
  detectiveStars?: number;
  currentLevel?: number;
  onNewGame: () => void;
}

export const EndingScreen: React.FC<EndingScreenProps> = ({
  caseData,
  suspects,
  verdictIdx,
  evidenceFoundCount,
  totalQuestionsAsked,
  suspicion,
  detectiveStars = 0,
  currentLevel = 1,
  onNewGame,
}) => {
  const [studioOpen, setStudioOpen] = useState(false);
  const [studioSeed, setStudioSeed] = useState("");
  const [studioName, setStudioName] = useState("");
  const [studioRole, setStudioRole] = useState("");

  const guiltyIdx = suspects[0].role === "guilty" ? 0 : 1;
  const isCorrect = verdictIdx === guiltyIdx;
  const totalEvidenceCount = caseData.evidence.length;
  const evidenceRatio = evidenceFoundCount / totalEvidenceCount;

  // Grade evaluation
  let stampTitle = "CASE CLOSED";
  let stampColor = "border-emerald-400 text-emerald-400 shadow-emerald-500/20";
  let description = "";

  if (isCorrect && evidenceRatio >= 0.75) {
    stampTitle = "MASTER CID DETECTIVE (+3 ⭐)";
    stampColor = "border-emerald-400 text-emerald-400 shadow-emerald-500/20";
    description = `Outstanding CID work, Officer Musa! You thoroughly combed the crime scene, uncovered key physical evidence, and cornered ${suspects[guiltyIdx].name} until their fake alibi collapsed completely! You have earned +3 Stars and advanced to Level ${currentLevel + 1}!`;
  } else if (isCorrect) {
    stampTitle = "CASE SOLVED! (+3 ⭐)";
    stampColor = "border-amber-400 text-amber-400 shadow-amber-500/20";
    description = `Great detective work! You identified the true culprit (${suspects[guiltyIdx].name}) and executed the arrest warrant successfully. Case closed permanently!`;
  } else if (evidenceRatio >= 0.5) {
    stampTitle = "WRONGFUL ARREST - GAME OVER";
    stampColor = "border-rose-500 text-rose-500 shadow-rose-500/20";
    description = `Despite finding crucial evidence at the crime scene, you misjudged the suspect interrogations and arrested the wrong person! ${suspects[guiltyIdx].name} escaped scot-free. You have been suspended from CID!`;
  } else {
    stampTitle = "BLIND ACCUSATION - GAME OVER";
    stampColor = "border-rose-600 text-rose-600 shadow-rose-600/20";
    description = `You rushed to make an arrest without finding enough clues or testing the suspect stories! An innocent person went to jail and you were dismissed from CID!`;
  }

  const handleOpenStudio = (seed: string, name: string, role: string) => {
    setStudioSeed(seed);
    setStudioName(name);
    setStudioRole(role);
    setStudioOpen(true);
  };

  return (
    <div className="relative max-w-4xl mx-auto space-y-6 text-center py-6 font-rajdhani">
      {/* Victory Celebration Confetti */}
      {isCorrect && <VictoryCelebration showBadge={false} />}

      {/* Outcome Banner */}
      <div className="inline-block transform -rotate-1">
        <div
          className={`text-2xl md:text-4xl font-black font-cinzel uppercase tracking-widest px-8 py-3 rounded-2xl border-4 bg-slate-950/90 shadow-2xl ${stampColor}`}
        >
          {isCorrect ? (
            <span className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-400 inline" />
              {stampTitle}
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-rose-500 inline" />
              {stampTitle}
            </span>
          )}
        </div>
      </div>

      <p className="text-slate-200 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-semibold font-sans">
        {description}
      </p>

      {/* Suspect Avatars Row */}
      <div className="flex justify-center items-center gap-6 py-2">
        {suspects.map((s, idx) => {
          const isGuilty = s.role === "guilty";
          return (
            <div
              key={idx}
              onClick={() => handleOpenStudio(s.avatarSeed, s.name, s.title)}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
              title="Inspect LEGO Minifigure Avatar"
            >
              <div className="relative">
                <LegoAvatar
                  seedKey={s.avatarSeed}
                  sizePx={72}
                  expression={isGuilty ? "angry" : "normal"}
                  avatarMode="photo"
                  className={`border-2 transform group-hover:scale-105 transition shadow-lg ${
                    isGuilty ? "border-rose-500" : "border-emerald-400"
                  }`}
                />
                <EmoteSystem
                  overrideEmote={isGuilty ? "panic" : "confident"}
                  size="md"
                  showLabel={true}
                />
              </div>
              <span className="text-xs font-black text-amber-300 uppercase tracking-wide">{s.name}</span>
              <span
                className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                  isGuilty ? "bg-rose-950/90 text-rose-300 border border-rose-500/40" : "bg-emerald-950/90 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                {isGuilty ? "TRUE KILLER" : "INNOCENT SUSPECT"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Metrics breakdown */}
      <div className="bg-slate-950/90 gold-filigree-border rounded-2xl p-6 text-left space-y-4 shadow-2xl">
        <div className="flex items-center gap-2 text-sm font-bold text-amber-400 uppercase tracking-widest border-b border-amber-500/20 pb-3 font-cinzel">
          <FileText className="w-4 h-4" />
          <span>CID Case Dossier & Metrics Breakdown</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-amber-500/20">
            <div className="text-slate-400 font-medium">Clues Discovered</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">
              {evidenceFoundCount} / {totalEvidenceCount}
            </div>
          </div>

          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-amber-500/20">
            <div className="text-slate-400 font-medium">Interrogation Questions</div>
            <div className="text-lg font-black text-amber-300 mt-0.5">{totalQuestionsAsked}</div>
          </div>

          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-amber-500/20">
            <div className="text-slate-400 font-medium">{suspects[0].name} Suspicion</div>
            <div className="text-lg font-black text-amber-200 mt-0.5">{suspicion[0]}%</div>
          </div>

          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-amber-500/20">
            <div className="text-slate-400 font-medium">{suspects[1].name} Suspicion</div>
            <div className="text-lg font-black text-amber-200 mt-0.5">{suspicion[1]}%</div>
          </div>
        </div>

        {/* Environmental Facts Truth Box */}
        <div className="bg-slate-900/90 rounded-xl p-4 border border-amber-500/20 space-y-2">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider font-cinzel">
            Key CID Investigation Facts (Ground Truth)
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside font-sans">
            {caseData.hard_facts.map((hf, i) => (
              <li key={i} className="leading-relaxed">
                <span className="text-slate-200">{hf.fact}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        onClick={onNewGame}
        className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-2xl shadow-amber-500/30 transition transform active:scale-95 cursor-pointer font-rajdhani"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Play Again - Solve Another Case</span>
      </button>

      <CharacterStudioModal
        isOpen={studioOpen}
        seedKey={studioSeed}
        characterName={studioName}
        characterRole={studioRole}
        onClose={() => setStudioOpen(false)}
      />
    </div>
  );
};
