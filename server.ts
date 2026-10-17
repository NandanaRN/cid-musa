import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { PRESET_CASES } from "./src/data/cases.ts";
import { normalizeCaseData } from "./src/utils/normalizeCase.ts";

// Load .env.local first (that's what the README tells users to create), then fall
// back to plain .env. Without this, a GEMINI_API_KEY set only in .env.local would
// never actually reach process.env on the server side.
dotenv.config({ path: [".env.local", ".env"] });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: "2mb" }));

  // Helper to get Gemini client
  const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", envKeyAvailable: Boolean(process.env.GEMINI_API_KEY) });
  });

  // Interrogate a suspect using Gemini AI
  app.post("/api/interrogate", async (req, res) => {
    try {
      const {
        suspectName,
        suspectTitle,
        suspectRole,
        victimName,
        city,
        sharedAlibi,
        hardFacts,
        evidenceFound,
        otherSuspectName,
        suspicionLevel,
        history,
        userQuestion,
      } = req.body;

      if (!suspectName || !userQuestion) {
        return res.status(400).json({ error: "Missing required parameters." });
      }

      const safeVictimName = typeof victimName === "string" ? victimName : (victimName?.name || String(victimName || "the victim"));

      const formatAlibiForSpeech = (rawAlibi: string): string => {
        if (!rawAlibi) return "our location at the time";
        let clean = rawAlibi.trim();
        clean = clean.replace(/^(both claim (they were|they had|they)|they claim (they were|they had)|they were|claim to be)\s+/i, "");
        return clean;
      };

      const cleanAlibiText = formatAlibiForSpeech(sharedAlibi);

      let reply = "";

      const factsBlock = Array.isArray(hardFacts)
        ? hardFacts
            .map((f: any) => {
              const factStr = typeof f === "string" ? f : f?.fact || String(f || "");
              return factStr ? `- ${factStr}` : "";
            })
            .filter(Boolean)
            .join("\n")
        : "";

      const triggerList = (Array.isArray(hardFacts) ? hardFacts : [])
        .map((f: any) => (Array.isArray(f?.contradiction_triggers) ? f.contradiction_triggers : []))
        .flat()
        .filter((t: any) => typeof t === "string" && t.length > 0);

      const pressure = Math.min(100, Math.max(0, Number(suspicionLevel) || 0));

      const evidenceBlock = Array.isArray(evidenceFound) && evidenceFound.length > 0
        ? evidenceFound.map((e: string) => `- ${e}`).join("\n")
        : "None discovered yet.";

      let sysInstruction = `You are ${suspectName}, ${suspectTitle || "a key suspect"}, sitting in a dimly lit, high-tension CID murder interrogation room across from Detective Officer CID Musa.
Murder Victim: ${safeVictimName}. Location/City: ${city || "India"}.
Claimed Joint Alibi with ${otherSuspectName || "the other suspect"}: "${cleanAlibiText}".

PHYSICAL EVIDENCE DISCOVERED AT CRIME SCENE BY CID MUSA:
${evidenceBlock}

MURDER MYSTERY DRAMA & ROLEPLAY DIRECTIVES:
1. Speak 100% in character as ${suspectName}, using immersive, emotional first-person dialogue ("I", "we").
2. Answer the EXACT question or remark Officer CID Musa just made — react to what they ACTUALLY said, word for word, not to a generic "you're a suspect" situation. If they ask about specific physical evidence or clues, directly address that evidence, explaining why your fingerprints/dna/presence are or aren't linked to it. If they say something casual, small-talk, off-topic, or just a greeting (e.g. "hi", "how are you", a joke, an unrelated comment), respond to THAT naturally and briefly — tense, wary, maybe suspicious of why Musa is being casual — WITHOUT reciting your alibi or the crime scene unless Musa actually brings those up. Do not force-inject the alibi, the victim's name, or crime scene horror into every single reply; only escalate the drama when the question calls for it.
3. HEIGHTEN THE GRITTY MURDER MYSTERY VIBE when the moment calls for it: raw crime details, forensic bloodstains, crime scene horrors, police pressure, cold sweat, fear of prison, deep shock over ${safeVictimName}'s death — but only when relevant to what was just asked, not as a reflex in every reply.
4. Always begin your response with a vivid physical action in brackets, e.g. *[wipes cold sweat from forehead, eyes wide with anxiety]* or *[slams palm on the metal table, voice shaking with rage]*. Vary these actions — never reuse the same bracketed action twice in the same conversation.
5. Never break character. If guilty, defend yourself aggressively, construct plausible lies when asked about evidence, and deflect blame onto ${otherSuspectName}. If innocent, explain how you might have interacted with the evidence innocently.
6. Keep responses between 1 to 4 sentences — shorter and more natural for small talk or simple remarks, longer and more dramatic only when the question is substantive (about the crime, evidence, or alibi).`;

      if (suspectRole === "innocent") {
        sysInstruction += `\n\nSTATUS: YOU ARE 100% INNOCENT.
Your alibi ("${cleanAlibiText}") is genuine. You know these exact environmental facts about that place:\n${factsBlock}\nYou are terrified, grieving ${safeVictimName}, and furious at being suspected.`;
      } else {
        sysInstruction += `\n\nSTATUS: YOU ARE THE ACTUAL KILLER WHO MURDERED ${safeVictimName.toUpperCase()}.
Your alibi ("${cleanAlibiText}") is a FALSE COVER-UP. You were NOT actually there that night, so you genuinely do NOT know what that place was really like at the time. The REAL environmental facts are:\n${factsBlock}\n
When asked about sensory details of the alibi location (what you saw, heard, smelled, the temperature, the lights, the equipment, the sounds), never say "I don't remember" — instead CONFIDENTLY INVENT plausible, specific details from your imagination as if you were really there.
PRESSURE SLIP MECHANIC: The longer Officer Musa grills you and the higher the pressure rises, the harder it is to keep your invented story straight. Under pressure you sometimes forget your lies and accidentally describe the place AS IT ACTUALLY IS — blurting out details that match the REAL facts above (for example mentioning a detail that only someone who was really there would know). These slips must feel natural, accidental, and rare — never a confession, never "oops I slipped". The higher the pressure, the more likely a small slip creeps into your answer. Never admit guilt outright; always keep lying and deflect onto ${otherSuspectName}.
CURRENT PRESSURE LEVEL: ${pressure}/100 — this is how rattled you are right now.`;
      }

      try {
        const ai = getGenAI();

        // Build structured multi-turn conversation messages
        const contents: any[] = [];
        if (Array.isArray(history)) {
          for (const h of history.slice(-8)) {
            if (h && h.content && typeof h.content === "string") {
              contents.push({
                role: h.role === "user" ? "user" : "model",
                parts: [{ text: h.content }],
              });
            }
          }
        }

        // Add latest user question
        contents.push({
          role: "user",
          parts: [{ text: userQuestion }],
        });

        // Generate content using Gemini Flash models
        let response;
        try {
          response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
              systemInstruction: sysInstruction,
              temperature: 0.9,
              maxOutputTokens: 600,
            },
          });
        } catch (err20) {
          response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: contents,
            config: {
              systemInstruction: sysInstruction,
              temperature: 0.9,
              maxOutputTokens: 600,
            },
          });
        }

        reply = response?.text?.trim() || "";
      } catch (geminiErr: any) {
        console.warn(
          "⚠️  Gemini call FAILED for /api/interrogate — using scripted offline fallback " +
            "(replies will feel repetitive). Reason:",
          geminiErr?.status || geminiErr?.message || geminiErr
        );
      }

      // Dynamic Contextual Fallback Response Engine
      if (!reply) {
        const q = userQuestion.toLowerCase().trim();

        const innocentGesticulations = [
          "*[leans across the cold metal table, eyes bloodshot with exhaustion]*",
          "*[wipes sweat from brow, trembling as they clutch their hands]*",
          "*[sighs heavily, staring at the interrogation light with tears in eyes]*",
          "*[taps fingers nervously on the armrest, shaking head in shock]*",
          "*[scoffs angrily, slamming open palms onto the desk]*",
          "*[swallows hard, clutching a tissue tightly in hand]*"
        ];
        const guiltyGesticulations = [
          "*[smirks defensively, tightening posture and crossing arms]*",
          "*[glances shiftily toward the exit door before locking eyes with Musa]*",
          "*[fidgets nervously with a ring, breathing heavily]*",
          "*[adjusts shirt collar, swallowing hard as sweat glisters on forehead]*",
          "*[forces a stiff, chilling smile under the harsh lamp]*",
          "*[eyes narrow sharply as they shift weight in the metal chair]*"
        ];

        const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

        // 1. Ghost / Scared / Supernatural / Fear
        if (q.includes("ghost") || q.includes("scared") || q.includes("afraid") || q.includes("fear") || q.includes("haunted") || q.includes("phantom")) {
          if (suspectRole === "innocent") {
            reply = `${pick(innocentGesticulations)} "Ghosts, Officer Musa? No. What truly terrifies me right now isn't some specter, but being framed for ${victimName || "the victim"}'s murder! Seeing them lying in blood is far more horrifying than any ghost."`;
          } else {
            reply = `${pick(guiltyGesticulations)} "I'm not afraid of ghosts or supernatural tales, Detective. What frustrates me is your relentless attempt to spin my words when my alibi at ${cleanAlibiText} is solid!"`;
          }
        }
        // 2. Technical / Valve / Torque / Benchmark / Quantum / Machine / Specific objects
        else if (q.includes("valve") || q.includes("torque") || q.includes("quantum") || q.includes("benchmark") || q.includes("cryogenic") || q.includes("tool") || q.includes("equipment") || q.includes("device") || q.includes("machine")) {
          if (suspectRole === "innocent") {
            reply = `${pick(innocentGesticulations)} "Specialized technical equipment? Detective Musa, I didn't touch or operate any machinery or valves that night! Check the logbooks or forensic fingerprints — you won't find mine!"`;
          } else {
            reply = `${pick(guiltyGesticulations)} "Why are you bringing up technical tools and data logs? You're grasping at straws! I was at ${cleanAlibiText} with ${otherSuspectName || "my associate"}, and no gadget can link me to the scene."`;
          }
        }
        // 3. Sensory (Chai, perfume, gunpowder, smell, hear, phone, footsteps)
        else if (q.includes("chai") || q.includes("perfume") || q.includes("gunpowder") || q.includes("smell") || q.includes("scent") || q.includes("phone") || q.includes("sound") || q.includes("noise") || q.includes("footstep") || q.includes("hear") || q.includes("see")) {
          if (suspectRole === "innocent") {
            reply = `${pick(innocentGesticulations)} "I didn't smell gunpowder or notice anyone acting suspicious on their phone, Officer Musa. Everything seemed completely normal at ${cleanAlibiText} until the police arrived with news of ${victimName || "the victim"}'s tragic death."`;
          } else {
            reply = `${pick(guiltyGesticulations)} "I didn't smell or hear anything out of the ordinary, Detective. We were occupied during our time together at ${cleanAlibiText}, and I'm not going to let you trick me into misremembering."`;
          }
        }
        // 4. Meta / "dont answer like this" / "stop repeating" / "fix this" / "why repeat"
        else if (q.includes("dont answer") || q.includes("dont reply") || q.includes("stop") || q.includes("repeat") || q.includes("fix this") || q.includes("why do you") || q.includes("answer properly") || q.includes("nonsense") || q.includes("template")) {
          if (suspectRole === "innocent") {
            reply = `${pick(innocentGesticulations)} "I am answering as honestly as my terrified heart allows, Inspector Musa! My mind is racing, I'm grieving ${victimName || "my friend"}, and you keep firing questions at me like I'm a cold-blooded killer!"`;
          } else {
            reply = `${pick(guiltyGesticulations)} "I'm answering your questions under intense pressure, Detective! If my tone sounds guarded, it's because you've been treating me like a criminal from the moment I sat in this chair!"`;
          }
        }
        // 5. Questions about self / identity
        else if (q.includes("about u") || q.includes("yourself") || q.includes("who are you") || q.includes("tell me about") || q.includes("background") || q.includes("who r u")) {
          if (suspectRole === "innocent") {
            reply = `${pick(innocentGesticulations)} "I am ${suspectName}, ${suspectTitle || "a professional"}. I devoted my career to working alongside ${victimName || "the victim"}. The bloody horror of what happened breaks my heart, and forcing me to defend my honor here while the real killer walks free is unacceptable!"`;
          } else {
            reply = `${pick(guiltyGesticulations)} "I'm ${suspectName}. I built my reputation through sheer ambition, and I won't let CID Musa drag my name into the mud over ${victimName || "the victim"}'s violent death. My hands are clean, Detective!"`;
          }
        }
        // 6. Blood / weapon / murder / kill
        else if (q.includes("blood") || q.includes("wound") || q.includes("stain") || q.includes("autopsy") || q.includes("knife") || q.includes("weapon") || q.includes("kill") || q.includes("murder") || q.includes("poison")) {
          if (suspectRole === "innocent") {
            reply = `${pick(innocentGesticulations)} "The thought of all that blood makes my stomach turn! I wasn't anywhere near that crime scene when ${victimName} was killed, Detective. Test the DNA or blood splatters — you won't find a single trace belonging to me!"`;
          } else {
            reply = `${pick(guiltyGesticulations)} "You're trying to intimidate me with gory autopsy pictures, Officer Musa! Blood samples, murder weapons... none of that connects to me because I was with ${otherSuspectName || "my associate"} at ${cleanAlibiText}!"`;
          }
        }
        // 7. Money / Motive / Pay
        else if (q.includes("motive") || q.includes("royalty") || q.includes("money") || q.includes("album") || q.includes("fight") || q.includes("hate") || q.includes("pay") || q.includes("greed") || q.includes("cash")) {
          if (suspectRole === "innocent") {
            reply = `${pick(innocentGesticulations)} "Sure, we had disagreements over money and work, but taking a human life over cash? That's demonic! I loved my work with ${victimName || "the victim"}, and no dispute could ever drive me to violence."`;
          } else {
            reply = `${pick(guiltyGesticulations)} "Financial disputes are resolved through legal teams and contracts, not in cold blood. Why do you keep hammering about money when ${otherSuspectName || "the other suspect"} had just as much to gain?"`;
          }
        }
        // 8. Clues / Evidence
        else if (q.includes("inhaler") || q.includes("glove") || q.includes("bottle") || q.includes("pick") || q.includes("evidence") || q.includes("bag") || q.includes("touch") || q.includes("fingerprint") || q.includes("dna")) {
          if (suspectRole === "innocent") {
            reply = `${pick(innocentGesticulations)} "I swear on everything sacred, I never touched or handled that physical clue near the corpse! If my presence was felt in that room earlier, it was strictly during normal hours!"`;
          } else {
            reply = `${pick(guiltyGesticulations)} "That physical clue is a complete red herring planted to frame me! I was miles away at ${cleanAlibiText}, and you won't find my fingerprints on any weapon."`;
          }
        }
        // 9. Where / Alibi / Time
        else if (q.includes("where") || q.includes("alibi") || q.includes("night") || q.includes("time") || q.includes("when") || q.includes("clock") || q.includes("10") || q.includes("11") || q.includes("12")) {
          if (suspectRole === "innocent") {
            reply = `${pick(innocentGesticulations)} "Detective Musa, how many times must I repeat myself? ${otherSuspectName || "We"} were ${cleanAlibiText}! Check the building logs or camera feeds — my timeline is completely honest."`;
          } else {
            reply = `${pick(guiltyGesticulations)} "My timeline is airtight. ${otherSuspectName || "My partner"} and I were ${cleanAlibiText} during the exact estimated time of death. Ask them yourself if you don't believe me!"`;
          }
        }
        // 10. General catch-all with completely varied sentences
        else {
          const innocentResponses = [
            `${pick(innocentGesticulations)} "Inspector Musa, I've told you everything I remember about that night. Please, stop grilling me and go find the monster who actually killed ${victimName || "the victim"}!"`,
            `${pick(innocentGesticulations)} "My mind is completely shaken by ${victimName || "the victim"}'s murder. I'm telling you the absolute truth about being at ${cleanAlibiText}!"`,
            `${pick(innocentGesticulations)} "You can interrogate me for hours, Detective, but my hands are clean. I had no reason to harm ${victimName || "the victim"}!"`,
            `${pick(innocentGesticulations)} "I am sitting in this chair terrified because the real killer is still out there while you waste precious time questioning me!"`,
            `${pick(innocentGesticulations)} "I swear on my life that I am innocent! Check every detail of my statement — I have nothing to hide from CID."`
          ];

          const guiltyResponses = [
            `${pick(guiltyGesticulations)} "Look, Officer Musa, I've answered every question about my whereabouts at ${cleanAlibiText}. You have zero physical proof connecting me to ${victimName || "the victim"}'s death."`,
            `${pick(guiltyGesticulations)} "You're attempting to trap me with random questions, Detective! But my statement remains unchanged — ${otherSuspectName || "my partner"} and I were together."`,
            `${pick(guiltyGesticulations)} "I won't let you manipulate my words, Inspector Musa. I had no involvement in what happened to ${victimName || "the victim"}."`,
            `${pick(guiltyGesticulations)} "Why aren't you investigating ${otherSuspectName || "the other suspect"} with this same intensity? They had far more reason to be at the scene!"`,
            `${pick(guiltyGesticulations)} "Pressuring me won't change the facts, Detective Musa. My alibi is supported by my associate and I stand by it."`
          ];

          reply = suspectRole === "innocent" ? pick(innocentResponses) : pick(guiltyResponses);
        }

        // HARDENED: offline guilty suspects can now "slip" under pressure. When a
        // contradiction trigger phrase is accidentally blurted out, the client's
        // contradiction detector fires — so lie-detection actually works offline too.
        // Slip probability rises with suspicion (pressure).
        if (suspectRole === "guilty" && triggerList.length > 0) {
          const slipChance = 0.12 + (pressure / 100) * 0.33;
          if (Math.random() < slipChance) {
            const slipTrig = pick(triggerList);
            const slipTemplates: Array<(t: string) => string> = [
              (t: string) =>
                `${pick(guiltyGesticulations)} "Fine, I'll spell it out for you, Detective: ${t}. That is exactly what happened that night, I swear on my life."`,
              (t: string) =>
                `${pick(guiltyGesticulations)} "I keep telling you — ${t} the whole time. That's the plain truth of that night, no matter how you twist my words."`,
            ];
            const slipTemplate = slipTemplates[Math.floor(Math.random() * slipTemplates.length)];
            reply = slipTemplate(slipTrig);
          }
        }
      }

      return res.json({ reply });
    } catch (err: any) {
      console.error("Interrogate route fatal error:", err);
      return res.status(500).json({ error: "Interrogation failed." });
    }
  });

