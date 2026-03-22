import type { Lesson } from "@/types";

export const nummersystemen: Lesson = {
  slug: "nummersystemen",
  title: "Nummersystemen en Analyse",
  description:
    "Leer de Nashville Number System en Romeinse cijfers — systemen waarmee je akkoordprogressies in elke toonsoort kunt begrijpen.",
  order: 3,
  sections: [
    {
      heading: "Waarom nummersystemen?",
      content:
        "Als iemand zegt 'speel een ii-V-I in Bb', moet je weten wat dat betekent. Nummersystemen beschrijven akkoordprogressies onafhankelijk van de toonsoort. In plaats van specifieke akkoorden (Dm7-G7-Cmaj7) zeg je ii-V-I. Dat werkt in elke toonsoort.",
    },
    {
      heading: "Hoe werkt het?",
      content:
        "Elke noot in een toonladder krijgt een nummer. In C majeur: C=1, D=2, E=3, F=4, G=5, A=6, B=7. Als je op elke noot een akkoord bouwt met alleen noten uit de toonladder, krijg je de diatonische akkoorden. Elk nummer heeft een vast akkoordtype.",
    },
    {
      heading: "De diatonische akkoorden in majeur",
      content:
        "I = majeur 7 (Cmaj7)\nii = mineur 7 (Dm7)\niii = mineur 7 (Em7)\nIV = majeur 7 (Fmaj7)\nV = dominant 7 (G7)\nvi = mineur 7 (Am7)\nvii° = half verminderd (Bm7♭5)\n\nHoofdletters = majeur, kleine letters = mineur. Dit patroon is hetzelfde in élke toonsoort!",
    },
    {
      heading: "Voorbeeld: ii-V-I in verschillende toonsoorten",
      content:
        "In C: Dm7 - G7 - Cmaj7\nIn F: Gm7 - C7 - Fmaj7\nIn Bb: Cm7 - F7 - Bbmaj7\nIn Eb: Fm7 - Bb7 - Ebmaj7\n\nZie je het patroon? De ii is altijd mineur 7, de V is altijd dominant 7, en de I is altijd majeur 7.",
      pianoExamples: [
        {
          label: "ii-V-I in C",
          notes: [
            { note: "D3", color: "#60a5fa", label: "ii" },
            { note: "G3", color: "#3b82f6", label: "V" },
            { note: "C4", color: "#2563eb", label: "I" },
          ],
          caption: "Dm7 → G7 → Cmaj7 — de grondtonen",
        },
      ],
    },
    {
      heading: "Nashville Number System",
      content:
        "Het Nashville systeem gebruikt gewone Arabische cijfers (1, 2, 3...) en wordt veel gebruikt in pop, country en session-muziek. Je schrijft simpelweg de nummers op en iedereen kan het in elke toonsoort spelen. Voorbeeld: '1 - 5 - 6m - 4' is de beroemde pop-progressie (in C: C - G - Am - F).",
    },
    {
      heading: "Romeinse cijfers",
      content:
        "In jazz en klassieke muziektheorie worden Romeinse cijfers gebruikt (I, ii, iii, IV, V, vi, vii°). Het voordeel is dat je aan de schrijfwijze meteen het akkoordtype kunt zien: hoofdletters = majeur, kleine letters = mineur, ° = verminderd. Dit systeem wordt gebruikt in The Real Book en jazz-onderwijs.",
      tip: "Als je één ding onthoudt: leer de ii-V-I herkennen. Het is de meest voorkomende progressie in jazz en komt in bijna elk jazz-nummer voor.",
    },
    {
      heading: "Praktische toepassing",
      content:
        "Als je een leadsheet of akkoordenblad ziet met Dm7 - G7 - Cmaj7 - A7 - Dm7 - G7 - Cmaj7, analyseer je het als: ii - V - I - VI7 - ii - V - I. Die VI7 is een 'secondary dominant' — een tijdelijk dominant akkoord dat naar de ii leidt. Door zo te denken, begrijp je de functie van elk akkoord in plaats van alleen de naam.",
    },
  ],
};
