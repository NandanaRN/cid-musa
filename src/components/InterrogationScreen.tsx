import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CaseData, SuspectState, DiscoveredContradiction } from "../types";
import { LegoAvatar } from "./LegoAvatar";
import { SuspicionMeter } from "./SuspicionMeter";
import { CharacterStudioModal } from "./CharacterStudioModal";
import { EmoteSystem } from "./EmoteSystem";
import { soundEffects } from "../utils/audio";
import {
  Send,
  ShieldAlert,
  Sparkles,
  Lock,
  FileText,
  Search,
  MessageSquare,
  Flame,
  ArrowRight,
  Zap,
  BrainCircuit,
  Smile,
  Frown,
  Meh,
  Activity,
  Volume2,
} from "lucide-react";

interface InterrogationScreenProps {
  caseData: CaseData;
  suspects: [SuspectState, SuspectState];
  activeSuspectIdx: number;
  suspicion: [number, number];
  totalQuestionsAsked: number;
  maxTotalQuestions: number;
  evidenceFoundIds: string[];
  discoveredContradictions: DiscoveredContradiction[];
  onSelectSuspect: (idx: number) => void;
  onAskQuestion: (text: string) => Promise<void>;
  onAccuseSuspect: (idx: number) => void;
  onOpenAutopsy?: () => void;
}

const CINEMA_QUICK_QUESTIONS = [
  "🔊 Was the room silent or did you hear heavy footsteps?",
  "💡 Were the lamps bright or flickering ominously?",
  "🥭 Did you smell chai, perfume, or gunpowder nearby?",
  "❄️ Was the air freezing cold or suffocatingly hot?",
  "📱 Did you see anyone checking their phone nervously?",
  "🚪 Was the heavy door bolted shut or wide open?",
];

export const MIN_SUSPICION_TO_ARREST = 50;

