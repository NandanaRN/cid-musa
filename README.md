<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# CID Musa: Glitch in the Alibi

> **🟢 Play live: [https://cid-musa.onrender.com/](https://cid-musa.onrender.com/)**

An AI-powered interactive murder-mystery detective game. You play as **Detective CID
Musa**, investigating Indian crime cases: search the crime scene for evidence, then
interrogate two suspects who share a rehearsed alibi — using AI-generated dialogue and
sensory environmental "hard facts" to catch the liar in a contradiction, and deliver
your verdict before the clock runs out.

## Tech Stack

**Frontend**
- [React 19](https://react.dev/) with TypeScript, function components + hooks
- [Vite 6](https://vitejs.dev/) as the dev server / build tool
- [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite`) for styling
- [Motion](https://motion.dev/) (Framer Motion successor) for animations/cinematics
- [Lucide React](https://lucide.dev/) for icons

**Backend**
- [Express 4](https://expressjs.com/) running under [tsx](https://github.com/privatenumber/tsx)
  (executes the TypeScript server directly, no separate compile step in dev)
- Vite is mounted into Express in **middleware mode**, so one server (`server.ts`)
  handles both the API routes and serves/HMRs the React app — no separate frontend
  server or proxy config needed
- [`@google/genai`](https://www.npmjs.com/package/@google/genai) — official Google
  GenAI SDK, used to call the **Gemini API** (`gemini-2.5-flash`, falling back to
  `gemini-2.5-flash-lite`)
- [`dotenv`](https://www.npmjs.com/package/dotenv) for loading `GEMINI_API_KEY` from
  a local `.env.local` / `.env` file

**Build/Tooling**
- TypeScript (`tsc --noEmit` for type-checking, no emit — Vite/esbuild handle
  transpilation)
- `esbuild` bundles `server.ts` into `dist/server.mjs` for production
- `npm run build` = `vite build` (client) + `esbuild` (server) → `dist/`
- `npm start` runs the production bundle with plain `node`

## Architecture

```
Browser (React SPA)
   │  fetch("/api/...")
   ▼
Express server (server.ts)
   ├─ /api/health            → reports whether GEMINI_API_KEY is configured
   ├─ /api/interrogate       → suspect dialogue during questioning
   ├─ /api/generate-case     → generates a brand-new case
   ├─ /api/ai-analyze-case   → forensic "AI analyst" strategic briefing
   ├─ /api/ai-confrontation  → dramatic hero confrontation line
   └─ (everything else) ─────► Vite middleware → serves the React app (dev)
                                or static dist/ files (prod)
```

Every AI endpoint follows the same pattern: **try Gemini first, and if it's
unavailable (no API key, network error, or a 429 quota error) fall back to a rich,
hand-written offline response generator** — so the game is always playable even
without a Gemini key, just with less dynamic dialogue/cases.

- **`src/data/cases.ts`** — hand-authored preset cases (victim, suspects, shared
  alibi, "hard facts" about the alibi location, physical evidence, autopsy report)
  used when the app first loads / as a fallback pool.
- **`server.ts` → `generateProceduralCase()`** — a large procedural generator that
  can produce brand-new cases across categories (`murder`, `ghost`, `zombie`,
  `stalker`, `cyber`, `theft`, `kidnap`) entirely offline, used when
  `/api/generate-case` can't reach Gemini.
- **`src/utils/normalizeCase.ts`** — normalizes/validates case JSON (whether it came
  from a preset, Gemini, or the procedural generator) into one consistent shape the
  UI can render.
- **`src/components/*`** — one component per game screen/overlay:
  `IntroScreen`, `BriefingScreen`, `CrimeSceneScreen` (evidence search),
  `InterrogationScreen` (chat-style questioning + suspicion meter),
  `AutopsyModal`, `EndingScreen`/`JailCinematic`/`FailureSequence`
  (win/lose cinematics), plus visual flourishes like `DetectiveEntranceAnimation`,
  `VictoryCelebration`, `EmoteSystem`, `ForensicMatch3Game`, and avatar rendering
  (`LegoAvatar`, `avatar.ts`).
- **`src/App.tsx`** — top-level state machine (`GameScreen`: intro → briefing →
  scene → interrogation → jail/ending), owns case state, suspicion levels,
  discovered evidence/contradictions, and the countdown clock.

## Project Structure

```
├── server.ts               # Express + Vite middleware + Gemini API routes
├── vite.config.ts          # Vite config (React, Tailwind, HMR port)
├── index.html              # SPA entry point
├── src/
│   ├── main.tsx             # React root
│   ├── App.tsx               # Game state machine
│   ├── types.ts              # Shared TypeScript types
│   ├── components/           # UI screens, modals, animations
│   ├── data/cases.ts          # Preset case data
│   └── utils/                 # normalizeCase, audio, avatar, backgrounds
├── .env.example             # Template for required env vars
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Environment Variables

Create a `.env.local` file in the project root (never commit this — it's already in
`.gitignore`):

```dotenv
GEMINI_API_KEY="your_real_gemini_api_key_here"
```

Get a free key from [Google AI Studio](https://aistudio.google.com/apikey).
Without it, the app still runs fully — AI responses just use the offline fallback
generators described above instead of live Gemini calls.

`APP_URL` (seen in `.env.example`) is only used when this app is deployed on Google's
AI Studio / Cloud Run; you can ignore it for local development.

## Run Locally

**Prerequisites:** [Node.js](https://nodejs.org/) (which comes with `npm`)

```bash
npm install        # install all dependencies (reads package.json)
npm run dev         # start the dev server (Express + Vite, with HMR)
```

Open whatever URL is printed in the terminal, e.g. `http://localhost:3000`.

### Available scripts

| Script          | What it does                                                    |
|-----------------|------------------------------------------------------------------|
| `npm run dev`   | Start the dev server (hot-reloading React + Express API)        |
| `npm run build` | Build the production client bundle and bundle the server        |
| `npm start`     | Run the production build (`node dist/server.mjs`)                |
| `npm run lint`  | Type-check the whole project with `tsc --noEmit`                 |
| `npm run clean` | Remove `dist/` and any stray build output                        |

### Choosing a different port

If the default port is already taken (by another app, or in some setups even by
VS Code itself), override it:

```powershell
$env:PORT="7070"; npm run dev      # PowerShell
```
```bash
PORT=7070 npm run dev              # macOS/Linux
```

## Troubleshooting

**"Port XXXX is already in use"** (app port, or the Vite HMR port 24678)
Some other process already has that port open. Find and stop it:

```powershell
netstat -ano | findstr :3000
taskkill /PID <PID_FROM_ABOVE> /F
```

or just run on a fresh port (`$env:PORT="7070"; npm run dev`).

**Getting a raw `{"jsonrpc":"2.0", ...}` error instead of the app**
This project contains no JSON-RPC code at all — that response is coming from a
*different* local process (commonly VS Code itself, or another dev tool) that
happens to be listening on the same port/URL you opened. Confirm the exact URL the
terminal printed after `Server running on http://localhost:<PORT>` and open exactly
that; if needed, run on a port nothing else is using.

**AI replies seem generic/scripted instead of dynamic**
Check `http://localhost:<PORT>/api/health` — if `envKeyAvailable` is `false`, your
`GEMINI_API_KEY` isn't being picked up. Make sure it's in a file named `.env.local`
in the project root, then restart `npm run dev`.
