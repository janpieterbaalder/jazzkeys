import type { Lesson } from "@/types";

export const substituten: Lesson = {
  slug: "substituten",
  title: "Akkoordsubstituten",
  description:
    "Leer hoe je akkoorden kunt vervangen voor rijkere, verrassende klanken. Van tritone substitution tot secondary dominants.",
  order: 7,
  sections: [
    {
      heading: "Wat is een akkoordsubstituut?",
      content:
        "Een akkoordsubstituut is een akkoord dat je in de plaats speelt van het originele akkoord. Het deelt genoeg noten met het origineel om dezelfde harmonische functie te vervullen, maar voegt een andere kleur toe. Dit is een van de krachtigste tools in jazz om muziek interessanter te maken.",
    },
    {
      heading: "Tritonus-substitutie",
      content:
        "De beroemdste jazz-substitutie. Je vervangt een dominant 7-akkoord door een ander dominant 7-akkoord dat een tritonus (6 halve tonen) hoger of lager ligt.\n\nVoorbeeld: Vervang G7 door D♭7.\n\nWaarom werkt dit? Omdat G7 en D♭7 dezelfde tritonus delen:\n• G7 bevat B en F (tritonus)\n• D♭7 bevat F en C♭/B (dezelfde tritonus!)\n\nDe twee akkoorden zijn harmonisch verwisselbaar.",
      pianoExamples: [
        {
          label: "G7 — origineel",
          notes: [
            { note: "G3", color: "#60a5fa", label: "R" },
            { note: "B3", color: "#3b82f6", label: "3" },
            { note: "F4", color: "#818cf8", label: "7" },
          ],
          caption: "Tritonus tussen B en F",
        },
        {
          label: "D♭7 — substituut",
          notes: [
            { note: "C#3", color: "#60a5fa", label: "R" },
            { note: "F3", color: "#3b82f6", label: "3" },
            { note: "B3", color: "#818cf8", label: "7" },
          ],
          caption: "Dezelfde tritonus: F en B!",
        },
      ],
      tip: "Probeer dit: speel Dm7 → D♭7 → Cmaj7 in plaats van Dm7 → G7 → Cmaj7. De bas loopt nu chromatisch omlaag (D → D♭ → C) — dat klinkt heel smooth!",
    },
    {
      heading: "Secondary dominants (secundaire dominanten)",
      content:
        "Elk akkoord in een toonsoort kan worden voorafgegaan door zijn eigen dominant. In C majeur is G7 de dominant van C. Maar je kunt ook:\n\n• A7 → Dm7 (A7 is de dominant van Dm)\n• B7 → Em7 (B7 is de dominant van Em)\n• C7 → Fmaj7 (C7 is de dominant van F)\n• D7 → G7 (D7 is de dominant van G)\n• E7 → Am7 (E7 is de dominant van Am)\n\nDeze 'extra' dominanten voegen spanning en beweging toe aan de progressie.",
    },
    {
      heading: "Relative major/minor swap",
      content:
        "Elke majeur toonsoort heeft een relatieve mineur (en andersom). Ze delen dezelfde noten. Je kunt vaak een majeur akkoord vervangen door zijn relatieve mineur:\n\n• Cmaj7 ↔ Am7 (delen C, E, G)\n• Fmaj7 ↔ Dm7 (delen D, F, A)\n• G7 ↔ Bm7♭5 (delen B, D, F)\n\nDit werkt omdat ze zoveel noten gemeenschappelijk hebben.",
    },
    {
      heading: "Diminished passing chords",
      content:
        "Een verminderd akkoord (dim7) kan worden ingevoegd als 'passeerakkoord' tussen twee diatonische akkoorden, meestal een halve toon onder het doel-akkoord.\n\nVoorbeeld: C → C♯dim7 → Dm7\n\nDe C♯dim7 creëert een chromatische opgang in de bas (C → C♯ → D) die heel soepel klinkt. Dit is een klassieke jazz-techniek.",
    },
    {
      heading: "Backdoor ii-V",
      content:
        "In plaats van de standaard ii-V (Dm7-G7 naar C), kun je de 'achterdeur' nemen: iv-♭VII7, oftewel Fm7-B♭7 naar C. Dit geeft een verrassende maar bevredigende oplossing. Je hoort het veel in jazz-standards uit de jaren '50 en '60.",
    },
    {
      heading: "Hoe begin je?",
      content:
        "Begin met tritonus-substitutie — het is de makkelijkste en meest effectieve. Neem een nummer dat je kent met ii-V-I progressies en vervang elke V7 door het tritonus-substituut. Luister naar het verschil. Probeer daarna secondary dominants toe te voegen voor de ii-akkoorden.",
    },
  ],
};
