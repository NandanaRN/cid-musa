import React, { useState } from "react";
import { motion } from "motion/react";
import {
  generateAvatarSVG,
  getLegoAvatarPhotoUrl,
  getLegoAvatarDicebearUrl,
} from "../utils/avatar";

export interface LegoAvatarProps {
  seedKey: string;
  sizePx?: number;
  expression?: "normal" | "nervous" | "angry";
  avatarMode?: "photo" | "svg" | "dicebear";
  className?: string;
  onClick?: () => void;
  showExpressionBadge?: boolean;
  isSpeaking?: boolean;
}

export const LegoAvatar: React.FC<LegoAvatarProps> = ({
  seedKey,
  sizePx = 64,
  expression = "normal",
  avatarMode = "photo",
  className = "",
  onClick,
  showExpressionBadge = false,
  isSpeaking = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const [mode, setMode] = useState<"photo" | "svg" | "dicebear">(avatarMode);

  // Expression emoji icon
  const exprEmoji =
    expression === "angry" ? "😡" : expression === "nervous" ? "😰" : "😄";

  const photoUrl = getLegoAvatarPhotoUrl(seedKey);
  const dicebearUrl = getLegoAvatarDicebearUrl(seedKey);
  const svgMarkup = generateAvatarSVG(seedKey, sizePx, expression as "normal" | "nervous" | "angry");

  // Motion variants according to suspect mood & dialogue activity
  const getMotionAnimation = () => {
    if (isSpeaking) {
      return {
        y: [0, -6, 0, -3, 0],
        rotate: [0, -3, 3, -2, 0],
        scale: [1, 1.05, 1],
        transition: {
          duration: 0.6,
          repeat: Infinity,
          ease: "easeInOut",
        },
      };
    }

    if (expression === "nervous") {
      return {
        x: [-2, 2, -3, 3, -1, 1, 0],
        y: [0, 1, -1, 0],
        transition: {
          duration: 0.8,
          repeat: Infinity,
          repeatDelay: 1.2,
          ease: "linear",
        },
      };
    }

    if (expression === "angry") {
      return {
        scale: [1, 1.04, 1],
        rotate: [-1.5, 1.5, -1.5],
        transition: {
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 2,
          ease: "easeInOut",
        },
      };
    }

    // Normal breathing
    return {
      y: [0, -3, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    };
  };

  return (
    <motion.div
      onClick={onClick}
      style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
      animate={getMotionAnimation()}
      className={`relative rounded-2xl overflow-hidden border-2 border-amber-300/80 bg-gradient-to-br from-indigo-900 to-purple-950 shadow-lg flex items-center justify-center shrink-0 select-none ${
        onClick ? "cursor-pointer hover:border-amber-400" : ""
      } ${className}`}
      title={`Lego Minifigure Avatar: ${seedKey}`}
    >
      {/* Photo Mode using Unsplash Lego API */}
      {mode === "photo" && !imgError ? (
        <img
          src={photoUrl}
          alt={`Lego Minifigure ${seedKey}`}
          referrerPolicy="no-referrer"
          onError={() => {
            setImgError(true);
            setMode("svg");
          }}
          className="w-full h-full object-cover rounded-2xl transition duration-300"
        />
      ) : mode === "dicebear" && !imgError ? (
        <img
          src={dicebearUrl}
          alt={`Lego Synthesized ${seedKey}`}
          referrerPolicy="no-referrer"
          onError={() => {
            setImgError(true);
            setMode("svg");
          }}
          className="w-full h-full object-contain p-1"
        />
      ) : (
        /* Vector SVG Mode */
        <div
          className="w-full h-full flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      )}

      {/* Speaking Indicator Glow Ring */}
      {isSpeaking && (
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="absolute inset-0 rounded-2xl border-2 border-amber-400 pointer-events-none shadow-[0_0_15px_rgba(251,191,36,0.8)]"
        />
      )}

      {/* Optional Expression Badge Overlay */}
      {showExpressionBadge && (
        <div className="absolute -bottom-1 -right-1 bg-slate-950/90 text-xs px-1.5 py-0.5 rounded-full border border-amber-300/80 shadow-md">
          {exprEmoji}
        </div>
      )}

      {/* Top Stud Accent overlay */}
      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-amber-400/40 rounded-t-sm pointer-events-none" />
    </motion.div>
  );
};

