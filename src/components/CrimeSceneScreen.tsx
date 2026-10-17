import React, { useEffect, useRef, useState } from "react";
import { CaseData, EvidenceItem, ZoneData } from "../types";
import { soundEffects } from "../utils/audio";
import { Search, CheckCircle2, ArrowRight, Compass, Trophy, Sparkles, Eye, Zap, Briefcase, Fingerprint, Gamepad2, Map } from "lucide-react";
import { ForensicMatch3Game } from "./ForensicMatch3Game";
import { DigitalShatterOverlay, DigitalShatterHandle } from "./DigitalShatterOverlay";

interface CrimeSceneScreenProps {
  caseData: CaseData;
  evidenceFoundIds: string[];
  searchedZoneNames: string[];
  onSearchZone: (zoneName: string, items: EvidenceItem[]) => void;
  onProceedToInterrogation: () => void;
  onOpenAutopsy?: () => void;
}

type DetectiveTool = "magnifier" | "uv_light" | "duster";
type InvestigationMode = "candy_crush" | "map";

export const CrimeSceneScreen: React.FC<CrimeSceneScreenProps> = ({
  caseData,
  evidenceFoundIds,
  searchedZoneNames,
  onSearchZone,
  onProceedToInterrogation,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapShatterRef = useRef<DigitalShatterHandle | null>(null);
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [lastDiscovered, setLastDiscovered] = useState<EvidenceItem[] | null>(null);
  const [activeTool, setActiveTool] = useState<DetectiveTool>("magnifier");
  const [investigationMode, setInvestigationMode] = useState<InvestigationMode>("candy_crush");
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredZoneName, setHoveredZoneName] = useState<string | null>(null);
  const lastHoveredZoneRef = useRef<string | null>(null);
  const animationRef = useRef<number | null>(null);

  // Initialize search zones based on unique locations in evidence
  useEffect(() => {
    const locations: string[] = [];
    caseData.evidence.forEach((ev) => {
      if (!locations.includes(ev.location)) {
        locations.push(ev.location);
      }
    });

    const cols = Math.ceil(Math.sqrt(locations.length));
    const rows = Math.ceil(locations.length / cols);
    const W = 860;
    const H = 440;
    const pad = 20;
    const cw = (W - pad * 2) / cols;
    const ch = (H - pad * 2) / rows;

    const initialZones: ZoneData[] = locations.map((loc, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const items = caseData.evidence.filter((e) => e.location === loc);
      return {
        name: loc,
        items,
        x: pad + col * cw + 10,
        y: pad + row * ch + 10,
        w: cw - 20,
        h: ch - 20,
        searched: searchedZoneNames.includes(loc),
      };
    });

    setZones(initialZones);
  }, [caseData, searchedZoneNames]);

  // Handle canvas mouse movement for forensic scanner overlay
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    setMousePos({ x: mx, y: my });

    const hit = zones.find((z) => mx >= z.x && mx <= z.x + z.w && my >= z.y && my <= z.y + z.h);
    const currentZoneName = hit ? hit.name : null;

    if (currentZoneName !== lastHoveredZoneRef.current) {
      lastHoveredZoneRef.current = currentZoneName;
      setHoveredZoneName(currentZoneName);
      if (hit && !hit.searched) {
        soundEffects.playEvidenceScan();
      }
    }
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    setHoveredZoneName(null);
    lastHoveredZoneRef.current = null;
  };

  // Render loop for canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let startTime = performance.now();

    const draw = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const W = canvas.width;
      const H = canvas.height;

      // Color scheme according to tool
      const mainColor =
        activeTool === "uv_light"
          ? "#c084fc"
          : activeTool === "duster"
          ? "#f97316"
          : "#f59e0b";

      const subColor =
        activeTool === "uv_light"
          ? "#e879f9"
          : activeTool === "duster"
          ? "#fde047"
          : "#fbbf24";

      // Rich atmospheric background based on active tool
      ctx.clearRect(0, 0, W, H);
      const grad = ctx.createLinearGradient(0, 0, W, H);
      if (activeTool === "uv_light") {
        grad.addColorStop(0, "#1e1b4b");
        grad.addColorStop(0.5, "#311042");
        grad.addColorStop(1, "#020617");
      } else if (activeTool === "duster") {
        grad.addColorStop(0, "#1f1912");
        grad.addColorStop(0.5, "#2e2315");
        grad.addColorStop(1, "#0f172a");
      } else {
        grad.addColorStop(0, "#2a080c");
        grad.addColorStop(0.5, "#450a0a");
        grad.addColorStop(1, "#0f172a");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = activeTool === "uv_light" ? "rgba(168, 85, 247, 0.2)" : "rgba(245, 158, 11, 0.12)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 35) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 35) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Draw Search Zones
      zones.forEach((z) => {
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * 4);
        const isHovered = hoveredZoneName === z.name;

        ctx.save();
        ctx.strokeStyle = z.searched ? "#10b981" : isHovered ? "#ffffff" : mainColor;
        ctx.lineWidth = isHovered ? 4 : 3;

        if (isHovered && !z.searched) {
          ctx.shadowColor = subColor;
          ctx.shadowBlur = 15;
        }

        // Container card
        const r = 16;
        ctx.beginPath();
        ctx.moveTo(z.x + r, z.y);
        ctx.arcTo(z.x + z.w, z.y, z.x + z.w, z.y + z.h, r);
        ctx.arcTo(z.x + z.w, z.y + z.h, z.x, z.y + z.h, r);
        ctx.arcTo(z.x, z.y + z.h, z.x, z.y, r);
        ctx.arcTo(z.x, z.y, z.x + z.w, z.y, r);
        ctx.closePath();

        ctx.fillStyle = z.searched
          ? "rgba(16, 185, 129, 0.18)"
          : isHovered
          ? activeTool === "uv_light"
            ? "rgba(168, 85, 247, 0.35)"
            : activeTool === "duster"
            ? "rgba(249, 115, 22, 0.35)"
            : "rgba(245, 158, 11, 0.35)"
          : activeTool === "uv_light"
          ? "rgba(168, 85, 247, 0.15)"
          : "rgba(245, 158, 11, 0.15)";
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;

        // FORENSIC SCANNER LASER SWEEP ANIMATION (if hovered)
        if (isHovered && !z.searched) {
          const sweepX = z.x + ((elapsed * 220) % z.w);
          const sweepGrad = ctx.createLinearGradient(sweepX - 35, z.y, sweepX + 5, z.y);
          sweepGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
          sweepGrad.addColorStop(0.7, subColor);
          sweepGrad.addColorStop(1, "#ffffff");
          ctx.fillStyle = sweepGrad;
          ctx.fillRect(sweepX - 35, z.y, 40, z.h);

          // Glowing laser sweep vertical beam line
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(sweepX, z.y);
          ctx.lineTo(sweepX, z.y + z.h);
          ctx.stroke();

          // Floating scanner particles inside zone
          for (let p = 0; p < 5; p++) {
            const px = z.x + ((Math.sin(elapsed * 3 + p) * 0.5 + 0.5) * z.w);
            const py = z.y + ((Math.cos(elapsed * 2 + p) * 0.5 + 0.5) * z.h);
            ctx.fillStyle = subColor;
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Studs / decorative trim on top
        const studCount = 4;
        const studW = (z.w - 30) / studCount;
        for (let s = 0; s < studCount; s++) {
          const sx = z.x + 15 + s * studW;
          ctx.fillStyle = z.searched ? "#34d399" : isHovered ? "#ffffff" : subColor;
          ctx.beginPath();
          ctx.roundRect(sx, z.y - 6, studW - 6, 6, [3, 3, 0, 0]);
          ctx.fill();
        }

        // Zone title badge
        ctx.font = "bold 13px 'Rajdhani', sans-serif";
        ctx.fillStyle = z.searched ? "#6ee7b7" : isHovered ? "#ffffff" : subColor;
        ctx.fillText(`🗺️ SEARCH ZONE: ${z.name.toUpperCase()}`, z.x + 16, z.y + 26);

        const cx = z.x + z.w / 2;
        const cy = z.y + z.h / 2 + 10;

        if (!z.searched) {
          // Radar pulse
          ctx.strokeStyle = isHovered ? "#ffffff" : subColor;
          ctx.lineWidth = isHovered ? 3.5 : 2.5;
          ctx.beginPath();
          ctx.arc(cx, cy, 18 + pulse * 8, 0, Math.PI * 2);
          ctx.stroke();

          ctx.font = "bold 13px 'Rajdhani', sans-serif";
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";

          const actionText = isHovered
            ? "⚡ SCANNER MATCH! CLICK TO EXAMINE"
            : activeTool === "uv_light"
            ? "🔦 SCAN UV BLOOD & TRACES"
            : activeTool === "duster"
            ? "🖐️ DUST FOR FINGERPRINTS"
            : "🔍 SEARCH WITH MAGNIFIER";

          ctx.fillText(actionText, cx, cy + 34);
          ctx.textAlign = "left";
        } else {
          // Checked icon
          ctx.font = "28px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("🏆", cx, cy - 4);

          ctx.font = "bold 13px 'Rajdhani', sans-serif";
          ctx.fillStyle = "#34d399";
          ctx.fillText(`${z.items.length} Evidence Items Collected`, cx, cy + 24);
          ctx.textAlign = "left";
        }

        ctx.restore();
      });

      // FORENSIC TARGET RETICLE & HUD OVERLAY AT CURSOR POSITION
      if (mousePos) {
        ctx.save();
        const { x: mx, y: my } = mousePos;

        // Laser crosshair axis lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mx, 0);
        ctx.lineTo(mx, H);
        ctx.moveTo(0, my);
        ctx.lineTo(W, my);
        ctx.stroke();

        // Rotating reticle ring
        const rotAngle = elapsed * 2.5;
        ctx.strokeStyle = hoveredZoneName ? "#ffffff" : subColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mx, my, 22, 0, Math.PI * 2);
        ctx.stroke();

        // Crosshair ticks
        for (let a = 0; a < 4; a++) {
          const ang = rotAngle + (a * Math.PI) / 2;
          const x1 = mx + Math.cos(ang) * 16;
          const y1 = my + Math.sin(ang) * 16;
          const x2 = mx + Math.cos(ang) * 26;
          const y2 = my + Math.sin(ang) * 26;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        // Bracket corners
        const cornerSize = 10;
        const offset = 28;
        ctx.strokeStyle = subColor;
        ctx.lineWidth = 2;

        // Top-left
        ctx.beginPath();
        ctx.moveTo(mx - offset, my - offset + cornerSize);
        ctx.lineTo(mx - offset, my - offset);
        ctx.lineTo(mx - offset + cornerSize, my - offset);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(mx + offset - cornerSize, my - offset);
        ctx.lineTo(mx + offset, my - offset);
        ctx.lineTo(mx + offset, my - offset + cornerSize);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(mx - offset, my + offset - cornerSize);
        ctx.lineTo(mx - offset, my + offset);
        ctx.lineTo(mx - offset + cornerSize, my + offset);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(mx + offset - cornerSize, my + offset);
        ctx.lineTo(mx + offset, my + offset);
        ctx.lineTo(mx + offset, my + offset - cornerSize);
        ctx.stroke();

        // HUD Readout Card near reticle
        const boxW = 160;
        const boxH = 46;
        const boxX = mx + 34 + boxW > W ? mx - 34 - boxW : mx + 34;
        const boxY = my + 34 + boxH > H ? my - 34 - boxH : my + 10;

        ctx.fillStyle = "rgba(2, 6, 23, 0.9)";
        ctx.strokeStyle = hoveredZoneName ? "#38bdf8" : subColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = "bold 10px 'Rajdhani', sans-serif";
        ctx.fillStyle = hoveredZoneName ? "#38bdf8" : subColor;
        ctx.fillText(
          `🔍 FORENSIC SCANNER [${activeTool.toUpperCase()}]`,
          boxX + 8,
          boxY + 16
        );

        ctx.font = "9px 'Rajdhani', sans-serif";
        ctx.fillStyle = "#e2e8f0";
        const statusText = hoveredZoneName
          ? `TARGET: ${hoveredZoneName.toUpperCase()} (LOCKED)`
          : `SCANNING GRID... X:${Math.round(mx)} Y:${Math.round(my)}`;
        ctx.fillText(statusText, boxX + 8, boxY + 32);

        ctx.restore();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [zones, activeTool, mousePos, hoveredZoneName]);

  // Handle canvas clicks
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    const hit = zones.find((z) => mx >= z.x && mx <= z.x + z.w && my >= z.y && my <= z.y + z.h);

    if (hit && !hit.searched) {
      soundEffects.playTreasureFound();

      const xPct = (mx / canvas.width) * 100;
      const yPct = (my / canvas.height) * 100;
      mapShatterRef.current?.triggerShatter(
        xPct,
        yPct,
        hit.items.length > 0 ? "⚡ EVIDENCE DISCOVERED!" : "🔍 SCANNED!"
      );

      setZones((prev) =>
        prev.map((z) => (z.name === hit.name ? { ...z, searched: true } : z))
      );
      setLastDiscovered(hit.items);
      onSearchZone(hit.name, hit.items);
    }
  };

  const foundEvidence = caseData.evidence.filter((e) => evidenceFoundIds.includes(e.id));
  const totalEvidenceCount = caseData.evidence.length;
  const progressPercent = Math.round((foundEvidence.length / totalEvidenceCount) * 100);
  const isReadyToInterrogate = foundEvidence.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-4 font-rajdhani">
      {/* Crime Scene Header Bar */}
      <div className="bg-gradient-to-r from-amber-950/90 via-rose-950/90 to-slate-900/95 backdrop-blur-xl gold-filigree-border rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xl">
        <div>
          <div className="text-[10px] font-black text-amber-300 uppercase tracking-widest flex items-center gap-1.5 font-rajdhani">
            <Compass className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: "12s" }} />
            <span>CRIME SCENE EVIDENCE INVESTIGATION</span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-amber-100 font-rajdhani uppercase">{caseData.scene}</h2>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-xs font-black text-amber-300 bg-amber-500/20 px-3.5 py-1.5 rounded-xl border border-amber-400/40 flex items-center gap-2 font-rajdhani">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Clues Collected: <b className="text-white font-mono text-sm">{foundEvidence.length} / {totalEvidenceCount}</b> ({progressPercent}%)</span>
          </div>

          <button
            onClick={onProceedToInterrogation}
            className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-black flex items-center gap-2 transition transform active:scale-95 cursor-pointer shrink-0 border-2 font-rajdhani shadow-lg ${
              isReadyToInterrogate
                ? "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border-amber-300 shadow-amber-400/30 animate-pulse"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
            }`}
          >
            <span>Proceed to Interrogation Room</span>
            <ArrowRight className="w-4 h-4 text-current" />
          </button>
        </div>
      </div>

      {/* MODE SWITCHER TAB BAR */}
      <div className="bg-slate-950/90 p-2 rounded-2xl border-2 border-amber-400/40 flex items-center justify-between gap-2 shadow-xl font-rajdhani">
        <div className="text-xs font-black text-amber-300 uppercase tracking-widest px-2 hidden sm:flex items-center gap-1.5">
          <Gamepad2 className="w-4 h-4 text-amber-400" />
          <span>INVESTIGATION MODE:</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              soundEffects.playClick();
              setInvestigationMode("candy_crush");
            }}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 transition border cursor-pointer ${
              investigationMode === "candy_crush"
                ? "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 border-white shadow-lg shadow-amber-400/30 scale-105"
                : "bg-slate-900 text-amber-300/80 border-slate-800 hover:text-amber-200 hover:bg-slate-800"
            }`}
          >
            <span className="text-sm">🍬</span>
            <span>CANDY CRUSH MATCH-3 MODE</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setInvestigationMode("map");
            }}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 transition border cursor-pointer ${
              investigationMode === "map"
                ? "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 border-white shadow-lg shadow-amber-400/30 scale-105"
                : "bg-slate-900 text-amber-300/80 border-slate-800 hover:text-amber-200 hover:bg-slate-800"
            }`}
          >
            <Map className="w-4 h-4 text-current" />
            <span>CRIME SCENE MAP SCANNER</span>
          </button>
        </div>
      </div>

      {/* RENDER CANDY CRUSH MATCH 3 OR MAP SCANNER */}
      {investigationMode === "candy_crush" ? (
        <ForensicMatch3Game
          caseData={caseData}
          evidenceFoundIds={evidenceFoundIds}
          onUnlockEvidence={(item) => onSearchZone(item.location, [item])}
          onProceedToInterrogation={onProceedToInterrogation}
        />
      ) : (
        <>
          {/* DETECTIVE FORENSIC TOOLBAR */}
          <div className="bg-slate-950/90 p-3 rounded-2xl border-2 border-amber-400/30 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Active Forensic Tool:</span>
            </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTool("magnifier");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition border cursor-pointer ${
              activeTool === "magnifier"
                ? "bg-amber-400 text-slate-950 border-amber-200 shadow-lg shadow-amber-400/30 font-extrabold"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>🔍 Magnifying Lens</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTool("uv_light");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition border cursor-pointer ${
              activeTool === "uv_light"
                ? "bg-purple-600 text-white border-purple-300 shadow-lg shadow-purple-600/30 font-extrabold"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>🔦 UV Flashlight</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTool("duster");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition border cursor-pointer ${
              activeTool === "duster"
                ? "bg-amber-600 text-white border-amber-300 shadow-lg shadow-amber-600/30 font-extrabold"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>🖐️ Fingerprint Duster</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Canvas stage */}
        <div className="lg:col-span-2 bg-gradient-to-b from-amber-950/80 via-slate-900/90 to-slate-900/95 backdrop-blur-xl border-2 border-amber-400/30 rounded-2xl p-3 flex flex-col justify-between shadow-2xl">
          <div className="relative overflow-hidden rounded-xl border-2 border-amber-400/30 shadow-inner group">
            <DigitalShatterOverlay ref={mapShatterRef} />
            <canvas
              ref={canvasRef}
              width={860}
              height={440}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="w-full h-auto cursor-crosshair block"
            />
          </div>

          {/* Forensic Scanner Telemetry HUD Overlay Bar */}
          <div className="mt-2.5 bg-slate-950/90 border border-amber-400/40 rounded-xl px-3.5 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-inner text-xs font-mono">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
              <span className="text-[11px] uppercase tracking-wider font-rajdhani font-black">
                FORENSIC SCANNER TELEMETRY:
              </span>
            </div>

            <div className="text-[11px] text-slate-200 truncate font-semibold font-rajdhani">
              {hoveredZoneName ? (
                <span className="text-cyan-300 font-black animate-pulse flex items-center gap-1.5">
                  ⚡ TARGET LOCKED: [{hoveredZoneName.toUpperCase()}] • FORENSIC CLUE SUSPECTED — CLICK TO EXTRACT
                </span>
              ) : mousePos ? (
                <span className="text-amber-300">
                  🔍 SCANNING CRIME SCENE GRID... X:{Math.round(mousePos.x)} Y:{Math.round(mousePos.y)}
                </span>
              ) : (
                <span className="text-slate-400">
                  Hover over any search zone to activate Forensic Laser Sweep & Audio Scan.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Forensic Evidence Bag Inventory */}
        <div className="bg-gradient-to-b from-amber-950/80 via-rose-950/80 to-slate-900/95 backdrop-blur-xl border-2 border-amber-400/30 rounded-2xl p-4 flex flex-col h-[480px] shadow-2xl">
          <div className="flex items-center justify-between border-b border-amber-400/20 pb-3 mb-3">
            <div className="flex items-center gap-2 text-xs font-black text-amber-300 uppercase tracking-wider font-rajdhani">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span>CID Musa Forensic Bag</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-400/40">
              {foundEvidence.length} Clues Collected
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {foundEvidence.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-amber-200/80">
                <Search className="w-10 h-10 mb-2 opacity-60 text-amber-400 animate-bounce" />
                <p className="text-xs font-black text-white font-rajdhani uppercase tracking-wider">Forensic Bag is Empty</p>
                <p className="text-[11px] mt-1 text-amber-200/80 font-medium">Click zones on the crime scene map to collect physical evidence.</p>
              </div>
            ) : (
              foundEvidence.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-slate-950/90 border-2 border-amber-400/50 rounded-xl p-3 space-y-1.5 shadow-lg animate-fade-in"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black tracking-widest text-amber-300 uppercase font-mono">
                      EVIDENCE ITEM • {ev.location}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="font-black text-xs text-white">{ev.name}</div>
                  <p className="text-[11px] text-slate-200 font-medium leading-relaxed">{ev.reveal_text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )}

      {/* Popup banner when a new clue is discovered */}
      {lastDiscovered && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 p-4 rounded-2xl shadow-2xl border-2 border-amber-300 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-6 h-6 fill-slate-950" />
          <div>
            <div className="text-xs font-black uppercase font-rajdhani">NEW FORENSIC EVIDENCE COLLECTED!</div>
            <div className="text-sm font-black">{lastDiscovered.map((item) => item.name).join(", ")}</div>
          </div>
          <button
            onClick={() => setLastDiscovered(null)}
            className="ml-2 text-xs font-black bg-slate-950 text-amber-300 px-2.5 py-1 rounded-lg hover:bg-slate-900 cursor-pointer"
          >
            STORE IN BAG
          </button>
        </div>
      )}
    </div>
  );
};
