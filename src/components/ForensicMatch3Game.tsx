import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CaseData, EvidenceItem } from "../types";
import { soundEffects } from "../utils/audio";
import { DigitalShatterOverlay, DigitalShatterHandle } from "./DigitalShatterOverlay";
import {
  Trophy,
  Sparkles,
  Zap,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Award,
  Flame,
  Volume2,
  PartyPopper,
  AlertTriangle,
  Plus
} from "lucide-react";

interface ForensicMatch3GameProps {
  caseData: CaseData;
  evidenceFoundIds: string[];
  onUnlockEvidence: (item: EvidenceItem) => void;
  onProceedToInterrogation: () => void;
}

type TileType = "magnifier" | "blood" | "fingerprint" | "vial" | "badge" | "evidence_lock";

interface Tile {
  id: string;
  type: TileType;
  row: number;
  col: number;
  isMatched?: boolean;
  isNew?: boolean;
}

const GRID_SIZE = 6;

const TILE_TYPES: TileType[] = [
  "magnifier",
  "blood",
  "fingerprint",
  "vial",
  "badge",
  "evidence_lock",
];

const TILE_CONFIG: Record<
  TileType,
  { label: string; icon: string; bg: string; border: string; text: string; glow: string }
> = {
  magnifier: {
    label: "Magnifier",
    icon: "🔍",
    bg: "bg-amber-500/20 hover:bg-amber-500/40",
    border: "border-amber-400/80",
    text: "text-amber-300",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.5)]",
  },
  blood: {
    label: "Blood Trace",
    icon: "🩸",
    bg: "bg-rose-500/20 hover:bg-rose-500/40",
    border: "border-rose-400/80",
    text: "text-rose-300",
    glow: "shadow-[0_0_15px_rgba(244,63,94,0.5)]",
  },
  fingerprint: {
    label: "Fingerprint",
    icon: "🖐️",
    bg: "bg-cyan-500/20 hover:bg-cyan-500/40",
    border: "border-cyan-400/80",
    text: "text-cyan-300",
    glow: "shadow-[0_0_15px_rgba(6,182,212,0.5)]",
  },
  vial: {
    label: "Toxin Vial",
    icon: "🧪",
    bg: "bg-purple-500/20 hover:bg-purple-500/40",
    border: "border-purple-400/80",
    text: "text-purple-300",
    glow: "shadow-[0_0_15px_rgba(168,85,247,0.5)]",
  },
  badge: {
    label: "CID Badge",
    icon: "🛡️",
    bg: "bg-yellow-500/20 hover:bg-yellow-500/40",
    border: "border-yellow-300/80",
    text: "text-yellow-200",
    glow: "shadow-[0_0_15px_rgba(234,179,8,0.5)]",
  },
  evidence_lock: {
    label: "Evidence Clue",
    icon: "💎",
    bg: "bg-emerald-500/25 hover:bg-emerald-500/45",
    border: "border-emerald-300",
    text: "text-emerald-200",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.7)]",
  },
};

// Distinct shapes for different evidence items (Candy Crush style)
const DISTINCT_EVIDENCE_SHAPES = [
  { icon: "🔑", name: "Brass Cipher Key", bg: "bg-amber-500/30 hover:bg-amber-500/50", border: "border-amber-300", text: "text-amber-200" },
  { icon: "🧬", name: "DNA Double Helix", bg: "bg-cyan-500/30 hover:bg-cyan-500/50", border: "border-cyan-300", text: "text-cyan-200" },
  { icon: "🧪", name: "Toxin Specimen", bg: "bg-purple-500/30 hover:bg-purple-500/50", border: "border-purple-300", text: "text-purple-200" },
  { icon: "📜", name: "Secret Document", bg: "bg-yellow-500/30 hover:bg-yellow-500/50", border: "border-yellow-200", text: "text-yellow-100" },
  { icon: "🧭", name: "Scene Navigator", bg: "bg-rose-500/30 hover:bg-rose-500/50", border: "border-rose-300", text: "text-rose-200" },
  { icon: "💎", name: "Cyanide Crystal", bg: "bg-emerald-500/30 hover:bg-emerald-500/50", border: "border-emerald-300", text: "text-emerald-200" },
];