export const InterrogationScreen: React.FC<InterrogationScreenProps> = ({
  caseData,
  suspects,
  activeSuspectIdx,
  suspicion,
  totalQuestionsAsked,
  maxTotalQuestions,
  evidenceFoundIds,
  discoveredContradictions,
  onSelectSuspect,
  onAskQuestion,
  onAccuseSuspect,
}) => {
  const [inputText, setInputText] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [isConfronting, setIsConfronting] = useState(false);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<"interrogate" | "caselog">("interrogate");
  const [caseLogTab, setCaseLogTab] = useState<"evidence" | "contradictions" | "analysis">("evidence");

  // Character Studio Modal state
  const [studioOpen, setStudioOpen] = useState(false);
  const [studioSeed, setStudioSeed] = useState("");
  const [studioName, setStudioName] = useState("");
  const [studioRole, setStudioRole] = useState("");

  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const activeSuspect = suspects[activeSuspectIdx];
  const maxPerSuspect = 14;

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [activeSuspect.history, isAsking, isConfronting, mainTab]);

  const handleOpenStudio = (seed: string, name: string, role: string) => {
    setStudioSeed(seed);
    setStudioName(name);
    setStudioRole(role);
    setStudioOpen(true);
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isAsking || isConfronting) return;

    if (totalQuestionsAsked >= maxTotalQuestions) return;
    if (activeSuspect.questionsAsked >= maxPerSuspect) return;

    setInputText("");
    setIsAsking(true);
    soundEffects.playClick();
    if (mainTab === "caselog") {
      setMainTab("interrogate");
    }
    try {
      await onAskQuestion(query);
    } finally {
      setIsAsking(false);
    }
  };

  // AI Hero "Table Slam" Confrontation Power Move
  const handleAiConfrontation = async () => {
    if (isAsking || isConfronting) return;
    if (totalQuestionsAsked >= maxTotalQuestions) return;
    if (activeSuspect.questionsAsked >= maxPerSuspect) return;

    setIsConfronting(true);
    soundEffects.playTableSlam();

    try {
      const lastReply = activeSuspect.history.slice().reverse().find((h) => h.role === "model")?.content || "";
      const res = await fetch("/api/ai-confrontation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suspectName: activeSuspect.name,
          suspectRole: activeSuspect.role,
          lastReply,
          sharedAlibi: caseData.shared_alibi,
          victimName: caseData.victim,
        }),
      });

      let line = `[TABLE SLAM] Look at me, ${activeSuspect.name}! Inspector Musa knows you are hiding the truth about ${caseData.shared_alibi.slice(0, 30)}... speak now!`;
      if (res.ok) {
        const data = await res.json();
        if (data.confrontation) {
          line = `💥 [INSPECTOR MUSA TABLE SLAM] ${data.confrontation}`;
        }
      }

      await onAskQuestion(line);
    } catch (err) {
      console.error("Confrontation error:", err);
    } finally {
      setIsConfronting(false);
    }
  };

  // Run AI Forensic Case Analysis
  const handleRunAiAnalysis = async () => {
    setIsAnalyzingAi(true);
    try {
      const res = await fetch("/api/ai-analyze-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseData,
          suspects,
          evidenceFoundIds,
          discoveredContradictions,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiAnalysisResult(data.analysis);
      } else {
        setAiAnalysisResult("AI Forensic Scan: Compare suspect statements with environmental facts to expose contradictions.");
      }
    } catch (err) {
      console.error("AI Analysis error:", err);
      setAiAnalysisResult("CID Inspector Musa AI System: Keep questioning both suspects about fine sensory details of the alibi.");
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const foundEvidence = caseData.evidence.filter((e) => evidenceFoundIds.includes(e.id));

  // Determine Lego expression for active suspect
  const getSuspectExpression = (susScore: number): "normal" | "nervous" | "angry" => {
    if (susScore >= 60) return "angry";
    if (susScore >= 35) return "nervous";
    return "normal";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Top View Selector Bar */}
      <div className="flex flex-wrap items-center justify-between bg-gradient-to-r from-amber-950/90 via-rose-950/90 to-slate-900/95 backdrop-blur-xl p-3 rounded-2xl gold-filigree-border shadow-2xl gap-2">
        <div className="flex items-center gap-2 font-rajdhani">
          <button
            onClick={() => setMainTab("interrogate")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md ${
              mainTab === "interrogate"
                ? "bg-amber-400 text-slate-950 border border-amber-300"
                : "bg-amber-950/60 text-amber-200 hover:bg-amber-900"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-slate-950" />
            <span>Interrogation Chamber</span>
          </button>

          <button
            onClick={() => setMainTab("caselog")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md ${
              mainTab === "caselog"
                ? "bg-amber-400 text-slate-950 border border-amber-300"
                : "bg-slate-900/60 text-amber-200 hover:bg-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Case Clues & Lies</span>
            <span className="bg-slate-950/90 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-mono border border-amber-400/40">
              {foundEvidence.length} Clues • {discoveredContradictions.length} Lies
            </span>
          </button>
        </div>

        {/* AI Forensic Advisor Trigger Button */}
        <button
          onClick={() => {
            setMainTab("caselog");
            setCaseLogTab("analysis");
            if (!aiAnalysisResult) handleRunAiAnalysis();
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-rose-600 to-amber-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/30 border border-amber-300 cursor-pointer font-rajdhani uppercase tracking-wider"
        >
          <BrainCircuit className="w-4 h-4 text-slate-950 animate-pulse" />
          <span>AI Forensic Advisor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Suspect Tabs Sidebar */}
        <div className="space-y-3">
          <div className="text-xs font-black text-amber-300 uppercase tracking-wider px-1 flex items-center justify-between font-rajdhani">
            <span>Prime Suspect Dossiers</span>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded">CID Musa</span>
          </div>

          {suspects.map((s, idx) => {
            const isActive = activeSuspectIdx === idx;
            const susScore = suspicion[idx];
            const expr = getSuspectExpression(susScore);
            const gaugeColor =
              susScore >= 65
                ? "bg-rose-600"
                : susScore >= 35
                ? "bg-amber-500"
                : "bg-emerald-500";

            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectSuspect(idx)}
                className={`p-3.5 rounded-2xl border-2 transition cursor-pointer backdrop-blur-md relative overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-br from-amber-950/90 to-rose-950/90 border-amber-400 shadow-xl shadow-amber-400/20"
                    : "bg-slate-900/80 border-amber-400/20 hover:border-amber-400/40"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative shrink-0">
                    <LegoAvatar
                      seedKey={s.avatarSeed}
                      sizePx={48}
                      expression={expr}
                      avatarMode="photo"
                      onClick={() => handleOpenStudio(s.avatarSeed, s.name, s.title)}
                      className="border-2 border-amber-300/80 shadow cursor-pointer"
                    />
                    <EmoteSystem
                      responseContent={s.history.slice().reverse().find((h) => h.role === "model")?.content || ""}
                      suspicionScore={susScore}
                      expression={expr}
                      size="sm"
                    />
                  </div>

                  <div>
                    <div className="font-extrabold text-sm text-white flex items-center gap-1.5 font-rajdhani">
                      <span>{s.name}</span>
                      {expr === "angry" ? (
                        <Frown className="w-3.5 h-3.5 text-rose-400" />
                      ) : expr === "nervous" ? (
                        <Meh className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Smile className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <div className="text-[10px] text-amber-200/80 font-medium">{s.title}</div>
                  </div>
                </div>

                {/* Suspicion Meter Component */}
                <SuspicionMeter score={susScore} size="sm" />

                <div className="flex justify-between text-[10px] text-amber-300/80 mt-2 pt-2 border-t border-amber-400/20 font-mono">
                  <span>Questions Asked</span>
                  <span>
                    {s.questionsAsked}/{maxPerSuspect}
                  </span>
                </div>
              </motion.div>
            );
          })}

          {/* Accuse Action Box */}
          <div className="bg-gradient-to-br from-rose-950/90 to-amber-950/90 backdrop-blur-md border-2 border-rose-500/50 rounded-2xl p-4 space-y-2 shadow-xl">
            <div className="flex items-center gap-1.5 text-xs font-black text-rose-300 uppercase tracking-widest font-rajdhani">
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>Make Final Decision</span>
            </div>
            <p className="text-[11px] text-slate-200 font-medium leading-tight">
              Ready to execute Inspector Musa's arrest warrant? Choose the real killer!
            </p>
            <p className="text-[10px] text-amber-300 font-mono font-bold">
              ⚖️ A suspect must reach {MIN_SUSPICION_TO_ARREST}% suspicion to justify an arrest.
            </p>

            <div className="space-y-2 pt-1">
              {suspects.map((s, idx) => {
                const canArrest = suspicion[idx] >= MIN_SUSPICION_TO_ARREST;
                return (
                  <button
                    key={idx}
                    onClick={() => onAccuseSuspect(idx)}
                    disabled={!canArrest}
                    title={
                      canArrest
                        ? `Arrest ${s.name}`
                        : `${s.name} suspicion is too low (${suspicion[idx]}%). Build a case first.`
                    }
                    className={`w-full py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition transform active:scale-95 font-rajdhani ${
                      canArrest
                        ? "bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-600/30 cursor-pointer"
                        : "bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed opacity-70"
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>
                      ARREST {s.name.toUpperCase()} ({suspicion[idx]}%)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3 bg-gradient-to-b from-amber-950/80 via-slate-900/90 to-slate-900/95 backdrop-blur-xl border-2 border-amber-400/30 rounded-2xl flex flex-col h-[600px] overflow-hidden shadow-2xl">
          {mainTab === "interrogate" ? (
            <>
              {/* Active Suspect Banner with Motion Expressions & Suspicion Meter */}
              <div className="p-3.5 border-b border-amber-400/20 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <LegoAvatar
                      seedKey={activeSuspect.avatarSeed}
                      sizePx={44}
                      expression={getSuspectExpression(suspicion[activeSuspectIdx])}
                      avatarMode="photo"
                      isSpeaking={isAsking}
                      onClick={() =>
                        handleOpenStudio(activeSuspect.avatarSeed, activeSuspect.name, activeSuspect.title)
                      }
                      className="border border-amber-300 shadow cursor-pointer"
                    />
                    <EmoteSystem
                      responseContent={activeSuspect.history.slice().reverse().find((h) => h.role === "model")?.content || ""}
                      suspicionScore={suspicion[activeSuspectIdx]}
                      isSpeaking={isAsking}
                      expression={getSuspectExpression(suspicion[activeSuspectIdx])}
                      size="md"
                      showLabel={true}
                    />
                  </div>

                  <div>
                    <div className="font-black text-sm text-white flex items-center gap-2 font-rajdhani">
                      <span>{activeSuspect.name}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {activeSuspect.title}
                      </span>
                      {isAsking && (
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 0.6 }}
                          className="text-[10px] font-mono font-black text-amber-400 flex items-center gap-1"
                        >
                          <Volume2 className="w-3 h-3 text-amber-400" />
                          <span>SPEAKING...</span>
                        </motion.span>
                      )}
                    </div>
                    <div className="text-[10px] text-amber-200/80 font-mono">
                      Claimed Alibi: "{caseData.shared_alibi.slice(0, 45)}..."
                    </div>
                  </div>
                </div>

                {/* Main Suspicion Meter Header Widget */}
                <div className="w-full sm:w-52">
                  <SuspicionMeter score={suspicion[activeSuspectIdx]} size="md" />
                </div>

                <button
                  onClick={handleAiConfrontation}
                  disabled={isAsking || isConfronting}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-rose-500 to-amber-500 hover:from-amber-300 hover:to-pink-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-rose-500/30 disabled:opacity-40 cursor-pointer transition transform active:scale-95 font-rajdhani shrink-0"
                  title="Inspector Musa Table Slam AI Confrontation Move"
                >
                  <Zap className="w-4 h-4 text-slate-950 animate-bounce" />
                  <span>Table Slam AI</span>
                </button>
              </div>

              {/* Scrollable Messages */}
              <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-3">
                {activeSuspect.history.length === 0 ? (
                  <div className="text-center py-16 text-amber-200/80 space-y-3">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-16 h-16 mx-auto rounded-2xl bg-amber-400/20 border-2 border-amber-400/40 flex items-center justify-center text-2xl"
                    >
                      🎬
                    </motion.div>
                    <p className="text-sm font-black text-white font-rajdhani uppercase tracking-wider">
                      {activeSuspect.name} takes a seat across the CID interrogation table.
                    </p>
                    <p className="text-xs max-w-sm mx-auto text-amber-200/80 font-medium">
                      Ask about their alibi or fire questions on fine sensory details (lights, sounds, environment) to catch them lying!
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {activeSuspect.history.map((turn, i) => {
                      const isUser = turn.role === "user";
                      const isConfront = turn.content.includes("[INSPECTOR MUSA TABLE SLAM]");
                      const isLatestTurn = i === activeSuspect.history.length - 1;

                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 16, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                        >
                          {!isUser && (
                            <div className="relative shrink-0 mt-1">
                              <LegoAvatar
                                seedKey={activeSuspect.avatarSeed}
                                sizePx={34}
                                expression={getSuspectExpression(suspicion[activeSuspectIdx])}
                                avatarMode="photo"
                                isSpeaking={isLatestTurn && !isUser}
                                className="shadow border border-amber-300/80"
                              />
                              <EmoteSystem
                                responseContent={turn.content}
                                suspicionScore={suspicion[activeSuspectIdx]}
                                expression={getSuspectExpression(suspicion[activeSuspectIdx])}
                                size="sm"
                              />
                            </div>
                          )}
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed ${
                              isUser
                                ? isConfront
                                  ? "bg-gradient-to-r from-rose-600/90 via-amber-600/90 to-rose-700/90 border-2 border-rose-300 text-white rounded-br-none shadow-xl shadow-rose-600/30 font-bold"
                                  : "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-bold rounded-br-none shadow-lg shadow-amber-400/20"
                                : "bg-slate-950/90 border border-amber-400/30 text-amber-100 rounded-bl-none shadow-md"
                            }`}
                          >
                            {!isUser ? (
                              <div className="text-[10px] font-black text-amber-300 mb-0.5 uppercase font-rajdhani flex items-center justify-between">
                                <span>{activeSuspect.name}</span>
                                {isLatestTurn && (
                                  <span className="text-[9px] text-amber-400/80 font-mono lowercase">just now</span>
                                )}
                              </div>
                            ) : isConfront ? (
                              <div className="text-[10px] font-black text-amber-200 mb-0.5 uppercase tracking-wider flex items-center gap-1 font-rajdhani">
                                <span>💥 Inspector Musa Hero Table Slam</span>
                              </div>
                            ) : null}
                            <div>{turn.content}</div>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}

                {(isAsking || isConfronting) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-xs text-amber-300 font-mono font-bold italic"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </motion.div>
                    <span>{isConfronting ? "Inspector Musa is slamming the table..." : `${activeSuspect.name} is speaking...`}</span>
                  </motion.div>
                )}
              </div>

              {/* Cinema Quick Question Chips */}
              <div className="p-2.5 border-t border-amber-400/20 bg-slate-950/70">
                <div className="text-[10px] font-black text-amber-300 uppercase mb-1.5 flex items-center justify-between font-rajdhani">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Detective Quick Interrogation Questions:
                  </span>
                  {foundEvidence.length > 0 && (
                    <span className="text-[10px] text-amber-300 font-bold">
                      {foundEvidence.length} Clue(s) Unlocked
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {/* Evidence Clue Questions */}
                  {foundEvidence.map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => handleSend(ev.hint_question)}
                      disabled={isAsking || isConfronting}
                      className="text-[11px] bg-amber-950/90 hover:bg-amber-900 border border-amber-400/60 text-amber-200 px-3 py-1 rounded-xl font-bold transition cursor-pointer disabled:opacity-50 shadow-sm font-rajdhani"
                    >
                      🔍 {ev.hint_question}
                    </button>
                  ))}

                  {/* Standard Cinema Questions */}
                  {CINEMA_QUICK_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q.slice(2))}
                      disabled={isAsking || isConfronting}
                      className="text-[11px] bg-slate-900/80 hover:bg-slate-800 border border-amber-400/30 text-amber-200/90 px-3 py-1 rounded-xl font-medium transition cursor-pointer disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Box */}
              <div className="p-3 border-t border-amber-400/20 bg-slate-950/95 flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={isAsking || isConfronting}
                  placeholder={`Question ${activeSuspect.name} in simple English...`}
                  className="flex-1 bg-slate-900/90 border border-amber-400/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-amber-200/40 focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isAsking || isConfronting || !inputText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-400/20 disabled:opacity-40 cursor-pointer font-rajdhani"
                >
                  <span>Ask</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            /* Dedicated Case Log Panel */
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/95">
              {/* Case Log Navigation Bar */}
              <div className="p-3.5 border-b border-amber-400/20 bg-slate-900/95 flex flex-wrap items-center justify-between gap-2 font-rajdhani">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCaseLogTab("evidence")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                      caseLogTab === "evidence"
                        ? "bg-amber-400 text-slate-950"
                        : "bg-slate-800 text-amber-200/80 hover:text-white"
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Gathered Evidence ({foundEvidence.length})</span>
                  </button>

                  <button
                    onClick={() => setCaseLogTab("contradictions")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                      caseLogTab === "contradictions"
                        ? "bg-rose-600 text-white"
                        : "bg-slate-800 text-amber-200/80 hover:text-white"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Caught Contradictions ({discoveredContradictions.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      setCaseLogTab("analysis");
                      if (!aiAnalysisResult) handleRunAiAnalysis();
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                      caseLogTab === "analysis"
                        ? "bg-amber-500 text-slate-950"
                        : "bg-slate-800 text-amber-200/80 hover:text-white"
                    }`}
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>AI Forensic Analysis</span>
                  </button>
                </div>
              </div>

              {/* Case Log Tab Content */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {caseLogTab === "evidence" && (
                  foundEvidence.length === 0 ? (
                    <div className="text-center py-16 text-amber-200/80 space-y-2">
                      <Search className="w-12 h-12 mx-auto opacity-30 text-amber-400" />
                      <p className="text-sm font-black text-white font-rajdhani uppercase tracking-wider">No Clues Collected Yet</p>
                      <p className="text-xs max-w-sm mx-auto text-amber-200/80 font-medium">
                        Search crime scene zones to collect physical evidence that can be used to question suspects.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {foundEvidence.map((ev) => (
                        <div
                          key={ev.id}
                          className="bg-slate-900/90 border-2 border-amber-400/40 rounded-xl p-3.5 space-y-2 flex flex-col justify-between shadow-lg"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-black text-xs text-amber-300 flex items-center gap-1 font-rajdhani">
                                <Search className="w-3.5 h-3.5" /> {ev.name}
                              </span>
                              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-400/40">
                                {ev.location}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-200 italic bg-slate-950/90 p-2.5 rounded-lg border border-amber-400/20">
                              "{ev.reveal_text}"
                            </p>
                          </div>

                          <div className="pt-2 border-t border-amber-400/20 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-amber-200/80 font-mono font-bold">
                              Interrogation Prompt:
                            </span>
                            <button
                              onClick={() => handleSend(ev.hint_question)}
                              className="text-[10px] bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer font-rajdhani"
                            >
                              <span>Fire Question</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {caseLogTab === "contradictions" && (
                  discoveredContradictions.length === 0 ? (
                    <div className="text-center py-16 text-amber-200/80 space-y-2">
                      <Flame className="w-12 h-12 mx-auto opacity-30 text-rose-500 animate-pulse" />
                      <p className="text-sm font-black text-white font-rajdhani uppercase tracking-wider">No Contradictions Caught Yet</p>
                      <p className="text-xs max-w-sm mx-auto text-amber-200/80 font-medium">
                        Ask suspects about environmental sensory details. If they lie, their answer will clash with hard scene facts!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {discoveredContradictions.map((c) => (
                        <div
                          key={c.id}
                          className="bg-rose-950/60 border-2 border-rose-500/60 rounded-xl p-3.5 space-y-2 shadow-lg"
                        >
                          <div className="flex items-center justify-between border-b border-rose-500/30 pb-2 font-rajdhani">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded bg-rose-500 text-white font-black text-[10px] uppercase tracking-wider">
                                Lie Caught!
                              </span>
                              <span className="font-black text-xs text-rose-200">
                                {c.suspectName}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-rose-300 font-bold">
                              {c.timestamp} (+25% Guilt)
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <div>
                              <span className="text-[10px] text-amber-200/80 font-bold uppercase font-rajdhani">
                                Question Asked:
                              </span>
                              <p className="text-white font-medium">"{c.question}"</p>
                            </div>

                            <div className="bg-slate-950/90 p-2.5 rounded-lg border border-rose-500/40">
                              <span className="text-[10px] text-rose-400 font-bold uppercase block font-rajdhani">
                                Suspect's Lying Claim:
                              </span>
                              <p className="text-rose-100 italic">"{c.reply}"</p>
                            </div>

                            <div className="bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-500/50">
                              <span className="text-[10px] text-emerald-400 font-bold uppercase block font-rajdhani">
                                Environmental Real Fact:
                              </span>
                              <p className="text-emerald-200 font-bold">
                                ✓ {c.factContradicted}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {caseLogTab === "analysis" && (
                  <div className="bg-slate-900/90 border-2 border-amber-400/40 rounded-2xl p-5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-amber-400/20 pb-3 font-rajdhani">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="w-6 h-6 text-amber-400 animate-pulse" />
                        <div>
                          <h3 className="font-black text-sm text-amber-200">
                            CID Inspector Musa AI Forensic Intelligence Report
                          </h3>
                          <p className="text-[10px] text-amber-300 font-mono font-bold">
                            Powered by Gemini 2.5 Flash
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleRunAiAnalysis}
                        disabled={isAnalyzingAi}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1 disabled:opacity-50 cursor-pointer shadow-md"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Re-Analyze Case</span>
                      </button>
                    </div>

                    {isAnalyzingAi ? (
                      <div className="py-12 text-center text-amber-200 space-y-2 font-mono text-xs animate-pulse">
                        <BrainCircuit className="w-8 h-8 mx-auto animate-spin text-amber-400" />
                        <p>Scanning all suspect dialogue history & scene evidence...</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-slate-950 p-4 rounded-xl border border-amber-400/30 text-xs text-amber-100 leading-relaxed font-medium">
                          {aiAnalysisResult || "Click Re-Analyze Case to generate a live Gemini strategic report."}
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className="bg-slate-950/90 p-3 rounded-xl border border-amber-400/20 text-center space-y-1">
                            <span className="text-[10px] text-amber-300 font-mono uppercase font-bold">
                              Suspect 1 Suspicion
                            </span>
                            <div className="text-lg font-black text-amber-300 font-rajdhani">
                              {suspects[0].name}: {suspicion[0]}%
                            </div>
                          </div>
                          <div className="bg-slate-950/90 p-3 rounded-xl border border-amber-400/20 text-center space-y-1">
                            <span className="text-[10px] text-amber-300 font-mono uppercase font-bold">
                              Suspect 2 Suspicion
                            </span>
                            <div className="text-lg font-black text-rose-400 font-rajdhani">
                              {suspects[1].name}: {suspicion[1]}%
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
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
