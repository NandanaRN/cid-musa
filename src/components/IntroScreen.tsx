import React, { useState } from "react";
import { CaseData } from "../types";
import { PRESET_CASES } from "../data/cases";
import { LegoAvatar } from "./LegoAvatar";
import { CharacterStudioModal } from "./CharacterStudioModal";
import { CuteDetectiveChaseAnimation } from "./CuteDetectiveChaseAnimation";
import { DetectiveEntranceAnimation } from "./DetectiveEntranceAnimation";
import { EmoteSystem, EmoteType } from "./EmoteSystem";
import { soundEffects } from "../utils/audio";
import {
  Sparkles,
  Play,
  ShieldAlert,
  MapPin,
  Zap,
  Skull,
  Cpu,
  Gem,
  AlertOctagon,
  Trophy,
  Star,
  Target,
  Ghost,
  Biohazard,
  Eye,
  Flame,
  Radio,
  HelpCircle,
  AlertTriangle,
  Fingerprint,
  Search,
  MessageSquareCode,
  Lock,
  UserCheck,
  Compass,
  Briefcase
} from "lucide-react";

interface IntroScreenProps {
  detectiveStars?: number;
  currentLevel?: number;
  completedCaseIds?: string[];
  onSelectPreset: (caseData: CaseData) => void;
  onGenerateAiCase: (category: string, level: number) => void;
  isGenerating: boolean;
}

export const CRIME_DIVISIONS = [
  {
    id: "murder",
    title: "Murder & Blood Poison",
    icon: Skull,
    badge: "🩸 Poison & Revenge",
    color: "from-rose-700 via-red-900 to-black border-rose-500 text-rose-200",
    glow: "shadow-rose-600/50",
    description: "Laced kombucha, cyanide cocktails, cold-blooded revenge, and staged crime scenes.",
    tagline: "Uncover who poisoned the victim!"
  },
  {
    id: "ghost",
    title: "Ghosts & Creepy Hauntings",
    icon: Ghost,
    badge: "👻 Fake Ghosts & Crypts",
    color: "from-purple-800 via-indigo-950 to-slate-950 border-purple-400 text-purple-200",
    glow: "shadow-purple-600/50",
    description: "Fake specters, midnight séances, ultrasonic illusion speakers, and haunted mansion terror.",
    tagline: "Expose the fake ghost operator!"
  },
  {
    id: "zombie",
    title: "Zombie Bio-Outbreak",
    icon: Biohazard,
    badge: "🧟 Bio-Hazard Lockdown",
    color: "from-emerald-800 via-lime-950 to-black border-lime-400 text-lime-200",
    glow: "shadow-lime-600/50",
    description: "Leaked neuro-parasite strains, lab lock-in panic, airlock sabotage, and viral outbreaks.",
    tagline: "Find who sabotaged the quarantine airlock!"
  },
  {
    id: "stalker",
    title: "Creepy Stalkers & Occult",
    icon: Eye,
    badge: "👁️ Stalker Tapes & Glyphs",
    color: "from-red-900 via-rose-950 to-neutral-950 border-red-500 text-rose-300",
    glow: "shadow-red-600/50",
    description: "Obsessive midnight calls, dark blood glyphs on mirrors, hidden cams & creepy tapes.",
    tagline: "Catch the creepy stalker in the shadows!"
  },
  {
    id: "cyber",
    title: "Cyber Crime & AI Heist",
    icon: Cpu,
    badge: "💻 Crypto Drains & AI",
    color: "from-cyan-700 via-indigo-950 to-slate-950 border-cyan-400 text-cyan-200",
    glow: "shadow-cyan-500/40",
    description: "Hacked neural networks, $12M crypto wallet drains, server room heat traps & deepfakes.",
    tagline: "Bust the rogue dev who wiped the hot wallets!"
  },
  {
    id: "theft",
    title: "High-Stakes Heists",
    icon: Gem,
    badge: "💎 Royal Jewels & Heists",
    color: "from-amber-700 via-amber-950 to-slate-950 border-amber-400 text-amber-200",
    glow: "shadow-amber-500/40",
    description: "Stolen royal Nizam diamonds, museum masterpieces, and laser grid 3D replica swaps.",
    tagline: "Track down the master jewel thief!"
  },
  {
    id: "kidnap",
    title: "Kidnapping & Ransom",
    icon: AlertOctagon,
    badge: "🚨 Hostage Rescue Ticking Clock",
    color: "from-orange-700 via-red-950 to-black border-orange-400 text-orange-200",
    glow: "shadow-orange-500/40",
    description: "Vanished tech heiresses, cryptographic Monero ransom demands & EMP jammers.",
    tagline: "Outsmart the kidnapper before time runs out!"
  },
];