export const ForensicMatch3Game: React.FC<ForensicMatch3GameProps> = ({
  caseData,
  evidenceFoundIds,
  onUnlockEvidence,
  onProceedToInterrogation,
}) => {
  const [board, setBoard] = useState<Tile[][]>([]);
  const [selectedTile, setSelectedTile] = useState<{ row: number; col: number } | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [moves, setMoves] = useState(50);
  const [maxMoves] = useState(50);
  const [comboMessage, setComboMessage] = useState<string | null>(null);
  const [unlockedNotice, setUnlockedNotice] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [showSugarRushModal, setShowSugarRushModal] = useState(false);
  const [bonusScore, setBonusScore] = useState(0);
  const shatterRef = useRef<DigitalShatterHandle | null>(null);

  // Remaining uncollected case evidence
  const uncollectedEvidence = caseData.evidence.filter(
    (ev) => !evidenceFoundIds.includes(ev.id)
  );
  const collectedCount = caseData.evidence.length - uncollectedEvidence.length;
  const totalEvidenceCount = caseData.evidence.length;

  // Candy Crush Victory Rush Effect Trigger
  useEffect(() => {
    if (totalEvidenceCount > 0 && collectedCount === totalEvidenceCount && !showSugarRushModal) {
      setShowSugarRushModal(true);
      soundEffects.playVictoryFanfare();
      const calculatedBonus = moves * 500;
      setBonusScore(calculatedBonus);
      setScore((prev) => prev + calculatedBonus);

      // Trigger celebratory particle explosions
      shatterRef.current?.triggerShatter(50, 40, "🍬 SUGAR RUSH! ALL CLUES FOUND!");
      setTimeout(() => {
        shatterRef.current?.triggerShatter(25, 60, "💥 CASE SOLVED!");
        shatterRef.current?.triggerShatter(75, 60, "🏆 STAGE CLEAR!");
      }, 500);
    }
  }, [collectedCount, totalEvidenceCount, moves, showSugarRushModal]);

  // Helper to generate a random tile
  const getRandomTileType = (): TileType => {
    return TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
  };

  // Create initial grid without initial 3-matches
  const createInitialBoard = (): Tile[][] => {
    let newBoard: Tile[][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      newBoard[r] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        let type = getRandomTileType();
        // Avoid initial 3-in-a-row or 3-in-a-col
        while (
          (c >= 2 && newBoard[r][c - 1]?.type === type && newBoard[r][c - 2]?.type === type) ||
          (r >= 2 && newBoard[r - 1][c]?.type === type && newBoard[r - 2][c]?.type === type)
        ) {
          type = getRandomTileType();
        }
        newBoard[r][c] = {
          id: `tile_${r}_${c}_${Math.random()}`,
          type,
          row: r,
          col: c,
        };
      }
    }
    return newBoard;
  };

  // Initialize board
  useEffect(() => {
    setBoard(createInitialBoard());
  }, [caseData]);

  // Find all matches on board
  const findMatches = (currentBoard: Tile[][]): { row: number; col: number }[] => {
    const matchedCoords = new Set<string>();

    // Horizontal check
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE - 2; c++) {
        const type = currentBoard[r][c].type;
        if (
          type &&
          currentBoard[r][c + 1]?.type === type &&
          currentBoard[r][c + 2]?.type === type
        ) {
          matchedCoords.add(`${r},${c}`);
          matchedCoords.add(`${r},${c + 1}`);
          matchedCoords.add(`${r},${c + 2}`);
        }
      }
    }

    // Vertical check
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = 0; r < GRID_SIZE - 2; r++) {
        const type = currentBoard[r][c].type;
        if (
          type &&
          currentBoard[r + 1][c]?.type === type &&
          currentBoard[r + 2][c]?.type === type
        ) {
          matchedCoords.add(`${r},${c}`);
          matchedCoords.add(`${r + 1},${c}`);
          matchedCoords.add(`${r + 2},${c}`);
        }
      }
    }

    return Array.from(matchedCoords).map((str) => {
      const [r, c] = str.split(",").map(Number);
      return { row: r, col: c };
    });
  };

  // Trigger evidence unlock logic when score milestones or evidence matches occur
  const triggerEvidenceReward = () => {
    const remaining = caseData.evidence.filter((ev) => !evidenceFoundIds.includes(ev.id));
    if (remaining.length > 0) {
      const itemToUnlock = remaining[0];
      onUnlockEvidence(itemToUnlock);
      soundEffects.playEvidenceScan();
      shatterRef.current?.triggerShatter(50, 45, "⚡ EVIDENCE DISCOVERED!");
      setUnlockedNotice(`🎉 CLUE DISCOVERED: ${itemToUnlock.name.toUpperCase()}!`);
      setTimeout(() => setUnlockedNotice(null), 3500);
    }
  };

  // Process matches and drop cascade
  const processMatchesAndCascade = async (
    startBoard: Tile[][],
    currentCombo = 1
  ): Promise<void> => {
    const matches = findMatches(startBoard);
    if (matches.length === 0) {
      setIsBusy(false);
      setCombo(1);
      return;
    }

    // Play match audio & trigger digital shattering effect overlay
    soundEffects.playEvidenceScan();

    // Calculate approximate center position of matched tiles for shatter burst
    let sumCol = 0;
    let sumRow = 0;
    matches.forEach((m) => {
      sumCol += m.col;
      sumRow += m.row;
    });
    const avgColPercent = 20 + (sumCol / matches.length / (GRID_SIZE - 1)) * 60;
    const avgRowPercent = 25 + (sumRow / matches.length / (GRID_SIZE - 1)) * 55;

    shatterRef.current?.triggerShatter(
      avgColPercent,
      avgRowPercent,
      currentCombo > 1 ? `💥 x${currentCombo} DIGITAL SHATTER!` : "💥 FORENSIC MATCH!"
    );

    // Check if evidence lock tile was in matches
    const matchedEvidenceLock = matches.some(
      (m) => startBoard[m.row][m.col]?.type === "evidence_lock"
    );

    // Calculate score
    const pointsGained = matches.length * 100 * currentCombo;
    setScore((prev) => {
      const nextScore = prev + pointsGained;
      // Unlock evidence every 100 points or on evidence_lock match or any match
      if (matchedEvidenceLock || Math.floor(nextScore / 100) > Math.floor(prev / 100) || pointsGained > 0) {
        triggerEvidenceReward();
      }
      return nextScore;
    });

    // Display combo message
    if (currentCombo > 1 || matches.length >= 4) {
      const msg =
        matches.length >= 5
          ? "💥 SUPER MATCH! +500 PTS!"
          : currentCombo >= 3
          ? `🔥 CID MUSA ULTRA COMBO x${currentCombo}!`
          : `⚡ SWEET CRUSH! x${currentCombo}`;
      setComboMessage(msg);
      setTimeout(() => setComboMessage(null), 2000);
    }

    // Mark matched tiles
    const newBoard = startBoard.map((row) => row.map((tile) => ({ ...tile })));
    matches.forEach(({ row, col }) => {
      newBoard[row][col].isMatched = true;
    });
    setBoard([...newBoard]);

    // Wait for pop animation
    await new Promise((res) => setTimeout(res, 250));

    // Collapse board column by column
    const collapsedBoard: Tile[][] = Array.from({ length: GRID_SIZE }, () => []);

    for (let c = 0; c < GRID_SIZE; c++) {
      const validTilesInCol: Tile[] = [];
      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        if (!newBoard[r][c].isMatched) {
          validTilesInCol.push(newBoard[r][c]);
        }
      }

      // Fill empty spots at top with new tiles
      const missingCount = GRID_SIZE - validTilesInCol.length;
      const newTiles: Tile[] = [];
      for (let i = 0; i < missingCount; i++) {
        newTiles.push({
          id: `tile_new_${c}_${i}_${Math.random()}`,
          type: getRandomTileType(),
          row: 0,
          col: c,
          isNew: true,
        });
      }

      const fullCol = [...validTilesInCol.reverse(), ...newTiles];
      for (let r = 0; r < GRID_SIZE; r++) {
        collapsedBoard[r][c] = {
          ...fullCol[r],
          row: r,
          col: c,
        };
      }
    }

    setBoard(collapsedBoard);
    await new Promise((res) => setTimeout(res, 300));

    // Recursive cascade check
    setCombo(currentCombo + 1);
    await processMatchesAndCascade(collapsedBoard, currentCombo + 1);
  };

  // Tile swap handler
  const handleTileClick = async (r: number, c: number) => {
    if (isBusy) return;

    if (!selectedTile) {
      soundEffects.playClick();
      setSelectedTile({ row: r, col: c });
      return;
    }

    const { row: r1, col: c1 } = selectedTile;
    setSelectedTile(null);

    // If same tile, unselect
    if (r1 === r && c1 === c) return;

    // Check if adjacent (non-diagonal)
    const isAdjacent = Math.abs(r1 - r) + Math.abs(c1 - c) === 1;
    if (!isAdjacent) {
      soundEffects.playClick();
      setSelectedTile({ row: r, col: c });
      return;
    }

    // Perform trial swap
    setIsBusy(true);
    soundEffects.playClick();

    const swappedBoard = board.map((rowArr) => rowArr.map((t) => ({ ...t })));
    const temp = swappedBoard[r1][c1].type;
    swappedBoard[r1][c1].type = swappedBoard[r][c].type;
    swappedBoard[r][c].type = temp;

    const matches = findMatches(swappedBoard);

    if (matches.length === 0) {
      // Invalid swap -> animate swap back
      setBoard(swappedBoard);
      await new Promise((res) => setTimeout(res, 200));

      // Swap back
      const revertedBoard = swappedBoard.map((rowArr) => rowArr.map((t) => ({ ...t })));
      revertedBoard[r1][c1].type = swappedBoard[r1][c1].type;
      revertedBoard[r][c].type = swappedBoard[r][c].type;
      // swap back types
      revertedBoard[r1][c1].type = swappedBoard[r][c].type;
      revertedBoard[r][c].type = swappedBoard[r1][c1].type;

      setBoard(revertedBoard);
      setIsBusy(false);
      return;
    }

    // Valid swap!
    setMoves((prev) => Math.max(0, prev - 1));
    setBoard(swappedBoard);
    await processMatchesAndCascade(swappedBoard, 1);
  };

  const handleResetBoard = () => {
    soundEffects.playClick();
    setScore(0);
    setMoves(50);
    setCombo(1);
    setShowSugarRushModal(false);
    setBoard(createInitialBoard());
  };

  return (
    <div className="w-full bg-slate-950/90 border-2 border-amber-400/50 rounded-3xl p-4 md:p-6 mb-6 shadow-2xl font-rajdhani text-left relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* MATCH 3 HEADER STATUS BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-500/30 pb-4 mb-4">
        <div>
          <div className="text-[10px] font-black text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>FORENSIC MATCH-3 PUZZLE ENGINE</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-amber-100 uppercase tracking-wider">
            🍬 CID MUSA CRIMINAL CRUSH
          </h2>
          <p className="text-xs text-amber-200/80 font-medium">
            Swap distinct forensic tiles to make 3-in-a-row matches and extract all crime scene clues!
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {/* Score Counter */}
          <div className="bg-amber-950/80 px-3.5 py-1.5 rounded-xl border border-amber-400/40 text-xs font-black text-amber-300 flex items-center gap-2 shadow-inner">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>SCORE: <b className="text-white font-mono text-base">{score}</b></span>
          </div>

          {/* Moves left - HIGH VISIBILITY BANNER */}
          <div className={`px-4 py-1.5 rounded-xl border text-xs font-black flex items-center gap-2 shadow-lg transition-all ${
            moves <= 5
              ? "bg-red-600 border-red-300 text-white animate-pulse"
              : "bg-rose-950/90 border-rose-400 text-rose-300"
          }`}>
            <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>MOVES LEFT: <b className="text-amber-200 font-mono text-lg">{moves} / {maxMoves}</b></span>
          </div>

          <button
            onClick={handleResetBoard}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/40 transition cursor-pointer"
            title="Reset Board"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MAIN GAME CONTAINER: BOARD + FORENSIC PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* MATCH 3 CANDY BOARD */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center bg-slate-900/90 p-4 rounded-2xl border-2 border-amber-400/30 shadow-2xl relative space-y-3 overflow-hidden">
          
          {/* DIGITAL SHATTERING OVERLAY */}
          <DigitalShatterOverlay ref={shatterRef} />

          {/* CANDY CRUSH STYLE MOVES & EVIDENCE DISPLAY BAR */}
          <div className="w-full bg-slate-950/90 border border-amber-500/30 p-2.5 rounded-xl flex items-center justify-between text-xs font-bold font-mono">
            <div className="flex items-center gap-2 text-amber-300">
              <span className="bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/40 uppercase">
                🎯 GOAL: UNLOCK {totalEvidenceCount} CLUES
              </span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-black">
              <span>PROGRESS: {collectedCount} / {totalEvidenceCount}</span>
            </div>
          </div>
          
          {/* EASY INSTANT CLUE UNLOCK BUTTON */}
          {uncollectedEvidence.length > 0 && (
            <button
              onClick={() => triggerEvidenceReward()}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition transform active:scale-95 cursor-pointer border border-emerald-200"
            >
              <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>⚡ TAP TO INSTANTLY UNLOCK NEXT CLUE ({uncollectedEvidence.length} LEFT)</span>
            </button>
          )}
          
          {/* Floating Combo / Unlock Overlay Popups */}
          <AnimatePresence>
            {comboMessage && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 10 }}
                animate={{ scale: 1.1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="absolute z-30 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-sm md:text-base px-5 py-2 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.8)] border-2 border-white uppercase tracking-wider pointer-events-none"
              >
                {comboMessage}
              </motion.div>
            )}

            {unlockedNotice && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-2 z-30 bg-emerald-500 text-slate-950 font-black text-xs md:text-sm px-4 py-2 rounded-xl shadow-2xl border-2 border-emerald-200 uppercase tracking-wide flex items-center gap-2 pointer-events-none"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>{unlockedNotice}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CANDY CRUSH SUGAR RUSH VICTORY OVERLAY MODAL */}
          <AnimatePresence>
            {showSugarRushModal && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md p-6 rounded-2xl border-4 border-amber-400 flex flex-col items-center justify-center text-center space-y-4 shadow-[0_0_50px_rgba(245,158,11,0.8)]"
              >
                <div className="relative">
                  <PartyPopper className="w-16 h-16 text-amber-400 animate-bounce" />
                  <Sparkles className="w-8 h-8 text-yellow-300 absolute -top-2 -right-2 animate-spin" />
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-black text-amber-400 uppercase tracking-widest">
                    🍬 CANDY CRUSH FORENSIC RUSH!
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent drop-shadow-md">
                    STAGE CLEAR! CASE SOLVED!
                  </h3>
                  <p className="text-xs text-amber-200 font-medium max-w-xs mx-auto">
                    All {totalEvidenceCount} crime scene clues extracted with {moves} moves remaining!
                  </p>
                </div>

                <div className="bg-amber-950/80 p-3 rounded-xl border border-amber-400/50 space-y-1 w-full max-w-xs font-mono">
                  <div className="text-[10px] text-amber-300 font-bold uppercase">SUGAR RUSH MOVES BONUS</div>
                  <div className="text-lg font-black text-emerald-300">
                    +{bonusScore} PTS ({moves} moves left)
                  </div>
                  <div className="text-xs text-amber-100 font-bold">TOTAL SCORE: {score}</div>
                </div>

                <button
                  onClick={() => {
                    soundEffects.playTableSlam();
                    onProceedToInterrogation();
                  }}
                  className="w-full max-w-xs py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.8)] transition transform active:scale-95 cursor-pointer border-2 border-emerald-200"
                >
                  <span>CONFRONT SUSPECTS IN INTERROGATION ROOM</span>
                  <ArrowRight className="w-5 h-5 text-slate-950" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* OUT OF MOVES MODAL */}
          <AnimatePresence>
            {moves <= 0 && collectedCount < totalEvidenceCount && !showSugarRushModal && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md p-6 rounded-2xl border-4 border-rose-500 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl"
              >
                <AlertTriangle className="w-14 h-14 text-rose-400 animate-bounce" />
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white uppercase tracking-wider">
                    OUT OF MOVES!
                  </h3>
                  <p className="text-xs text-rose-200">
                    You ran out of moves with {uncollectedEvidence.length} clue(s) remaining!
                  </p>
                </div>

                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <button
                    onClick={() => {
                      soundEffects.playTreasureFound();
                      setMoves(20);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg border border-amber-200 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>GET +20 EXTRA BONUS MOVES!</span>
                  </button>

                  <button
                    onClick={handleResetBoard}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-500/40 cursor-pointer"
                  >
                    RESTART MATCH-3 PUZZLE
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 6x6 CANDY MATCH GRID */}
          <div className="grid grid-cols-6 gap-2 w-full max-w-md aspect-square p-2 bg-slate-950/80 rounded-2xl border border-amber-500/20 shadow-inner select-none">
            {board.map((rowArr, r) =>
              rowArr.map((tile, c) => {
                const isSelected = selectedTile?.row === r && selectedTile?.col === c;

                // Check if this is an evidence lock tile and assign a distinct shape
                const isEvidenceTile = tile.type === "evidence_lock";
                const evidenceShapeIndex = (r * GRID_SIZE + c) % DISTINCT_EVIDENCE_SHAPES.length;
                const distinctShape = DISTINCT_EVIDENCE_SHAPES[evidenceShapeIndex];

                const conf = isEvidenceTile
                  ? {
                      label: distinctShape.name,
                      icon: distinctShape.icon,
                      bg: distinctShape.bg,
                      border: distinctShape.border,
                      text: distinctShape.text,
                      glow: "shadow-[0_0_20px_rgba(245,158,11,0.8)]",
                    }
                  : TILE_CONFIG[tile.type] || TILE_CONFIG.magnifier;

                return (
                  <motion.button
                    key={tile.id}
                    onClick={() => handleTileClick(r, c)}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.92 }}
                    animate={
                      tile.isMatched
                        ? { scale: [1, 1.25, 0], opacity: [1, 1, 0] }
                        : isSelected
                        ? { scale: [1, 1.12, 1], rotate: [0, -3, 3, 0] }
                        : { scale: 1, opacity: 1 }
                    }
                    transition={{ duration: tile.isMatched ? 0.25 : 0.15 }}
                    className={`relative rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all shadow-md aspect-square ${
                      conf.bg
                    } ${conf.border} ${conf.text} ${
                      isSelected
                        ? "ring-4 ring-amber-300 border-white bg-amber-400/40 z-20 shadow-[0_0_20px_rgba(251,191,36,0.9)]"
                        : ""
                    }`}
                  >
                    <span className="text-2xl md:text-3xl filter drop-shadow-md">
                      {conf.icon}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-tighter opacity-90 hidden sm:block truncate max-w-[50px]">
                      {conf.label}
                    </span>

                    {/* Distinct Evidence Shape Badge */}
                    {isEvidenceTile && (
                      <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-[7px] font-black px-1.5 py-0.5 rounded-full border border-white shadow-md animate-pulse">
                        EVID #{evidenceShapeIndex + 1}
                      </span>
                    )}
                  </motion.button>
                );
              })
            )}
          </div>

          <div className="mt-3 text-[11px] text-amber-200/90 font-mono text-center flex items-center justify-between w-full px-2">
            <span>👇 Click any tile, then click an adjacent tile to match 3 or more!</span>
            <span className="text-amber-400 font-bold">MOVES LEFT: {moves}</span>
          </div>
        </div>

        {/* EVIDENCE COLLECTION BAG & INTERROGATION UNLOCK PANEL */}
        <div className="bg-gradient-to-b from-amber-950/80 via-rose-950/80 to-slate-900/95 p-4 rounded-2xl border-2 border-amber-400/40 flex flex-col justify-between h-full min-h-[420px] shadow-2xl">
          <div>
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2.5 mb-3">
              <div className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Forensic Clues Extracted</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-400/40">
                {collectedCount} / {totalEvidenceCount} Logged
              </span>
            </div>

            {/* Evidence List with Distinct Shapes & Badges */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {caseData.evidence.map((ev, idx) => {
                const isFound = evidenceFoundIds.includes(ev.id);
                const distinctShape = DISTINCT_EVIDENCE_SHAPES[idx % DISTINCT_EVIDENCE_SHAPES.length];

                return (
                  <div
                    key={ev.id}
                    className={`p-2.5 rounded-xl border text-xs transition ${
                      isFound
                        ? "bg-amber-950/70 border-amber-400/60 text-amber-100 shadow-md"
                        : "bg-slate-900/50 border-slate-800 text-slate-500 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black uppercase tracking-wider text-[10px] text-amber-300 flex items-center gap-1">
                        <span>{distinctShape.icon}</span>
                        <span>{isFound ? `✓ CLUE #${idx + 1} UNLOCKED` : `🔒 CLUE #${idx + 1}`}</span>
                      </span>
                      {isFound && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <div className="font-bold text-xs mt-0.5 text-white flex items-center gap-1">
                      <span>{isFound ? ev.name : `${distinctShape.name} (Match Tiles)`}</span>
                    </div>
                    {isFound && (
                      <p className="text-[10px] text-amber-200/80 mt-1 line-clamp-2">
                        {ev.reveal_text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTION BUTTON TO INTERROGATION ROOM */}
          <div className="mt-4 pt-3 border-t border-amber-500/30 flex flex-col gap-2">
            <div className="text-[11px] text-amber-200/90 font-medium">
              {collectedCount > 0
                ? " You have extracted key forensic evidence! Ready to confront the suspects?"
                : "Match 3 tiles to extract evidence or proceed directly when ready."}
            </div>

            <button
              onClick={() => {
                soundEffects.playTableSlam();
                onProceedToInterrogation();
              }}
              className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-2 transition transform active:scale-95 cursor-pointer shadow-lg ${
                collectedCount > 0
                  ? "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border-amber-200 shadow-amber-400/30 animate-pulse"
                  : "bg-slate-800 text-amber-300 border-amber-500/40 hover:bg-slate-700"
              }`}
            >
              <span>PROCEED TO INTERROGATION ROOM ({collectedCount}/{totalEvidenceCount})</span>
              <ArrowRight className="w-4 h-4 text-current" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
