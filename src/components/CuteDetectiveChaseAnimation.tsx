import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LegoAvatar } from "./LegoAvatar";
import { soundEffects } from "../utils/audio";
import {
  Skull,
  Ghost,
  Biohazard,
  Eye,
  Cpu,
  Search,
  Zap,
  Sparkles,
  Siren,
  CheckCircle2,
  RotateCcw,
  Footprints,
  Radio,
  Fingerprint,
  ShieldAlert
} from "lucide-react";

export interface KillerProfile {
  id: string;
  name: string;
  type: string;
  seed: string;
  icon: any;
  crime: string;
  excuse: string;
  evidence: string;
  bustedQuote: string;
  badgeColor: string;
}

const KILLER_PROFILES: KillerProfile[] = [
  {
    id: "barista_vicky",
    name: "Barista Vicky",
    type: "Cyanide Poisoner",
    seed: "BARISTA_VICKY_KILLER",
    icon: Skull,
    crime: "Laced the specialty filter coffee with refined potassium cyanide powder.",
    excuse: "I was only caramelizing the dark brew at 10 PM. Check the espresso counter!",
    evidence: "☕ Cyanide-dusted filter cup & fractured poison vial recovered from disposal.",
    bustedQuote: "Imperect trace cleanup... how did you isolate the cyanic residues?!",
    badgeColor: "from-rose-600 to-red-800 text-rose-200 border-rose-400",
  },
  {
    id: "phantom_prof",
    name: "Professor Vane",
    type: "Acoustic Phantom",
    seed: "PHANTOM_GHOST_KILLER",
    icon: Ghost,
    crime: "Deployed ultrasonic emitter arrays & holographic projection masks in the estate.",
    excuse: "I was conducting an acoustic reverberation study at midnight.",
    evidence: "👻 Ultrasonic projector rig & hidden fog canisters in leather satchel.",
    bustedQuote: "Curses... my ultrasonic frequency broadcast log exposed the transmitter!",
    badgeColor: "from-purple-600 to-indigo-900 text-purple-200 border-purple-400",
  },
  {
    id: "dr_mutant",
    name: "Dr. Z-Virus",
    type: "Bio-Lab Saboteur",
    seed: "DR_MUTANT_ZOMBIE",
    icon: Biohazard,
    crime: "Breached the primary bio-containment airlock and released viral neuro-parasites.",
    excuse: "The airlock pressure seal malfunctioned during maintenance.",
    evidence: "☣️ Severed airlock latch & unauthorized bio-hazard security override.",
    bustedQuote: "You cross-referenced the biometric access logs against the airlock alarm!",
    badgeColor: "from-emerald-600 to-lime-900 text-lime-200 border-lime-400",
  },
  {
    id: "shadow_stalker",
    name: "The Shadow Operative",
    type: "Creepy Stalker",
    seed: "MIDNIGHT_STALKER",
    icon: Eye,
    crime: "Infiltrated private quarters, leaving crimson glyphs & covert recording arrays.",
    excuse: "I was taking night-exposure architectural photography from the street.",
    evidence: "📼 High-gain telephoto optics & red acrylic paint spray cans.",
    bustedQuote: "The optical reflection in the mirror... you calculated my exact focal distance!",
    badgeColor: "from-red-700 to-stone-950 text-rose-300 border-red-500",
  },
  {
    id: "crypto_hacker",
    name: "Satoshi X",
    type: "Cyber Heist Operative",
    seed: "CYBER_HACKER_KILLER",
    icon: Cpu,
    crime: "Exfiltrated $12M from multi-sig vault wallets & forced server room thermal shutdown.",
    excuse: "I was executing an authorized penetration test on the server rack.",
    evidence: "💻 Hardware cold wallet with embedded keylogger hardware bypass.",
    bustedQuote: "Fatal mistake... my zero-knowledge trace route left an IP timestamp!",
    badgeColor: "from-cyan-600 to-slate-900 text-cyan-200 border-cyan-400",
  },
];

