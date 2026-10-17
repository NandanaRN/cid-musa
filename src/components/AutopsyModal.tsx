import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CaseData, BodyMark } from "../types";
import { FileText, X, AlertCircle, Eye, Activity, ShieldAlert, Heart, Stethoscope } from "lucide-react";

interface AutopsyModalProps {
  caseData: CaseData;
  isOpen: boolean;
  onClose: () => void;
}

export const AutopsyModal: React.FC<AutopsyModalProps> = ({
  caseData,
  isOpen,
  onClose,
}) => {
  const [selectedMark, setSelectedMark] = useState<BodyMark | null>(null);

  if (!isOpen || !caseData.autopsy) return null;

  const autopsy = caseData.autopsy;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md font-rajdhani">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-slate-900 border-2 border-rose-500/40 rounded-2xl shadow-[0_0_50px_rgba(244,63,94,0.3)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Top Dossier Header */}
          <div className="p-4 bg-slate-950 border-b border-rose-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/40">
                <Stethoscope className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/30">
                    CONFIDENTIAL FORENSIC DOSSIER
                  </span>
                  <span className="text-xs font-mono text-slate-400">REF: AUTOPSY-{caseData.id}</span>
                </div>
                <h2 className="text-xl font-black text-slate-100 uppercase tracking-wider font-cinzel">
                  AUTOPSY REPORT: <span className="text-rose-400">{caseData.victim}</span>
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Scrollable Forensic Content */}
          <div className="p-4 md:p-6 overflow-y-auto space-y-6 text-slate-200">
            {/* Top Pathology Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  CHIEF PATHOLOGIST
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">{autopsy.pathologist}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  ESTIMATED T.O.D. WINDOW
                </span>
                <span className="text-xs font-mono font-bold text-rose-400">{autopsy.time_of_death_range}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  OFFICIAL CAUSE OF DEATH
                </span>
                <span className="text-xs font-bold text-slate-100">{autopsy.cause_of_death}</span>
              </div>
            </div>

            {/* Split View: Interactive Visual Body Diagram & Pathology Details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Interactive Deceased Anatomy Scanner */}
              <div className="lg:col-span-5 bg-slate-950/90 rounded-2xl border border-rose-500/30 p-4 relative flex flex-col items-center shadow-inner min-h-[340px]">
                <div className="w-full flex items-center justify-between text-xs font-mono text-rose-400 border-b border-rose-500/20 pb-2 mb-3">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Activity className="w-4 h-4 animate-pulse text-rose-500" />
                    ANATOMICAL SCANNER
                  </span>
                  <span className="text-[10px] text-slate-500">INTERACTIVE MARKS</span>
                </div>

                {/* Stylized Body Silhouette / Diagram Canvas */}
                <div className="relative w-48 h-72 bg-slate-900/80 rounded-3xl border border-slate-800 flex items-center justify-center p-2 overflow-hidden shadow-2xl">
                  {/* Grid overlay scanner lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-40" />

                  {/* Body SVG Vector Silhouette */}
                  <svg
                    viewBox="0 0 100 200"
                    className="w-full h-full text-slate-700/80 stroke-rose-500/40 fill-slate-950/80 stroke-[1.5] filter drop-shadow-md"
                  >
                    {/* Head */}
                    <circle cx="50" cy="22" r="14" />
                    {/* Neck */}
                    <rect x="46" y="35" width="8" height="8" rx="2" />
                    {/* Torso */}
                    <path d="M 30 43 Q 50 40 70 43 L 64 110 Q 50 115 36 110 Z" />
                    {/* Left Arm */}
                    <path d="M 28 45 L 18 100 L 12 110" />
                    {/* Right Arm */}
                    <path d="M 72 45 L 82 100 L 88 110" />
                    {/* Left Leg */}
                    <path d="M 38 112 L 35 180 L 32 195" />
                    {/* Right Leg */}
                    <path d="M 62 112 L 65 180 L 68 195" />
                  </svg>

                  {/* Interactive Target Dots for Injury/Forensic Marks */}
                  {autopsy.body_marks.map((mark, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setSelectedMark(mark)}
                      whileHover={{ scale: 1.3 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full bg-rose-500/30 border-2 border-rose-400 flex items-center justify-center shadow-[0_0_12px_rgba(244,63,94,0.9)] cursor-pointer z-20"
                      style={{ left: `${mark.x}%`, top: `${mark.y}%` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-ping" />
                    </motion.button>
                  ))}
                </div>

                {/* Selected Body Mark Detail Box */}
                {selectedMark ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-left font-sans text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-rose-300 font-bold uppercase tracking-wider font-rajdhani">
                      <span className="flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {selectedMark.label}
                      </span>
                      <button
                        onClick={() => setSelectedMark(null)}
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Dismiss
                      </button>
                    </div>
                    <p className="text-slate-200 text-[11px] leading-relaxed">{selectedMark.detail}</p>
                  </motion.div>
                ) : (
                  <div className="w-full mt-3 text-center text-[11px] text-slate-500 font-mono italic">
                    Tap any pulsing target marker on the body diagram to inspect injury details.
                  </div>
                )}
              </div>

              {/* Right Column: Detailed Pathology Analysis */}
              <div className="lg:col-span-7 space-y-4">
                {/* External Injuries List */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>External Traumatic Observations</span>
                  </h4>
                  <ul className="space-y-1.5 font-sans text-xs text-slate-300">
                    {autopsy.external_injuries.map((inj, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded border border-slate-800/80">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{inj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Toxicology Analysis */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Lab Toxicology Readout</span>
                  </h4>
                  <p className="font-sans text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                    {autopsy.toxicology_results}
                  </p>
                </div>

                {/* Stomach Analysis & Gastric Findings */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-rose-400 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span>Gastric & Stomach Analysis</span>
                  </h4>
                  <p className="font-sans text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                    {autopsy.stomach_contents}
                  </p>
                </div>

                {/* Pathologist Notes */}
                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-rose-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Medical Examiner Concluding Notes</span>
                  </h4>
                  <p className="font-sans text-xs text-rose-200/90 leading-relaxed italic">
                    "{autopsy.forensic_notes}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Close Forensic Dossier
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
