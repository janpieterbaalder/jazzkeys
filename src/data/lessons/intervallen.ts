import type { Lesson } from "@/types";

export const intervallen: Lesson = {
  slug: "intervallen",
  title: "Intervallen — De Bouwstenen",
  description:
    "Leer de afstanden tussen noten kennen. Intervallen vormen de basis van alle akkoorden en melodieën.",
  order: 1,
  sections: [
    {
      heading: "Wat is een interval?",
      content:
        "Een interval is de afstand tussen twee noten, gemeten in halve tonen. Op de piano is één halve toon de afstand naar de dichtstbijzijnde toets (wit of zwart). Twee halve tonen vormen een hele toon. Alle akkoorden en toonladders zijn opgebouwd uit specifieke combinaties van intervallen.",
    },
    {
      heading: "De 12 intervallen",
      content:
        "Binnen één octaaf (van C tot de volgende C) zijn er 12 halve tonen en dus 13 mogelijke intervallen (inclusief de priem en het octaaf). Elk interval heeft een eigen klank en karakter.",
    },
    {
      heading: "Priem (0 halve tonen)",
      content:
        "Dezelfde noot twee keer. Klinkt als één noot — geen spanning.",
      pianoExamples: [
        {
          label: "Priem: C-C",
          notes: [
            { note: "C4", color: "#60a5fa", label: "C" },
          ],
          caption: "Dezelfde noot — geen afstand",
        },
      ],
    },
    {
      heading: "Kleine secunde (1 halve toon)",
      content:
        "De kleinste afstand op de piano. Klinkt dissonant en gespannen. Denk aan de 'Jaws'-melodie. In jazz wordt dit interval veel gebruikt als chromatic approach note.",
      pianoExamples: [
        {
          label: "Kleine secunde: C-Db",
          notes: [
            { note: "C4", color: "#60a5fa", label: "C" },
            { note: "C#4", color: "#3b82f6", label: "D♭" },
          ],
          caption: "1 halve toon — gespannen klank",
        },
      ],
    },
    {
      heading: "Grote secunde (2 halve tonen)",
      content:
        "Een hele toon. De afstand tussen de meeste witte toetsen. Dit is de standaard stapgrootte in een majeur toonladder.",
      pianoExamples: [
        {
          label: "Grote secunde: C-D",
          notes: [
            { note: "C4", color: "#60a5fa", label: "C" },
            { note: "D4", color: "#3b82f6", label: "D" },
          ],
          caption: "2 halve tonen — een hele toon",
        },
      ],
    },
    {
      heading: "Kleine terts (3 halve tonen)",
      content:
        "Dit interval maakt een akkoord mineur (klein). Het geeft een droevige, melancholische klank. Als je een mineur drieklank speelt, is de afstand van de grondtoon naar de derde noot altijd een kleine terts.",
      pianoExamples: [
        {
          label: "Kleine terts: C-Eb",
          notes: [
            { note: "C4", color: "#60a5fa", label: "C" },
            { note: "D#4", color: "#3b82f6", label: "E♭" },
          ],
          caption: "3 halve tonen — mineur klank",
        },
      ],
    },
    {
      heading: "Grote terts (4 halve tonen)",
      content:
        "Dit interval maakt een akkoord majeur (groot). Het geeft een blije, heldere klank. De afstand van de grondtoon naar de derde noot in een majeur drieklank is altijd een grote terts.",
      pianoExamples: [
        {
          label: "Grote terts: C-E",
          notes: [
            { note: "C4", color: "#60a5fa", label: "C" },
            { note: "E4", color: "#3b82f6", label: "E" },
          ],
          caption: "4 halve tonen — majeur klank",
        },
      ],
    },
    {
      heading: "Reine kwart (5 halve tonen)",
      content:
        "Een stabiel, open interval. Herkenbaar als het begin van 'Vader Jacob'. In jazz wordt de kwart veel gebruikt in zogenaamde 'quartal voicings' — akkoorden opgebouwd uit kwarten in plaats van tertsen.",
      pianoExamples: [
        {
          label: "Reine kwart: C-F",
          notes: [
            { note: "C4", color: "#60a5fa", label: "C" },
            { note: "F4", color: "#3b82f6", label: "F" },
          ],
          caption: "5 halve tonen — open, stabiel",
        },
      ],
    },
    {
      heading: "Tritonus (6 halve tonen)",
      content:
        "Precies het midden van het octaaf. Dit is het meest instabiele interval — het 'wil' oplossen naar een consonant interval. De tritonus is de motor achter dominant-akkoorden in jazz. In een G7-akkoord zit een tritonus tussen B en F, die oplost naar C en E van het Cmaj7-akkoord.",
      pianoExamples: [
        {
          label: "Tritonus: C-F#",
          notes: [
            { note: "C4", color: "#60a5fa", label: "C" },
            { note: "F#4", color: "#3b82f6", label: "F♯" },
          ],
          caption: "6 halve tonen — maximale spanning",
        },
      ],
      tip: "De tritonus is het belangrijkste interval in jazz! Het zit verborgen in elk dominant 7-akkoord (tussen de 3e en de 7e) en zorgt voor de drang om op te lossen.",
    },
    {
      heading: "Reine kwint (7 halve tonen)",
      content:
        "Het meest consonante interval na het octaaf en de priem. De kwint geeft stabiliteit aan akkoorden, maar is ook de reden dat je hem in shell voicings kunt weglaten — hij voegt weinig 'karakter' toe.",
      pianoExamples: [
        {
          label: "Reine kwint: C-G",
          notes: [
            { note: "C4", color: "#60a5fa", label: "C" },
            { note: "G4", color: "#3b82f6", label: "G" },
          ],
          caption: "7 halve tonen — stabiel, consonant",
        },
      ],
    },
    {
      heading: "De overige intervallen",
      content:
        "Kleine sext (8) — omgekeerde grote terts, warm en romantisch. Grote sext (9) — begin van 'My Bonnie Lies Over the Ocean'. Kleine septiem (10) — het interval dat een dominant 7 maakt, essentieel voor jazz. Grote septiem (11) — klinkt helder en modern, maakt een major 7-akkoord. Octaaf (12) — dezelfde noot, maar hoger.",
    },
    {
      heading: "Waarom zijn intervallen belangrijk voor jazz?",
      content:
        "In jazz draait alles om het herkennen van intervallen. Als je een akkoord ziet staan, bouw je het op uit intervallen. Als je improviseert, kies je noten op basis van hun interval tot het akkoord. En voice leading — het soepel verbinden van akkoorden — werkt door intervallen zo klein mogelijk te houden. Begin met het herkennen van tertsen (klein/groot) en de septiem (klein/groot). Die twee bepalen het karakter van elk jazz-akkoord.",
      tip: "Oefen dit: speel willekeurige noten op de piano en probeer het interval te benoemen. Begin met tertsen (3-4 halve tonen) en de septiem (10-11 halve tonen).",
    },
  ],
};