export const CuteDetectiveChaseAnimation: React.FC = () => {
  const [selectedKillerIdx, setSelectedKillerIdx] = useState(0);
  const [isCaught, setIsCaught] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(true);
  const [showClueModal, setShowClueModal] = useState(false);
  const [speechBubbleText, setSpeechBubbleText] = useState("");

  const activeKiller = KILLER_PROFILES[selectedKillerIdx];

  // Speech bubble rotation
  useEffect(() => {
    if (isCaught) {
      setSpeechBubbleText(`"${activeKiller.bustedQuote}"`);
      return;
    }

    const quotes = [
      `"${activeKiller.excuse}"`,
      `"Your physical evidence is purely circumstantial, Inspector."`,
      `"My timeline is verified by CCTV... check again!"`,
      `"CID Musa, you have no solid link to this crime scene."`,
    ];

    let qIdx = 0;
    setSpeechBubbleText(quotes[0]);

    const interval = setInterval(() => {
      qIdx = (qIdx + 1) % quotes.length;
      setSpeechBubbleText(quotes[qIdx]);
    }, 3800);

    return () => clearInterval(interval);
  }, [selectedKillerIdx, isCaught]);

  const handleCatchKiller = () => {
    if (isCaught) return;
    soundEffects.playSirenSound();
    soundEffects.playTableSlam();
    setIsCaught(true);
  };

  const handleResetChase = () => {
    soundEffects.playClick();
    setIsCaught(false);
  };

  const handleCycleKiller = () => {
    soundEffects.playClick();
    setIsCaught(false);
    setSelectedKillerIdx((prev) => (prev + 1) % KILLER_PROFILES.length);
  };

  const handleToggleSpotlight = () => {
    soundEffects.playEvidenceScan();
    setShowSpotlight((prev) => !prev);
  };

  const handleExamineClue = () => {
    soundEffects.playContradictionBoom();
    setShowClueModal((prev) => !prev);
  };

  const KillerIcon = activeKiller.icon;

  return (
    <div className="w-full bg-slate-950/95 border-2 border-red-600/60 rounded-3xl p-4 md:p-6 mb-6 shadow-[0_0_40px_rgba(225,29,72,0.3)] relative overflow-hidden text-left font-rajdhani">
      {/* Background Animated Glow Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/40 via-slate-950/80 to-black pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-red-500/30 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-red-600/30 border border-red-500/50 text-red-400 animate-pulse">
            <Siren className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <span>CID SPECIAL TACTICAL SIMULATOR</span>
              <span className="text-[10px] bg-red-600 text-white font-mono px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                LIVE INTERROGATION
              </span>
            </h2>
            <p className="text-xs text-rose-200/80 font-medium">
              Confront live suspects, sweep for evidence, and execute tactical arrests.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCycleKiller}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-black uppercase border border-amber-400/40 flex items-center gap-1.5 transition cursor-pointer"
            title="Cycle Suspect Target"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Target ({selectedKillerIdx + 1}/{KILLER_PROFILES.length})</span>
          </button>
        </div>
      </div>

      {/* ANIMATED CHASE STAGE */}
      <div className="relative z-10 w-full h-64 md:h-72 rounded-2xl bg-gradient-to-b from-stone-950 via-slate-950 to-neutral-950 border-2 border-red-500/40 overflow-hidden shadow-2xl flex items-center justify-center">
        
        {/* Animated Night City Skyline Background */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />

        {/* Dynamic Scanning Spotlight */}
        {showSpotlight && (
          <motion.div
            animate={{
              x: [-150, 150, -150],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-0 w-48 h-full bg-gradient-to-b from-amber-300/30 via-amber-400/10 to-transparent blur-md pointer-events-none transform -skew-x-12"
          />
        )}

        {/* Crime Scene Tape Overlay */}
        <div className="absolute top-2 left-0 right-0 bg-amber-400/90 text-slate-950 font-black text-[9px] uppercase tracking-widest py-0.5 px-4 rotate-[-1deg] shadow-lg border-y border-slate-950 flex items-center justify-between select-none opacity-90">
          <span>CRIME SCENE DO NOT CROSS • CID MUSA SPECIAL UNIT</span>
          <span>EVIDENCE RECORD #{activeKiller.id.toUpperCase()}</span>
        </div>

        {/* Ground Cobblestone Line */}
        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-stone-900 to-black border-t-2 border-amber-500/30 flex items-center justify-around">
          {/* Blood Footprints / Clue Marker */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            onClick={handleExamineClue}
            className="flex items-center gap-1.5 text-red-500 cursor-pointer bg-black/80 px-2.5 py-1 rounded-full border border-red-500/50 hover:bg-red-950/80 transition"
            title="Examine Physical Evidence"
          >
            <Footprints className="w-4 h-4 text-red-500" />
            <span className="text-[10px] font-mono font-bold text-rose-200 uppercase">
              Inspect {activeKiller.type} Clue
            </span>
          </motion.div>
        </div>

        {/* STAGE CHARACTER 1: DETECTIVE CID MUSA */}
        <motion.div
          animate={
            isCaught
              ? { x: [0, 80, 70], y: [0, -8, 0] }
              : { x: [-120, -80, -120], y: [0, -4, 0] }
          }
          transition={
            isCaught
              ? { duration: 0.5, ease: "easeOut" }
              : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
          }
          className="absolute bottom-10 left-1/3 flex flex-col items-center z-20"
        >
          {/* Detective Speech Bubble */}
          <div className="bg-amber-300 text-slate-950 font-black text-[11px] px-3 py-1 rounded-xl shadow-xl border-2 border-slate-950 mb-2 relative max-w-[170px] text-center uppercase tracking-wide">
            {isCaught ? "CONTRADICTION DETECTED." : "STATE YOUR ALIBI."}
            <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-amber-300 rotate-45 border-r-2 border-b-2 border-slate-950" />
          </div>

          <div className="relative">
            <LegoAvatar
              seedKey="CID_MUSA_HERO"
              sizePx={72}
              avatarMode="photo"
              className="border-4 border-amber-300 shadow-2xl rounded-2xl"
              isSpeaking={!isCaught}
            />
            {/* Flashlight beam */}
            <div className="absolute top-4 -right-12 w-16 h-8 bg-gradient-to-r from-amber-300/80 to-transparent blur-sm transform -rotate-12 pointer-events-none" />
          </div>

          <span className="mt-1 text-[10px] font-black uppercase text-amber-300 bg-black/80 px-2 py-0.5 rounded border border-amber-400">
            Inspector CID Musa
          </span>
        </motion.div>

        {/* STAGE CHARACTER 2: THE SUSPECT */}
        <motion.div
          animate={
            isCaught
              ? { scale: [1, 1.05, 1], rotate: [0, -3, 3, 0] }
              : { x: [60, 100, 60], y: [0, -6, 0] }
          }
          transition={{
            duration: isCaught ? 0.4 : 2,
            repeat: isCaught ? 0 : Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-10 right-1/3 flex flex-col items-center z-20"
        >
          {/* Suspect Speech Bubble */}
          <AnimatePresence mode="wait">
            <motion.div
              key={speechBubbleText}
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`text-[11px] font-black px-3 py-1 rounded-xl shadow-xl border-2 mb-2 relative max-w-[190px] text-center tracking-wide ${
                isCaught
                  ? "bg-red-700 text-white border-amber-300 font-extrabold"
                  : "bg-slate-900 text-rose-200 border-red-500 font-semibold"
              }`}
            >
              {speechBubbleText}
              <div
                className={`absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 border-r-2 border-b-2 ${
                  isCaught
                    ? "bg-red-700 border-amber-300"
                    : "bg-slate-900 border-red-500"
                }`}
              />
            </motion.div>
          </AnimatePresence>

          <div className="relative">
            <LegoAvatar
              seedKey={activeKiller.seed}
              sizePx={72}
              expression={isCaught ? "nervous" : "angry"}
              avatarMode="photo"
              className={`border-4 shadow-2xl rounded-2xl ${
                isCaught ? "border-red-500 ring-4 ring-red-500/50" : "border-slate-700"
              }`}
            />

            {/* Arrest Overlay */}
            {isCaught && (
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute inset-0 bg-red-950/85 rounded-2xl border-2 border-amber-400 flex items-center justify-center text-white font-black text-[11px] uppercase tracking-widest text-center p-1"
              >
                <span>ARRESTED IN CUSTODY</span>
              </motion.div>
            )}
          </div>

          <div className="mt-1 flex items-center gap-1 bg-black/80 px-2 py-0.5 rounded border border-red-500">
            <KillerIcon className="w-3 h-3 text-red-400" />
            <span className="text-[10px] font-black uppercase text-rose-200">
              {activeKiller.name}
            </span>
          </div>
        </motion.div>

        {/* Arrest Confirmation Badge */}
        {isCaught && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center z-30"
          >
            <div className="bg-red-950/95 border-2 border-amber-400 text-white font-black text-lg md:text-xl px-6 py-2.5 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.8)] flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-amber-300" />
              <span>CONTRADICTION PROVEN • TARGET IN CUSTODY</span>
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
          </motion.div>
        )}
      </div>

      {/* ACTION CONTROLS */}
      <div className="relative z-10 mt-4 grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {!isCaught ? (
          <button
            onClick={handleCatchKiller}
            className="col-span-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-slate-950 font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-rose-600/40 transition transform active:scale-95 cursor-pointer border-2 border-amber-300"
          >
            <Siren className="w-4 h-4 text-slate-950 animate-bounce" />
            <span>CONFRONT & ARREST {activeKiller.name.toUpperCase()}</span>
          </button>
        ) : (
          <button
            onClick={handleResetChase}
            className="col-span-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition transform active:scale-95 cursor-pointer border-2 border-emerald-300"
          >
            <RotateCcw className="w-4 h-4 text-white" />
            <span>RESET TACTICAL SIMULATOR</span>
          </button>
        )}

        <button
          onClick={handleToggleSpotlight}
          className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs uppercase tracking-wider border border-amber-400/40 flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>{showSpotlight ? "Spotlight ON" : "Spotlight OFF"}</span>
        </button>

        <button
          onClick={handleExamineClue}
          className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 font-extrabold text-xs uppercase tracking-wider border border-red-500/40 flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-red-400" />
          <span>Inspect Evidence</span>
        </button>
      </div>

      {/* CLUE MODAL POPOVER */}
      {showClueModal && (
        <div className="relative z-20 mt-4 bg-slate-900 p-4 rounded-2xl border-2 border-amber-400 text-left shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
              <Fingerprint className="w-4 h-4 text-amber-400" />
              <span>FORENSIC DOSSIER #{activeKiller.id.toUpperCase()}</span>
            </span>
            <button
              onClick={() => setShowClueModal(false)}
              className="text-xs font-mono text-slate-400 hover:text-white underline cursor-pointer"
            >
              Close [X]
            </button>
          </div>

          <div className="p-3 bg-black/80 rounded-xl border border-slate-800 text-xs text-rose-200 font-medium space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold">
              <KillerIcon className="w-4 h-4 text-amber-400" />
              <span>Investigation Classification: {activeKiller.type}</span>
            </div>
            <p className="text-amber-200">
              <strong className="text-amber-400">Modus Operandi:</strong> {activeKiller.crime}
            </p>
            <p className="text-rose-300">
              <strong className="text-red-400">Physical Evidence:</strong> {activeKiller.evidence}
            </p>
            <p className="text-emerald-300 italic">
              <strong className="text-emerald-400">Suspect's Alibi Statement:</strong> "{activeKiller.excuse}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
