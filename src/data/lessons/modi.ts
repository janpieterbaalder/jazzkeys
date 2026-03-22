import type { Lesson } from "@/types";

export const modi: Lesson = {
  slug: "modi",
  title: "Modi en Hun Rol in Jazz",
  description:
    "Leer de kerkmodi kennen — Dorisch, Mixolydisch en meer — en begrijp hoe ze in jazz worden gebruikt.",
  order: 5,
  sections: [
    {
      heading: "Wat zijn modi?",
      content:
        "Modi zijn toonladders die je krijgt door op een andere noot van de majeur toonladder te beginnen. Als je alle witte toetsen speelt vanaf C krijg je Ionisch (= gewoon majeur). Begin je op D, dan krijg je Dorisch. Op E: Frygisch. Enzovoort. Elke modus heeft een eigen karakter door de unieke volgorde van hele en halve tonen.",
    },
    {
      heading: "De 7 modi (op witte toetsen)",
      content:
        "I. Ionisch (C-C): Gewoon majeur. Helder, vrolijk.\nII. Dorisch (D-D): Mineur met hoge 6e. Warm, jazzy.\nIII. Frygisch (E-E): Mineur met lage 2e. Spaans, exotisch.\nIV. Lydisch (F-F): Majeur met hoge 4e. Dromerig, zwevend.\nV. Mixolydisch (G-G): Majeur met lage 7e. Bluesy, dominant.\nVI. Aeolisch (A-A): Natuurlijk mineur. Droef, melancholisch.\nVII. Locrisch (B-B): Verminderd. Instabiel, zelden solistisch.",
    },
    {
      heading: "Dorisch — de jazz-mineur modus",
      content:
        "Dorisch is de belangrijkste modus voor jazz. Je speelt hem over mineur 7-akkoorden (de ii in een ii-V-I). Het verschil met gewoon mineur (Aeolisch) is de verhoogde 6e noot — die geeft een warmere, minder droevige klank.\n\nD Dorisch: D E F G A B C D\nVergelijk met D Aeolisch: D E F G A B♭ C D\n\nHet verschil is die B (natuurlijk) in plaats van B♭.",
      pianoExamples: [
        {
          label: "D Dorisch toonladder",
          notes: [
            { note: "D4", color: "#60a5fa", label: "D" },
            { note: "E4", color: "#3b82f6", label: "E" },
            { note: "F4", color: "#3b82f6", label: "F" },
            { note: "G4", color: "#3b82f6", label: "G" },
            { note: "A4", color: "#3b82f6", label: "A" },
            { note: "B4", color: "#818cf8", label: "B" },
            { note: "C5", color: "#3b82f6", label: "C" },
          ],
          caption: "De B (6e noot) is het kenmerk van Dorisch — vergelijk met B♭ in Aeolisch",
        },
      ],
      tip: "Als je over een Dm7-akkoord improviseert in een ii-V-I, gebruik dan D Dorisch. Het is letterlijk dezelfde noten als C majeur, maar dan startend op D.",
    },
    {
      heading: "Mixolydisch — voor dominant akkoorden",
      content:
        "Mixolydisch is de modus voor dominant 7-akkoorden (de V in een ii-V-I). Het is een majeur toonladder met een verlaagde 7e noot.\n\nG Mixolydisch: G A B C D E F G\nVergelijk met G Ionisch: G A B C D E F♯ G\n\nDie F (in plaats van F♯) maakt het bluesy en past perfect bij G7.",
      pianoExamples: [
        {
          label: "G Mixolydisch",
          notes: [
            { note: "G4", color: "#60a5fa", label: "G" },
            { note: "A4", color: "#3b82f6", label: "A" },
            { note: "B4", color: "#3b82f6", label: "B" },
            { note: "C5", color: "#3b82f6", label: "C" },
            { note: "D5", color: "#3b82f6", label: "D" },
            { note: "E5", color: "#3b82f6", label: "E" },
            { note: "F5", color: "#818cf8", label: "F" },
          ],
          caption: "De F (♭7e noot) maakt het dominant/bluesy",
        },
      ],
    },
    {
      heading: "Lydisch — voor majeur akkoorden",
      content:
        "Lydisch wordt vaak gebruikt over majeur 7-akkoorden, vooral als I-akkoord. De verhoogde 4e (#4 of #11) geeft een zwevende, open klank die populair is in modern jazz.\n\nC Lydisch: C D E F♯ G A B C\n\nDie F♯ vermijdt de 'botsing' die een gewone F heeft met de E (grote terts) in een Cmaj7-akkoord.",
    },
    {
      heading: "De simpele regel",
      content:
        "Voor de ii-V-I in C majeur:\n\n• Over Dm7 (ii): speel D Dorisch (= noten van C majeur)\n• Over G7 (V): speel G Mixolydisch (= noten van C majeur)\n• Over Cmaj7 (I): speel C Ionisch of C Lydisch (= noten van C majeur, of met F♯)\n\nMerk op: voor Dorisch en Mixolydisch gebruik je exact dezelfde noten als de onderliggende majeur toonladder! Je hoeft alleen te weten welke noot je 'thuis' noemt.",
      tip: "In het begin hoef je niet elke modus apart te leren. Als je de ii-V-I speelt in C, gebruik je voor alle drie de akkoorden gewoon de noten van C majeur. De modus verandert alleen je 'focus-noot'.",
    },
    {
      heading: "Modale jazz",
      content:
        "Sommige jazz-nummers zijn 'modaal' — ze blijven lang op één akkoord hangen in plaats van snel te wisselen. Het beroemdste voorbeeld is 'So What' van Miles Davis, dat 16 maten op Dm7 (Dorisch) staat en dan 8 maten op E♭m7 (Dorisch een halve toon hoger). Bij modale jazz draait het om het verkennen van de kleur van één modus.",
    },
  ],
};
