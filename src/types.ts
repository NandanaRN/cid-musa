export type CityName = "Goa" | "Bangalore" | "Hyderabad" | "Delhi" | "Mumbai";

export interface HardFact {
  fact: string;
  contradiction_triggers: string[];
}

export interface EvidenceItem {
  id: string;
  name: string;
  location: string;
  reveal_text: string;
  relevance: "supports_guilty" | "red_herring";
  hint_question: string;
}

export interface BodyMark {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  label: string;
  detail: string;
}

export interface AutopsyReport {
  pathologist: string;
  time_of_death_range: string;
  cause_of_death: string;
  toxicology_results: string;
  stomach_contents: string;
  external_injuries: string[];
  forensic_notes: string;
  body_marks: BodyMark[];
}

export interface CaseData {
  id: string;
  city: CityName;
  victim: string;
  victim_detail: string;
  scene: string;
  time_of_death: string;
  method: string;
  suspects: [string, string];
  suspect_roles: [string, string];
  relationship: string;
  shared_alibi: string;
  hard_facts: HardFact[];
  evidence: EvidenceItem[];
  autopsy?: AutopsyReport;
}

export interface InterrogationTurn {
  role: "user" | "model";
  content: string;
  timestamp?: number;
}

export interface SuspectState {
  name: string;
  title: string;
  role: "guilty" | "innocent";
  avatarSeed: string;
  accent: string;
  history: InterrogationTurn[];
  questionsAsked: number;
}

export interface ZoneData {
  name: string;
  items: EvidenceItem[];
  x: number;
  y: number;
  w: number;
  h: number;
  searched: boolean;
}

export interface DiscoveredContradiction {
  id: string;
  suspectName: string;
  question: string;
  reply: string;
  factContradicted: string;
  timestamp: string;
}

export type GameScreen = "intro" | "briefing" | "scene" | "interrogation" | "jail" | "ending";
