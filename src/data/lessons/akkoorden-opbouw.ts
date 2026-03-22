import type { Lesson } from "@/types";

export const akkoordenOpbouw: Lesson = {
  slug: "akkoorden-opbouw",
  title: "Hoe Akkoorden Zijn Opgebouwd",
  description:
    "Van drieklanken naar 7e-akkoorden en uitbreidingen. Begrijp hoe elk jazz-akkoord is opgebouwd uit intervallen.",
  order: 2,
  sections: [
    {
      heading: "Drieklanken — de basis",
      content:
        "Een drieklank (triad) bestaat uit drie noten: grondtoon (root), terts (3e) en kwint (5e). Er zijn vier soorten drieklanken, afhankelijk van de intervallen. Dit zijn de bouwstenen waar alle complexere akkoorden op voortbouwen.",
    },
    {
      heading: "Majeur drieklank",
      content:
        "Grondtoon + grote terts (4 halve tonen) + reine kwint (7 halve tonen). Klinkt helder en blij. Voorbeeld: C majeur = C, E, G.",
      pianoExamples: [
        {
          label: "C majeur",
          notes: [
            { note: "C4", color: "#60a5fa", label: "R" },
            { note: "E4", color: "#3b82f6", label: "3" },
            { note: "G4", color: "#2563eb", label: "5" },
          ],
          caption: "Root — grote terts — reine kwint",
        },
      ],
    },
    {
      heading: "Mineur drieklank",
      content:
        "Grondtoon + kleine terts (3 halve tonen) + reine kwint (7 halve tonen). Klinkt droeviger en donkerder. Het enige verschil met majeur is dat de terts een halve toon lager is. Voorbeeld: C mineur = C, Eb, G.",
      pianoExamples: [
        {
          label: "C mineur",
          notes: [
            { note: "C4", color: "#60a5fa", label: "R" },
            { note: "D#4", color: "#3b82f6", label: "♭3" },
            { note: "G4", color: "#2563eb", label: "5" },
          ],
          caption: "Root — kleine terts — reine kwint",
        },
      ],
    },
    {
      heading: "Van drieklank naar 7e-akkoord",
      content:
        "In jazz speel je bijna nooit kale drieklanken — ze klinken te simpel. Door een vierde noot toe te voegen (de septiem, of 7e) krijg je een veel rijkere klank. Er zijn twee soorten septiemen: de grote septiem (11 halve tonen, klinkt helder/modern) en de kleine septiem (10 halve tonen, klinkt bluesy/dominant).",
      tip: "Dit is de belangrijkste stap van pop naar jazz: vervang al je drieklanken door 7e-akkoorden!",
    },
    {
      heading: "Majeur 7 (maj7)",
      content:
        "Drieklank + grote septiem. Klinkt dromerig, romantisch, verfijnd. Symbool: Cmaj7. Noten: C, E, G, B. Dit akkoord hoor je veel in bossa nova en zachte jazz.",
      pianoExamples: [
        {
          label: "Cmaj7",
          notes: [
            { note: "C4", color: "#60a5fa", label: "R" },
            { note: "E4", color: "#3b82f6", label: "3" },
            { note: "G4", color: "#2563eb", label: "5" },
            { note: "B4", color: "#818cf8", label: "7" },
          ],
          caption: "Majeur drieklank + grote septiem",
        },
      ],
    },
    {
      heading: "Dominant 7 (7)",
      content:
        "Majeur drieklank + kleine septiem. Dit is HET jazz-akkoord bij uitstek. Het bevat een tritonus (tussen de 3e en de ♭7e) die wil oplossen. Symbool: C7. Noten: C, E, G, B♭. Elk dominant 7-akkoord 'trekt' naar het akkoord een kwint lager (G7 → C).",
      pianoExamples: [
        {
          label: "C7",
          notes: [
            { note: "C4", color: "#60a5fa", label: "R" },
            { note: "E4", color: "#3b82f6", label: "3" },
            { note: "G4", color: "#2563eb", label: "5" },
            { note: "A#4", color: "#818cf8", label: "♭7" },
          ],
          caption: "Majeur drieklank + kleine septiem — bevat tritonus!",
        },
      ],
    },
    {
      heading: "Mineur 7 (m7)",
      content:
        "Mineur drieklank + kleine septiem. Warm, zacht, en veelzijdig. Dit is het meest voorkomende akkoord op de 'ii' positie in een ii-V-I progressie. Symbool: Cm7. Noten: C, E♭, G, B♭.",
      pianoExamples: [
        {
          label: "Cm7",
          notes: [
            { note: "C4", color: "#60a5fa", label: "R" },
            { note: "D#4", color: "#3b82f6", label: "♭3" },
            { note: "G4", color: "#2563eb", label: "5" },
            { note: "A#4", color: "#818cf8", label: "♭7" },
          ],
          caption: "Mineur drieklank + kleine septiem",
        },
      ],
    },
    {
      heading: "Half verminderd (m7♭5)",
      content:
        "Mineur drieklank met verlaagde kwint + kleine septiem. Klinkt donker en mysterieus. Wordt gebruikt als ii-akkoord in mineur toonsoorten. Symbool: Cm7♭5. Noten: C, E♭, G♭, B♭.",
      pianoExamples: [
        {
          label: "Cm7♭5",
          notes: [
            { note: "C4", color: "#60a5fa", label: "R" },
            { note: "D#4", color: "#3b82f6", label: "♭3" },
            { note: "F#4", color: "#2563eb", label: "♭5" },
            { note: "A#4", color: "#818cf8", label: "♭7" },
          ],
          caption: "Verlaagde kwint geeft donker karakter",
        },
      ],
    },
    {
      heading: "Verminderd 7 (dim7)",
      content:
        "Opgebouwd uit alleen kleine tertsen: root, ♭3, ♭5, ♭♭7 (= 6). Klinkt heel gespannen. Wordt in jazz vaak gebruikt als passeerdakkoord tussen twee andere akkoorden. Symbool: Cdim7. Noten: C, E♭, G♭, A.",
      pianoExamples: [
        {
          label: "Cdim7",
          notes: [
            { note: "C4", color: "#60a5fa", label: "R" },
            { note: "D#4", color: "#3b82f6", label: "♭3" },
            { note: "F#4", color: "#2563eb", label: "♭5" },
            { note: "A4", color: "#818cf8", label: "♭♭7" },
          ],
          caption: "Symmetrisch — alleen kleine tertsen",
        },
      ],
    },
    {
      heading: "Uitbreidingen: 9e, 11e en 13e",
      content:
        "Na de 7e kun je nog hogere noten toevoegen. De 9e is dezelfde noot als de 2e, maar dan een octaaf hoger. De 11e = de 4e een octaaf hoger. De 13e = de 6e een octaaf hoger. Deze uitbreidingen geven extra kleur aan het akkoord. In de praktijk speel je niet alle noten — je kiest welke je wilt horen en laat andere weg (vaak de 5e en soms de grondtoon).",
      tip: "Begin met 9e-akkoorden: voeg simpelweg de 9e toe aan je 7e-akkoorden. Cmaj9 = C, E, G, B, D. Dm9 = D, F, A, C, E.",
    },
    {
      heading: "Samenvatting: de 5 essentiële jazz-akkoordtypen",
      content:
        "Dit zijn de vijf akkoordtypen die je als eerste moet leren in alle 12 toonsoorten: Majeur 7 (maj7), Dominant 7 (7), Mineur 7 (m7), Half verminderd (m7♭5), en Verminderd 7 (dim7). Als je deze vijf typen kunt spelen vanuit elke grondtoon, heb je de basis voor 90% van alle jazz-akkoorden. Ga naar het Akkoorden-naslagwerk om ze allemaal met piano-diagrammen te bekijken.",
    },
  ],
};
