import { CityName, GameScreen } from "../types";

export interface BackgroundConfig {
  imageUrl: string;
  overlay: string;
}

const CITY_BACKGROUNDS: Record<CityName, string> = {
  Goa: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80", // Coastal Goa luxury villa
  Bangalore: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1920&q=80", // Tech hub Bangalore skyline
  Hyderabad: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80", // Neon esports stage
  Delhi: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1920&q=80", // Music studio
  Mumbai: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1920&q=80", // Mumbai Marine Drive night lights
};

// Atmospheric, bloody murder mystery gothic/noir crime scene imagery
const SCREEN_BACKGROUNDS: Record<GameScreen, string> = {
  intro: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80", // Eerie foggy murder mansion
  briefing: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=1920&q=80", // Dark ominous archway crime scene
  scene: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80", // Foggy murder mystery alley
  interrogation: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1920&q=80", // Shadowy, intense interrogation booth
  jail: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1920&q=80", // Iron cell bars
  ending: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1920&q=80",
};

// Dark crimson, blood-noir gradient overlays
const SCREEN_OVERLAYS: Record<GameScreen, string> = {
  intro: "bg-gradient-to-br from-black/95 via-red-950/85 to-stone-950/95 backdrop-blur-[2px]",
  briefing: "bg-gradient-to-br from-black/95 via-rose-950/85 to-neutral-950/90 backdrop-blur-[2px]",
  scene: "bg-gradient-to-br from-stone-950/90 via-red-950/80 to-black/95 backdrop-blur-[1px]",
  interrogation: "bg-gradient-to-br from-red-950/90 via-black/90 to-stone-950/95 backdrop-blur-[2px]",
  jail: "bg-gradient-to-br from-black/95 via-red-950/90 to-zinc-950/95 backdrop-blur-[2px]",
  ending: "bg-gradient-to-br from-neutral-950/95 via-red-950/80 to-stone-950/95 backdrop-blur-[2px]",
};

// Darker color palettes & gothic-inspired backgrounds for Creepy theme
const CREEPY_BACKGROUNDS: Record<GameScreen, string> = {
  intro: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80",
  briefing: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=1920&q=80",
  scene: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80",
  interrogation: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1920&q=80",
  jail: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1920&q=80",
  ending: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80",
};

const CREEPY_OVERLAYS: Record<GameScreen, string> = {
  intro: "bg-gradient-to-br from-black/95 via-red-950/90 to-stone-950/95 backdrop-blur-[2px]",
  briefing: "bg-gradient-to-br from-black/95 via-rose-950/85 to-neutral-950/90 backdrop-blur-[2px]",
  scene: "bg-gradient-to-br from-stone-950/90 via-red-950/80 to-black/95 backdrop-blur-[1px]",
  interrogation: "bg-gradient-to-br from-red-950/95 via-black/90 to-stone-950/95 backdrop-blur-[2px]",
  jail: "bg-gradient-to-br from-black/95 via-red-950/90 to-zinc-950/95 backdrop-blur-[2px]",
  ending: "bg-gradient-to-br from-neutral-950/95 via-red-950/80 to-stone-950/95 backdrop-blur-[2px]",
};

// Stalker-mystery themed background variations
const STALKER_BACKGROUNDS: Record<GameScreen, string> = {
  intro: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1920&q=80",
  briefing: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=1920&q=80",
  scene: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80",
  interrogation: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1920&q=80",
  jail: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1920&q=80",
  ending: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1920&q=80",
};

const STALKER_OVERLAYS: Record<GameScreen, string> = {
  intro: "bg-gradient-to-br from-zinc-950/95 via-red-950/80 to-black/95 backdrop-blur-[2px]",
  briefing: "bg-gradient-to-br from-neutral-950/90 via-rose-950/85 to-stone-950/90 backdrop-blur-[2px]",
  scene: "bg-gradient-to-br from-black/90 via-red-950/85 to-zinc-950/95 backdrop-blur-[1px]",
  interrogation: "bg-gradient-to-br from-stone-950/95 via-rose-950/90 to-black/95 backdrop-blur-[2px]",
  jail: "bg-gradient-to-br from-black/95 via-neutral-950/90 to-red-950/90 backdrop-blur-[2px]",
  ending: "bg-gradient-to-br from-neutral-950/95 via-rose-950/80 to-stone-950/95 backdrop-blur-[2px]",
};

export function getPhaseBackground(
  screen: GameScreen,
  city?: CityName,
  theme?: "creepy" | "stalker-mystery" | "default" | string
): BackgroundConfig {
  const normTheme = theme?.toLowerCase() || "";

  if (normTheme.includes("creepy") || normTheme.includes("ghost") || normTheme.includes("zombie")) {
    return {
      imageUrl: CREEPY_BACKGROUNDS[screen] || CREEPY_BACKGROUNDS.scene,
      overlay: CREEPY_OVERLAYS[screen] || CREEPY_OVERLAYS.scene,
    };
  }

  if (normTheme.includes("stalker") || normTheme.includes("mystery")) {
    return {
      imageUrl: STALKER_BACKGROUNDS[screen] || STALKER_BACKGROUNDS.scene,
      overlay: STALKER_OVERLAYS[screen] || STALKER_OVERLAYS.scene,
    };
  }

  // Default / City-specific fallback
  let imageUrl = SCREEN_BACKGROUNDS[screen];
  if (screen === "scene" || screen === "interrogation" || screen === "briefing") {
    if (city && CITY_BACKGROUNDS[city]) {
      imageUrl = CITY_BACKGROUNDS[city];
    }
  }

  return {
    imageUrl,
    overlay: SCREEN_OVERLAYS[screen] || "bg-gradient-to-br from-black/95 via-red-950/85 to-stone-950/95",
  };
}
