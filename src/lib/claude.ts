import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `Je bent een ervaren jazz piano docent die bladmuziek analyseert voor een leerling die nog niet goed noten kan lezen. Je doel is om het stuk op te knippen in kleine fragmenten (2-4 maten) en per fragment uit te leggen:
1. Welke noten er staan en hoe je ze herkent op de balk
2. Welke akkoorden bij deze noten horen (ook als er geen akkoordsymbolen staan)
3. Hoe je dit fragment kunt oefenen
4. Hoe je het in jazz-stijl kunt spelen

BELANGRIJK: Gebruik altijd wetenschappelijke nootnotatie met octaafnummer. Midden-C = C4. De octaaf onder midden-C = octaaf 3. Gebruik C, D, E, F, G, A, B voor stamtonen. Gebruik # voor kruis (bijv. F#4, C#3) en b voor mol (bijv. Bb3, Eb4).

Antwoord ALTIJD in het Nederlands. Geef je antwoord als JSON.`;

export interface StukInfo {
  titel: string;
  toonsoort: string;
  maatsoort: string;
  tempo: string;
  moeilijkheidsgraad: "beginner" | "gemiddeld" | "gevorderd";
}

export interface AkkoordAnalyse {
  akkoorden: string[];
  uitleg: string;
  jazzVarianten: string[];
  voicingSuggesties: string;
}

export interface NootData {
  noot: string; // "C4", "Bb3", etc. Bij rust: "rust"
  type: "noot" | "rust";
  duur: string; // heel, half, kwart, achtste, zestiende + _met_punt
  beatPositie: number; // 1, 1.5, 2, etc.
  hand: "rechts" | "links";
  stem: "omhoog" | "omlaag"; // stem-richting (voor meerdere stemmen)
  balkPositie: string; // uitleg positie op de balk
  uitleg: string;
  verbinding?: "overbinding" | "legatoboog"; // tie/slur naar volgende noot
}

export interface MaatData {
  maatNummer: number;
  noten: NootData[];
  akkoord?: string;
  dynamiek?: string; // p, f, mf, etc.
}

export interface Fragment {
  nummer: number;
  maten: string;
  beschrijving: string;
  notenUitleg: {
    rechterhand: string;
    linkerhand: string;
  };
  leesStrategie: string;
  ritmeUitleg: string;
  akkoordAnalyse: AkkoordAnalyse;
  oefentip: string;
  jazzTip: string;
  maatNoten?: MaatData[];
}

export interface PdfAnalyseResult {
  stukInfo: StukInfo;
  fragmenten: Fragment[];
}

export interface AkkoordAnalyseResult {
  toonsoort: string;
  analyse: {
    akkoord: string;
    functie: string;
    uitleg: string;
  }[];
  voicingSuggesties: {
    akkoord: string;
    shell: string;
    rootlessA: string;
    rootlessB: string;
  }[];
  oefenplan: string[];
  jazzVariaties: string[];
}

