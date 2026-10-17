import React, { useState } from "react";
import { LegoAvatar } from "./LegoAvatar";
import {
  Sparkles,
  X,
  RefreshCw,
  Image as ImageIcon,
  Palette,
  Shield,
  Zap,
  Smile,
  Frown,
  Meh,
} from "lucide-react";

interface CharacterStudioModalProps {
  isOpen: boolean;
  seedKey: string;
  characterName: string;
  characterRole?: string;
  initialExpression?: "normal" | "nervous" | "angry";
  onClose: () => void;
  onSelectAvatarSeed?: (newSeed: string) => void;
}

export const CharacterStudioModal: React.FC<CharacterStudioModalProps> = ({
  isOpen,
  seedKey,
  characterName,
  characterRole = "Suspect / Minifigure",
  initialExpression = "normal",
  onClose,
  onSelectAvatarSeed,
}) => {
  const [activeSeed, setActiveSeed] = useState(seedKey);
  const [avatarMode, setAvatarMode] = useState<"photo" | "dicebear" | "svg">("photo");
  const [expression, setExpression] = useState<"normal" | "nervous" | "angry">(
    initialExpression
  );

  if (!isOpen) return null;

  const handleRandomizeSeed = () => {
    const randomSuffix = Math.floor(Math.random() * 10000);
    const newSeed = `${characterName}_${randomSuffix}`;
    setActiveSeed(newSeed);
    if (onSelectAvatarSeed) {
      onSelectAvatarSeed(newSeed);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-900 border-2 border-amber-400/50 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">LEGO Minifigure Character Studio</h3>
              <p className="text-[10px] text-amber-300 font-mono font-bold uppercase">
                Image Synthesis & Avatar Generator
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Character Avatar Stage */}
        <div className="flex flex-col items-center justify-center space-y-3 bg-slate-950/80 p-5 rounded-2xl border-2 border-purple-400/30">
          <LegoAvatar
            seedKey={activeSeed}
            sizePx={128}
            expression={expression}
            avatarMode={avatarMode}
            showExpressionBadge={true}
            className="border-4 border-amber-400 shadow-2xl"
          />

          <div className="text-center">
            <div className="font-black text-lg text-white">{characterName}</div>
            <div className="text-xs text-purple-200 font-bold">{characterRole}</div>
            <div className="text-[10px] text-amber-300/80 font-mono mt-1">
              Seed: <b className="text-white">{activeSeed}</b>
            </div>
          </div>
        </div>

        {/* Avatar Rendering Mode Selector */}
        <div className="space-y-2">
          <label className="text-xs font-black text-amber-300 uppercase tracking-wider block">
            Select Render Engine / External Image API:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setAvatarMode("photo")}
              className={`p-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                avatarMode === "photo"
                  ? "bg-amber-400 text-slate-950 border-amber-300 shadow-lg"
                  : "bg-slate-900 text-purple-200 border-white/10 hover:border-purple-400"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Unsplash LEGO</span>
            </button>

            <button
              onClick={() => setAvatarMode("dicebear")}
              className={`p-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                avatarMode === "dicebear"
                  ? "bg-cyan-400 text-slate-950 border-cyan-300 shadow-lg"
                  : "bg-slate-900 text-purple-200 border-white/10 hover:border-purple-400"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>DiceBear Synth</span>
            </button>

            <button
              onClick={() => setAvatarMode("svg")}
              className={`p-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                avatarMode === "svg"
                  ? "bg-purple-600 text-white border-purple-400 shadow-lg"
                  : "bg-slate-900 text-purple-200 border-white/10 hover:border-purple-400"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Vector LEGO</span>
            </button>
          </div>
        </div>

        {/* Expression State Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-black text-amber-300 uppercase tracking-wider block">
            Set Minifigure Expression State:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setExpression("normal")}
              className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                expression === "normal"
                  ? "bg-emerald-500 text-white border-emerald-300"
                  : "bg-slate-900 text-slate-300 border-white/10"
              }`}
            >
              <Smile className="w-4 h-4 text-emerald-300" />
              <span>Calm / Smile</span>
            </button>

            <button
              onClick={() => setExpression("nervous")}
              className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                expression === "nervous"
                  ? "bg-amber-500 text-slate-950 border-amber-300 font-black"
                  : "bg-slate-900 text-slate-300 border-white/10"
              }`}
            >
              <Meh className="w-4 h-4" />
              <span>Nervous</span>
            </button>

            <button
              onClick={() => setExpression("angry")}
              className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                expression === "angry"
                  ? "bg-rose-600 text-white border-rose-400 font-black"
                  : "bg-slate-900 text-slate-300 border-white/10"
              }`}
            >
              <Frown className="w-4 h-4 text-rose-300" />
              <span>Angry / Guilty</span>
            </button>
          </div>
        </div>

        {/* Randomize Seed & Confirm Actions */}
        <div className="pt-2 flex gap-3">
          <button
            onClick={handleRandomizeSeed}
            className="flex-1 py-3 px-4 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 hover:text-white font-extrabold text-xs flex items-center justify-center gap-2 border border-purple-400/40 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-amber-300" />
            <span>Synthesize New Seed</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-400/30 transition cursor-pointer"
          >
            <Shield className="w-4 h-4 text-slate-950" />
            <span>Apply Character</span>
          </button>
        </div>
      </div>
    </div>
  );
};