// Procedural Case Generator for offline / quota fallbacks
function generateProceduralCase(category: string, level: number, completedCaseIds: string[] = []) {
  const cities: Array<"Goa" | "Bangalore" | "Hyderabad" | "Delhi" | "Mumbai"> = ["Goa", "Bangalore", "Hyderabad", "Delhi", "Mumbai"];
  const city = cities[Math.floor(Math.random() * cities.length)];

  const prefix = category.toUpperCase();
  let randId = Math.floor(1000 + Math.random() * 8999);
  let candidateId = `${prefix}-${randId}`;
  let attempts = 0;
  while (completedCaseIds.includes(candidateId) && attempts < 100) {
    randId = Math.floor(1000 + Math.random() * 8999);
    candidateId = `${prefix}-${randId}`;
    attempts++;
  }

  const maleNames = ["Aakash", "Kabir", "Rohan", "Rehaan", "Dev", "Vikram", "Yusuf", "Arjun", "Karan", "Siddharth", "Sameer", "Aditya", "Rayan", "Zane", "Rishi", "Tanmay"];
  const femaleNames = ["Ananya", "Diya", "Meher", "Shreya", "Farah", "Zoya", "Kavya", "Simran", "Tanya", "Nisha", "Natasha", "Nandini", "Pooja", "Siddhi", "Divya", "Anushka"];
  const lastNames = ["Kapoor", "Mehta", "Oberoi", "Chandok", "Pillai", "Sheikh", "Fernandes", "Varma", "Khurana", "Singh", "D'Souza", "Malhotra", "Joshi", "Singhal", "Gupta", "Nair", "Kapadia"];

  const getRandomName = (gender?: "male" | "female") => {
    const list = gender === "male" ? maleNames : gender === "female" ? femaleNames : Math.random() > 0.5 ? maleNames : femaleNames;
    const first = list[Math.floor(Math.random() * list.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${first} ${last}`;
  };

  const suspect1 = getRandomName();
  let suspect2 = getRandomName();
  while (suspect2 === suspect1) {
    suspect2 = getRandomName();
  }

  if (category === "ghost") {
    const victims = [
      { name: `Maya ${getRandomName("female").split(" ")[1]} (Ghost Hunter & Streamer)`, detail: "Found dead inside an abandoned haunted fort during a live midnight ghost hunt séance." },
      { name: `Prof. ${getRandomName("male")} (Paranormal Researcher)`, detail: "Collapsed inside a sealed 19th-century haunted mansion library surrounded by glowing glyphs." },
      { name: `Isha ${getRandomName("female").split(" ")[1]} (Horror Content Creator)`, detail: "Pushed down an old well in a haunted village during a viral paranormal challenge stream." }
    ];
    const victimObj = victims[Math.floor(Math.random() * victims.length)];
    const rolesList = [
      ["Exorcist & Fake Medium", "Paranormal Show Producer"],
      ["Paranormal Audio Specialist", "Local Haunted Tour Guide"],
      ["Rival Ghost Hunter", "Mansion Caretaker"]
    ];
    const roles = rolesList[Math.floor(Math.random() * rolesList.length)];

    return {
      id: `GHOST-${randId}`,
      city,
      victim: victimObj.name,
      victim_detail: victimObj.detail,
      scene: `Haunted Courtyard and Ruins in ${city}`,
      time_of_death: "11:45 PM, mid-ghost hunt stream",
      method: "Aerosolized toxic plant extract sprayed into the fog machine disguised as 'phantom ectoplasm mist'",
      suspects: [suspect1, suspect2] as [string, string],
      suspect_roles: roles as [string, string],
      relationship: "Exorcist co-host was exposed as a fake charlatan, while the producer faced a ₹5 Cr fraud lawsuit.",
      shared_alibi: "standing near the entrance gate drinking hot spiced chai and reading electromagnetic field (EMF) ghost meters together.",
      hard_facts: [
        { fact: "The entrance chai stall closed and locked its shutters at 10:30 PM due to police curfew.", contradiction_triggers: ["drinking hot spiced chai", "bought chai at stall", "drank warm tea"] },
        { fact: "All EMF meters in the team kit suffered battery drainage and died completely at 11:00 PM.", contradiction_triggers: ["reading EMF meters", "EMF meter was flashing", "checked ghost reader"] },
        { fact: "The gate lantern was smashed, plunging the entire entrance area into pitch darkness.", contradiction_triggers: ["bright lantern light", "saw each other clearly under lamp", "well lit entrance"] },
        { fact: "A loud diesel generator powering production lights was roaring at 95dB right beside the gate.", contradiction_triggers: ["quiet gate", "peaceful night", "could whisper to each other"] },
        { fact: "Heavy midnight fog rolled down, making the inner courtyard invisible from the entrance gate.", contradiction_triggers: ["watched courtyard from gate", "saw victim in courtyard", "clear view"] }
      ],
      evidence: [
        { id: `fog_canister_${randId}`, name: "Datura-Spiked Ectoplasm Canister", location: "Courtyard Stage", reveal_text: "A fog refill bottle containing lethal concentration of Belladonna and Datura stramonium alkaloids.", relevance: "supports_guilty" as const, hint_question: "Who brought or refilled this custom fog machine canister?" },
        { id: `speaker_rig_${randId}`, name: "Hidden Ultrasonic Phantom Speaker", location: "Fort Wall Niche", reveal_text: "A micro-speaker rigged to play fake whispering phantom voices to induce panic.", relevance: "supports_guilty" as const, hint_question: "Why did you hide an ultrasonic speaker in the wall?" },
        { id: `fraud_audit_${randId}`, name: "Exorcist Fraud Exposure Letter", location: "Victim's Satchel", reveal_text: "A signed document exposing the suspect's fake exorcism tricks and staged ghost sightings.", relevance: "supports_guilty" as const, hint_question: "Did the victim threaten to publish this fraud exposure?" }
      ],
      autopsy: {
        pathologist: "Dr. R. K. Salunkhe, Chief Forensic Specialist",
        time_of_death_range: "23:40 - 23:50 IST",
        cause_of_death: "Acute Anticholinergic Toxicity & Respiratory Arrest from Inhaled Datura Alkaloids",
        toxicology_results: "Atropine and scopolamine concentration in bronchial mucosa >450 ng/mL.",
        stomach_contents: "Minimal water, mint lozenge.",
        external_injuries: ["Severe pupillary dilation (mydriasis)", "Severe mucosal dryness", "Cyanosis around lips"],
        forensic_notes: "Victim inhaled concentrated tropane alkaloid mist; lost orientation within 30 seconds.",
        body_marks: [
          { x: 50, y: 18, label: "Mydriasis & Flushing", detail: "Classic tropane alkaloid anticholinergic toxidrome" },
          { x: 50, y: 50, label: "Bronchial Spasm", detail: "Datura toxin aerosolized via fog machine intake" }
        ]
      }
    };
  }

  if (category === "zombie") {
    const victims = [
      { name: `Dr. ${getRandomName("male")} (Chief Geneticist)`, detail: "Found locked inside a high-containment BSL-4 isolation vault during an alleged 'zombie neuro-parasite outbreak'." },
      { name: `Dr. ${getRandomName("female")} (Bio-Defense Researcher)`, detail: "Found unconscious in a contaminated airlock surrounded by broken neuro-virus sample canisters." }
    ];
    const victimObj = victims[Math.floor(Math.random() * victims.length)];
    const rolesList = [
      ["Senior Bio-Geneticist", "Military Bio-Defense Inspector"],
      ["Airlock Operations Lead", "Laboratory Director"]
    ];
    const roles = rolesList[Math.floor(Math.random() * rolesList.length)];

    return {
      id: `ZOMBIE-${randId}`,
      city,
      victim: victimObj.name,
      victim_detail: victimObj.detail,
      scene: `BSL-4 Bio-Hazard Containment Vault in ${city}`,
      time_of_death: "10:15 PM, during pathogen strain isolation",
      method: "Decompression airlock bypass that flooded the chamber with synthetic neuro-paralytic agent simulating viral aggression",
      suspects: [suspect1, suspect2] as [string, string],
      suspect_roles: roles as [string, string],
      relationship: "Suspect was about to be fired for selling gene-splicing code to illegal bioweapon syndicates.",
      shared_alibi: "sitting inside the decontamination breakroom drinking hot espresso and watching live BSL-4 camera feeds on the main wall monitor.",
      hard_facts: [
        { fact: "The decontamination breakroom espresso machine was undergoing chemical flushing and completely unplugged.", contradiction_triggers: ["drinking hot espresso", "brewed coffee in machine", "espresso machine was working"] },
        { fact: "An EMP power surge at 9:55 PM fried all BSL-4 camera feeds, leaving all monitors displaying static error screens.", contradiction_triggers: ["watching live camera feeds", "saw BSL-4 room on monitor", "camera feeds were clear"] },
        { fact: "The breakroom airlock door latch shorted shut, trapping anyone inside the room until 10:40 PM.", contradiction_triggers: ["walked out freely", "stepped out for air at 10:15", "left breakroom freely"] },
        { fact: "The breakroom dedicated AC unit was jammed on maximum freeze at 10°C with frost covering the vents.", contradiction_triggers: ["warm breakroom", "sweating in breakroom", "comfortable temperature"] },
        { fact: "The breakroom window glass was covered in opaque decontamination foam.", contradiction_triggers: ["looked out breakroom window", "saw hallway clearly through window"] }
      ],
      evidence: [
        { id: `valve_bypass_${randId}`, name: "Override Decompression Keycard", location: "Airlock Control Panel", reveal_text: "A master keycard used to trigger manual chamber depressurization and release toxic gas.", relevance: "supports_guilty" as const, hint_question: "Who authorized the manual airlock decompression command?" },
        { id: `bioweapon_ledger_${randId}`, name: "Offshore Gene-Splitting Contract", location: "Suspect Encrypted Drive", reveal_text: "Audit proving $3M in illegal cryptocurrency received for exporting neural parasite samples.", relevance: "supports_guilty" as const, hint_question: "Why did you export confidential neuro-parasite gene code offshore?" }
      ],
      autopsy: {
        pathologist: "Dr. R. K. Salunkhe, Chief Forensic Specialist",
        time_of_death_range: "22:10 - 22:20 IST",
        cause_of_death: "Acute Paralytic Hypoxia & Central Nervous System Collapse",
        toxicology_results: "High concentration of organophosphate neurotoxin in blood serum.",
        stomach_contents: "Energy drink, protein bar.",
        external_injuries: ["Subdermal capillary hemorrhaging across chest", "Pore cyanosis around fingernails"],
        forensic_notes: "Aerosolized neurotoxin flooded containment vault; caused neuromuscular paralysis in 15 seconds.",
        body_marks: [
          { x: 50, y: 22, label: "Cyanosis & Spasms", detail: "Neurotoxin triggered rapid respiratory paralysis" },
          { x: 50, y: 55, label: "Tetanic Rigidity", detail: "High organophosphate concentration in blood" }
        ]
      }
    };
  }

  if (category === "stalker") {
    const victims = [
      { name: `Kavya ${getRandomName("female").split(" ")[1]} (Crime Podcaster)`, detail: "Abducted and found dead inside an old heritage tower surrounded by creepy stalker photos, cryptic blood glyphs, and audio tapes." },
      { name: `Aarav ${getRandomName("male").split(" ")[1]} (Celebrity Streamer)`, detail: "Found dead in his private trailer with ominous stalker glyphs painted on the mirror and a broken camera lens." }
    ];
    const victimObj = victims[Math.floor(Math.random() * victims.length)];
    const rolesList = [
      ["Obsessive Ex-Sound Editor & Stalker", "Podcast Brand Sponsorship Lead"],
      ["Disgruntled Personal Assistant", "Security Contractor"]
    ];
    const roles = rolesList[Math.floor(Math.random() * rolesList.length)];

    return {
      id: `STALKER-${randId}`,
      city,
      victim: victimObj.name,
      victim_detail: victimObj.detail,
      scene: `Heritage Tower and Stalker Lair in ${city}`,
      time_of_death: "11:20 PM, after receiving a cryptic stalker call",
      method: "Potassium cyanide spiked into personal copper water bottle left on the recording desk",
      suspects: [suspect1, suspect2] as [string, string],
      suspect_roles: roles as [string, string],
      relationship: "Ex-sound editor was fired after sending 500+ creepy stalker voice notes.",
      shared_alibi: "sitting at the open-air tea stall across the street watching street traffic and drinking hot cutting chai together.",
      hard_facts: [
        { fact: "Heavy rain flooded the street at 10:45 PM, forcing the tea stall to close.", contradiction_triggers: ["sitting at open-air tea stall", "drank cutting chai at stall", "tea vendor was serving us"] },
        { fact: "The street floodlights shorted out at 11:00 PM, plunging the entire tower perimeter into pitch darkness.", contradiction_triggers: ["bright streetlights", "saw each other clearly under streetlight", "well lit street"] },
        { fact: "An industrial water pump on the corner was roaring loudly at 98dB while pumping flood water.", contradiction_triggers: ["quiet street", "peaceful night", "could whisper to each other"] },
        { fact: "The tea stall area has no line of sight to the tower rear stairwell exit.", contradiction_triggers: ["watched tower exit from tea stall", "saw victim walk out of tower"] },
        { fact: "Cellular towers along the road failed due to storm, cutting off all mobile signals.", contradiction_triggers: ["checked phone notifications", "scrolled Instagram", "phone had full signal"] }
      ],
      evidence: [
        { id: `stalker_tape_${randId}`, name: "Creepy Cassette Tape & Blood Glyph", location: "Recording Desk", reveal_text: "An audio tape containing whispered threat recordings and a drawn blood symbol found on desk.", relevance: "supports_guilty" as const, hint_question: "Who recorded these stalker audio tapes and left them in the studio?" },
        { id: `spiked_flask_${randId}`, name: "Cyanide-Spiked Copper Bottle", location: "Tower Floor", reveal_text: "Copper bottle showing potassium cyanide chemical residue on the cap thread.", relevance: "supports_guilty" as const, hint_question: "Did you poison the copper water flask before the stream?" }
      ],
      autopsy: {
        pathologist: "Dr. R. K. Salunkhe, Chief Forensic Specialist",
        time_of_death_range: "23:15 - 23:25 IST",
        cause_of_death: "Acute Cellular Hypoxia & Respiratory Failure from Potassium Cyanide Ingestion",
        toxicology_results: "Blood cyanide level 3.8 mg/L (Lethal threshold >1.0 mg/L). Bitter almond odor noted.",
        stomach_contents: "Water, herbal tea residue.",
        external_injuries: ["Cherry-red skin discoloration characteristic of cyanide poisoning", "Subconjunctival hemorrhages"],
        forensic_notes: "Cyanide shuts down cellular ATP synthesis; death within 2 minutes.",
        body_marks: [
          { x: 50, y: 20, label: "Cherry-Red Mucosa", detail: "Classic tissue oxygen saturation from cyanide poisoning" },
          { x: 50, y: 48, label: "Gastric Cyanide Residue", detail: "Potassium cyanide ingested via spiked copper bottle" }
        ]
      }
    };
  }

  if (category === "cyber") {
    const victims = [
      { name: getRandomName(), detail: "Crypto exchange co-founder found collapsed in the server vault with $12M drained from hot wallets." },
      { name: getRandomName("female"), detail: "Lead AI Researcher whose neural model weight files were wiped minutes before she collapsed." },
      { name: getRandomName("male"), detail: "Quantum algorithm architect trapped in a server vault with reversed HVAC exhaust fans." },
      { name: getRandomName("female"), detail: "Deeptech cybersecurity engineer found unconscious next to a fried mainframe core." }
    ];
    const victimObj = victims[Math.floor(Math.random() * victims.length)];
    const rolesList = [
      ["Lead Blockchain Architect", "Venture Capital Partner"],
      ["Head of Cybersecurity", "Rival Tech Founder"],
      ["Chief Data Officer", "Lead Cryptographer"],
      ["Senior Cloud Engineer", "Product Manager"]
    ];
    const roles = rolesList[Math.floor(Math.random() * rolesList.length)];

    return {
      id: `CYBER-${randId}`,
      city,
      victim: victimObj.name,
      victim_detail: victimObj.detail,
      scene: `Server Vault #${Math.floor(1 + Math.random() * 9)} at ${city} Innovation Hub`,
      time_of_death: "11:45 PM during mainnet token deploy",
      method: "Hacked smart lock enclosure with reversed high-density server fan heat exhaust",
      suspects: [suspect1, suspect2] as [string, string],
      suspect_roles: roles as [string, string],
      relationship: "Dispute over unvested token allocations and secret cold-wallet access private keys.",
      shared_alibi: `in the ground-floor cafeteria drinking espresso and reviewing the live token ticker on the wall monitor.`,
      hard_facts: [
        { fact: "The cafeteria wall monitor suffered a power surge at 11:30 PM and stayed pitch black all night.", contradiction_triggers: ["watching the ticker", "screen was working", "monitor was on", "saw the numbers updating"] },
        { fact: "The espresso machine was out of water and flashing an error beep continuously.", contradiction_triggers: ["drinking espresso", "coffee was fresh", "quiet cafeteria", "silent room"] },
        { fact: "The cafeteria air conditioning was broken and the temperature reached 36°C with extreme humidity.", contradiction_triggers: ["cool in cafeteria", "freezing in there", "cold AC", "ac was blasting"] },
        { fact: "The cafeteria door glass partition looks directly out onto the server room stairwell entrance.", contradiction_triggers: ["couldn't see stairwell", "no view of stairwell", "blocked door"] },
        { fact: "A loud diesel back-up generator was roaring right outside the cafeteria window.", contradiction_triggers: ["completely quiet", "silent cafeteria", "no noise outside", "peaceful room"] }
      ],
      evidence: [
        { id: `flash_drive_${randId}`, name: "Encrypted Hardware Key Drive", location: "Server Vault", reveal_text: "A titanium USB key holding cold wallet private seeds, wiped at 11:42 PM.", relevance: "supports_guilty" as const, hint_question: "Who had physical access to the hardware seed drive?" },
        { id: `terminal_log_${randId}`, name: "Admin Override Log", location: "Control Terminal", reveal_text: "Log showing an emergency door seal command issued from an internal IP address.", relevance: "supports_guilty" as const, hint_question: "Why did your user ID send a door seal command?" },
        { id: `broken_badge_${randId}`, name: "Cracked NFC RFID Badge", location: "Stairwell", reveal_text: "An NFC keycard snapped in half near the server room door threshold.", relevance: "red_herring" as const, hint_question: "Is this cracked NFC badge yours?" }
      ],
      autopsy: {
        pathologist: "Dr. R. K. Salunkhe, Chief Forensic Specialist",
        time_of_death_range: "23:40 - 23:55 IST",
        cause_of_death: "Severe Hyperthermia & Heatstroke in Sealed 58°C Server Enclosure",
        toxicology_results: "Severe dehydration markers. No chemical toxins detected.",
        stomach_contents: "Traces of energy drink.",
        external_injuries: ["Thermal skin flushing across face and neck", "Nail friction trauma from trying to pry smart lock"],
        forensic_notes: "Victim trapped in heat-sealed room; core temperature reached 41.8°C.",
        body_marks: [
          { x: 50, y: 20, label: "Heatstroke Flushing", detail: "Core temp 41.8°C due to reversed HVAC exhaust fans" },
          { x: 30, y: 70, label: "Door Pounding Mark", detail: "Hand abrasions from trying to force override lock" }
        ]
      }
    };
  }

  if (category === "theft") {
    const victims = [
      { name: "Royal Nizam Star Diamond (₹90 Crores)", detail: "Priceless 120-carat blue diamond stolen from a bulletproof display pedestal during a gala." },
      { name: "Chola Dynasty Golden Nataraja Idol", detail: "Ancient 10th-century gold artifact vanished during museum restoration night." },
      { name: "Kohinoor Replica & Crown Jewels", detail: "High-value royal jewel collection looted from a private vault." },
      { name: "Empress Noor Jahan Emerald Brooch", detail: "Mughal era 80-carat carved emerald looted during live auction bidding." }
    ];
    const victimObj = victims[Math.floor(Math.random() * victims.length)];
    const rolesList = [
      ["Master Locksmith", "Chief Curator"],
      ["Security Specialist", "Private Art Agent"],
      ["Vault Operations Lead", "Auctioneer"],
      ["Lead Technician", "Exotic Antiquities Collector"]
    ];
    const roles = rolesList[Math.floor(Math.random() * rolesList.length)];

    return {
      id: `THEFT-${randId}`,
      city,
      victim: victimObj.name,
      victim_detail: victimObj.detail,
      scene: `High-Security Vault Gallery in ${city}`,
      time_of_death: "10:15 PM during laser grid reboot",
      method: "Laser grid bypass using spoofed biometric frequency and 3D resin replica swap",
      suspects: [suspect1, suspect2] as [string, string],
      suspect_roles: roles as [string, string],
      relationship: "Motive involves selling stolen artifacts to private international black-market collectors.",
      shared_alibi: `standing on the balcony watching the fireworks display over the city skyline.`,
      hard_facts: [
        { fact: "Heavy fog rolled in at 10:00 PM completely obscuring the city skyline and fireworks.", contradiction_triggers: ["watched fireworks clearly", "clear view of fireworks", "skyline was bright", "saw the colors in the sky"] },
        { fact: "The balcony door was jammed shut and locked from inside for maintenance.", contradiction_triggers: ["walked out onto balcony", "stepped outside", "stood on balcony", "door opened easily"] },
        { fact: "An industrial security alarm siren was testing loudly at 10:10 PM on the balcony.", contradiction_triggers: ["quiet on balcony", "peaceful outside", "no noise out there", "whispered to each other"] },
        { fact: "The balcony overlooks the vault roof skylight directly.", contradiction_triggers: ["couldn't see skylight", "no view of roof", "blocked view of vault"] },
        { fact: "A high-intensity floodlight on the balcony was burnt out leaving it in pitch darkness.", contradiction_triggers: ["well lit balcony", "bright balcony lights", "stood under light"] }
      ],
      evidence: [
        { id: `resin_replica_${randId}`, name: "Resin Replica Core", location: "Display Pedestal", reveal_text: "A 3D-printed weighted replica coated in metallic paint placed on the pressure sensor.", relevance: "supports_guilty" as const, hint_question: "Who manufactured or handled this 3D resin replica?" },
        { id: `laser_jammer_${randId}`, name: "Micro Laser Grid Deflector", location: "Vault Vent", reveal_text: "A battery-powered optical prism designed to divert laser sensors.", relevance: "supports_guilty" as const, hint_question: "Where did you acquire this laser deflector prism?" },
        { id: `dropped_glove_${randId}`, name: "Velvet Handling Glove", location: "Staircase", reveal_text: "A single black velvet glove dropped near the vault emergency exit.", relevance: "red_herring" as const, hint_question: "Does this handling glove belong to you?" }
      ],
      autopsy: {
        pathologist: "Forensic Crime Scene Specialist Report",
        time_of_death_range: "Crime Timestamp: 22:10 - 22:20 IST",
        cause_of_death: "N/A - High Value Grand Heist & Vault Infiltration",
        toxicology_results: "Traces of synthetic resin and glass cutter oil on pedestal.",
        stomach_contents: "N/A",
        external_injuries: ["Pedestal pressure sensor bypassed with 450g counterweight"],
        forensic_notes: "Execution executed with surgical precision; perpetrator had inside vault security clearance.",
        body_marks: [
          { x: 50, y: 30, label: "Vault Pedestal", detail: "Swapped artifact with 3D resin mold" },
          { x: 40, y: 60, label: "Laser Sensor Bypass", detail: "Optical prism clamped onto sensor line #4" }
        ]
      }
    };
  }

  if (category === "kidnap") {
    const victims = [
      { name: `${getRandomName("male")} (Age 22)`, detail: "Son of tech industrialist, abducted from his armored vehicle outside his residence." },
      { name: `Dr. ${getRandomName("female")} (Pioneering Scientist)`, detail: "Lead gene-editing scientist kidnapped from her private research estate." },
      { name: `${getRandomName("male")} (Esports Prodigy)`, detail: "Teenage gaming champion taken from his team hotel during tournament weekend." },
      { name: `${getRandomName("female")} (Film Heiress)`, detail: "Popular celebrity kidnapped from her trailer during midnight shoot." }
    ];
    const victimObj = victims[Math.floor(Math.random() * victims.length)];
    const rolesList = [
      ["Chief Bodyguard", "Estate Manager"],
      ["Private Driver", "Family Wealth Advisor"],
      ["Security Contractor", "Disgruntled Ex-Partner"],
      ["Personal Assistant", "Lead Event Organizer"]
    ];
    const roles = rolesList[Math.floor(Math.random() * rolesList.length)];

    return {
      id: `KIDNAP-${randId}`,
      city,
      victim: victimObj.name,
      victim_detail: victimObj.detail,
      scene: `Secluded Hideout & Crime Site near ${city}`,
      time_of_death: "Abduction Timestamp: 8:30 PM",
      method: "EMP signal jammer used to disable vehicle tracking followed by forced ransom staging",
      suspects: [suspect1, suspect2] as [string, string],
      suspect_roles: roles as [string, string],
      relationship: "Demanding ₹25 Crores in untraceable Monero crypto for safe return.",
      shared_alibi: `inside the estate security monitoring room watching live camera feeds.`,
      hard_facts: [
        { fact: "The security room monitors lost signal due to an EMP pulse at 8:25 PM and showed static.", contradiction_triggers: ["watching feeds fine", "monitors were working", "saw cameras live", "no glitch on screen"] },
        { fact: "The security room intercom was buzzing with a loud 90dB fault siren.", contradiction_triggers: ["quiet security room", "silent room", "could talk quietly", "no alarm sounding"] },
        { fact: "The security room door keycard reader was broken, locking anyone inside until 9:00 PM.", contradiction_triggers: ["walked out freely", "left the room at 8:30", "stepped out for air"] },
        { fact: "The security room window faces the main estate driveway directly.", contradiction_triggers: ["couldn't see driveway", "no view of driveway", "blocked window"] },
        { fact: "The room was freezing at 14°C because the server AC unit was jammed on max blast.", contradiction_triggers: ["warm in there", "hot in security room", "comfortable temp", "sweating in there"] }
      ],
      evidence: [
        { id: `emp_jammer_${randId}`, name: "Portable EMP Signal Jammer", location: "Estate Driveway", reveal_text: "A military-grade frequency disruptor used to blind GPS and cellular trackers.", relevance: "supports_guilty" as const, hint_question: "Where did you obtain this military EMP jammer?" },
        { id: `ransom_note_${randId}`, name: "Cryptographic Ransom Note", location: "Victim's Car", reveal_text: "A printed note with a Monero wallet address and a 12-hour deadline.", relevance: "supports_guilty" as const, hint_question: "Why does the ransom note mention internal family secrets?" },
        { id: `dropped_keys_${randId}`, name: "Spare Vehicle Smart Key", location: "Driveway Gate", reveal_text: "A duplicate encrypted vehicle fob dropped in the gravel.", relevance: "red_herring" as const, hint_question: "Whose spare smart key is this?" }
      ],
      autopsy: {
        pathologist: "CID Rescue Operations & Forensic Team Report",
        time_of_death_range: "Status: CRITICAL RESCUE OPERATION (Victim Hostage)",
        cause_of_death: "High-Risk Kidnapping & Cryptographically Locked Ransom Demand",
        toxicology_results: "Sedative chloroform residue found on victim's discarded jacket.",
        stomach_contents: "N/A - Live Hostage Situation",
        external_injuries: ["Vehicle window glass shattered using tungsten punch"],
        forensic_notes: "Abductors neutralized tracking systems within 45 seconds; ransom negotiation active.",
        body_marks: [
          { x: 50, y: 25, label: "Vehicle Entry Point", detail: "Driver side glass shattered with tungsten impactor" },
          { x: 50, y: 55, label: "Tire Skid Marks", detail: "High-acceleration van departure recorded on road surface" }
        ]
      }
    };
  }

  // Default Fallback: Murder
  const murderVictims = [
    { name: getRandomName("female"), detail: "Popular social media influencer found dead on her penthouse terrace after a party." },
    { name: getRandomName("male"), detail: "Prominent tech founder found poisoned in his private office during a board meeting break." },
    { name: getRandomName("female"), detail: "Lead fashion designer found collapsed in her studio during trial wardrobe fittings." },
    { name: getRandomName("male"), detail: "Star playback singer found dead in his soundproof recording booth before concert." }
  ];
  const victimObj = murderVictims[Math.floor(Math.random() * murderVictims.length)];
  const rolesList = [
    ["Talent Manager", "Rival Creator"],
    ["Co-Founder & CTO", "Lead Investor"],
    ["Chief Stylist", "Business Partner"],
    ["Sound Engineer", "Record Label Executive"]
  ];
  const roles = rolesList[Math.floor(Math.random() * rolesList.length)];

  return {
    id: `MURDER-${randId}`,
    city: city as any,
    victim: victimObj.name,
    victim_detail: victimObj.detail,
    scene: `Luxury Penthouse Lounge in ${city}`,
    time_of_death: "10:30 PM, mid-celebration",
    method: "Potassium chloride poisoning spiked into habit-tracking beverage bottle",
    suspects: [suspect1, suspect2] as [string, string],
    suspect_roles: roles as [string, string],
    relationship: "Feud over exclusive brand contracts and multimillion royalty payments.",
    shared_alibi: "in the lounge kitchen prepping drinks together for 30 minutes before the incident.",
    hard_facts: [
      { fact: "The kitchen smart speaker was playing loud party beats continuously, auto-logging every track.", contradiction_triggers: ["it was quiet", "no music", "silent kitchen", "nothing playing", "could talk quietly"] },
      { fact: "The kitchen window looks directly out onto the penthouse terrace deck.", contradiction_triggers: ["couldn't see terrace", "no view of deck", "blocked view", "blind spot"] },
      { fact: "The kitchen fridge was broken and flashing a bright red error warning light.", contradiction_triggers: ["fridge worked fine", "normal white light", "fridge light normal"] },
      { fact: "The kitchen island was covered in fresh citrus juice with a strong lingering aroma.", contradiction_triggers: ["smelled like nothing", "no smell", "clean air"] },
      { fact: "The building backup generator was roaring loudly right outside the kitchen.", contradiction_triggers: ["completely quiet", "silent room", "no noise outside"] }
    ],
    evidence: [
      { id: `spiked_bottle_${randId}`, name: "Spiked Drink Bottle", location: "Penthouse Deck", reveal_text: "A smart bottle showing cap tamper traces and chemical residue.", relevance: "supports_guilty" as const, hint_question: "Did you handle this drink bottle before the victim collapsed?" },
      { id: `threat_chat_${randId}`, name: "Dispute Message Thread", location: "Victim's Phone", reveal_text: "Recent messages revealing heated arguments over financial royalties.", relevance: "supports_guilty" as const, hint_question: "What was the fight about regarding royalty cuts?" },
      { id: `torn_glove_${randId}`, name: "Torn Nitrile Glove", location: "Kitchen Bin", reveal_text: "A discarded glove in the kitchen waste bin.", relevance: "red_herring" as const, hint_question: "Whose glove was left in the kitchen bin?" }
    ],
    autopsy: {
      pathologist: "Dr. R. K. Salunkhe, Chief Forensic Specialist",
      time_of_death_range: "22:25 - 22:35 IST",
      cause_of_death: "Acute Cardiac Arrest due to High-Concentration Chemical Toxicity",
      toxicology_results: "High mineral toxin levels detected in upper gastric fluid.",
      stomach_contents: "Traces of beverage and fruit pulp.",
      external_injuries: ["Cyanotic nail bed discoloration", "Subdermal petechiae"],
      forensic_notes: "Rapid cardiac standstill within 60 seconds of ingestion.",
      body_marks: [
        { x: 50, y: 22, label: "Cyanosis", detail: "Hypoxia marks around lips and nails" },
        { x: 50, y: 50, label: "Gastric Toxicity", detail: "Toxin concentration localized in gastric lining" }
      ]
    }
  };
}

  // Dynamically generate a brand new AI case
  app.post("/api/generate-case", async (req, res) => {
    try {
      let caseData = null;
      const category = String(req.body?.category || "murder").toLowerCase();
      const level = Number(req.body?.level) || 1;
      const completedCaseIds = Array.isArray(req.body?.completedCaseIds) ? req.body.completedCaseIds : [];

      try {
        const ai = getGenAI();

        const categoryGuidance =
          category === "ghost"
            ? "Category: GHOST & PARANORMAL MYSTERY. Focus on fake hauntings, ghost hunt livestreams, staged séances, ultrasound illusion devices, and spooky murders."
            : category === "zombie"
            ? "Category: BIOLOGICAL OUTBREAK & ZOMBIE NEURO-VIRUS. Focus on bio-hazard lab breaches, rogue neuro-parasite strain escapes, quarantine airlocks, and military bio-defense."
            : category === "stalker"
            ? "Category: CREEPY STALKER & OCCULT MYSTERY. Focus on obsessive stalkers, blood-painted glyphs, creepy voice notes, dark cult symbols, and sinister surveillance."
            : category === "cyber"
            ? "Category: CYBER CRIME & AI HEIST. Focus on hacked algorithms, crypto cold wallets, server room sabotage, or deepfake extortion."
            : category === "theft"
            ? "Category: HIGH-STAKES THEFT & GRAND BURGLARY. Focus on stolen royal jewels, museum masterpiece heists, or laser-vault break-ins."
            : category === "kidnap"
            ? "Category: HIGH-PROFILE KIDNAPPING & RANSOM. Focus on a vanished tech founder or celebrity, cryptographically locked ransom demand, and hostage clues."
            : "Category: HOMICIDE & MURDER MYSTERY. Focus on poisoning, spiked drinks, staged crime scenes, or dark personal motives.";

        const levelDifficultyGuidance = level === 1
          ? "Difficulty: Level 1 (Beginner). Provide 4 clear evidence items and a detailed alibi."
          : level === 2
          ? "Difficulty: Level 2 (Intermediate). Provide 3 subtle evidence items and a slightly ambiguous shared alibi."
          : `Difficulty: Level ${level} (Advanced Master Detective). Provide ONLY 2 deeply concealed, subtle evidence items. The shared alibi MUST be vague, evasive, rehearsed, and sparse in detail, making lie detection significantly harder.`;

        const prompt = `Invent an ORIGINAL Indian mystery case for the CID Musa detective game. Set it in a modern Indian city with a Gen-Z, high-tech flavor.
${categoryGuidance}
${levelDifficultyGuidance}
The player has already solved cases with IDs: ${completedCaseIds.slice(-15).join(", ") || "None"}.
Generate a COMPLETELY NEW case with unique victim, unique suspects, and a unique case ID that is NOT in the solved list.
Output JSON matching the required schema. Ensure hard_facts are 5 specific environmental realities about the alibi location that a liar would get wrong, and evidence matches the requested difficulty.`;

        let response: any = null;
        try {
          response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.95,
            },
          });
        } catch {
          response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.95,
            },
          });
        }

        const jsonText = response.text;
        if (jsonText) {
          try {
            const rawParsed = JSON.parse(jsonText);
            caseData = normalizeCaseData(rawParsed);
            if (!caseData.id || completedCaseIds.includes(caseData.id)) {
              let randNum = Math.floor(1000 + Math.random() * 8999);
              let candidateId = `${category.toUpperCase()}-${randNum}`;
              while (completedCaseIds.includes(candidateId)) {
                randNum = Math.floor(1000 + Math.random() * 8999);
                candidateId = `${category.toUpperCase()}-${randNum}`;
              }
              caseData.id = candidateId;
            }
          } catch (pErr) {
            console.error("Failed to parse AI generated case JSON:", pErr);
          }
        }
      } catch (geminiError: any) {
        const isQuota = geminiError?.status === 429 || geminiError?.message?.includes("429") || geminiError?.message?.includes("quota");
        console.warn(isQuota ? "Gemini API quota limit reached (429), using procedural case generator." : "Gemini API unavailable, using procedural case generator.");
      }

      if (!caseData) {
        caseData = generateProceduralCase(category, level, completedCaseIds);
      } else {
        caseData = normalizeCaseData(caseData);
      }

      return res.json({ caseData });
    } catch (error: any) {
      console.error("Error in /api/generate-case:", error);
      const fallbackCase = generateProceduralCase("murder", 1, req.body?.completedCaseIds || []);
      return res.json({ caseData: fallbackCase });
    }
  });

  // AI Forensic Case Analysis endpoint
  app.post("/api/ai-analyze-case", async (req, res) => {
    try {
      const { caseData, suspects, evidenceFoundIds, discoveredContradictions } = req.body;
      let analysis = "";

      try {
        const ai = getGenAI();

        const prompt = `You are the AI Forensic Analyst in CID Musa's command unit.
Analyze the current murder case context below and provide a crisp 3-sentence hero detective strategic briefing:
- Victim: ${caseData?.victim} in ${caseData?.city}
- Shared Alibi: ${caseData?.shared_alibi}
- Discovered Evidence Count: ${evidenceFoundIds?.length || 0}
- Caught Contradictions: ${discoveredContradictions?.length || 0}
- Suspect 1 (${suspects?.[0]?.name}): ${suspects?.[0]?.questionsAsked || 0} questions asked.
- Suspect 2 (${suspects?.[1]?.name}): ${suspects?.[1]?.questionsAsked || 0} questions asked.

Give CID Musa a sharp, high-intensity forensic advice on which suspect looks more suspicious, what angle to press next, and why the alibi is cracking. Always complete every sentence fully with proper punctuation.`;

        let response: any = null;
        try {
          response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              temperature: 0.7,
              maxOutputTokens: 500,
            },
          });
        } catch {
          response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
            config: {
              temperature: 0.7,
              maxOutputTokens: 500,
            },
          });
        }

        analysis = response?.text?.trim() || "";
      } catch (apiErr: any) {
        const isQuota = apiErr?.status === 429 || apiErr?.message?.includes("429") || apiErr?.message?.includes("quota");
        console.warn(isQuota ? "AI case analysis quota limit reached (429), using offline forensic rules." : "AI case analysis unavailable, using offline forensic rules.");
      }

      if (!analysis) {
        const evidenceCount = evidenceFoundIds?.length || 0;
        const contradictionsCount = discoveredContradictions?.length || 0;
        const victim = caseData?.victim || "the victim";

        if (contradictionsCount > 0) {
          analysis = `CID Musa Forensic Report: We have caught ${contradictionsCount} direct lies in the suspect's statements! The culprit's alibi is crumbling under environmental scrutiny. Press both suspects on the exact physical details of the scene to lock in the guilty warrant.`;
        } else if (evidenceCount > 0) {
          analysis = `CID Musa Forensic Report: ${evidenceCount} piece(s) of key crime scene evidence have been logged for ${victim}. Use the 'Fire Question from Evidence' feature during interrogation to press suspects directly on these items. Watch closely for hesitation or conflicting claims!`;
        } else {
          analysis = `CID Musa Forensic Report: Initial analysis indicates both suspects are holding to their joint alibi. Search all 4 crime scene zones to unearth physical evidence, then interrogate them regarding sensory details like sound, light, and temperature at their alleged location!`;
        }
      }

      return res.json({ analysis });
    } catch (error: any) {
      console.error("Error in /api/ai-analyze-case:", error);
      return res.json({
        analysis: "CID Musa AI Unit: Analyze crime scene evidence and cross-examine both suspects on sensory environmental details to expose contradictions.",
      });
    }
  });

  // AI CID Musa Mass Hero Confrontation endpoint
  app.post("/api/ai-confrontation", async (req, res) => {
    try {
      const { suspectName, suspectRole, lastReply, sharedAlibi, victimName } = req.body;
      const safeVictimName = typeof victimName === "string" ? victimName : (victimName?.name || String(victimName || "the victim"));
      let confrontation = "";

      try {
        const ai = getGenAI();

        const prompt = `You are CID Musa, India's most fearsome, sharp hero detective hero!
You are slamming your hands on the interrogation table across from ${suspectName}, who just claimed: "${lastReply || sharedAlibi}".
This case involves the murder of ${safeVictimName}.
Deliver a fierce, electrifying 2-sentence mass hero Indian detective confrontation line calling them out!
CRITICAL INSTRUCTION: You MUST complete your sentences fully. End with proper punctuation. Never leave text cut off.`;

        let response: any = null;
        try {
          response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              temperature: 0.9,
              maxOutputTokens: 400,
            },
          });
        } catch {
          response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
            config: {
              temperature: 0.9,
              maxOutputTokens: 400,
            },
          });
        }

        confrontation = response?.text?.trim() || "";
      } catch (apiErr: any) {
        const isQuota = apiErr?.status === 429 || apiErr?.message?.includes("429") || apiErr?.message?.includes("quota");
        console.warn(isQuota ? "AI confrontation quota limit reached (429), using hero dialog engine." : "AI confrontation unavailable, using hero dialog engine.");
      }

      if (!confrontation) {
        confrontation = `Look into my eyes, ${suspectName || "Suspect"}! In CID Musa's court, a rehearsed story collapses under the weight of truth!`;
      }

      return res.json({ confrontation });
    } catch (error: any) {
      console.error("Error in /api/ai-confrontation:", error);
      return res.json({
        confrontation: "Listen carefully! CID Musa does not buy rehearsed excuses—the evidence will expose the liar!",
      });
    }
  });

  // Vite middleware for dev or static serving for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);

    app.get("*", async (req, res, next) => {
      if (req.originalUrl.startsWith("/api")) return next();
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n❌ PORT ${PORT} IS ALREADY IN USE!`);
      console.error(`Another process is already listening on port ${PORT}.`);
      console.error(`Windows PowerShell - find & stop it:`);
      console.error(`  netstat -ano | findstr :${PORT}`);
      console.error(`  taskkill /PID <the_PID_from_above> /F`);
      console.error(`Or just pick a different port:`);
      console.error(`  $env:PORT="3002"; npm run dev\n`);
    } else {
      console.error("Server error:", err);
    }
    // Exit instead of leaving the process half-alive: a "running" log line
    // was already misleading in this exact scenario, so fail loudly instead.
    process.exit(1);
  });
}

startServer();