export const IntroScreen: React.FC<IntroScreenProps> = ({
  detectiveStars = 0,
  currentLevel = 1,
  completedCaseIds = [],
  onSelectPreset,
  onGenerateAiCase,
  isGenerating,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("murder");
  const [selectedLevel, setSelectedLevel] = useState<number>(currentLevel);
  const unplayedPreset = PRESET_CASES.find((c) => !completedCaseIds.includes(c.id));
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    unplayedPreset ? unplayedPreset.id : PRESET_CASES[0].id
  );
  const [studioModalOpen, setStudioModalOpen] = useState(false);
  const [studioSeed, setStudioSeed] = useState("CID_MUSA_HERO");
  const [studioName, setStudioName] = useState("Officer CID Musa");

  // Simulator & Reaction State
  const [demoEmote, setDemoEmote] = useState<EmoteType>("sweat");
  const [teaserState, setTeaserState] = useState<"idle" | "confronted">("idle");

  const activeCase = PRESET_CASES.find((c) => c.id === selectedPresetId) || PRESET_CASES[0];
  const activeDivision = CRIME_DIVISIONS.find((d) => d.id === selectedCategory) || CRIME_DIVISIONS[0];

  const handleOpenStudio = (seed: string, name: string) => {
    soundEffects.playClick();
    setStudioSeed(seed);
    setStudioName(name);
    setStudioModalOpen(true);
  };

  const handleLaunchCase = () => {
    soundEffects.playTableSlam();
    onGenerateAiCase(selectedCategory, selectedLevel);
  };

  const cycleEmote = () => {
    soundEffects.playClick();
    const emotes: EmoteType[] = ["sweat", "panic", "angry", "question", "exclamation", "confident"];
    const nextIdx = (emotes.indexOf(demoEmote) + 1) % emotes.length;
    setDemoEmote(emotes[nextIdx]);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col items-center justify-center text-center py-2 px-3 font-rajdhani">
      {/* 1. TOP CAUTION BANNER */}
      <div className="w-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest py-1.5 px-3 rounded-t-2xl flex items-center justify-between border-2 border-amber-300 shadow-xl overflow-hidden select-none">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-slate-950 animate-bounce" />
          <span>🩸 CID MUSA SPECIAL INVESTIGATION DIVISION • REAL-TIME GEN AI INTERROGATION 🩸</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] bg-slate-950 text-amber-300 px-2.5 py-0.5 rounded-full font-mono font-bold border border-amber-400">
          <Radio className="w-3 h-3 text-red-500 animate-ping" /> LIVE AI SUSPECT SIMULATOR
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="w-full bg-slate-950/90 backdrop-blur-2xl border-x-2 border-b-2 border-amber-500/40 rounded-b-3xl p-4 md:p-6 shadow-2xl shadow-rose-950/50 mb-6 space-y-8">
        
        {/* HERO TITLE HEADER */}
        <div className="flex flex-col items-center">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
            <span className="text-amber-300 font-black tracking-widest text-[10px] md:text-xs uppercase px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center gap-1">
              <Fingerprint className="w-3.5 h-3.5 text-amber-400" /> OFFICIAL CID DETECTIVE HEADQUARTERS
            </span>
            <span className="text-rose-300 font-black tracking-widest text-[10px] md:text-xs uppercase px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-400" /> AI LIE DETECTOR ENGINE
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-200 to-red-500 tracking-wider uppercase drop-shadow-[0_5px_15px_rgba(225,29,72,0.5)] mb-1">
            GLITCH IN THE ALIBI
          </h1>
          <p className="text-amber-400 font-extrabold text-sm md:text-base uppercase tracking-widest mb-3">
            Search Crime Scenes • Find Evidence • Interrogate AI Suspects • Expose Liars
          </p>

          {/* Career Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 bg-black/80 px-4 py-2 rounded-2xl border border-rose-500/30 shadow-inner">
            <span className="text-amber-300 font-extrabold text-xs flex items-center gap-1">
              <Trophy className="w-4 h-4 text-amber-400" /> Rank: Level {currentLevel} Inspector
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-400 font-extrabold text-xs flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {detectiveStars} Detective Stars
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-cyan-300 font-extrabold text-xs flex items-center gap-1">
              <Target className="w-4 h-4 text-cyan-400" /> {completedCaseIds.length} Solved Murder Cases
            </span>
          </div>
        </div>

        {/* CINEMATIC ENTRANCE ANIMATION: DETECTIVE SILHOUETTE REVEAL & GREETING */}
        <DetectiveEntranceAnimation
          onStartGame={handleLaunchCase}
          isGenerating={isGenerating}
        />

        {/* SECTION 1: PROTAGONIST INTRODUCTION - YOU ARE CID MUSA */}
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-950 to-rose-950/80 p-5 rounded-2xl border-2 border-amber-400/40 text-left shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 font-black text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-widest flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-slate-950" /> MASTER DETECTIVE DOSSIER
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Detective Minifigure Avatar */}
            <div className="flex flex-col items-center justify-center">
              <div
                onClick={() => handleOpenStudio("CID_MUSA_HERO", "Officer CID Musa")}
                className="relative group cursor-pointer transform hover:scale-105 transition-all duration-300"
                title="Click to customize Officer CID Musa in 3D Character Studio"
              >
                <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-rose-600 via-amber-500 to-red-600 blur-md opacity-70 group-hover:opacity-100 animate-pulse" />
                <LegoAvatar
                  seedKey="CID_MUSA_HERO"
                  sizePx={90}
                  avatarMode="photo"
                  className="relative border-4 border-amber-300 shadow-2xl rounded-full"
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 to-rose-700 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-xl border border-rose-300 flex items-center gap-1 whitespace-nowrap">
                  <Sparkles className="w-3 h-3 text-amber-300" /> CHARACTER STUDIO
                </div>
              </div>
            </div>

            {/* Introduction Text */}
            <div className="md:col-span-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-300 font-mono font-bold bg-amber-500/20 px-2.5 py-0.5 rounded-md border border-amber-400/30">
                  PROTAGONIST PROFILE
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wide">
                  YOU ARE OFFICER CID MUSA
                </h2>
              </div>
              <p className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed">
                Welcome to the squad, Detective. You are <b className="text-amber-300">CID Musa</b>, India's most relentless lead investigator. From high-tech crypto heists to dark blood-poison murders, criminal masterminds build airtight, rehearsed alibis to fool the police.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-bold">
                <span className="bg-slate-900 text-amber-200 px-2.5 py-1 rounded-lg border border-amber-400/30 flex items-center gap-1">
                  🔍 Forensic Investigator
                </span>
                <span className="bg-slate-900 text-rose-200 px-2.5 py-1 rounded-lg border border-rose-400/30 flex items-center gap-1">
                  🎙️ AI Interrogator
                </span>
                <span className="bg-slate-900 text-cyan-200 px-2.5 py-1 rounded-lg border border-cyan-400/30 flex items-center gap-1">
                  ⚡ Contradiction Specialist
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: HOW THIS GAME WORKS (3-STEP TACTICAL FLOW) */}
        <div className="text-left">
          <div className="flex items-center justify-between mb-3 border-b border-rose-500/30 pb-2">
            <div className="flex items-center gap-2 text-rose-300 font-black text-sm uppercase tracking-wider">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>How This Game Works: 3-Step Investigation Pipeline</span>
            </div>
            <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
              GAMEPLAY MECHANICS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border-2 border-amber-400/30 space-y-2 relative overflow-hidden shadow-xl hover:border-amber-400 transition">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-amber-400 font-mono">01</span>
                <Search className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-black text-sm text-white uppercase tracking-wider">
                1. Inspect Crime Scene First
              </h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Before interrogating, you must enter the crime scene with your magnifying lens & UV scanner. Dig through search zones to uncover hidden evidence and physical hard facts!
              </p>
              <div className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2 py-1 rounded border border-amber-400/20">
                👜 Forensic Bag collects physical clues
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border-2 border-rose-500/30 space-y-2 relative overflow-hidden shadow-xl hover:border-rose-400 transition">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-rose-400 font-mono">02</span>
                <MessageSquareCode className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="font-black text-sm text-white uppercase tracking-wider">
                2. Real-Time AI Interrogation
              </h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Cross-examine suspect AI under the spotlight. Watch their dynamic <b className="text-cyan-300">Emote Badges</b> (sweat droplets, panic sparks, hostile frowns) react to your questions in real-time!
              </p>
              <div className="text-[10px] text-rose-300 font-bold bg-rose-500/10 px-2 py-1 rounded border border-rose-400/20">
                💬 Generative LLM responses
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border-2 border-emerald-500/30 space-y-2 relative overflow-hidden shadow-xl hover:border-emerald-400 transition">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-emerald-400 font-mono">03</span>
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-black text-sm text-white uppercase tracking-wider">
                3. Expose Lies & Make Arrest
              </h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Confront suspects with discovered crime scene facts. When their alibi breaks under pressure, their suspicion meter hits 100%. Handcuff the true killer and earn Detective Stars!
              </p>
              <div className="text-[10px] text-emerald-300 font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-400/20">
                🚨 Jail Cinematic & Career Level-Up
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: SELECT MYSTERY CASE */}
        <div className="text-left space-y-4">
          <div className="flex items-center justify-between border-b border-rose-500/30 pb-2">
            <div className="flex items-center gap-2 text-amber-300 font-black text-sm uppercase tracking-wider">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span>Step 1: Choose Your Mystery Investigation Case</span>
            </div>
            <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
              INFINITE PROCEDURAL CASES
            </span>
          </div>

          {/* Division Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CRIME_DIVISIONS.map((div) => {
              const IconComp = div.icon;
              const isSelected = div.id === selectedCategory;

              return (
                <button
                  key={div.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedCategory(div.id);
                  }}
                  className={`p-3.5 rounded-2xl text-left transition-all duration-300 border-2 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? `bg-gradient-to-br ${div.color} text-white shadow-xl ${div.glow} scale-[1.03] border-amber-300 ring-2 ring-amber-400/50`
                      : "bg-slate-900/90 border-slate-800 hover:border-rose-500/50 text-slate-300 hover:text-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-xl ${isSelected ? "bg-white/20 text-white" : "bg-slate-800 text-amber-400"}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/50 border border-white/20">
                        {div.badge}
                      </span>
                    </div>

                    <h3 className="font-black text-sm text-white mb-1 uppercase tracking-wide flex items-center gap-1">
                      {div.title}
                    </h3>
                    <p className="text-[11px] text-slate-200 leading-snug font-medium line-clamp-2 mb-2">
                      {div.description}
                    </p>
                  </div>

                  <div className="text-[10px] font-bold text-amber-300 font-mono uppercase border-t border-white/10 pt-1.5 flex items-center justify-between">
                    <span>{div.tagline}</span>
                    <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Difficulty Level Selector */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs font-black uppercase text-amber-200">Step 2: Case Difficulty Rating</div>
                <div className="text-[10px] text-slate-400 font-medium">Controls evidence hiding & suspect evasion tactics</div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {[
                { lvl: 1, label: "Rookie (4 Clues)" },
                { lvl: 2, label: "Inspector (3 Clues)" },
                { lvl: 3, label: "Master (2 Clues)" },
              ].map(({ lvl, label }) => (
                <button
                  key={lvl}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedLevel(lvl);
                  }}
                  className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-black uppercase transition border cursor-pointer ${
                    selectedLevel === lvl
                      ? "bg-amber-400 text-slate-950 border-amber-200 shadow-lg shadow-amber-400/40 font-extrabold"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:border-amber-400/50 hover:text-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Case Launch Button */}
          <button
            onClick={handleLaunchCase}
            disabled={isGenerating}
            className={`w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-slate-950 font-black text-base md:text-lg uppercase tracking-wider flex items-center justify-center gap-3 shadow-2xl shadow-rose-600/50 transition transform active:scale-95 disabled:opacity-50 cursor-pointer border-2 border-amber-300 group`}
          >
            {isGenerating ? (
              <Sparkles className="w-7 h-7 animate-spin text-slate-950" />
            ) : (
              <Play className="w-7 h-7 fill-slate-950 text-slate-950 group-hover:scale-110 transition" />
            )}
            <span>
              {isGenerating
                ? `Generating New ${activeDivision.title} Mystery...`
                : `🔥 Start Investigation: ${activeDivision.title}`}
            </span>
          </button>

          <p className="text-[11px] text-center text-amber-200/80 font-mono font-bold">
            ⚡ Search the Crime Scene for evidence first • Interrogate suspect AI in real-time
          </p>

          {/* Curated Archive Case Files */}
          <div className="pt-4 border-t border-rose-500/20 text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-amber-300 font-black text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Or Play Curated Archive Case Files (Instant Start)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {PRESET_CASES.length} Archive Files
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 mb-3">
              {PRESET_CASES.map((c) => {
                const isSelected = c.id === selectedPresetId;
                const isSolved = completedCaseIds.includes(c.id);

                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedPresetId(c.id);
                    }}
                    className={`p-3 rounded-2xl text-left transition border font-medium cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? "bg-amber-500/30 border-amber-400 text-white shadow-lg shadow-amber-500/30 scale-[1.02]"
                        : isSolved
                        ? "bg-slate-900/60 border-emerald-500/40 text-slate-300 hover:border-emerald-400/80"
                        : "bg-slate-900/90 border-slate-800 hover:border-amber-400/50 text-slate-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-black text-amber-300 mb-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        {c.city}
                      </span>
                      <span className="font-mono text-amber-400 text-[9px]">#{c.id}</span>
                    </div>
                    <div className="font-black text-xs truncate text-white">{c.victim}</div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-[10px] text-amber-200/80 font-semibold truncate">
                        {c.suspects[0]} vs {c.suspects[1]}
                      </div>
                      {isSolved && (
                        <span className="shrink-0 text-[8px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-500/50">
                          SOLVED ✓
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Archive Launch Box */}
            <div className="bg-slate-900/90 rounded-2xl p-3.5 border border-amber-400/30 flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
              <div className="flex items-center gap-3">
                <div
                  onClick={() => handleOpenStudio(activeCase.suspects[0] + activeCase.id, activeCase.suspects[0])}
                  className="cursor-pointer"
                  title="Inspect Minifigure Avatar in Character Studio"
                >
                  <LegoAvatar
                    seedKey={activeCase.suspects[0] + activeCase.id}
                    sizePx={44}
                    avatarMode="photo"
                    className="border-2 border-amber-400/80 shadow"
                  />
                </div>

                <div>
                  <div className="text-xs text-amber-300 font-black mb-0.5 flex items-center gap-1.5 uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Archive File • {activeCase.city} Mystery: {activeCase.victim}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium line-clamp-1">{activeCase.victim_detail}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  soundEffects.playTableSlam();
                  onSelectPreset(activeCase);
                }}
                className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg cursor-pointer shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                <span>Launch Archive Case #{activeCase.id}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Character Studio Modal */}
      <CharacterStudioModal
        isOpen={studioModalOpen}
        seedKey={studioSeed}
        characterName={studioName}
        onClose={() => setStudioModalOpen(false)}
      />
    </div>
  );
};
