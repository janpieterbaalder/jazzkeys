import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import {
  AkkoordAnalyseSchema,
  PdfAnalyseSchema,
  type AkkoordAnalyseResult,
  type PdfAnalyseResult,
} from "@/lib/analyse-schema";

export type * from "@/lib/analyse-schema";

const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";

type Effort = "low" | "medium" | "high" | "xhigh" | "max";
const EFFORTS: Effort[] = ["low", "medium", "high", "xhigh", "max"];
function effortFromEnv(name: string, fallback: Effort): Effort {
  const value = process.env[name] as Effort | undefined;
  return value && EFFORTS.includes(value) ? value : fallback;
}

// Noten lezen is precisiewerk → hoge effort. Akkoordanalyse is eenvoudiger.
const PDF_EFFORT = effortFromEnv("CLAUDE_PDF_EFFORT", "high");
const AKKOORD_EFFORT = effortFromEnv("CLAUDE_AKKOORD_EFFORT", "medium");

/** Fouten met een boodschap die direct aan de gebruiker getoond kan worden. */
export class AnalyseError extends Error {
  constructor(
    message: string,
    public status = 500
  ) {
    super(message);
  }
}

let client: Anthropic | null = null;
const GEEN_SLEUTEL =
  "Er is geen Claude API-sleutel ingesteld (ANTHROPIC_API_KEY). MusicXML-bestanden werken wel zonder sleutel.";

function getClient(): Anthropic {
  const { ANTHROPIC_API_KEY, ANTHROPIC_AUTH_TOKEN, ANTHROPIC_PROFILE } = process.env;
  if (!ANTHROPIC_API_KEY && !ANTHROPIC_AUTH_TOKEN && !ANTHROPIC_PROFILE) {
    throw new AnalyseError(GEEN_SLEUTEL, 503);
  }
  if (!client) {
    try {
      client = new Anthropic();
    } catch {
      throw new AnalyseError(GEEN_SLEUTEL, 503);
    }
  }
  return client;
}

/** Zet SDK-fouten om naar een Nederlandse melding met passende HTTP-status. */
export function toAnalyseError(error: unknown): AnalyseError {
  if (error instanceof AnalyseError) return error;
  if (error instanceof Anthropic.AuthenticationError) {
    return new AnalyseError("De Claude API-sleutel is ongeldig of ontbreekt.", 503);
  }
  if (error instanceof Anthropic.RateLimitError) {
    return new AnalyseError("Te veel aanvragen tegelijk. Probeer het over een minuut opnieuw.", 429);
  }
  if (error instanceof Anthropic.BadRequestError) {
    return new AnalyseError(`Claude kon dit verzoek niet verwerken: ${error.message}`, 400);
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return new AnalyseError("Geen verbinding met Claude. Controleer de internetverbinding.", 502);
  }
  if (error instanceof Anthropic.APIError) {
    return new AnalyseError(`Claude gaf een fout (${error.status ?? "onbekend"}). Probeer het later opnieuw.`, 502);
  }
  return new AnalyseError(error instanceof Error ? error.message : "Onbekende fout", 500);
}

function checkStop(stopReason: string | null | undefined) {
  if (stopReason === "refusal") {
    throw new AnalyseError("Claude heeft deze analyse geweigerd. Probeer een ander bestand.", 422);
  }
  if (stopReason === "max_tokens") {
    throw new AnalyseError(
      "Het stuk is te lang om in één keer te analyseren. Upload een kortere PDF (bijv. de eerste pagina).",
      413
    );
  }
}

const SYSTEM_PROMPT = `Je bent een ervaren jazzpianodocent die bladmuziek analyseert voor een leerling die nog niet vlot noten leest. Je knipt het stuk op in kleine fragmenten (2-4 maten) en legt per fragment uit:
1. welke noten er staan en hoe je ze herkent op de balk;
2. welke akkoorden bij deze noten horen (ook als er geen akkoordsymbolen staan);
3. hoe je het fragment oefent;
4. hoe je het in jazzstijl kunt spelen.

Nootnamen altijd in wetenschappelijke notatie met octaaf: midden-C = C4, de B daaronder = B3. Gebruik # voor kruis (F#4) en b voor mol (Bb3). Schrijf alle uitleg in het Nederlands.`;

