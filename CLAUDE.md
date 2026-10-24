# JazzKeys — Project Context

## Wat is JazzKeys?
Een webapp die beginners helpt jazz piano te leren. Gebouwd met Next.js 16 (App Router), TypeScript, Tailwind CSS v4. Dark mode design (slate-900/950 achtergrond).

## Kernfuncties
- **Analyse**: Upload bladmuziek (PDF) → Claude analyseert → interactieve notenbalk weergave (afspeelbaar)
- **Bladmuziekspeler**: MusicXML via OpenSheetMusicDisplay met geluid, meelopende piano, metronoom, aftellen, hand-selectie en herhaal-modus
- **Oefenschema**: 12-weeks stappenplan met dagelijkse oefeningen
- **Lessen**: Theorie over intervallen, akkoorden, nummersystemen
- **Akkoorden**: Interactief akkoorden woordenboek

## Notenbalk Rendering — Richtlijnen

### Architectuur
De notenbalk is een SVG-gebaseerde renderer die bladmuziek nabootst:
- `src/lib/staff-utils.ts` — Positionering, duur-mapping, constanten
- `src/components/analyse/NotenBalk.tsx` — SVG renderer (grand staff)
- `src/components/analyse/InteractieveNotenWeergave.tsx` — Scroll container + auto-scroll
- `src/components/analyse/NotenBalkControls.tsx` — Play/pause, snelheid

### Geluid & afspelen
- `src/lib/audio.ts` — Web Audio piano-synth (geen samples) + metronoomtik. `unlockAudio()` altijd vanuit een klik/tap aanroepen.
- `src/lib/score-timeline.ts` — Tijdlijn (noten, tellen, x-posities) in seconden. `buildOsmdTimeline` leest OSMD uit (echte duren, overbindingen, tempo, herhalingen); `buildMaatNotenTimeline` doet dit voor Claude-`MaatData`.
- `src/lib/score-player.ts` — Lookahead-scheduler (25 ms tick, 150 ms vooruit) met snelheid, loop, aftellen, metronoom en muten per hand (part 0 = rechts, 1 = links).
- `src/lib/osmd-svg.ts` — Maatstreep-detectie + `applyMidwayerFixes` (alleen voor Midwayer, via `renderFixes="midwayer"`).
- `PianoKeyboard` is standaard klikbaar (speelt de noot); `PlayNotesButton` speelt een akkoord blok of gebroken.

### Data Model (`src/lib/analyse-schema.ts`)
De Claude API analyseert PDFs en retourneert gestructureerde `MaatData[]` per fragment. De Zod-schema's in `analyse-schema.ts` worden als structured output meegestuurd (gegarandeerd geldige JSON). `controleerMaten()` meldt maten waarvan de duren de maatsoort niet vullen.

**NootData velden:**
- `noot`: Wetenschappelijke notatie (C4 = midden-C, Bb3 = B-mol octaaf 3)
- `duur`: Nederlands — heel, half, kwart, achtste, zestiende + `_met_punt` varianten
- `beatPositie`: Positie in de maat (1, 1.5, 2, 2.5, etc.)
- `hand`: "rechts" | "links"
- `stem`: "omhoog" | "omlaag" — voor meerdere stemmen per balk
- `type`: "noot" | "rust" — rusten moeten ook gerenderd worden
- `verbinding`: optioneel — "overbinding" | "legatoboog" voor ties/slurs

### Rendering Regels
1. **Grand staff**: Treble (G-sleutel) boven, Bass (F-sleutel) onder
2. **Meerdere stemmen per balk**: Stem 1 = stokken omhoog, Stem 2 = stokken omlaag
3. **Rusten**: Moeten als symbolen gerenderd worden (hele rust, halve rust, kwartrust, etc.)
4. **Nootkoppen**: Open (heel/half) vs gevuld (kwart/achtste/zestiende)
5. **Puntnoten**: Dot rechts naast de nootkop
6. **Vlaggen**: 1 vlag = achtste, 2 = zestiende
7. **Hulplijnen**: Voor noten buiten de 5 staff-lijnen
8. **Overbindingen**: Boog tussen dezelfde noot over maatstrepen

### Kleuren (Dark Mode)
- Achtergrond: `#0f172a` (slate-900)
- Balklijnen: `rgba(100, 116, 139, 0.35)`
- Rechterhand noten: `#60a5fa` (blue-400)
- Linkerhand noten: `#818cf8` (indigo-400)
- Geselecteerde noot: `#fbbf24` (amber-400)
- Stokken/stems: `#94a3b8` (slate-400)
- Akkoordsymbolen: `#60a5fa` (blue-400)

### Positionering
- Treble clef: E4 = onderste lijn (positie 8), F5 = bovenste lijn (positie 0)
- Bass clef: G2 = onderste lijn (positie 8), A3 = bovenste lijn (positie 0)
- STEP = 8px per halve lijn-afstand
- Noten worden diatonisch gepositioneerd (accidentals veranderen de Y niet)

### Claude API (`src/lib/claude.ts`, server-only)
- Model: `claude-opus-5-5` (overschrijfbaar met `CLAUDE_MODEL`), adaptive thinking, effort `high` voor PDF (`CLAUDE_PDF_EFFORT`) en `medium` voor akkoorden (`CLAUDE_AKKOORD_EFFORT`).
- Server-side refusal-fallback aan (`fallbacks: "default"`).
- `/api/analyse-pdf` streamt NDJSON (`progress` / `ping` / `result` / `error`), `maxDuration = 300`. PDF max 4 MB (Vercel body-limiet 4,5 MB).

### Claude PDF Analyse Prompt
De prompt in `src/lib/claude.ts` moet **elke noot en rust** uit de bladmuziek halen met:
- Exacte nootnaam + octaaf
- Exacte duur
- Exacte beat-positie
- Welke hand + welke stem (bij meerdere stemmen)
- Type (noot of rust)

**Veelvoorkomende fouten in Claude's analyse:**
- Rusten overslaan
- Meerdere stemmen per balk niet herkennen
- Verkeerde octaafnummers
- Overbindingen niet vermelden
- Te weinig noten per maat (sommige noten missen)

## Database
- Neon (PostgreSQL) via Drizzle ORM
- `DATABASE_URL` in env vars
- Schema: `src/db/schema.ts`
- Analyses worden opgeslagen zodat ze niet opnieuw gedaan hoeven worden

## Deployment
- Git repo: https://github.com/janpieterbaalder/jazzkeys
- Live: https://jazzkeys.vercel.app
- Auto-deploy via Vercel bij push naar master

## Dev Server
```bash
cd jazzkeys && npm run dev -- --port 3000
```

## Controles
```bash
npm run check   # typecheck + eslint + vitest
npm run build
```
