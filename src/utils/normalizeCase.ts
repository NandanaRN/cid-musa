import { CaseData, CityName, EvidenceItem, HardFact, AutopsyReport } from "../types";

export function normalizeCaseData(rawInput: any): CaseData {
  let raw = rawInput;

  // Handle double JSON stringifying
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = {};
    }
  }

  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = {};
    }
  }

  // Handle arrays or wrapped objects
  if (Array.isArray(raw)) {
    raw = raw[0] || {};
  }

  if (raw && typeof raw === "object") {
    if (raw.caseData) raw = raw.caseData;
    else if (raw.case) raw = raw.case;
    else if (raw.data) raw = raw.data;
  }

  if (!raw || typeof raw !== "object") {
    raw = {};
  }

  // 1. Victim
  let victimStr = "Unknown Victim";
  let victimDetailStr = "Found deceased at the crime scene.";

  if (raw.victim) {
    if (typeof raw.victim === "string") {
      victimStr = raw.victim;
    } else if (typeof raw.victim === "object" && raw.victim !== null) {
      if (Array.isArray(raw.victim)) {
        const item = raw.victim[0];
        if (typeof item === "string") victimStr = item;
        else if (item && typeof item === "object") {
          victimStr = item.name || item.title || "Unknown Victim";
          if (item.detail) victimDetailStr = String(item.detail);
        }
      } else {
        victimStr = raw.victim.name || raw.victim.title || "Unknown Victim";
        if (raw.victim.detail) victimDetailStr = String(raw.victim.detail);
      }
    } else {
      victimStr = String(raw.victim);
    }
  }

  if (raw.victim_detail && typeof raw.victim_detail === "string") {
    victimDetailStr = raw.victim_detail;
  } else if (raw.victimDetail && typeof raw.victimDetail === "string") {
    victimDetailStr = raw.victimDetail;
  }

  // 2. Suspects & Roles
  let rawSuspectsList = raw.suspects || raw.suspect_names || raw.suspects_list || raw.suspectsList;
  let rawRolesList = raw.suspect_roles || raw.suspectRoles || raw.roles;

  const parsedSuspectNames: string[] = [];
  const parsedSuspectRoles: string[] = [];

  if (Array.isArray(rawSuspectsList)) {
    rawSuspectsList.forEach((s: any, idx: number) => {
      if (typeof s === "string") {
        parsedSuspectNames.push(s);
      } else if (s && typeof s === "object") {
        const name = s.name || s.title || `Suspect ${idx + 1}`;
        parsedSuspectNames.push(String(name));
        if (s.role && typeof s.role === "string") {
          parsedSuspectRoles.push(s.role);
        }
      }
    });
  }

  if (Array.isArray(rawRolesList)) {
    rawRolesList.forEach((r: any) => {
      if (typeof r === "string") {
        parsedSuspectRoles.push(r);
      }
    });
  }

  const name0 = parsedSuspectNames[0] || "Suspect A";
  const name1 = parsedSuspectNames[1] || (name0 !== "Suspect B" ? "Suspect B" : "Suspect C");
  const role0 = parsedSuspectRoles[0] || "Key Suspect";
  const role1 = parsedSuspectRoles[1] || "Person of Interest";

  // 3. City
  const validCities: CityName[] = ["Goa", "Bangalore", "Hyderabad", "Delhi", "Mumbai"];
  let city: CityName = "Delhi";
  if (typeof raw.city === "string" && validCities.includes(raw.city as CityName)) {
    city = raw.city as CityName;
  } else {
    city = validCities[Math.floor(Math.random() * validCities.length)];
  }

  // 4. Strings
  const safeStr = (val: any, fallback: string) => {
    if (typeof val === "string" && val.trim().length > 0) return val.trim();
    if (val && typeof val === "object") return JSON.stringify(val);
    if (val !== undefined && val !== null) return String(val);
    return fallback;
  };

  const scene = safeStr(raw.scene, `Crime Scene in ${city}`);
  const time_of_death = safeStr(raw.time_of_death || raw.timeOfDeath, "10:30 PM");
  const method = safeStr(raw.method, "Targeted foul play");
  const relationship = safeStr(raw.relationship, "Colleagues with ongoing disputes over work and money.");
  const shared_alibi = safeStr(raw.shared_alibi || raw.sharedAlibi, "standing near the entrance gate reviewing timeline notes together.");

  // 5. Hard Facts
  const rawHardFacts = Array.isArray(raw.hard_facts) ? raw.hard_facts : Array.isArray(raw.hardFacts) ? raw.hardFacts : [];
  const hard_facts: HardFact[] = [];

  rawHardFacts.forEach((hf: any) => {
    if (typeof hf === "string") {
      hard_facts.push({
        fact: hf,
        contradiction_triggers: ["talking", "stayed together", "doing that"],
      });
    } else if (hf && typeof hf === "object") {
      const factStr = safeStr(hf.fact, "The alibi location had severe environmental anomalies.");
      let triggers: string[] = [];
      if (Array.isArray(hf.contradiction_triggers)) {
        triggers = hf.contradiction_triggers.map((t: any) => String(t));
      } else if (Array.isArray(hf.triggers)) {
        triggers = hf.triggers.map((t: any) => String(t));
      }
      if (triggers.length === 0) {
        triggers = ["doing that", "stayed there", "saw clearly"];
      }
      hard_facts.push({ fact: factStr, contradiction_triggers: triggers });
    }
  });

  if (hard_facts.length === 0) {
    hard_facts.push(
      {
        fact: "The location power was cut off at 10:00 PM, disabling all electric appliances and lights.",
        contradiction_triggers: ["lights were on", "used blender", "tv was playing", "bright lighting"],
      },
      {
        fact: "Heavy rain flooded the entrance street at 10:15 PM, forcing all nearby shops to close.",
        contradiction_triggers: ["bought coffee at shop", "drank tea at stall", "shops were open"],
      },
      {
        fact: "An emergency alarm siren was blaring loudly at 95dB throughout the entire area.",
        contradiction_triggers: ["quiet room", "silent atmosphere", "could whisper to each other"],
      }
    );
  }

  // 6. Evidence
  const rawEvidence = Array.isArray(raw.evidence) ? raw.evidence : Array.isArray(raw.evidenceItems) ? raw.evidenceItems : [];
  const evidence: EvidenceItem[] = [];

  rawEvidence.forEach((ev: any, idx: number) => {
    if (ev && typeof ev === "object") {
      evidence.push({
        id: safeStr(ev.id, `ev_${idx}_${Date.now()}`),
        name: safeStr(ev.name, `Physical Evidence #${idx + 1}`),
        location: safeStr(ev.location, scene),
        reveal_text: safeStr(ev.reveal_text || ev.revealText, "Logged in forensic evidence inventory."),
        relevance: ev.relevance === "red_herring" ? "red_herring" : "supports_guilty",
        hint_question: safeStr(ev.hint_question || ev.hintQuestion, "Can you explain this physical evidence found at the crime scene?"),
      });
    }
  });

  if (evidence.length === 0) {
    evidence.push(
      {
        id: `ev_spiked_${Date.now()}`,
        name: "Tampered Beverage Bottle",
        location: scene,
        reveal_text: "Container showing cap tampering marks and chemical residue.",
        relevance: "supports_guilty",
        hint_question: "Did you handle or bring this beverage container to the scene?",
      },
      {
        id: `ev_doc_${Date.now()}`,
        name: "Signed Financial Agreement Notice",
        location: scene,
        reveal_text: "Document showing heated financial disputes and legal demands.",
        relevance: "supports_guilty",
        hint_question: "What was this financial agreement document about?",
      }
    );
  }

  // 7. Autopsy
  let autopsy: AutopsyReport | undefined = undefined;
  if (raw.autopsy && typeof raw.autopsy === "object") {
    const rawA = raw.autopsy;
    const bodyMarksRaw = Array.isArray(rawA.body_marks) ? rawA.body_marks : [];
    const body_marks = bodyMarksRaw.map((bm: any) => ({
      x: typeof bm?.x === "number" ? bm.x : 50,
      y: typeof bm?.y === "number" ? bm.y : 50,
      label: safeStr(bm?.label, "Forensic Injury Mark"),
      detail: safeStr(bm?.detail, "Observed during medical examination"),
    }));

    autopsy = {
      pathologist: safeStr(rawA.pathologist, "Dr. R. K. Salunkhe, Chief Forensic Specialist"),
      time_of_death_range: safeStr(rawA.time_of_death_range || rawA.timeOfDeathRange, "22:15 - 22:45 IST"),
      cause_of_death: safeStr(rawA.cause_of_death || rawA.causeOfDeath, "Acute Asphyxiation / Chemical Toxicity"),
      toxicology_results: safeStr(rawA.toxicology_results || rawA.toxicologyResults, "Elevated toxicological concentration detected in gastric fluid."),
      stomach_contents: safeStr(rawA.stomach_contents || rawA.stomachContents, "Water, beverage traces"),
      external_injuries: Array.isArray(rawA.external_injuries)
        ? rawA.external_injuries.map((i: any) => String(i))
        : ["Cyanosis around fingernails and lips"],
      forensic_notes: safeStr(rawA.forensic_notes || rawA.forensicNotes, "Signs of sudden systemic distress and respiratory paralysis."),
      body_marks: body_marks.length > 0 ? body_marks : [
        { x: 50, y: 20, label: "Cyanosis", detail: "Facial and lip hypoxia marks" },
        { x: 50, y: 50, label: "Gastric Toxicity", detail: "Concentrated toxin in upper stomach" }
      ],
    };
  }

  const idStr = safeStr(raw.id, `CASE-${Math.floor(1000 + Math.random() * 8999)}`);

  return {
    id: idStr,
    city,
    victim: victimStr,
    victim_detail: victimDetailStr,
    scene,
    time_of_death,
    method,
    suspects: [name0, name1],
    suspect_roles: [role0, role1],
    relationship,
    shared_alibi,
    hard_facts,
    evidence,
    autopsy,
  };
}