export async function analyseerPdf(
  pdfBase64: string
): Promise<PdfAnalyseResult> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 16384,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: pdfBase64,
            },
          },
          {
            type: "text",
            text: `Analyseer deze bladmuziek NOOT VOOR NOOT. Focus op de EERSTE 4 MATEN en analyseer die perfect. Daarna de rest in fragmenten van 2-4 maten.

Het doel is dat wij de bladmuziek exact kunnen NARENDEREN als interactieve notenbalk. Elke noot, rust, overbinding en dynamiek-aanduiding moet aanwezig zijn.

## KRITIEKE REGELS VOOR NOTENANALYSE

1. **ELKE noot en rust telt mee** — als er een kwartrust staat op beat 1, moet die als object in de array staan met type "rust"
2. **Meerdere stemmen per balk**: Als er noten met stokken OMHOOG en OMLAAG op dezelfde balk staan, zijn dat verschillende stemmen. Stem "omhoog" = bovenste stem, "omlaag" = onderste stem
3. **Exacte beat-posities**: Kwart op beat 1 = beatPositie 1. Achtste op de "en" van beat 2 = beatPositie 2.5. Tel nauwkeurig!
4. **Overbindingen (ties)**: Als een noot via een boog verbonden is met dezelfde noot in de volgende maat → verbinding: "overbinding"
5. **Puntnoten**: Een halve noot met punt = "half_met_punt" (duurt 3 tellen). Kwart met punt = "kwart_met_punt" (duurt 1.5 tellen)
6. **Octaafnummers**: C4 = midden-C. B3 = de B net onder midden-C. C3 = een octaaf onder midden-C. Controleer elk octaafnummer twee keer!
7. **Dynamiek**: Noteer p, f, mf etc. in het dynamiek veld van de maat waar het staat

## NOOT NOTATIE
Gebruik # voor kruis (F#4), b voor mol (Bb3, Eb4). Stamtonen: C D E F G A B.

## JSON FORMAAT

{
  "stukInfo": { "titel": "...", "toonsoort": "...", "maatsoort": "...", "tempo": "...", "moeilijkheidsgraad": "beginner|gemiddeld|gevorderd" },
  "fragmenten": [{
    "nummer": 1,
    "maten": "1-4",
    "beschrijving": "...",
    "notenUitleg": { "rechterhand": "...", "linkerhand": "..." },
    "leesStrategie": "...",
    "ritmeUitleg": "...",
    "akkoordAnalyse": { "akkoorden": ["Cmaj7"], "uitleg": "...", "jazzVarianten": ["Cmaj9"], "voicingSuggesties": "..." },
    "oefentip": "...",
    "jazzTip": "...",
    "maatNoten": [{
      "maatNummer": 1,
      "akkoord": "Cmaj7",
      "dynamiek": "p",
      "noten": [
        {
          "noot": "rust",
          "type": "rust",
          "duur": "kwart",
          "beatPositie": 1,
          "hand": "rechts",
          "stem": "omhoog",
          "balkPositie": "",
          "uitleg": "Kwartrust op tel 1 in de rechterhand"
        },
        {
          "noot": "E5",
          "type": "noot",
          "duur": "kwart",
          "beatPositie": 2,
          "hand": "rechts",
          "stem": "omhoog",
          "balkPositie": "vierde ruimte G-sleutel",
          "uitleg": "E op de vierde ruimte van de G-sleutel"
        },
        {
          "noot": "D4",
          "type": "noot",
          "duur": "half_met_punt",
          "beatPositie": 1,
          "hand": "rechts",
          "stem": "omlaag",
          "balkPositie": "net onder de eerste lijn G-sleutel",
          "uitleg": "D net onder de G-sleutel balk, onderste stem"
        }
      ]
    }]
  }]
}

BELANGRIJK:
- Het voorbeeld hierboven is FICTIEF — lees de WERKELIJKE noten uit de PDF!
- Geef ELKE noot en rust die op de bladmuziek staat
- Bij meerdere stemmen per balk: gebruik "stem": "omhoog" voor de bovenste stem en "stem": "omlaag" voor de onderste stem
- Controleer dat de totale duur van ELKE stem in een maat klopt met de maatsoort (bijv. 4 tellen bij 4/4)
- Geef ALLEEN geldige JSON terug`,
          },
        ],
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Extract JSON from response (handle possible markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Geen geldige JSON in het antwoord gevonden");
  }

  return JSON.parse(jsonMatch[0]) as PdfAnalyseResult;
}

export async function analyseerAkkoorden(
  chords: string
): Promise<AkkoordAnalyseResult> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Analyseer deze akkoordprogressie: ${chords}

Geef je antwoord als JSON in dit formaat:
{
  "toonsoort": "...",
  "analyse": [
    {
      "akkoord": "Dm7",
      "functie": "ii",
      "uitleg": "Dit is het tweede trapsakkoord in C majeur..."
    }
  ],
  "voicingSuggesties": [
    {
      "akkoord": "Dm7",
      "shell": "D - F - C (root-3-7)",
      "rootlessA": "F - A - C - E (3-5-7-9)",
      "rootlessB": "C - E - F - A (7-9-3-5)"
    }
  ],
  "oefenplan": [
    "Stap 1: Speel elk akkoord apart als shell voicing...",
    "Stap 2: ..."
  ],
  "jazzVariaties": [
    "Vervang G7 door Db7 (tritone substitutie)...",
    "..."
  ]
}

Geef ALLEEN geldige JSON terug, geen andere tekst.`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Geen geldige JSON in het antwoord gevonden");
  }

  return JSON.parse(jsonMatch[0]) as AkkoordAnalyseResult;
}
