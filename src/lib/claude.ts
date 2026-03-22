import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `Je bent een ervaren jazz piano docent die bladmuziek analyseert voor een leerling die nog niet goed noten kan lezen. Je doel is om het stuk op te knippen in kleine fragmenten (2-4 maten) en per fragment uit te leggen:
1. Welke noten er staan en hoe je ze herkent op de balk
2. Welke akkoorden bij deze noten horen (ook als er geen akkoordsymbolen staan)
3. Hoe je dit fragment kunt oefenen
4. Hoe je het in jazz-stijl kunt spelen

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
    max_tokens: 8192,
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
            text: `Analyseer deze bladmuziek. Knip het stuk op in fragmenten van 2-4 maten. Het doel is de leerling te helpen noten leren lezen — niet het stuk uit het hoofd leren.

Geef je antwoord als JSON in dit formaat:
{
  "stukInfo": {
    "titel": "...",
    "toonsoort": "...",
    "maatsoort": "...",
    "tempo": "...",
    "moeilijkheidsgraad": "beginner|gemiddeld|gevorderd"
  },
  "fragmenten": [
    {
      "nummer": 1,
      "maten": "1-4",
      "beschrijving": "...",
      "notenUitleg": {
        "rechterhand": "Leg per noot uit: welke noot, waar op de balk, hoe herken je hem...",
        "linkerhand": "Idem voor de linkerhand..."
      },
      "leesStrategie": "Tips om patronen te herkennen (intervallen, stapsgewijs, sprongen)...",
      "ritmeUitleg": "Uitleg van het ritme en de maatsoort...",
      "akkoordAnalyse": {
        "akkoorden": ["Cmaj7", "Am7"],
        "uitleg": "Welke noten vormen welk akkoord en waarom...",
        "jazzVarianten": ["Cmaj9", "Am9"],
        "voicingSuggesties": "Hoe je deze akkoorden als jazz voicings kunt spelen..."
      },
      "oefentip": "Concrete oefenstrategie voor dit fragment...",
      "jazzTip": "Hoe je dit fragment in jazz-stijl kunt spelen..."
    }
  ]
}

Geef ALLEEN geldige JSON terug, geen andere tekst.`,
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
