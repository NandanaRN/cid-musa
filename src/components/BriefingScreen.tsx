import React, { useState } from "react";
import { CaseData, SuspectState } from "../types";
import { LegoAvatar } from "./LegoAvatar";
import { CharacterStudioModal } from "./CharacterStudioModal";
import { EmoteSystem } from "./EmoteSystem";
import { MapPin, Clock, Skull, Users, Quote, ArrowRight, Flame, Stethoscope } from "lucide-react";

interface BriefingScreenProps {
  caseData: CaseData;
  caseNumber: string;
  suspects: [SuspectState, SuspectState];
  onProceedToScene: () => void;
  onOpenAutopsy?: () => void;
}

export const BriefingScreen: React.FC<BriefingScreenProps> = ({
  caseData,
  caseNumber,
  suspects,
  onProceedToScene,
  onOpenAutopsy,
}) => {
  const [studioOpen, setStudioOpen] = useState(false);
  const [studioSeed, setStudioSeed] = useState("");
  const [studioName, setStudioName] = useState("");
  const [studioRole, setStudioRole] = useState("");

  const handleOpenStudio = (seed: string, name: string, role: string) => {
    setStudioSeed(seed);
    setStudioName(name);
    setStudioRole(role);
    setStudioOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/90 via-rose-950/90 to-slate-900/95 backdrop-blur-xl gold-filigree-border rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
        <div>
          <div className="text-xs text-amber-300 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5 font-rajdhani">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>
              CID FILE #{caseNumber} • {String(caseData.city || "").toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-amber-100 font-rajdhani uppercase tracking-wide">
            INVESTIGATION BRIEF: THE {String(caseData.victim || "").toUpperCase()} MURDER
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenAutopsy && (
            <button
              onClick={onOpenAutopsy}
              className="px-4 py-3 rounded-xl bg-rose-950/90 hover:bg-rose-900 text-rose-300 hover:text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 border-2 border-rose-500/50 shadow-lg cursor-pointer font-rajdhani"
            >
              <Stethoscope className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>Inspect Autopsy</span>
            </button>
          )}

          <button
            onClick={onProceedToScene}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-amber-400/30 transition transform active:scale-95 cursor-pointer shrink-0 border-2 border-amber-300 font-rajdhani"
          >
            <span>Search Crime Scene</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Victim & Cause Panel */}
        <div className="bg-gradient-to-b from-amber-950/80 via-rose-950/80 to-slate-900/95 backdrop-blur-xl border-2 border-amber-400/30 rounded-2xl p-5 space-y-4 shadow-2xl">
          <div className="flex items-center gap-2 text-xs font-black text-rose-300 uppercase tracking-widest border-b border-amber-400/20 pb-2 font-rajdhani">
            <Skull className="w-4 h-4 text-rose-400" />
            <span>Victim & Crime Scene Details</span>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/80 p-3.5 rounded-2xl border-2 border-rose-500/40 shadow-lg">
            <LegoAvatar
              seedKey={caseData.victim + "::victim"}
              sizePx={60}
              expression="angry"
              avatarMode="photo"
              onClick={() =>
                handleOpenStudio(caseData.victim + "::victim", caseData.victim, "Victim (Deceased)")
              }
              className="border-2 border-rose-400 shadow-md cursor-pointer"
            />
            <div>
              <div className="text-lg font-black text-white">{caseData.victim}</div>
              <div className="text-xs text-rose-400 font-black font-mono uppercase">
                VICTIM (DECEASED)
              </div>
              <p className="text-xs text-slate-300 font-medium mt-1 line-clamp-2">{caseData.victim_detail}</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-200 font-medium">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-300" />
              <span>
                <b className="text-amber-300 font-bold">Time of Death:</b> {caseData.time_of_death}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Skull className="w-4 h-4 text-rose-400" />
              <span>
                <b className="text-rose-300 font-bold">Cause of Death:</b> {caseData.method}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>
                <b className="text-amber-400 font-bold">Location:</b> {caseData.scene}
              </span>
            </div>
          </div>

          {/* Rehearsed Alibi Box */}
          <div className="bg-amber-500/10 border-2 border-amber-400/40 rounded-2xl p-4 relative shadow-md">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 uppercase mb-1 font-rajdhani">
              <Quote className="w-4 h-4 text-amber-400" />
              <span>Shared Rehearsed Alibi (Word for Word)</span>
            </div>
            <p className="text-xs text-amber-100 font-bold italic leading-relaxed">
              "{caseData.shared_alibi}"
            </p>
          </div>
        </div>

        {/* Suspects & Motive Panel */}
        <div className="bg-gradient-to-b from-amber-950/80 via-slate-900/90 to-slate-900/95 backdrop-blur-xl border-2 border-amber-400/30 rounded-2xl p-5 space-y-4 shadow-2xl">
          <div className="flex items-center gap-2 text-xs font-black text-amber-300 uppercase tracking-widest border-b border-amber-400/20 pb-2 font-rajdhani">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Prime Suspects Dossiers</span>
          </div>

          <div className="space-y-3">
            {suspects.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-slate-950/80 p-3.5 rounded-2xl border-2 border-amber-400/30 shadow-lg"
              >
                <div className="relative shrink-0">
                  <LegoAvatar
                    seedKey={s.avatarSeed}
                    sizePx={52}
                    avatarMode="photo"
                    onClick={() => handleOpenStudio(s.avatarSeed, s.name, s.title)}
                    className="border-2 border-amber-400/80 shadow-md cursor-pointer"
                  />
                  <EmoteSystem
                    responseContent={s.history.slice().reverse().find((h) => h.role === "model")?.content || "I am innocent!"}
                    size="sm"
                  />
                </div>
                <div>
                  <div className="font-black text-sm text-white" style={{ color: s.accent }}>
                    {s.name}
                  </div>
                  <div className="text-xs text-amber-200/80 font-bold">{s.title}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-950/80 rounded-2xl p-4 border-2 border-amber-400/20 space-y-1.5">
            <div className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1 font-rajdhani">
              <Flame className="w-3.5 h-3.5 text-rose-400" /> Motive & Suspect Conflict
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">{caseData.relationship}</p>
          </div>
        </div>
      </div>

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
