import type { Lesson } from "@/types";

export const vanPopNaarJazz: Lesson = {
  slug: "van-pop-naar-jazz",
  title: "Van Pop naar Jazz",
  description:
    "Leer stap voor stap hoe je een eenvoudig stuk omzet naar jazz-stijl — van ritme tot voicings tot reharmonisatie.",
  order: 8,
  sections: [
    {
      heading: "Het verschil tussen pop en jazz",
      content:
        "Pop-piano gebruikt meestal simpele drieklanken, rechte (straight) ritmes en vaste begeleiding. Jazz-piano gebruikt rijkere akkoorden (7e, 9e), swing-ritme, variatie in begeleiding (comping), en geavanceerdere harmonieën. Het goede nieuws: je kunt stap voor stap elementen toevoegen.",
    },
    {
      heading: "Stap 1: Van drieklanken naar 7e-akkoorden",
      content:
        "De simpelste transformatie: voeg een septiem toe aan elk akkoord.\n\nPop: C - Am - F - G\nJazz: Cmaj7 - Am7 - Fmaj7 - G7\n\nDit alleen al maakt een enorm verschil in klank. De akkoorden klinken voller en meer 'volwassen'.",
      pianoExamples: [
        {
          label: "Pop: C majeur",
          notes: [
            { note: "C4", color: "#60a5fa", label: "C" },
            { note: "E4", color: "#3b82f6", label: "E" },
            { note: "G4", color: "#2563eb", label: "G" },
          ],
          caption: "Simpele drieklank",
        },
        {
          label: "Jazz: Cmaj7",
          notes: [
            { note: "C4", color: "#60a5fa", label: "R" },
            { note: "E4", color: "#3b82f6", label: "3" },
            { note: "G4", color: "#2563eb", label: "5" },
            { note: "B4", color: "#818cf8", label: "7" },
          ],
          caption: "Met septiem — veel rijker",
        },
      ],
    },
    {
      heading: "Stap 2: Shell voicings in de linkerhand",
      content:
        "In plaats van het complete akkoord in de linkerhand, speel je alleen root-3-7 (shell voicing). Dit klinkt minder vol maar meer 'open' en jazzy. Je rechterhand is nu vrij voor melodie of improvisatie.\n\nDit is precies de stap die jij al deels doet (links bastoon, rechts akkoord). Het verschil is dat je nu de 3e en 7e meespeelt in je linkerhand in plaats van alleen de bastoon.",
    },
    {
      heading: "Stap 3: Swing-ritme",
      content:
        "Pop gebruikt rechte achtste noten (even lang). Jazz 'swingt' — de eerste achtste noot is langer dan de tweede, met een licht 'hinkend' gevoel (daa-da daa-da in plaats van da-da da-da). Dit is moeilijk uit te leggen in tekst maar makkelijk te horen. Luister naar een jazz-opname en probeer het gevoel na te doen.\n\nDaarnaast speelt jazz-piano akkoorden niet op elke tel. Je laat gaten, speelt syncopisch (net voor of na de tel) en varieert constant. Dit heet 'comping'.",
    },
    {
      heading: "Stap 4: Comping-patronen",
      content:
        "Comping is het begeleiden met akkoorden op een ritmisch interessante manier. Enkele basispatronen:\n\n1. Charleston: akkoord op tel 1, dan op de 'en' van tel 2 (DUM... da-DUM)\n2. Anticipatie: speel het akkoord net vóór tel 1 van de volgende maat\n3. Call-and-response: speel een ritmisch patroon, laat een gat, reageer\n\nHet belangrijkste principe: laat ruimte! Jazz draait om wat je NIET speelt.",
      tip: "Begin met het Charleston-patroon. Speel je shell voicing op tel 1, rust op tel 2, speel weer op de 'en' van tel 2. Dit klinkt meteen jazzy.",
    },
    {
      heading: "Stap 5: Reharmonisatie",
      content:
        "Nu wordt het echt jazz: je verandert de akkoorden zelf.\n\nPop: C - Am - F - G\n\nStap 1 — Analyseer: I - vi - IV - V\n\nStap 2 — Voeg ii-V bewegingen toe:\nCmaj7 - Am7 | Dm7 - G7 (de F wordt Dm7 want Dm7 klinkt als een ii naar G7)\n\nStap 3 — Voeg secondary dominants toe:\nCmaj7 - A7 | Dm7 - G7 (A7 leidt nu als dominant naar Dm7)\n\nStap 4 — Tritonus-substitutie:\nCmaj7 - A7 | Dm7 - D♭7 (G7 vervangen door D♭7)\n\nElke stap voegt meer harmonische rijkdom toe.",
    },
    {
      heading: "Stap 6: Walking bass",
      content:
        "Voor solo jazz-piano kun je een walking bass toevoegen: je linkerhand speelt op elke tel een noot die 'wandelt' naar de grondtoon van het volgende akkoord. Begin simpel met afwisselend root en kwint, en bouw dan op naar chromatische benaderingsnoten.\n\nVoorbeeld over Dm7 → G7:\nLinkerhand: D - A - D - F♯ | G - D - G - B\n(root - 5 - root - chromatic approach naar G)",
    },
    {
      heading: "Alles samenvoegen",
      content:
        "Neem een simpel stuk dat je al kent en pas deze stappen één voor één toe:\n\n1. Vervang drieklanken door 7e-akkoorden\n2. Speel shell voicings in de linkerhand\n3. Voeg swing-feeling toe\n4. Varieer je ritme (comping)\n5. Experimenteer met reharmonisatie\n6. Probeer walking bass\n\nJe hoeft niet alles tegelijk te doen. Elke stap apart maakt het al jazzy-er. Begin met stap 1 en 2 — die maken het meeste verschil.",
      tip: "Neem een stuk als 'Fly Me to the Moon' of 'Autumn Leaves' — die zijn al jazz maar simpel genoeg om mee te oefenen.",
    },
  ],
};
