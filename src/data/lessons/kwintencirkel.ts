import type { Lesson } from "@/types";

export const kwintencirkel: Lesson = {
  slug: "kwintencirkel",
  title: "De Kwintencirkel",
  description:
    "Het kompas van de muziektheorie. Leer hoe de kwintencirkel je helpt bij toonsoorten, akkoordprogressies en improvisatie.",
  order: 6,
  useCircleOfFifths: true,
  sections: [
    {
      heading: "Wat is de kwintencirkel?",
      content:
        "De kwintencirkel ordent alle 12 toonsoorten in een cirkel, waarbij elke stap met de klok mee een reine kwint (7 halve tonen) omhoog gaat. C → G → D → A → E → B → F♯/G♭ → D♭ → A♭ → E♭ → B♭ → F → terug naar C. Tegen de klok in ga je steeds een kwart omhoog (of een kwint omlaag).",
    },
    {
      heading: "Toonsoorten en voortekens",
      content:
        "Met de klok mee krijg je bij elke stap één kruis (#) erbij:\nC = 0, G = 1♯, D = 2♯, A = 3♯, E = 4♯, B = 5♯, F♯ = 6♯\n\nTegen de klok in krijg je bij elke stap één mol (♭) erbij:\nC = 0, F = 1♭, B♭ = 2♭, E♭ = 3♭, A♭ = 4♭, D♭ = 5♭, G♭ = 6♭",
    },
    {
      heading: "Waarom is dit belangrijk voor jazz?",
      content:
        "De kwintencirkel verklaart waarom de ii-V-I zo goed klinkt: de grondtonen volgen de cirkel tegen de klok in. D → G → C zijn drie opeenvolgende stappen tegen de klok in op de kwintencirkel. Deze neerwaartse kwintbeweging klinkt als de meest natuurlijke harmonische beweging in westerse muziek.",
    },
    {
      heading: "Praktische toepassingen",
      content:
        "1. Transponeren: Wil je een stuk van C naar E♭ verplaatsen? Tel de stappen op de cirkel.\n\n2. Verwante toonsoorten vinden: De buren op de cirkel (bijv. F en G voor C) zijn de meest verwante toonsoorten — ze delen veel dezelfde noten.\n\n3. ii-V-I oefenen: Loop de cirkel rond en speel ii-V-I in elke toonsoort: C, F, B♭, E♭, A♭, D♭, G♭, B, E, A, D, G.\n\n4. Relative mineur: Elke majeur toonsoort heeft een relatieve mineur — die vind je 3 stappen met de klok mee (of kijk naar de binnencirkel).",
      tip: "Oefen je ii-V-I's in de volgorde van de kwintencirkel (tegen de klok in): C, F, B♭, E♭, A♭, D♭ enzovoort. Dit is de 'standaard' oefenvolgorde in jazz.",
    },
    {
      heading: "Buurakkoorden",
      content:
        "Akkoorden die naast elkaar liggen op de kwintencirkel klinken verwant en gaan soepel in elkaar over. Dit verklaart veel jazz-progressies. De hele turnaround I-vi-ii-V (bijv. C-Am-Dm-G) volgt de kwintencirkel!",
    },
  ],
};
