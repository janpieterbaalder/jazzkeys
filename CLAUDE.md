# JazzKeys — Project Context

## Wat is JazzKeys?
Een webapp die beginners helpt jazz piano te leren. Gebouwd met Next.js 16 (App Router), TypeScript, Tailwind CSS v4. Dark mode design (slate-900/950 achtergrond).

## Kernfuncties
- **Analyse**: Upload bladmuziek (PDF) → Claude analyseert → interactieve notenbalk weergave
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

### Data Model (`src/lib/claude.ts`)
De Claude API analyseert PDFs en retourneert gestructureerde `MaatData[]` per fragment.

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
