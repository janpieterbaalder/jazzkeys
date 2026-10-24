/**
 * Datamodel van de Claude-analyses. De Zod-schema's worden als structured
 * output aan de API meegegeven, zodat het antwoord gegarandeerd geldige JSON
 * in exact dit formaat is. Dit bestand bevat geen server-code en mag dus ook
 * door client-componenten geïmporteerd worden.
 */

import { z } from "zod";
import { duurInKwarten, parseMaatsoort } from "@/lib/score-timeline";

export const DUREN = [
  "heel",
  "half",
  "kwart",
  "achtste",
  "zestiende",
  "heel_met_punt",
  "half_met_punt",
  "kwart_met_punt",
  "achtste_met_punt",
  "zestiende_met_punt",
] as const;

export const NootSchema = z.object({
  noot: z
    .string()
    .describe('Wetenschappelijke notatie met octaaf, bijv. "C4", "Bb3", "F#5". Bij een rust: "rust".'),
  type: z.enum(["noot", "rust"]),
  duur: z.enum(DUREN),
  beatPositie: z
    .number()
    .describe("Tel in de maat waarop de noot begint: 1, 1.5, 2, 2.5, ... (eenheid = noemer van de maatsoort)"),
  hand: z.enum(["rechts", "links"]),
  stem: z
    .enum(["omhoog", "omlaag"])
    .describe('"omhoog" = bovenste stem van de balk, "omlaag" = onderste stem'),
  balkPositie: z.string().describe("Waar de noot op de balk staat, in gewone taal"),
  uitleg: z.string(),
  verbinding: z
    .enum(["overbinding", "legatoboog"])
    .optional()
    .describe("Alleen invullen als deze noot met een boog naar de volgende noot loopt"),
});

export const MaatSchema = z.object({
  maatNummer: z.number().int(),
  noten: z.array(NootSchema),
  akkoord: z.string().optional(),
  dynamiek: z.string().optional().describe("p, mp, mf, f, ... als die in deze maat staat"),
});

export const FragmentSchema = z.object({
  nummer: z.number().int(),
  maten: z.string().describe('Bereik, bijv. "1-4"'),
  beschrijving: z.string(),
  notenUitleg: z.object({
    rechterhand: z.string(),
    linkerhand: z.string(),
  }),
  leesStrategie: z.string(),
  ritmeUitleg: z.string(),
  akkoordAnalyse: z.object({
    akkoorden: z.array(z.string()),
    uitleg: z.string(),
    jazzVarianten: z.array(z.string()),
    voicingSuggesties: z.string(),
  }),
  oefentip: z.string(),
  jazzTip: z.string(),
  maatNoten: z.array(MaatSchema),
});

export const PdfAnalyseSchema = z.object({
  stukInfo: z.object({
    titel: z.string(),
    toonsoort: z.string(),
    maatsoort: z.string().describe('Bijv. "4/4", "3/4", "6/8"'),
    tempo: z.string().describe('Tempo-aanduiding zoals die op de bladmuziek staat, bijv. "♩ = 92" of "Andante"'),
    moeilijkheidsgraad: z.enum(["beginner", "gemiddeld", "gevorderd"]),
  }),
  fragmenten: z.array(FragmentSchema),
});

export const AkkoordAnalyseSchema = z.object({
  toonsoort: z.string(),
  analyse: z.array(
    z.object({
      akkoord: z.string(),
      functie: z.string().describe('Trapfunctie, bijv. "ii", "V7", "Imaj7", "V7/ii"'),
      uitleg: z.string(),
    })
  ),
  voicingSuggesties: z.array(
    z.object({
      akkoord: z.string(),
      shell: z.string(),
      rootlessA: z.string(),
      rootlessB: z.string(),
    })
  ),
  oefenplan: z.array(z.string()),
  jazzVariaties: z.array(z.string()),
});

export type NootData = z.infer<typeof NootSchema>;
export type MaatData = z.infer<typeof MaatSchema>;
export type Fragment = z.infer<typeof FragmentSchema>;
export type AkkoordAnalyse = Fragment["akkoordAnalyse"];
export type StukInfo = z.infer<typeof PdfAnalyseSchema>["stukInfo"];
export type PdfAnalyseResult = z.infer<typeof PdfAnalyseSchema>;
export type AkkoordAnalyseResult = z.infer<typeof AkkoordAnalyseSchema>;

export interface MaatWaarschuwing {
  maatNummer: number;
  hand: NootData["hand"];
  stem: NootData["stem"];
  verwacht: number;
  gevonden: number;
}

/**
 * Controleert per maat, hand en stem of de noten + rusten samen precies de
 * maatsoort vullen. Afwijkingen wijzen meestal op een leesfout in de analyse
 * (gemiste noot/rust, verkeerde duur). Een opmaat (eerste maat korter) wordt
 * niet gemeld.
 */
export function controleerMaten(maatNoten: MaatData[], maatsoort?: string): MaatWaarschuwing[] {
  const { beats, unit } = parseMaatsoort(maatsoort);
  const verwacht = beats * (4 / unit); // in kwartnoten
  const result: MaatWaarschuwing[] = [];

  maatNoten.forEach((maat, index) => {
    const groepen = new Map<string, NootData[]>();
    for (const n of maat.noten) {
      const key = `${n.hand}|${n.stem}`;
      groepen.set(key, [...(groepen.get(key) ?? []), n]);
    }
    for (const [key, noten] of groepen) {
      // Akkoordnoten (zelfde beatPositie) tellen één keer mee.
      const perBeat = new Map<number, number>();
      for (const n of noten) {
        const len = duurInKwarten(n.duur);
        perBeat.set(n.beatPositie, Math.max(perBeat.get(n.beatPositie) ?? 0, len));
      }
      const gevonden = [...perBeat.values()].reduce((a, b) => a + b, 0);
      const isOpmaat = index === 0 && gevonden < verwacht;
      if (Math.abs(gevonden - verwacht) > 0.01 && !isOpmaat) {
        const [hand, stem] = key.split("|") as [NootData["hand"], NootData["stem"]];
        result.push({ maatNummer: maat.maatNummer, hand, stem, verwacht, gevonden });
      }
    }
  });
  return result;
}