const PDF_INSTRUCTIE = `Analyseer deze bladmuziek noot voor noot. Het resultaat wordt teruggerenderd als interactieve notenbalk én afgespeeld, dus elke noot, rust, overbinding en dynamiek moet kloppen.

Werkwijze:
- Lees de eerste 4 maten met extra zorg; daarna de rest in fragmenten van 2-4 maten.
- Neem ELKE noot én ELKE rust op. Een kwartrust op tel 1 is een object met type "rust" en noot "rust".
- Staan er op één balk noten met stokken omhoog én omlaag, dan zijn dat twee stemmen: "omhoog" (bovenste) en "omlaag" (onderste). Geef elke stem zijn eigen rusten.
- beatPositie telt in de eenheid van de maatsoort: kwart op tel 1 = 1, achtste op de "en" van tel 2 = 2.5.
- Puntnoten: half_met_punt = 3 tellen (in 4/4), kwart_met_punt = 1,5 tel.
- Noot met een boog naar dezelfde toonhoogte (ook over de maatstreep): verbinding "overbinding" op de eerste noot. Een boog tussen verschillende noten: "legatoboog".
- Akkoordnoten (meerdere noten op één stok) krijgen dezelfde beatPositie.
- Controleer elk octaafnummer: hulplijnen tellen, G-sleutel onderste lijn = E4, F-sleutel bovenste lijn = A3.
- Controleer per maat, per hand en per stem dat de duren samen precies de maatsoort vullen.
- Noteer dynamiek (p, mf, f, ...) in de maat waar die staat.`;

export interface PdfProgress {
  fase: "lezen" | "schrijven";
  /** Hoogste maatnummer dat al in de uitvoer staat */
  maat: number;
}

export async function analyseerPdf(
  pdfBase64: string,
  onProgress?: (p: PdfProgress) => void
): Promise<PdfAnalyseResult> {
  try {
    const stream = getClient().beta.messages.stream({
      model: MODEL,
      max_tokens: 64000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      thinking: { type: "adaptive" },
      output_config: { effort: PDF_EFFORT, format: betaZodOutputFormat(PdfAnalyseSchema) },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
            },
            { type: "text", text: PDF_INSTRUCTIE },
          ],
        },
      ],
    });

    if (onProgress) {
      let lastMaat = -1;
      let scanFrom = 0;
      onProgress({ fase: "lezen", maat: 0 });
      stream.on("text", (_delta, snapshot) => {
        // Alleen het nieuwe stuk scannen (met wat overlap voor afgebroken matches).
        const tail = snapshot.slice(Math.max(0, scanFrom - 24));
        scanFrom = snapshot.length;
        let maat = Math.max(lastMaat, 0);
        for (const m of tail.matchAll(/"maatNummer"\s*:\s*(\d+)/g)) {
          maat = Math.max(maat, parseInt(m[1], 10));
        }
        if (maat !== lastMaat) {
          lastMaat = maat;
          onProgress({ fase: "schrijven", maat });
        }
      });
    }

    const message = await stream.finalMessage();
    checkStop(message.stop_reason);
    if (!message.parsed_output) {
      throw new AnalyseError("Claude gaf geen bruikbare analyse terug. Probeer het opnieuw.", 502);
    }
    return normaliseerPdfResultaat(message.parsed_output);
  } catch (error) {
    throw toAnalyseError(error);
  }
}

/** Kleine opschoning: noten per maat sorteren, rusten consistent maken. */
function normaliseerPdfResultaat(result: PdfAnalyseResult): PdfAnalyseResult {
  for (const fragment of result.fragmenten) {
    for (const maat of fragment.maatNoten) {
      for (const noot of maat.noten) {
        if (noot.type === "rust" || noot.noot.toLowerCase() === "rust") {
          noot.type = "rust";
          noot.noot = "rust";
        } else {
          // "bb3" → "Bb3", "c#4" → "C#4"
          noot.noot = noot.noot.charAt(0).toUpperCase() + noot.noot.slice(1);
        }
      }
      maat.noten.sort((a, b) => a.beatPositie - b.beatPositie);
    }
  }
  return result;
}

export async function analyseerAkkoorden(chords: string): Promise<AkkoordAnalyseResult> {
  try {
    const message = await getClient().beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      thinking: { type: "adaptive" },
      output_config: { effort: AKKOORD_EFFORT, format: betaZodOutputFormat(AkkoordAnalyseSchema) },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Analyseer deze akkoordprogressie voor een beginnende jazzpianist: ${chords}

Geef per akkoord de functie in de toonsoort, voicings (shell = root-3-7, rootless A = 3-5-7-9, rootless B = 7-9-3-5, met concrete nootnamen), een oefenplan in stappen en jazzvariaties (bijv. tritonussubstitutie, ii-V's ervoor).`,
        },
      ],
    });
    checkStop(message.stop_reason);
    if (!message.parsed_output) {
      throw new AnalyseError("Claude gaf geen bruikbare analyse terug. Probeer het opnieuw.", 502);
    }
    return message.parsed_output;
  } catch (error) {
    throw toAnalyseError(error);
  }
}
