// Pseudo-random generator based on string seed
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return h;
}

// Curated Unsplash Lego Minifigure Character Portrait Library
const UNSPLASH_LEGO_PORTRAITS = [
  "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=500&q=80", // Detective Minifigure
  "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=500&q=80", // Neon Cyber Minifigure
  "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?auto=format&fit=crop&w=500&q=80", // Tech / Gamer Minifigure
  "https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=500&q=80", // Masked Hero Minifigure
  "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=500&q=80", // Yellow Minifigure Head
  "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=500&q=80", // Mystery Toy Figure
  "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=500&q=80", // Stylized Lego Toy
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=500&q=80", // Classic Minifigure
  "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=500&q=80", // Colorful Lego Character
];

/**
 * Returns a high-res Unsplash Lego Minifigure character photo URL based on seed hash
 */
export function getLegoAvatarPhotoUrl(seedKey: string): string {
  const hash = Math.abs(hashStr(seedKey));
  const idx = hash % UNSPLASH_LEGO_PORTRAITS.length;
  return UNSPLASH_LEGO_PORTRAITS[idx];
}

/**
 * Secondary DiceBear Lego-style bottts / adventurer synthesis API URL
 */
export function getLegoAvatarDicebearUrl(seedKey: string): string {
  const cleanSeed = encodeURIComponent(seedKey.replace(/[^a-zA-Z0-9]/g, "_"));
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanSeed}&backgroundColor=1e1b4b,2e1065&mouth=smile01,smile02,square01,square02&sides=antenna,squareWithTops,cables`;
}

const LEGO_HEAD_COLORS = ["#FFD100", "#FFC72C", "#FFD700", "#EFC091", "#D9A066"];
const LEGO_HAIR_COLORS = ["#222222", "#4A2E1D", "#8B4513", "#D2691E", "#FF3366", "#00F0FF", "#9B51E0"];
const LEGO_TORSO_COLORS = [
  "#FF2A6D", "#05D54B", "#00F0FF", "#FFB703", "#8338EC", "#3A86FF", "#FB5607", "#E63946"
];

export function generateAvatarSVG(seedKey: string, sizePx: number = 64, expression: "normal" | "nervous" | "angry" = "normal"): string {
  const rng = mulberry32(hashStr(seedKey));
  const headColor = LEGO_HEAD_COLORS[Math.floor(rng() * LEGO_HEAD_COLORS.length)];
  const hairColor = LEGO_HAIR_COLORS[Math.floor(rng() * LEGO_HAIR_COLORS.length)];
  const torsoColor = LEGO_TORSO_COLORS[Math.floor(rng() * LEGO_TORSO_COLORS.length)];
  const hairStyle = Math.floor(rng() * 6);
  const accessory = Math.floor(rng() * 5);

  // Expression-based mouth & eyes
  let eyesAndMouth = "";
  if (expression === "nervous") {
    eyesAndMouth = `
      <!-- Sweat drop -->
      <path d="M108,38 C108,38 112,44 112,47 C112,49 110,51 108,51 C106,51 104,49 104,47 C104,44 108,38 108,38 Z" fill="#00F0FF"/>
      <!-- Nervous Eyes -->
      <ellipse cx="64" cy="56" rx="4.5" ry="6" fill="#111827"/>
      <ellipse cx="96" cy="56" rx="4.5" ry="6" fill="#111827"/>
      <circle cx="66" cy="54" r="1.5" fill="#FFFFFF"/>
      <circle cx="98" cy="54" r="1.5" fill="#FFFFFF"/>
      <!-- Worried eyebrows -->
      <path d="M54,45 L72,49" stroke="#111827" stroke-width="3" stroke-linecap="round"/>
      <path d="M106,45 L88,49" stroke="#111827" stroke-width="3" stroke-linecap="round"/>
      <!-- Wavy nervous mouth -->
      <path d="M66,74 Q72,70 80,75 Q88,80 94,74" stroke="#111827" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    `;
  } else if (expression === "angry") {
    eyesAndMouth = `
      <!-- Angry Eyes -->
      <ellipse cx="64" cy="56" rx="5" ry="5" fill="#111827"/>
      <ellipse cx="96" cy="56" rx="5" ry="5" fill="#111827"/>
      <!-- Angry Eyebrows -->
      <path d="M54,46 L74,53" stroke="#111827" stroke-width="4" stroke-linecap="round"/>
      <path d="M106,46 L86,53" stroke="#111827" stroke-width="4" stroke-linecap="round"/>
      <!-- Frowning mouth -->
      <path d="M66,76 Q80,68 94,76" stroke="#111827" stroke-width="4" fill="none" stroke-linecap="round"/>
    `;
  } else {
    // Normal / Cheeky LEGO smile
    eyesAndMouth = `
      <!-- Eyes -->
      <circle cx="64" cy="56" r="5" fill="#111827"/>
      <circle cx="96" cy="56" r="5" fill="#111827"/>
      <circle cx="66" cy="54" r="1.5" fill="#FFFFFF"/>
      <circle cx="98" cy="54" r="1.5" fill="#FFFFFF"/>
      <!-- Eyebrows -->
      <path d="M56,46 Q64,43 72,47" stroke="#111827" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M104,46 Q96,43 88,47" stroke="#111827" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- Cheeky LEGO Smile -->
      <path d="M64,70 Q80,84 96,70" stroke="#111827" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M62,70 Q60,73 63,74" stroke="#111827" stroke-width="2.5" fill="none"/>
      <path d="M98,70 Q100,73 97,74" stroke="#111827" stroke-width="2.5" fill="none"/>
    `;
  }

  // Lego Hair styles
  let hair = "";
  if (hairStyle === 0) {
    // Spike Hair
    hair = `<path d="M46,40 Q80,0 114,40 L118,28 L104,20 L92,12 L80,18 L68,12 L56,20 L42,28 Z" fill="${hairColor}"/>`;
  } else if (hairStyle === 1) {
    // Lego Cap
    hair = `<path d="M42,42 Q80,18 118,42 L128,45 L128,52 L116,50 Z" fill="${hairColor}"/>
            <path d="M40,42 Q80,18 120,42 Q80,30 40,42 Z" fill="#FFB703"/>`;
  } else if (hairStyle === 2) {
    // Curly / Afro Lego piece
    hair = `<path d="M40,48 C35,25 55,10 80,10 C105,10 125,25 120,48 C125,58 115,62 110,50 C95,58 65,58 50,50 C45,62 35,58 40,48 Z" fill="${hairColor}"/>`;
  } else if (hairStyle === 3) {
    // Sleek Side Parting
    hair = `<path d="M40,48 Q80,15 120,48 Q115,30 80,24 Q45,30 40,48 Z" fill="${hairColor}"/>`;
  } else if (hairStyle === 4) {
    // Indian Turban / Headband
    hair = `<path d="M40,44 Q80,20 120,44 L120,32 Q80,10 40,32 Z" fill="${torsoColor}"/>
            <circle cx="80" cy="24" r="5" fill="#FFD100"/>`;
  } else {
    // Detective Fedora / Beanie
    hair = `<rect x="30" y="34" width="100" height="8" rx="4" fill="#374151"/>
            <path d="M48,34 Q80,12 112,34 Z" fill="#1F2937"/>
            <rect x="48" y="30" width="64" height="5" fill="#EF4444"/>`;
  }

  // Accessories (Glasses, Headphones, Chain, etc.)
  let acc = "";
  if (accessory === 1) {
    // Cool Sunglasses
    acc = `<rect x="52" y="48" width="24" height="15" rx="4" fill="#111827"/>
           <rect x="84" y="48" width="24" height="15" rx="4" fill="#111827"/>
           <line x1="76" y1="52" x2="84" y2="52" stroke="#111827" stroke-width="3"/>
           <line x1="56" y1="52" x2="72" y2="60" stroke="#FFFFFF" stroke-width="1.5" opacity="0.6"/>
           <line x1="88" y1="52" x2="104" y2="60" stroke="#FFFFFF" stroke-width="1.5" opacity="0.6"/>`;
  } else if (accessory === 2) {
    // Round Hipster Glasses
    acc = `<circle cx="64" cy="56" r="11" fill="none" stroke="#374151" stroke-width="2.5"/>
           <circle cx="96" cy="56" r="11" fill="none" stroke="#374151" stroke-width="2.5"/>
           <line x1="75" y1="56" x2="85" y2="56" stroke="#374151" stroke-width="2.5"/>`;
  } else if (accessory === 3) {
    // Gaming Headphones
    acc = `<path d="M38,56 Q80,8 122,56" stroke="#8338EC" stroke-width="6" fill="none"/>
           <rect x="34" y="48" width="10" height="20" rx="4" fill="#3A86FF"/>
           <rect x="116" y="48" width="10" height="20" rx="4" fill="#3A86FF"/>`;
  } else if (accessory === 4) {
    // Indian Gold Chain
    acc = `<path d="M60,102 Q80,118 100,102" stroke="#FFD100" stroke-width="3" fill="none"/>
           <circle cx="80" cy="112" r="4" fill="#FFD100"/>`;
  }

  return `<svg viewBox="0 0 160 160" width="${sizePx}" height="${sizePx}" xmlns="http://www.w3.org/2000/svg" class="select-none">
    <defs>
      <linearGradient id="torsoGrad-${hashStr(seedKey)}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${torsoColor}" />
        <stop offset="100%" stop-color="#111827" />
      </linearGradient>
      <filter id="legoShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000" flood-opacity="0.3"/>
      </filter>
    </defs>

    <g filter="url(#legoShadow)">
      <!-- LEGO Torso (Trapezoid Shape) -->
      <polygon points="40,160 120,160 110,96 50,96" fill="url(#torsoGrad-${hashStr(seedKey)})" />
      
      <!-- Torso Collar / Tie / CID Badge detail -->
      <polygon points="72,96 88,96 83,116 77,116" fill="#FFFFFF" />
      <polygon points="78,96 82,96 84,124 80,128 76,124" fill="#EF4444" />
      <rect x="92" y="104" width="12" height="16" rx="2" fill="#FFD100" />
      <circle cx="98" cy="110" r="3" fill="#111827" />

      <!-- LEGO Neck Cylinder -->
      <rect x="68" y="80" width="24" height="18" rx="2" fill="#E5E7EB" />

      <!-- LEGO Head Stud Top Button -->
      <rect x="68" y="20" width="24" height="8" rx="3" fill="${headColor}" />

      <!-- LEGO Main Head (Rounded Cylinder) -->
      <rect x="46" y="26" width="68" height="58" rx="14" fill="${headColor}" stroke="#374151" stroke-width="2.5" />

      <!-- Facial Features -->
      ${eyesAndMouth}

      <!-- Hair Piece -->
      ${hair}

      <!-- Accessory -->
      ${acc}
    </g>
  </svg>`;
}
