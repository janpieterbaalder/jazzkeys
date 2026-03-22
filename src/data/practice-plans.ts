export interface PracticePhase {
  phase: number;
  title: string;
  period: string;
  focus: string;
  description: string;
  goals: string[];
  dailyRoutine: DailyBlock[];
  weeklyFocus: WeeklyFocus[];
  standards: string[];
}

export interface DailyBlock {
  title: string;
  duration: string;
  activities: string[];
}

export interface WeeklyFocus {
  week: string;
  focus: string;
  details: string;
}

export const practicePhases: PracticePhase[] = [
  {
    phase: 1,
    title: "Basis",
    period: "Maand 1–2",
    focus: "7e-akkoorden, shell voicings, ii-V-I, eerste notenlezen",
    description:
      "In deze fase leg je het fundament. Je leert de vijf essentiële 7e-akkoordtypen, speelt je eerste shell voicings, en begint met het herkennen van noten op de balk. Het doel is comfortabel worden met jazz-akkoorden in plaats van drieklanken.",
    goals: [
      "Alle 5 typen 7e-akkoorden spelen vanuit elke grondtoon",
      "Shell voicings (root-3-7) in alle 12 toonsoorten",
      "ii-V-I met shell voicings in minstens 6 toonsoorten",
      "Noten op de notenbalk herkennen (G-sleutel en F-sleutel)",
      "1 jazz-standard leren (bijv. Autumn Leaves)",
    ],
    dailyRoutine: [
      {
        title: "Opwarming",
        duration: "5 min",
        activities: [
          "C majeur toonladder beide handen, 2 octaven",
          "Chromatische toonladder langzaam",
        ],
      },
      {
        title: "Notenlezen",
        duration: "10 min",
        activities: [
          "Noten herkennen op de balk (gebruik flashcards of een app)",
          "Simpele melodieën lezen en langzaam spelen",
          "Focus op de 'landmark' noten: midden-C, G boven de balk, F onder de balk",
        ],
      },
      {
        title: "Akkoorden & Voicings",
        duration: "15 min",
        activities: [
          "Week 1-2: Leer maj7 en dom7 in alle 12 toonsoorten",
          "Week 3-4: Voeg min7 toe",
          "Week 5-6: Voeg m7♭5 en dim7 toe",
          "Week 7-8: Shell voicings door de kwintencirkel",
        ],
      },
      {
        title: "ii-V-I Progressie",
        duration: "10 min",
        activities: [
          "Speel ii-V-I met shell voicings",
          "Begin in C, voeg elke week een toonsoort toe",
          "Let op voice leading: beweeg zo min mogelijk",
        ],
      },
      {
        title: "Repertoire",
        duration: "15 min",
        activities: [
          "Leer de melodie van je eerste standard",
          "Speel de akkoorden als shell voicings",
          "Probeer melodie (rechts) + bastoon (links) samen",
        ],
      },
      {
        title: "Vrij spelen",
        duration: "5 min",
        activities: [
          "Improviseer met de akkoorden die je vandaag hebt geoefend",
          "Experimenteer — er zijn geen fouten!",
        ],
      },
    ],
    weeklyFocus: [
      {
        week: "Week 1-2",
        focus: "Majeur 7 en Dominant 7",
        details:
          "Leer Cmaj7, Fmaj7, Gmaj7, en C7, F7, G7. Speel ze als blokakkoorden en als shell voicings.",
      },
      {
        week: "Week 3-4",
        focus: "Mineur 7 en eerste ii-V-I",
        details:
          "Voeg Dm7, Gm7, Am7 toe. Speel je eerste ii-V-I: Dm7 → G7 → Cmaj7 met shell voicings.",
      },
      {
        week: "Week 5-6",
        focus: "Alle 5 akkoordtypen",
        details:
          "Voeg m7♭5 en dim7 toe. Oefen alle typen door de kwintencirkel. Begin met notenlezen.",
      },
      {
        week: "Week 7-8",
        focus: "ii-V-I in meerdere toonsoorten",
        details:
          "Speel ii-V-I in C, F, Bb, Eb, Ab, Db. Leer je eerste jazz-standard: Autumn Leaves.",
      },
    ],
    standards: ["Autumn Leaves", "Fly Me to the Moon"],
  },
  {
    phase: 2,
    title: "Voice Leading & Standards",
    period: "Maand 2–4",
    focus: "Voice leading, eerste standards, akkoordtoon-improvisatie",
    description:
      "Nu je de basis hebt, ga je soepeler spelen. Je leert voice leading (akkoorden vloeiend verbinden), speelt je eerste jazz-standards, en begint met eenvoudige improvisatie door akkoordtonen te targeten.",
    goals: [
      "Soepele voice leading in ii-V-I (guide tones blijven liggen)",
      "ii-V-I in alle 12 toonsoorten met shell voicings",
      "3-4 jazz-standards kunnen spelen",
      "Eenvoudige improvisatie: akkoordtonen op sterke tellen",
      "Sight-reading van eenvoudige melodieën",
    ],
    dailyRoutine: [
      {
        title: "Opwarming & Techniek",
        duration: "10 min",
        activities: [
          "Majeur toonladders in de toonsoort van je standard",
          "Arpeggio's van 7e-akkoorden (bijv. Cmaj7 arpeggio: C-E-G-B)",
        ],
      },
      {
        title: "Notenlezen",
        duration: "10 min",
        activities: [
          "Sight-reading: speel een nieuw stukje dat je nog niet kent",
          "Lees langzaam, focus op ritme en nootherkenning",
          "Probeer niet te stoppen — speel door, ook bij fouten",
        ],
      },
      {
        title: "Voice Leading",
        duration: "15 min",
        activities: [
          "ii-V-I met shell voicings door alle toonsoorten",
          "Focus: de 3e en 7e wisselen van functie (3→7, 7→3)",
          "Oefen zonder te kijken naar je handen",
        ],
      },
      {
        title: "Repertoire",
        duration: "15 min",
        activities: [
          "Werk aan een jazz-standard: melodie + voicings",
          "Speel de melodie met de rechterhand, shell voicings met links",
          "Probeer het stuk uit je hoofd te spelen",
        ],
      },
      {
        title: "Improvisatie",
        duration: "10 min",
        activities: [
          "Speel over de akkoorden van je standard",
          "Target de 3e of 7e van elk akkoord op tel 1",
          "Verbind de targets met toonladdernoten",
          "Houd het simpel — minder noten is vaak beter",
        ],
      },
    ],
    weeklyFocus: [
      {
        week: "Week 1-2",
        focus: "Voice leading verdiepen",
        details:
          "Speel ii-V-I in alle toonsoorten. Merk op hoe de guide tones (3e en 7e) amper bewegen.",
      },
      {
        week: "Week 3-4",
        focus: "Tweede standard + improvisatie",
        details:
          "Leer Blue Bossa of Misty. Begin met chord tone soloing: target de 3e en 7e.",
      },
      {
        week: "Week 5-6",
        focus: "Derde standard + arpeggio's",
        details:
          "Leer My Funny Valentine. Oefen 7e-akkoord arpeggio's als basis voor improvisatie.",
      },
      {
        week: "Week 7-8",
        focus: "Consolidatie",
        details:
          "Speel alle geleerde standards achter elkaar. Improviseer over ii-V-I met meer vertrouwen.",
      },
    ],
    standards: ["Blue Bossa", "Misty", "My Funny Valentine"],
  },
  {
    phase: 3,
    title: "Rootless Voicings & Walking Bass",
    period: "Maand 4–8",
    focus: "Rootless voicings, walking bass, hand-onafhankelijkheid",
    description:
      "In deze fase maak je de sprong naar professioneler klinkende jazz. Rootless voicings geven rijkere klanken, walking bass maakt je solopiano interessanter, en je ontwikkelt echte hand-onafhankelijkheid.",
    goals: [
      "Rootless voicings Type A en B in alle toonsoorten",
      "Basis walking bass lines (root-5th patroon)",
      "Linkerhand walking bass + rechterhand akkoorden",
      "5-8 jazz-standards in je repertoire",
      "Comping-patronen: Charleston, anticipatie",
    ],
    dailyRoutine: [
      {
        title: "Techniek",
        duration: "10 min",
        activities: [
          "Toonladders in tertsen (C-E, D-F, E-G...)",
          "Dorische en Mixolydische toonladders",
        ],
      },
      {
        title: "Notenlezen",
        duration: "10 min",
        activities: [
          "Sight-reading van iets moeilijkere stukken",
          "Lees leadsheets: melodie + akkoordsymbolen tegelijk",
        ],
      },
      {
        title: "Rootless Voicings",
        duration: "15 min",
        activities: [
          "Type A (3-5-7-9) door ii-V-I in alle toonsoorten",
          "Type B (7-9-3-5) door ii-V-I in alle toonsoorten",
          "Wissel A en B af voor optimale voice leading",
        ],
      },
      {
        title: "Walking Bass",
        duration: "10 min",
        activities: [
          "Begin met root-5th patroon (bijv. D-A-D-A over Dm7)",
          "Voeg chromatische approach notes toe op tel 4",
          "Combineer: links walking bass, rechts shell voicings",
        ],
      },
      {
        title: "Repertoire & Improvisatie",
        duration: "15 min",
        activities: [
          "Werk aan nieuwe standards",
          "Speel met comping-patronen (varieer het ritme)",
          "Improviseer met Dorisch over ii, Mixolydisch over V",
        ],
      },
    ],
    weeklyFocus: [
      {
        week: "Maand 4-5",
        focus: "Rootless voicings leren",
        details:
          "Leer Type A voor ii-V-I in alle toonsoorten. Dan Type B. Oefen het wisselen.",
      },
      {
        week: "Maand 5-6",
        focus: "Walking bass basis",
        details:
          "Start met root-5th, dan arpeggio-based walking, dan chromatische approaches.",
      },
      {
        week: "Maand 6-7",
        focus: "Hand-onafhankelijkheid",
        details:
          "Combineer walking bass (links) met akkoorden of melodie (rechts). Begin langzaam!",
      },
      {
        week: "Maand 7-8",
        focus: "Comping en repertoire",
        details:
          "Leer 2-3 nieuwe standards. Experimenteer met Charleston en anticipatie-comping.",
      },
    ],
    standards: [
      "Girl from Ipanema",
      "All the Things You Are",
      "There Will Never Be Another You",
      "Satin Doll",
    ],
  },
  {
    phase: 4,
    title: "Integratie & Stijl",
    period: "Maand 8–12+",
    focus: "Stride, uitbreidingen, reharmonisatie, eigen stijl ontwikkelen",
    description:
      "De eindfase is open-ended. Je integreert alles wat je hebt geleerd, experimenteert met geavanceerde technieken als stride piano en reharmonisatie, en begint je eigen jazz-stijl te ontwikkelen.",
    goals: [
      "10-15 jazz-standards in je repertoire",
      "Stride piano basispatronen",
      "Reharmonisatie: akkoordsubstituten toepassen",
      "Zelfverzekerd improviseren over standards",
      "Eigen arrangementen maken van stukken",
    ],
    dailyRoutine: [
      {
        title: "Techniek",
        duration: "10 min",
        activities: [
          "Alle modi door verschillende toonsoorten",
          "Verminderde en whole-tone toonladders",
          "Stride-patroon oefenen (bas-akkoord-bas-akkoord)",
        ],
      },
      {
        title: "Notenlezen",
        duration: "10 min",
        activities: [
          "Sight-reading van leadsheets op niveau",
          "Transcripties lezen van jazz-solo's",
        ],
      },
      {
        title: "Harmonie & Voicings",
        duration: "15 min",
        activities: [
          "Upper structure voicings verkennen",
          "Tritone substitutions toepassen in standards",
          "Experimenteer met 9e, 11e, 13e uitbreidingen",
        ],
      },
      {
        title: "Repertoire",
        duration: "15 min",
        activities: [
          "Leer nieuwe standards of maak eigen arrangementen",
          "Speel bekende stukken met reharmonisatie",
          "Probeer verschillende stijlen: bossa, swing, ballad",
        ],
      },
      {
        title: "Improvisatie",
        duration: "10 min",
        activities: [
          "Improviseer over volledige standards",
          "Gebruik approach notes en chromatiek",
          "Luister naar en kopieer licks van jazz-pianisten",
        ],
      },
    ],
    weeklyFocus: [
      {
        week: "Maand 8-9",
        focus: "Stride en solo piano",
        details:
          "Leer het stride-patroon. Speel standards als solo piano: melodie + stride.",
      },
      {
        week: "Maand 9-10",
        focus: "Reharmonisatie",
        details:
          "Pas tritone subs, secondary dominants en passing chords toe op bekende standards.",
      },
      {
        week: "Maand 10-11",
        focus: "Improvisatie verdiepen",
        details:
          "Ontwikkel langere solo's. Gebruik motief-ontwikkeling (herhaal en varieer een idee).",
      },
      {
        week: "Maand 11-12",
        focus: "Eigen stijl",
        details:
          "Maak eigen arrangementen. Kies je favoriete technieken en combineer ze tot jouw sound.",
      },
    ],
    standards: [
      "Stella by Starlight",
      "Body and Soul",
      "Round Midnight",
      "Take the A Train",
      "So What",
    ],
  },
];
