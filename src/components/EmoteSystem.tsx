import React, { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Droplets,
  HelpCircle,
  AlertTriangle,
  Zap,
  Sparkles,
  Flame,
  Eye,
  Brain,
  AlertCircle,
  ShieldAlert,
  Frown,
  Meh,
  Smile,
  ShieldCheck,
} from "lucide-react";

export type EmoteType = "sweat" | "exclamation" | "question" | "panic" | "angry" | "confident" | "confused";

export interface EmoteConfig {
  type: EmoteType;
  label: string;
  badgeBg: string;
  borderColor: string;
  textColor: string;
  glowColor: string;
  icons: React.FC<{ className?: string }>[];
  symbols: string[];
}

interface EmoteSystemProps {
  responseContent?: string;
  suspicionScore?: number;
  isSpeaking?: boolean;
  expression?: "normal" | "nervous" | "angry";
  size?: "sm" | "md" | "lg";
  overrideEmote?: EmoteType;
  className?: string;
  showLabel?: boolean;
}

export const analyzeSentimentEmote = (
  text: string = "",
  suspicion: number = 0,
  expression: "normal" | "nervous" | "angry" = "normal"
): EmoteType => {
  const q = text.toLowerCase();

  // Check panic / sweating indicators
  if (
    q.includes("sweat") ||
    q.includes("twitch") ||
    q.includes("trembl") ||
    q.includes("stutter") ||
    q.includes("nervous") ||
    q.includes("glisters") ||
    q.includes("terrifi") ||
    q.includes("wait!") ||
    q.includes("what?!") ||
    q.includes("uh...") ||
    q.includes("nooo") ||
    expression === "nervous" && suspicion > 50
  ) {
    return "sweat";
  }

  // Check angry / defensive / aggressive indicators
  if (
    q.includes("grasping at straws") ||
    q.includes("twist my words") ||
    q.includes("shut up") ||
    q.includes("monster") ||
    q.includes("false") ||
    q.includes("intimidate") ||
    expression === "angry" ||
    suspicion >= 70
  ) {
    return "angry";
  }

  // Check panic / caught in contradiction
  if (
    q.includes("busted") ||
    q.includes("contradiction") ||
    q.includes("caught") ||
    q.includes("impossible") ||
    q.includes("slam")
  ) {
    return "panic";
  }

  // Check question / confusion
  if (
    q.includes("why are you") ||
    q.includes("what do you mean") ||
    q.includes("how could") ||
    q.includes("puzzled") ||
    q.includes("?") ||
    q.includes("phone") ||
    q.includes("nearby")
  ) {
    return "question";
  }

  // Check exclamation / guarded alert
  if (
    q.includes("alibi") ||
    q.includes("evidence") ||
    q.includes("prove") ||
    q.includes("clue") ||
    q.includes("never") ||
    suspicion >= 40
  ) {
    return "exclamation";
  }

  // Default confident or calm
  return "confident";
};

const EMOTE_MAP: Record<EmoteType, EmoteConfig> = {
  sweat: {
    type: "sweat",
    label: "Nervous Sweating",
    badgeBg: "bg-cyan-950/90",
    borderColor: "border-cyan-400",
    textColor: "text-cyan-300",
    glowColor: "shadow-cyan-500/50",
    icons: [Droplets, AlertCircle],
    symbols: ["💧", "💦"],
  },
  panic: {
    type: "panic",
    label: "Extreme Panic",
    badgeBg: "bg-red-950/90",
    borderColor: "border-red-500",
    textColor: "text-red-300",
    glowColor: "shadow-red-600/60",
    icons: [Zap, Flame],
    symbols: ["⚡", "😱"],
  },
  angry: {
    type: "angry",
    label: "Hostile & Defiant",
    badgeBg: "bg-rose-950/90",
    borderColor: "border-rose-500",
    textColor: "text-rose-200",
    glowColor: "shadow-rose-600/50",
    icons: [ShieldAlert, Frown],
    symbols: ["😠", "🔥"],
  },
  exclamation: {
    type: "exclamation",
    label: "High Alert / Startled",
    badgeBg: "bg-amber-950/90",
    borderColor: "border-amber-400",
    textColor: "text-amber-300",
    glowColor: "shadow-amber-500/50",
    icons: [AlertTriangle, Zap],
    symbols: ["❗", "⚡"],
  },
  question: {
    type: "question",
    label: "Confused & Defensive",
    badgeBg: "bg-purple-950/90",
    borderColor: "border-purple-400",
    textColor: "text-purple-300",
    glowColor: "shadow-purple-500/50",
    icons: [HelpCircle, Brain],
    symbols: ["❓", "🤔"],
  },
  confused: {
    type: "confused",
    label: "Baffled",
    badgeBg: "bg-indigo-950/90",
    borderColor: "border-indigo-400",
    textColor: "text-indigo-300",
    glowColor: "shadow-indigo-500/50",
    icons: [Eye, Meh],
    symbols: ["👁️", "❓"],
  },
  confident: {
    type: "confident",
    label: "Calm & Composed",
    badgeBg: "bg-emerald-950/90",
    borderColor: "border-emerald-400",
    textColor: "text-emerald-300",
    glowColor: "shadow-emerald-500/50",
    icons: [Sparkles, ShieldCheck],
    symbols: ["✨", "🛡️"],
  },
};

