import type { Lesson } from "@/types";

export const iiVI: Lesson = {
  slug: "ii-v-i",
  title: "De ii-V-I Progressie",
  description:
    "De ruggengraat van jazz. Begrijp waarom deze progressie zo belangrijk is en leer hem in alle toonsoorten spelen.",
  order: 4,
  sections: [
    {
      heading: "Waarom ii-V-I?",
      content:
        "De ii-V-I is de meest voorkomende akkoordprogressie in jazz — naar schatting bevat 80% van alle jazz-standards deze progressie, vaak meerdere keren. Als je ii-V-I's kunt herkennen en spelen in alle toonsoorten, kun je een groot deel van het jazz-repertoire aan.",
    },
    {
      heading: "Hoe werkt het?",
      content:
        "De progressie volgt de kwintencirkel: de grondtonen dalen steeds een kwint (of stijgen een kwart). Dm7 (D) → G7 (G, een kwint lager dan D) → Cmaj7 (C, een kwint lager dan G). Deze neerwaartse kwintbeweging klinkt heel natuurlijk en 'opgelost'.",
    },
    {
      heading: "ii-V-I in C majeur",
      content:
        "Dm7 → G7 → Cmaj7. De Dm7 creëert een zachte spanning, de G7 verhoogt die spanning (door de tritonus tussen B en F), en de Cmaj7 lost alles op. Dit patroon van spanning-en-oplossing is de kern van jazz-harmonie.",
      pianoExamples: [
        {
          label: "Dm7 (ii)",
          notes: [
            { note: "D3", color: "#60a5fa", label: "R" },
            { note: "F3", color: "#3b82f6", label: "3" },
            { note: "C4", color: "#818cf8", label: "7" },
          ],
          caption: "Shell voicing: D - F - C",
        },
        {
          label: "G7 (V)",
          notes: [
            { note: "G3", color: "#60a5fa", label: "R" },
            { note: "B3", color: "#3b82f6", label: "3" },
            { note: "F4", color: "#818cf8", label: "7" },
          ],
          caption: "Shell voicing: G - B - F",
        },
        {
          label: "Cmaj7 (I)",
          notes: [
            { note: "C3", color: "#60a5fa", label: "R" },
            { note: "E3", color: "#3b82f6", label: "3" },
            { note: "B3", color: "#818cf8", label: "7" },
          ],
          caption: "Shell voicing: C - E - B",
        },
      ],
    },
    {
      heading: "Voice leading: het geheim",
      content:
        "Let op hoe weinig de noten bewegen tussen de akkoorden:\n\n• Dm7 → G7: de F (3e van Dm7) wordt F (7e van G7) — blijft liggen! De C (7e van Dm7) gaat naar B (3e van G7) — slechts een halve toon.\n\n• G7 → Cmaj7: de B (3e van G7) wordt B (7e van Cmaj7) — blijft liggen! De F (7e van G7) gaat naar E (3e van Cmaj7) — slechts een halve toon.\n\nDit soepele verloop heet 'voice leading' en is de reden waarom shell voicings zo goed werken in jazz.",
      tip: "Oefen ii-V-I met shell voicings in alle 12 toonsoorten. Focus op het zo min mogelijk bewegen van je vingers — de guide tones (3e en 7e) wisselen van functie bij elk volgend akkoord.",
    },
    {
      heading: "ii-V-I in alle toonsoorten",
      content:
        "C: Dm7 - G7 - Cmaj7\nF: Gm7 - C7 - Fmaj7\nB♭: Cm7 - F7 - B♭maj7\nE♭: Fm7 - B♭7 - E♭maj7\nA♭: B♭m7 - E♭7 - A♭maj7\nD♭: E♭m7 - A♭7 - D♭maj7\nG♭: A♭m7 - D♭7 - G♭maj7\nB: C♯m7 - F♯7 - Bmaj7\nE: F♯m7 - B7 - Emaj7\nA: Bm7 - E7 - Amaj7\nD: Em7 - A7 - Dmaj7\nG: Am7 - D7 - Gmaj7",
    },
    {
      heading: "Mineur ii-V-i",
      content:
        "In mineur toonsoorten verandert de progressie licht:\n• ii wordt half verminderd (m7♭5)\n• V wordt dominant 7 (vaak met alteraties: ♭9, ♯9, ♭13)\n• i wordt mineur (m7 of mMaj7)\n\nVoorbeeld in C mineur: Dm7♭5 → G7 → Cm7. De G7 blijft dominant — dat zorgt voor de sterke oplossing naar mineur.",
      pianoExamples: [
        {
          label: "Dm7♭5 (ii)",
          notes: [
            { note: "D3", color: "#60a5fa", label: "R" },
            { note: "F3", color: "#3b82f6", label: "♭3" },
            { note: "C4", color: "#818cf8", label: "♭7" },
          ],
          caption: "Half verminderd shell voicing",
        },
      ],
    },
    {
      heading: "Herkennen in de praktijk",
      content:
        "Open een jazz-standard (Autumn Leaves, Fly Me to the Moon, Blue Bossa) en markeer alle ii-V-I's die je kunt vinden. Je zult versteld staan hoeveel het er zijn. Soms zijn ze compleet (ii-V-I), soms onvolledig (alleen V-I of ii-V zonder oplossing).",
    },
  ],
};
