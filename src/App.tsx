import React, { useState, useEffect, useMemo } from "react";
import { CaseData, GameScreen, SuspectState, EvidenceItem, DiscoveredContradiction } from "./types";
import { PRESET_CASES } from "./data/cases";
import { normalizeCaseData } from "./utils/normalizeCase";
import { soundEffects } from "./utils/audio";
import { getPhaseBackground } from "./utils/backgrounds";
import { Header } from "./components/Header";
import { IntroScreen } from "./components/IntroScreen";
import { BriefingScreen } from "./components/BriefingScreen";
import { CrimeSceneScreen } from "./components/CrimeSceneScreen";
import { InterrogationScreen, MIN_SUSPICION_TO_ARREST } from "./components/InterrogationScreen";
import { JailCinematic } from "./components/JailCinematic";
import { EndingScreen } from "./components/EndingScreen";
import { AutopsyModal } from "./components/AutopsyModal";
import { GameOverModal } from "./components/GameOverModal";
import { SpookyBloodOverlay } from "./components/BloodVignetteOverlay";

const MAX_TOTAL_QUESTIONS = 24;
const CLOCK_START_SECONDS = 8 * 60;

export default function App() {
  const [screen, setScreen] = useState<GameScreen>("intro");
  const [caseData, setCaseData] = useState<CaseData>(() => normalizeCaseData(PRESET_CASES[0]));
  const [caseNumber, setCaseNumber] = useState<string>("MUSA-1001");
  const [sessionSeed, setSessionSeed] = useState<number>(12345);

  // Detective Career & Progression
  const [detectiveStars, setDetectiveStars] = useState<number>(() => {
    return parseInt(localStorage.getItem("cid_detective_stars") || "0", 10);
  });
  const [currentLevel, setCurrentLevel] = useState<number>(() => {
    return parseInt(localStorage.getItem("cid_current_level") || "1", 10);
  });
  const [completedCaseIds, setCompletedCaseIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("cid_completed_cases") || "[]");
    } catch {
      return [];
    }
  });

  const [autopsyModalOpen, setAutopsyModalOpen] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [gameOverCause, setGameOverCause] = useState<"wrong_arrest" | "timeout">("wrong_arrest");

  useEffect(() => {
    localStorage.setItem("cid_detective_stars", detectiveStars.toString());
    localStorage.setItem("cid_current_level", currentLevel.toString());
    localStorage.setItem("cid_completed_cases", JSON.stringify(completedCaseIds));
  }, [detectiveStars, currentLevel, completedCaseIds]);

  const [suspects, setSuspects] = useState<[SuspectState, SuspectState]>([
    {
      name: "Suspect 1",
      title: "Role 1",
      role: "innocent",
      avatarSeed: "s1",
      accent: "#4CC9F0",
      history: [],
      questionsAsked: 0,
    },
    {
      name: "Suspect 2",
      title: "Role 2",
      role: "guilty",
      avatarSeed: "s2",
      accent: "#F72585",
      history: [],
      questionsAsked: 0,
    },
  ]);

  const [activeSuspectIdx, setActiveSuspectIdx] = useState<number>(0);
  const [evidenceFoundIds, setEvidenceFoundIds] = useState<string[]>([]);
  const [searchedZoneNames, setSearchedZoneNames] = useState<string[]>([]);
  const [discoveredContradictions, setDiscoveredContradictions] = useState<DiscoveredContradiction[]>([]);
  const [lastContradictionTime, setLastContradictionTime] = useState<number>(0);
  const [suspicion, setSuspicion] = useState<[number, number]>([0, 0]);
  const [totalQuestionsAsked, setTotalQuestionsAsked] = useState<number>(0);
  const [verdictIdx, setVerdictIdx] = useState<number | null>(null);
  const [clockRemaining, setClockRemaining] = useState<number>(CLOCK_START_SECONDS);
  const [isGeneratingCase, setIsGeneratingCase] = useState<boolean>(false);

  // Timer loop during interrogation
  useEffect(() => {
    if (screen !== "interrogation") return;

    const timer = setInterval(() => {
      setClockRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [screen]);

  // Time's up — the case fails if the clock runs out during interrogation
  useEffect(() => {
    if (screen === "interrogation" && clockRemaining === 0 && !isGameOver) {
      soundEffects.playWrongArrest();
      setGameOverCause("timeout");
      setIsGameOver(true);
    }
  }, [screen, clockRemaining, isGameOver]);

  // Start a new investigation with a given caseData object
  const startInvestigation = (rawCaseData: CaseData) => {
    // Normalize case data and scale complexity based on currentLevel
    const data: CaseData = normalizeCaseData(rawCaseData);

    // Progressive Complexity Scaling based on currentLevel:
    // Level 1: Standard (4 clues, full detail)
    // Level 2: Moderate (3 clues)
    // Level 3+: High Difficulty (2 hidden clues, evasive alibis)
    if (currentLevel >= 3) {
      if (data.evidence.length > 2) {
        data.evidence = data.evidence.slice(0, 2);
      }
      if (!data.shared_alibi.includes("(Evasive)")) {
        data.shared_alibi = `${data.shared_alibi} (Evasive & sparse timeline)`;
      }
    } else if (currentLevel === 2) {
      if (data.evidence.length > 3) {
        data.evidence = data.evidence.slice(0, 3);
      }
    }

    const seed = Math.floor(Math.random() * 1000000);
    const caseNum = "MUSA-" + Math.floor(1000 + Math.random() * 8999);
    const guiltyIdx = Math.random() < 0.5 ? 0 : 1;

    const s0Role = guiltyIdx === 0 ? "guilty" : "innocent";
    const s1Role = guiltyIdx === 1 ? "guilty" : "innocent";

    setCaseData(data);
    setCaseNumber(caseNum);
    setSessionSeed(seed);

    setSuspects([
      {
        name: data.suspects[0],
        title: data.suspect_roles?.[0] || "Person of Interest",
        role: s0Role,
        avatarSeed: `${data.suspects[0]}::${seed}`,
        accent: "#4CC9F0",
        history: [],
        questionsAsked: 0,
      },
      {
        name: data.suspects[1],
        title: data.suspect_roles?.[1] || "Person of Interest",
        role: s1Role,
        avatarSeed: `${data.suspects[1]}::${seed}`,
        accent: "#F72585",
        history: [],
        questionsAsked: 0,
      },
    ]);

    setActiveSuspectIdx(0);
    setEvidenceFoundIds([]);
    setSearchedZoneNames([]);
    setDiscoveredContradictions([]);
    setSuspicion([0, 0]);
    setTotalQuestionsAsked(0);
    setVerdictIdx(null);
    setClockRemaining(CLOCK_START_SECONDS);
    setIsGameOver(false);
    setAutopsyModalOpen(false);

    setScreen("briefing");
  };

  // Helper to pick a new unplayed case
  const startNextLevelCase = () => {
    const unplayedPresets = PRESET_CASES.filter((c) => !completedCaseIds.includes(c.id));
    if (unplayedPresets.length > 0) {
      const nextPreset = unplayedPresets[0];
      startInvestigation(nextPreset);
    } else {
      // All preset cases solved - generate brand new AI case excluding completed ones
      handleGenerateAiCase("murder", currentLevel + 1);
    }
  };

  // Generate a custom AI case via backend Express route
  const handleGenerateAiCase = async (category: string = "murder", targetLevel?: number) => {
    setIsGeneratingCase(true);
    const lvl = targetLevel || currentLevel;
    try {
      const res = await fetch("/api/generate-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, level: lvl, completedCaseIds }),
      });
      if (!res.ok) {
        throw new Error("Failed to generate AI case");
      }
      const data = await res.json();
      if (data.caseData) {
        startInvestigation(data.caseData);
      } else {
        throw new Error("Invalid case format returned");
      }
    } catch (err) {
      console.error("AI Case generation error:", err);
      // Fallback to random unplayed preset case or generate unique procedural case
      const unplayed = PRESET_CASES.filter((c) => !completedCaseIds.includes(c.id));
      if (unplayed.length > 0) {
        const randomPreset = unplayed[Math.floor(Math.random() * unplayed.length)];
        startInvestigation(randomPreset);
      } else {
        const basePreset = PRESET_CASES[Math.floor(Math.random() * PRESET_CASES.length)];
        let randNum = Math.floor(1000 + Math.random() * 8999);
        let candidateId = `${category.toUpperCase()}-${randNum}`;
        while (completedCaseIds.includes(candidateId)) {
          randNum = Math.floor(1000 + Math.random() * 8999);
          candidateId = `${category.toUpperCase()}-${randNum}`;
        }
        startInvestigation({
          ...basePreset,
          id: candidateId,
        });
      }
    } finally {
      setIsGeneratingCase(false);
    }
  };

  // Record searching a zone
  const handleSearchZone = (zoneName: string, items: EvidenceItem[]) => {
    if (!searchedZoneNames.includes(zoneName)) {
      setSearchedZoneNames((prev) => [...prev, zoneName]);
    }
    const newFoundIds = [...evidenceFoundIds];
    items.forEach((item) => {
      if (!newFoundIds.includes(item.id)) {
        newFoundIds.push(item.id);
      }
    });
    setEvidenceFoundIds(newFoundIds);
  };

  // Ask suspect a question via server endpoint `/api/interrogate`
  const handleAskQuestion = async (userQuestion: string) => {
    const suspect = suspects[activeSuspectIdx];
    const otherSuspect = suspects[1 - activeSuspectIdx];

    const updatedSuspects = [...suspects] as [SuspectState, SuspectState];
    updatedSuspects[activeSuspectIdx] = {
      ...suspect,
      questionsAsked: suspect.questionsAsked + 1,
      history: [...suspect.history, { role: "user", content: userQuestion }],
    };
    setSuspects(updatedSuspects);
    setTotalQuestionsAsked((prev) => prev + 1);

    let reply = "";
    try {
      const res = await fetch("/api/interrogate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suspectName: suspect.name,
          suspectTitle: suspect.title,
          suspectRole: suspect.role,
          victimName: caseData.victim,
          city: caseData.city,
          sharedAlibi: caseData.shared_alibi,
          hardFacts: caseData.hard_facts.map((hf) => ({
            fact: hf.fact,
            contradiction_triggers: hf.contradiction_triggers || [],
          })),
          evidenceFound: caseData.evidence
            .filter((e) => evidenceFoundIds.includes(e.id))
            .map((e) => `${e.name} [Location: ${e.location}]: "${e.reveal_text}"`),
          otherSuspectName: otherSuspect.name,
          suspicionLevel: suspicion[activeSuspectIdx],
          history: suspect.history,
          userQuestion,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        reply = data.reply;
      }
    } catch (err) {
      console.warn("Interrogation network issue, using client offline fallback response:", err);
    }

    if (!reply) {
      reply =
        suspect.role === "innocent"
          ? `*[wipes cold sweat, eyes filled with emotion]* "Officer CID Musa, I am giving you my honest word! Search the room or test the crime scene forensics — my hands are completely clean of ${caseData.victim}'s blood!"`
          : `*[forces a tight, cold smile under the light]* "Detective Musa, I'm telling you again — we were at ${caseData.shared_alibi} that night. Trying to twist my words won't change my statement."`;
    }

    // Append reply
    const finalSuspects = [...updatedSuspects] as [SuspectState, SuspectState];
    finalSuspects[activeSuspectIdx] = {
      ...finalSuspects[activeSuspectIdx],
      history: [
        ...finalSuspects[activeSuspectIdx].history,
        { role: "model", content: reply },
      ],
    };

    // Check contradiction triggers
    let matchedContradiction = false;
    let matchedFact: string | null = null;
    if (suspect.role === "guilty") {
      // Strip *[action annotations]* before matching so trigger words inside
      // stage directions can't cause false positives.
      const cleanReply = reply.replace(/\*\[[^\]]*\]\*/g, "").toLowerCase();
      for (const hf of caseData.hard_facts) {
        for (const trig of hf.contradiction_triggers || []) {
          if (cleanReply.includes(trig.toLowerCase())) {
            matchedContradiction = true;
            matchedFact = hf.fact;
            break;
          }
        }
        if (matchedContradiction) break;
      }
    }

    // Update suspicion score & record contradiction
    if (matchedContradiction) {
      soundEffects.playContradictionBoom();
      setLastContradictionTime(Date.now());
      if (matchedFact) {
        setDiscoveredContradictions((prev) => [
          {
            id: "cnt-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
            suspectName: suspect.name,
            question: userQuestion,
            reply: reply,
            factContradicted: matchedFact,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
          ...prev,
        ]);
      }
    } else {
      soundEffects.playTableSlam();
    }

    setSuspicion((prev) => {
      const updated = [...prev] as [number, number];
      if (matchedContradiction) {
        updated[activeSuspectIdx] = Math.min(100, updated[activeSuspectIdx] + 25);
      } else if (suspect.role === "guilty") {
        updated[activeSuspectIdx] = Math.min(100, updated[activeSuspectIdx] + 5);
      } else {
        updated[activeSuspectIdx] = Math.max(0, updated[activeSuspectIdx] - 2);
      }
      return updated;
    });

    setSuspects(finalSuspects);
  };

  // Accuse suspect (requires enough suspicion to be a justified arrest)
  const handleAccuseSuspect = (idx: number) => {
    if (suspicion[idx] < MIN_SUSPICION_TO_ARREST) return;
    soundEffects.playSirenSound();
    setVerdictIdx(idx);
    setScreen("jail");
  };

  // Jail cinematic callback when continuing to ending
  const handleJailContinue = () => {
    const gIdx = suspects[0].role === "guilty" ? 0 : 1;
    const isWin = verdictIdx === gIdx;

    if (isWin) {
      // Victory: record case solved, award stars & level up
      if (!completedCaseIds.includes(caseData.id)) {
        setCompletedCaseIds((prev) => [...prev, caseData.id]);
      }
      setDetectiveStars((prev) => prev + 3);
      setCurrentLevel((prev) => prev + 1);
      setScreen("ending");
    } else {
      // Wrong accusation penalty: Game over & dismissal from CID
      setGameOverCause("wrong_arrest");
      setIsGameOver(true);
      setDetectiveStars(0);
      setCurrentLevel(1);
      setCompletedCaseIds([]);
    }
  };

  // Reset career after Game Over
  const handleRestartCareer = () => {
    setIsGameOver(false);
    setGameOverCause("wrong_arrest");
    setVerdictIdx(null);
    setDetectiveStars(0);
    setCurrentLevel(1);
    setCompletedCaseIds([]);
    setScreen("intro");
  };

  const guiltyIdx = suspects[0].role === "guilty" ? 0 : 1;
  const isCorrectVerdict = verdictIdx === guiltyIdx;

  const detectedTheme = useMemo(() => {
    if (!caseData) return undefined;
    const combinedText = `${caseData.id} ${caseData.victim} ${caseData.victim_detail} ${caseData.scene} ${caseData.method}`.toLowerCase();
    if (combinedText.includes("stalker") || combinedText.includes("mystery") || combinedText.includes("surveillance") || combinedText.includes("shadow")) {
      return "stalker-mystery";
    }
    if (combinedText.includes("ghost") || combinedText.includes("zombie") || combinedText.includes("creepy") || combinedText.includes("supernatural") || combinedText.includes("haunted") || combinedText.includes("phantom")) {
      return "creepy";
    }
    return undefined;
  }, [caseData]);

  const bgConfig = getPhaseBackground(screen, caseData?.city, detectedTheme);

  return (
    <div
      className="min-h-screen text-slate-100 p-3 md:p-6 font-sans selection:bg-amber-500 selection:text-slate-950 relative transition-all duration-700 bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: `url("${bgConfig.imageUrl}")` }}
    >
      {/* Dynamic Blood & Red-Tinted Vignette Overlay */}
      <SpookyBloodOverlay
        contradictionCount={discoveredContradictions.length}
        suspicionScore={Math.max(...suspicion, 0)}
        screen={screen}
        lastContradictionTime={lastContradictionTime}
      />

      {/* Atmospheric dark backdrop overlay */}
      <div className={`absolute inset-0 ${bgConfig.overlay} transition-all duration-700 pointer-events-none z-0`} />

      <div className="max-w-7xl mx-auto relative z-10">
        <Header
          currentScreen={screen}
          caseNumber={caseNumber}
          caseTitle={caseData ? `THE ${String(caseData.victim || "").toUpperCase()} CASE` : ""}
          totalQuestionsAsked={totalQuestionsAsked}
          maxQuestions={MAX_TOTAL_QUESTIONS}
          clockRemaining={clockRemaining}
          detectiveStars={detectiveStars}
          currentLevel={currentLevel}
          onOpenAutopsy={() => setAutopsyModalOpen(true)}
          onReset={() => setScreen("intro")}
        />

        <main>
          {screen === "intro" && (
            <IntroScreen
              detectiveStars={detectiveStars}
              currentLevel={currentLevel}
              completedCaseIds={completedCaseIds}
              onSelectPreset={startInvestigation}
              onGenerateAiCase={handleGenerateAiCase}
              isGenerating={isGeneratingCase}
            />
          )}

          {screen === "briefing" && (
            <BriefingScreen
              caseData={caseData}
              caseNumber={caseNumber}
              suspects={suspects}
              onProceedToScene={() => setScreen("scene")}
              onOpenAutopsy={() => setAutopsyModalOpen(true)}
            />
          )}

          {screen === "scene" && (
            <CrimeSceneScreen
              caseData={caseData}
              evidenceFoundIds={evidenceFoundIds}
              searchedZoneNames={searchedZoneNames}
              onSearchZone={handleSearchZone}
              onProceedToInterrogation={() => setScreen("interrogation")}
              onOpenAutopsy={() => setAutopsyModalOpen(true)}
            />
          )}

          {screen === "interrogation" && (
            <InterrogationScreen
              caseData={caseData}
              suspects={suspects}
              activeSuspectIdx={activeSuspectIdx}
              suspicion={suspicion}
              totalQuestionsAsked={totalQuestionsAsked}
              maxTotalQuestions={MAX_TOTAL_QUESTIONS}
              evidenceFoundIds={evidenceFoundIds}
              discoveredContradictions={discoveredContradictions}
              onSelectSuspect={(idx) => setActiveSuspectIdx(idx)}
              onAskQuestion={handleAskQuestion}
              onAccuseSuspect={handleAccuseSuspect}
              onOpenAutopsy={() => setAutopsyModalOpen(true)}
            />
          )}

          {screen === "jail" && verdictIdx !== null && (
            <JailCinematic
              accusedSuspect={suspects[verdictIdx]}
              actualGuiltySuspect={suspects[guiltyIdx]}
              isCorrect={isCorrectVerdict}
              onContinueToEnding={handleJailContinue}
              onRetryGame={handleRestartCareer}
            />
          )}

          {screen === "ending" && verdictIdx !== null && (
            <EndingScreen
              caseData={caseData}
              suspects={suspects}
              verdictIdx={verdictIdx}
              evidenceFoundCount={evidenceFoundIds.length}
              totalQuestionsAsked={totalQuestionsAsked}
              suspicion={suspicion}
              detectiveStars={detectiveStars}
              currentLevel={currentLevel}
              onNewGame={startNextLevelCase}
            />
          )}
        </main>
      </div>

      {/* Forensic Autopsy Report Modal */}
      {caseData && (
        <AutopsyModal
          isOpen={autopsyModalOpen}
          caseData={caseData}
          onClose={() => setAutopsyModalOpen(false)}
        />
      )}

      {/* Career Terminated Game Over Modal */}
      <GameOverModal
        isOpen={isGameOver}
        cause={gameOverCause}
        accusedName={verdictIdx !== null ? suspects[verdictIdx].name : ""}
        actualGuiltyName={suspects[guiltyIdx].name}
        onRestartCareer={handleRestartCareer}
      />
    </div>
  );
}