export const EmoteSystem: React.FC<EmoteSystemProps> = ({
  responseContent = "",
  suspicionScore = 0,
  isSpeaking = false,
  expression = "normal",
  size = "md",
  overrideEmote,
  className = "",
  showLabel = false,
}) => {
  const emoteType = useMemo(() => {
    if (overrideEmote) return overrideEmote;
    const validExpression: "normal" | "nervous" | "angry" =
      expression === "angry" || expression === "nervous" ? expression : "normal";
    return analyzeSentimentEmote(responseContent, suspicionScore, validExpression);
  }, [responseContent, suspicionScore, expression, overrideEmote]);

  const config = EMOTE_MAP[emoteType] || EMOTE_MAP.sweat;
  const PrimaryIcon = config.icons[0];
  const SecondaryIcon = config.icons[1];

  // Size configurations
  const sizeStyles = {
    sm: {
      badgePadding: "px-1.5 py-0.5",
      iconSize: "w-3 h-3",
      textSize: "text-[9px]",
      offset: "-top-2 -right-2",
    },
    md: {
      badgePadding: "px-2 py-1",
      iconSize: "w-3.5 h-3.5",
      textSize: "text-[10px]",
      offset: "-top-3 -right-3",
    },
    lg: {
      badgePadding: "px-2.5 py-1.5",
      iconSize: "w-4 h-4",
      textSize: "text-xs",
      offset: "-top-4 -right-4",
    },
  }[size];

  return (
    <AnimatePresence>
      <motion.div
        key={emoteType + (isSpeaking ? "_speaking" : "")}
        initial={{ scale: 0, y: 10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0, y: -10, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={`absolute ${sizeStyles.offset} z-30 pointer-events-auto ${className}`}
        title={`Suspect Mood: ${config.label}`}
      >
        <motion.div
          animate={{
            y: [0, -4, 0],
            scale: isSpeaking ? [1, 1.1, 1] : [1, 1.03, 1],
          }}
          transition={{
            duration: isSpeaking ? 0.8 : 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`flex items-center gap-1 ${sizeStyles.badgePadding} rounded-full border-2 ${config.borderColor} ${config.badgeBg} ${config.textColor} shadow-lg ${config.glowColor} backdrop-blur-md cursor-help`}
        >
          {/* Main Icon */}
          <PrimaryIcon className={`${sizeStyles.iconSize} animate-pulse`} />

          {/* Emoji / Symbol */}
          <span className={`${sizeStyles.textSize} font-black font-mono leading-none`}>
            {config.symbols[0]}
          </span>

          {/* Secondary Icon if larger */}
          {size !== "sm" && SecondaryIcon && (
            <SecondaryIcon className={`${sizeStyles.iconSize} opacity-80`} />
          )}

          {/* Optional Text Label */}
          {showLabel && (
            <span className={`${sizeStyles.textSize} font-black uppercase font-rajdhani tracking-wider ml-0.5`}>
              {config.label}
            </span>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
