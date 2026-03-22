import type { DagSchema } from "./practice-plans";

// Kleuren voor akkoordtonen (consistent met TONE_COLORS in piano-utils.ts)
const R = "#60a5fa"; // root — blue-400
const T = "#3b82f6"; // terts (3e) — blue-500
const V = "#6366f1"; // vijfde — indigo-500
const Z = "#818cf8"; // zevende — indigo-400
const N = "#8b5cf6"; // negende — violet-500

export const fase1Week1en2: DagSchema[] = [
  // ============ WEEK 1: Majeur 7 akkoorden ============
  {
    dag: 1,
    dagLabel: "Dag 1 (Maandag)",
    thema: "Het keyboard leren kennen",
    oefeningen: [
      {
        titel: "Alle C's vinden",
        duur: "5 min",
        doel: "Weten waar elke C op het keyboard zit",
        stappen: [
          {
            stap: 1,
            instructie: "Zoek de groepjes van 2 zwarte toetsen",
            details:
              "Het keyboard heeft steeds afwisselend groepjes van 2 en 3 zwarte toetsen. De C zit altijd direct links van een groepje van 2 zwarte toetsen.",
          },
          {
            stap: 2,
            instructie: "Speel alle C's van laag naar hoog",
            details:
              "Begin helemaal links op het keyboard en speel elke C die je tegenkomt. De middelste C (C4) is je ankerpunt — die gebruik je het meest.",
            pianoVoorbeeld: {
              label: "Midden-C (C4)",
              noten: [{ note: "C4", color: R, label: "C4" }],
              uitleg:
                "Dit is midden-C, het belangrijkste oriëntatiepunt op het keyboard. In bladmuziek staat deze noot op een hulplijn net onder de G-sleutel.",
              startOctave: 3,
              octaves: 2,
            },
          },
          {
            stap: 3,
            instructie: "Speel C3, C4, en C5 achter elkaar",
            pianoVoorbeeld: {
              label: "Drie C's",
              noten: [
                { note: "C3", color: R, label: "C3" },
                { note: "C4", color: R, label: "C4" },
                { note: "C5", color: R, label: "C5" },
              ],
              uitleg:
                "C3 is een octaaf lager dan midden-C. C5 is een octaaf hoger. Hoor je hoe ze 'hetzelfde' klinken maar hoger/lager?",
              startOctave: 3,
              octaves: 3,
            },
          },
        ],
      },
      {
        titel: "De witte toetsen: C-D-E-F-G-A-B",
        duur: "10 min",
        doel: "Alle witte toetsen bij naam kennen",
        stappen: [
          {
            stap: 1,
            instructie: "Speel C-D-E-F-G-A-B vanaf midden-C",
            details:
              "Dit zijn de 7 noten van de C majeur toonladder. Na B begint het weer bij C, maar dan een octaaf hoger.",
            pianoVoorbeeld: {
              label: "C majeur toonladder",
              noten: [
                { note: "C4", color: R, label: "C" },
                { note: "D4", color: T, label: "D" },
                { note: "E4", color: V, label: "E" },
                { note: "F4", color: Z, label: "F" },
                { note: "G4", color: R, label: "G" },
                { note: "A4", color: T, label: "A" },
                { note: "B4", color: V, label: "B" },
              ],
              uitleg:
                "De C majeur toonladder: alleen witte toetsen. Oefen dit langzaam met de rechterhand.",
              startOctave: 3,
              octaves: 2,
            },
          },
          {
            stap: 2,
            instructie: "Oefen het herkennen van losse noten",
            details:
              "Sluit je ogen, druk een willekeurige witte toets in, en probeer te benoemen welke noot het is. Gebruik de groepjes zwarte toetsen als oriëntatie: C en D zitten bij het groepje van 2, F en G bij het groepje van 3.",
            tip: "F zit altijd direct links van het groepje van 3 zwarte toetsen, net zoals C links zit van het groepje van 2.",
          },
          {
            stap: 3,
            instructie: "Speel de toonladder met beide handen apart",
            details:
              "Rechterhand: duim op C, dan D met wijsvinger, E met middelvinger enzovoort. Linkerhand: pink op C (een octaaf lager), dan omhoog.",
          },
        ],
      },
      {
        titel: "Eerste noten op de balk herkennen",
        duur: "10 min",
        doel: "De 'landmark' noten kennen: midden-C, G, F",
        stappen: [
          {
            stap: 1,
            instructie: "Leer de drie ankerpunten",
            details:
              "In bladmuziek zijn er drie noten die je als eerste moet onthouden: (1) Midden-C — op een hulplijn tussen de twee balken, (2) G4 — op de tweede lijn van de G-sleutel (treble clef), (3) F3 — op de vierde lijn van de F-sleutel (bass clef). Alle andere noten kun je afleiden door vanaf deze punten te tellen.",
            pianoVoorbeeld: {
              label: "Drie ankerpunten",
              noten: [
                { note: "F3", color: Z, label: "F3" },
                { note: "C4", color: R, label: "C4" },
                { note: "G4", color: T, label: "G4" },
              ],
              uitleg:
                "F3 = vierde lijn F-sleutel (linkerhand). C4 = hulplijn midden (beide handen). G4 = tweede lijn G-sleutel (rechterhand).",
              startOctave: 3,
              octaves: 2,
            },
          },
          {
            stap: 2,
            instructie: "Oefen: tel vanaf de ankerpunten",
            details:
              'Vanaf G4 omhoog op de balk: A4 zit in de ruimte erboven, B4 op de volgende lijn. Vanaf F3 omlaag: E3 in de ruimte eronder, D3 op de volgende lijn. Elke "stap" op de balk is één witte toets.',
            tip: "Op de notenbalk wisselen noten steeds af tussen lijn en ruimte. Elke stap is de volgende letter in het alfabet.",
          },
        ],
      },
    ],
    dagTip:
      "Neem de tijd om het keyboard te verkennen. Alles wat je leert bouwt voort op het herkennen van deze basisnoten. Snelheid is niet belangrijk — begrip wel!",
  },

  {
    dag: 2,
    dagLabel: "Dag 2 (Dinsdag)",
    thema: "Je eerste akkoord: Cmaj7",
    oefeningen: [
      {
        titel: "Cmaj7 leren (C-E-G-B)",
        duur: "15 min",
        doel: "Het Cmaj7 akkoord foutloos kunnen spelen",
        stappen: [
          {
            stap: 1,
            instructie: "Speel de vier noten apart: C, E, G, B",
            details:
              "Een Cmaj7 akkoord bestaat uit vier noten: C (grondtoon), E (terts), G (kwint), B (septiem). Speel ze één voor één en zeg de naam hardop.",
            pianoVoorbeeld: {
              label: "Cmaj7 noten apart",
              noten: [
                { note: "C4", color: R, label: "R" },
                { note: "E4", color: T, label: "3" },
                { note: "G4", color: V, label: "5" },
                { note: "B4", color: Z, label: "7" },
              ],
              uitleg:
                "R = Root (grondtoon), 3 = terts, 5 = kwint, 7 = septiem. Dit zijn de vier bouwstenen van elk 7e akkoord.",
              startOctave: 3,
              octaves: 2,
            },
          },
          {
            stap: 2,
            instructie: "Speel alle vier noten tegelijk",
            details:
              "Plaats je rechterhand zo: duim op C, wijsvinger op E, middelvinger op G, pink op B. Druk alle vier tegelijk in. Dit is het Cmaj7 akkoord!",
            tip: "Het klinkt 'dromerig' en warm. Dat is het kenmerkende geluid van een majeur 7 akkoord — de B (septiem) geeft die jazz-kleur.",
          },
          {
            stap: 3,
            instructie: "Speel Cmaj7 met de linkerhand",
            details:
              "Linkerhand: pink op C3, ringvinger op E3, wijsvinger op G3, duim op B3. Oefen tot het comfortabel voelt.",
            pianoVoorbeeld: {
              label: "Cmaj7 linkerhand",
              noten: [
                { note: "C3", color: R, label: "R" },
                { note: "E3", color: T, label: "3" },
                { note: "G3", color: V, label: "5" },
                { note: "B3", color: Z, label: "7" },
              ],
              uitleg:
                "Hetzelfde akkoord, maar een octaaf lager met de linkerhand.",
              startOctave: 3,
              octaves: 2,
            },
          },
          {
            stap: 4,
            instructie: "Wissel handen af",
            details:
              "Speel Cmaj7 met rechts, dan met links, dan met rechts. Herhaal dit 5 keer. Probeer steeds sneller te wisselen.",
          },
        ],
      },
      {
        titel: "Cmaj7 herkennen in bladmuziek",
        duur: "5 min",
        doel: "Weten hoe C, E, G en B eruitzien op de notenbalk",
        stappen: [
          {
            stap: 1,
            instructie: "Leer de posities op de G-sleutel",
            details:
              "C4 = hulplijn onder de balk. E4 = eerste lijn. G4 = tweede lijn. B4 = derde lijn. Merk op: deze noten zitten allemaal op lijnen, niet in ruimtes! Dat is een handige manier om Cmaj7 snel te herkennen.",
            tip: "Als je drie of vier noten op opeenvolgende lijnen ziet staan in de G-sleutel, is het waarschijnlijk een Cmaj7 of een soortgelijk akkoord.",
          },
        ],
      },
      {
        titel: "Vrij spelen met Cmaj7",
        duur: "5 min",
        doel: "Het akkoord comfortabel voelen",
        stappen: [
          {
            stap: 1,
            instructie: "Speel Cmaj7 met links en improviseer met rechts",
            details:
              "Houd Cmaj7 vast met de linkerhand (C3-E3-G3-B3) en speel willekeurige witte toetsen met de rechterhand. Bijna alles klinkt goed over Cmaj7!",
          },
        ],
      },
    ],
    dagTip:
      "Cmaj7 is het eerste van vijf akkoordtypen die je leert. Als je dit akkoord goed kent, is de rest veel makkelijker — de structuur is steeds hetzelfde.",
  },

  {
    dag: 3,
    dagLabel: "Dag 3 (Woensdag)",
    thema: "Fmaj7 — je tweede majeur 7 akkoord",
    oefeningen: [
      {
        titel: "Fmaj7 leren (F-A-C-E)",
        duur: "10 min",
        doel: "Fmaj7 foutloos spelen en vergelijken met Cmaj7",
        stappen: [
          {
            stap: 1,
            instructie: "Bouw Fmaj7 op: F, A, C, E",
            details:
              "Net als bij Cmaj7 heb je vier noten: grondtoon (F), terts (A), kwint (C), septiem (E). Het patroon is hetzelfde: 1-3-5-7.",
            pianoVoorbeeld: {
              label: "Fmaj7",
              noten: [
                { note: "F3", color: R, label: "R" },
                { note: "A3", color: T, label: "3" },
                { note: "C4", color: V, label: "5" },
                { note: "E4", color: Z, label: "7" },
              ],
              uitleg:
                "Fmaj7 = F-A-C-E. Merk op dat de C en E die je al kent van Cmaj7 hier ook in zitten!",
              startOctave: 3,
              octaves: 2,
            },
          },
          {
            stap: 2,
            instructie: "Speel Fmaj7 met beide handen apart",
            details:
              "Rechterhand: duim op F, wijsvinger op A, middelvinger op C, pink op E. Linkerhand: pink op F, ringvinger op A, wijsvinger op C, duim op E.",
          },
          {
            stap: 3,
            instructie: "Wissel Cmaj7 en Fmaj7",
            details:
              "Speel eerst Cmaj7, dan Fmaj7, dan weer Cmaj7. Doe dit langzaam en let op welke vingers bewegen en welke blijven liggen.",
            pianoVoorbeeld: {
              label: "Cmaj7 → Fmaj7 vergelijking",
              noten: [
                { note: "C3", color: R, label: "C" },
                { note: "E3", color: T, label: "E" },
                { note: "G3", color: "#334155" },
                { note: "A3", color: T, label: "A" },
                { note: "B3", color: "#334155" },
                { note: "C4", color: V, label: "C" },
                { note: "E4", color: Z, label: "E" },
                { note: "F3", color: R, label: "F" },
              ],
              uitleg:
                "De noten C en E zitten in beide akkoorden! Dit is belangrijk voor voice leading later.",
              startOctave: 3,
              octaves: 2,
            },
            tip: "Voice leading betekent: beweeg zo min mogelijk noten tussen akkoorden. C en E blijven liggen — alleen de andere noten veranderen.",
          },
        ],
      },
      {
        titel: "Notenlezen: de F-sleutel",
        duur: "10 min",
        doel: "Noten in de F-sleutel (bassleutel) herkennen",
        stappen: [
          {
            stap: 1,
            instructie: "Leer de F-sleutel ankerpunten",
            details:
              "De F-sleutel (bass clef) is voor je linkerhand. De twee stippen van de F-sleutel omsluiten de vierde lijn — dat is de F. Vanaf daar tel je: G in de ruimte erboven, A op de vijfde lijn, enzovoort.",
            pianoVoorbeeld: {
              label: "F-sleutel ankerpunten",
              noten: [
                { note: "A2", color: Z, label: "A2" },
                { note: "C3", color: R, label: "C3" },
                { note: "F3", color: T, label: "F3" },
              ],
              uitleg:
                "A2 = tweede ruimte. C3 = derde ruimte. F3 = vierde lijn. Dit zijn je drie ankerpunten in de F-sleutel.",
              startOctave: 2,
              octaves: 2,
            },
          },
          {
            stap: 2,
            instructie: "Oefen: speel noten in de F-sleutel",
            details:
              "Speel met je linkerhand de noten C3, D3, E3, F3, G3, A3, B3. Zeg bij elke noot de naam. Dit is hetzelfde als de C-toonladder, maar dan in het 'linkerhand-gebied'.",
          },
        ],
      },
      {
        titel: "Vrij spelen met twee akkoorden",
        duur: "5 min",
        doel: "Comfortabel wisselen tussen Cmaj7 en Fmaj7",
        stappen: [
          {
            stap: 1,
            instructie: "Speel een simpel patroon",
            details:
              "4 tellen Cmaj7 (links), 4 tellen Fmaj7 (links). Speel ondertussen losse noten met rechts. Herhaal dit een paar keer.",
          },
        ],
      },
    ],
    dagTip:
      "Je kent nu al twee majeur 7 akkoorden! Het patroon is steeds hetzelfde: grondtoon + terts + kwint + septiem. Morgen leren we Gmaj7 — met je eerste zwarte toets.",
  },

  {
    dag: 4,
    dagLabel: "Dag 4 (Donderdag)",
    thema: "Gmaj7 en je eerste kruis (F#)",
    oefeningen: [
      {
        titel: "Gmaj7 leren (G-B-D-F#)",
        duur: "15 min",
        doel: "Gmaj7 spelen en begrijpen waarom er een F# in zit",
        stappen: [
          {
            stap: 1,
            instructie: "Bouw Gmaj7 op: G, B, D, F#",
            details:
              "Dit is je eerste akkoord met een zwarte toets! De F# (fis) is de zwarte toets rechts van F. In een majeur 7 akkoord is de septiem altijd een halve toon onder de grondtoon — van G een halve toon omlaag is F#.",
            pianoVoorbeeld: {
              label: "Gmaj7",
              noten: [
                { note: "G3", color: R, label: "R" },
                { note: "B3", color: T, label: "3" },
                { note: "D4", color: V, label: "5" },
                { note: "F#4", color: Z, label: "7" },
              ],
              uitleg:
                "Gmaj7 = G-B-D-F#. De F# is de zwarte toets rechts van F. Dit is een 'grote septiem' — kenmerkend voor het maj7 geluid.",
              startOctave: 3,
              octaves: 2,
            },
          },
          {
            stap: 2,
            instructie: "Vergelijk F en F#",
            details:
              "Speel eerst G met F erbij (dat klinkt 'hard' en gespannen). Speel dan G met F# erbij (dat klinkt 'dromerig' en warm). De F# maakt het verschil tussen een dominant 7 (G7) en een majeur 7 (Gmaj7).",
            pianoVoorbeeld: {
              label: "G7 vs Gmaj7",
              noten: [
                { note: "G3", color: R, label: "R" },
                { note: "B3", color: T, label: "3" },
                { note: "D4", color: V, label: "5" },
                { note: "F4", color: "#ef4444", label: "b7" },
                { note: "F#4", color: Z, label: "7" },
              ],
              uitleg:
                "F (rood) = klein septiem → G7. F# (paars) = groot septiem → Gmaj7. Eén halve toon verschil, compleet ander karakter!",
              startOctave: 3,
              octaves: 2,
            },
          },
          {
            stap: 3,
            instructie: "Oefen alle drie: Cmaj7 → Fmaj7 → Gmaj7",
            details:
              "Speel ze achter elkaar, elke keer 4 tellen. Dit is een veelvoorkomende combinatie in muziek (I-IV-V in C majeur).",
          },
        ],
      },
      {
        titel: "Notenlezen: kruisen en mollen",
        duur: "10 min",
        doel: "Weten wat # en b betekenen op de balk",
        stappen: [
          {
            stap: 1,
            instructie: "Leer het verschil tussen # (kruis) en b (mol)",
            details:
              "Een # (kruis/sharp) verhoogt een noot met een halve toon — je speelt de zwarte toets rechts van de witte toets. Een b (mol/flat) verlaagt een noot met een halve toon — je speelt de zwarte toets links van de witte toets. F# = de zwarte toets rechts van F. Bb = de zwarte toets links van B.",
          },
          {
            stap: 2,
            instructie: "Oefen: speel F, F#, G en Bb, B, C",
            details:
              "Voel hoe de halve toon-stappen werken. F naar F# is een halve toon. F# naar G is ook een halve toon. Bb naar B is een halve toon.",
            pianoVoorbeeld: {
              label: "Halve tonen",
              noten: [
                { note: "F4", color: R, label: "F" },
                { note: "F#4", color: T, label: "F#" },
                { note: "G4", color: V, label: "G" },
                { note: "Bb4", color: R, label: "Bb" },
                { note: "B4", color: T, label: "B" },
                { note: "C5", color: V, label: "C" },
              ],
              uitleg:
                "Van F naar F# en van F# naar G: allemaal halve tonen. Hetzelfde geldt voor Bb → B → C.",
              startOctave: 4,
              octaves: 2,
            },
          },
        ],
      },
    ],
    dagTip:
      "Je kent nu drie majeur 7 akkoorden! Gmaj7 is speciaal omdat het je eerste zwarte toets bevat. In jazz kom je zwarte toetsen heel vaak tegen — raak ermee vertrouwd.",
  },

  {
    dag: 5,
    dagLabel: "Dag 5 (Vrijdag)",
    thema: "Shell voicings: minder noten, meer jazz",
    oefeningen: [
      {
        titel: "Wat zijn shell voicings?",
        duur: "5 min",
        doel: "Begrijpen waarom je niet alle noten hoeft te spelen",
        stappen: [
          {
            stap: 1,
            instructie: "De 3 belangrijkste noten van een akkoord",
            details:
              "In jazz speel je vaak niet alle vier noten van een akkoord. Een 'shell voicing' gebruikt alleen de drie belangrijkste: de grondtoon (R), de terts (3), en de septiem (7). De kwint (5) laat je weg — die voegt weinig kleur toe.",
          },
        ],
      },
      {
        titel: "Cmaj7 shell voicing",
        duur: "10 min",
        doel: "Cmaj7 als shell voicing spelen met de linkerhand",
        stappen: [
          {
            stap: 1,
            instructie: "Speel C-E-B met de linkerhand",
            details:
              "Pink op C3, duim op E3, wijsvinger op B3. Dit is de Cmaj7 shell voicing. Vergelijk met het volle akkoord — het klinkt opener en 'volwassener'.",
            pianoVoorbeeld: {
              label: "Cmaj7 shell voicing",
              noten: [
                { note: "C3", color: R, label: "R" },
                { note: "E3", color: T, label: "3" },
                { note: "B3", color: Z, label: "7" },
              ],
              uitleg:
                "Shell = Root + Terts + Septiem. Geen kwint! Dit klinkt helderder en laat ruimte voor de rechterhand.",
              startOctave: 3,
              octaves: 2,
            },
          },
          {
            stap: 2,
            instructie: "Vergelijk vol akkoord vs. shell",
            details:
              "Speel eerst Cmaj7 vol (C-E-G-B), dan de shell (C-E-B). Hoor je dat de shell 'opener' klinkt? Die openheid is typisch jazz — het geeft ruimte voor melodie en improvisatie.",
            pianoVoorbeeld: {
              label: "Cmaj7 vol vs. shell",
              noten: [
                { note: "C3", color: R, label: "R" },
                { note: "E3", color: T, label: "3" },
                { note: "G3", color: "#334155", label: "5" },
                { note: "B3", color: Z, label: "7" },
              ],
              uitleg:
                "De grijze G (kwint) laat je weg in de shell voicing. De kleur van het akkoord zit in de 3 en de 7, niet in de 5.",
              startOctave: 3,
              octaves: 2,
            },
          },
        ],
      },
      {
        titel: "Shell voicings voor Fmaj7 en Gmaj7",
        duur: "10 min",
        doel: "Alle drie majeur 7 shell voicings beheersen",
        stappen: [
          {
            stap: 1,
            instructie: "Fmaj7 shell: F-A-E",
            pianoVoorbeeld: {
              label: "Fmaj7 shell voicing",
              noten: [
                { note: "F3", color: R, label: "R" },
                { note: "A3", color: T, label: "3" },
                { note: "E4", color: Z, label: "7" },
              ],
              uitleg:
                "Fmaj7 shell = F-A-E. Zelfde principe: root + terts + septiem.",
              startOctave: 3,
              octaves: 2,
            },
          },
          {
            stap: 2,
            instructie: "Gmaj7 shell: G-B-F#",
            pianoVoorbeeld: {
              label: "Gmaj7 shell voicing",
              noten: [
                { note: "G3", color: R, label: "R" },
                { note: "B3", color: T, label: "3" },
                { note: "F#4", color: Z, label: "7" },
              ],
              uitleg:
                "Gmaj7 shell = G-B-F#. Onthoud: de septiem van G is F# (niet F!).",
              startOctave: 3,
              octaves: 2,
            },
          },
          {
            stap: 3,
            instructie: "Oefen: wissel alle drie shell voicings",
            details:
              "Cmaj7 shell → Fmaj7 shell → Gmaj7 shell → Cmaj7 shell. Elke keer 4 tellen. Herhaal 5 keer.",
            tip: "Let op hoe weinig je vingers hoeven te bewegen tussen de akkoorden. Dat is de kracht van shell voicings!",
          },
        ],
      },
    ],
    dagTip:
      "Shell voicings zijn dé basis van jazz piano. Professionele jazz-pianisten gebruiken ze constant. Met slechts drie noten krijg je het volledige jazz-geluid!",
  },

  {
    dag: 6,
    dagLabel: "Dag 6 (Zaterdag)",
    thema: "Dominant 7: de spanning",
    oefeningen: [
      {
        titel: "C7 leren — verschil met Cmaj7",
        duur: "10 min",
        doel: "Het verschil horen en spelen tussen maj7 en dom7",
        stappen: [
          {
            stap: 1,
            instructie: "Speel C7: C-E-G-Bb",
            details:
              "Een dominant 7 akkoord heeft een 'klein septiem' (b7) in plaats van een 'groot septiem' (7). Bij C: Cmaj7 heeft een B, C7 heeft een Bb. Het verschil is één halve toon, maar het klinkt compleet anders!",
            pianoVoorbeeld: {
              label: "C7 (dominant)",
              noten: [
                { note: "C4", color: R, label: "R" },
                { note: "E4", color: T, label: "3" },
                { note: "G4", color: V, label: "5" },
                { note: "Bb4", color: Z, label: "b7" },
              ],
              uitleg:
                "C7 = C-E-G-Bb. De Bb (zwarte toets links van B) geeft een 'dringende' klank die wil oplossen. Dit is het kenmerk van een dominant akkoord.",
              startOctave: 3,
              octaves: 2,
            },
          },
          {
            stap: 2,
            instructie: "Vergelijk Cmaj7 en C7 direct na elkaar",
            details:
              "Speel Cmaj7 (C-E-G-B), dan C7 (C-E-G-Bb). Cmaj7 klinkt 'rustig en dromerig'. C7 klinkt 'gespannen en wil ergens naartoe'. Dat 'ergens naartoe willen' is wat spanning heet in muziektheorie.",
            pianoVoorbeeld: {
              label: "Cmaj7 vs C7",
              noten: [
                { note: "C4", color: R, label: "R" },
                { note: "E4", color: T, label: "3" },
                { note: "G4", color: V, label: "5" },
                { note: "Bb4", color: "#ef4444", label: "b7" },
                { note: "B4", color: Z, label: "7" },
              ],
              uitleg:
                "B (paars) = Cmaj7 → rust. Bb (rood) = C7 → spanning. In jazz is dit verschil essentieel!",
              startOctave: 3,
              octaves: 2,
            },
          },
        ],
      },
      {
        titel: "C7 shell voicing",
        duur: "5 min",
        doel: "C7 als shell voicing spelen",
        stappen: [
          {
            stap: 1,
            instructie: "Speel C-E-Bb met de linkerhand",
            pianoVoorbeeld: {
              label: "C7 shell voicing",
              noten: [
                { note: "C3", color: R, label: "R" },
                { note: "E3", color: T, label: "3" },
                { note: "Bb3", color: Z, label: "b7" },
              ],
              uitleg:
                "C7 shell = C-E-Bb. Vergelijk met Cmaj7 shell (C-E-B) — alleen de septiem verandert!",
              startOctave: 3,
              octaves: 2,
            },
          },
          {
            stap: 2,
            instructie: "Speel Cmaj7 shell → C7 shell → Cmaj7 shell",
            details:
              "Voel hoe alleen je wijsvinger beweegt (van B naar Bb en terug). Dit is voice leading in actie!",
          },
        ],
      },
      {
        titel: "Spanning en oplossing: G7 → Cmaj7",
        duur: "10 min",
        doel: "De belangrijkste harmonie in muziek voelen",
        stappen: [
          {
            stap: 1,
            instructie: "Speel G7 shell → Cmaj7 shell",
            details:
              "G7 shell = G-B-F. Cmaj7 shell = C-E-B. Speel G7, wacht 4 tellen, dan Cmaj7. Hoor je hoe de spanning (G7) oplost naar rust (Cmaj7)? Dit is de V→I beweging, de ruggengraat van alle westerse muziek.",
            pianoVoorbeeld: {
              label: "G7 shell → Cmaj7 shell",
              noten: [
                { note: "G2", color: R, label: "G" },
                { note: "B2", color: T, label: "3" },
                { note: "F3", color: Z, label: "b7" },
                { note: "C3", color: R, label: "C" },
                { note: "E3", color: T, label: "3" },
                { note: "B3", color: Z, label: "7" },
              ],
              uitleg:
                "G7 (spanning) lost op naar Cmaj7 (rust). Let op: de F (b7 van G7) beweegt naar E (3 van Cmaj7), en de B (3 van G7) beweegt naar C (R van Cmaj7).",
              startOctave: 2,
              octaves: 2,
            },
            tip: "Dit V→I patroon hoor je in bijna elk nummer dat je kent, van pop tot jazz tot klassiek!",
          },
        ],
      },
    ],
    dagTip:
      "Je hebt nu het belangrijkste verschil in jazz geleerd: majeur 7 = rust, dominant 7 = spanning. Morgen breng je alles samen!",
  },

  {
    dag: 7,
    dagLabel: "Dag 7 (Zondag)",
    thema: "Herhaling week 1",
    oefeningen: [
      {
        titel: "Alle akkoorden doorspelen",
        duur: "10 min",
        doel: "Alle geleerde akkoorden vloeiend achter elkaar spelen",
        stappen: [
          {
            stap: 1,
            instructie: "Speel alle volle akkoorden: Cmaj7, Fmaj7, Gmaj7, C7",
            details:
              "Speel elk akkoord 4 tellen, dan door naar het volgende. Probeer niet te stoppen tussen de akkoorden.",
          },
          {
            stap: 2,
            instructie: "Speel alle shell voicings: Cmaj7, Fmaj7, Gmaj7, C7",
            details:
              "Nu hetzelfde maar dan als shell voicings met de linkerhand. Dit moet uiteindelijk automatisch gaan.",
          },
          {
            stap: 3,
            instructie: "Doe het 'blindtest' spel",
            details:
              "Kies een willekeurig akkoord en speel het. Zeg hardop: de naam, het type (maj7 of dom7), en de noten. Bijv: 'Fmaj7 — majeur 7 — F, A, C, E'.",
          },
        ],
      },
      {
        titel: "Notenlezen herhaling",
        duur: "10 min",
        doel: "Ankerpunten en basale nootherkenning oefenen",
        stappen: [
          {
            stap: 1,
            instructie: "Quiz: benoem noten op het keyboard",
            details:
              "Speel willekeurige witte toetsen en benoem ze. Doe dit eerst langzaam, dan steeds sneller. Doel: elke witte toets in 2 seconden benoemen.",
            pianoVoorbeeld: {
              label: "Alle witte toetsen octaaf 3-4",
              noten: [
                { note: "C3", color: R, label: "C" },
                { note: "D3", color: T, label: "D" },
                { note: "E3", color: V, label: "E" },
                { note: "F3", color: Z, label: "F" },
                { note: "G3", color: R, label: "G" },
                { note: "A3", color: T, label: "A" },
                { note: "B3", color: V, label: "B" },
                { note: "C4", color: R, label: "C" },
                { note: "D4", color: T, label: "D" },
                { note: "E4", color: V, label: "E" },
                { note: "F4", color: Z, label: "F" },
                { note: "G4", color: R, label: "G" },
                { note: "A4", color: T, label: "A" },
                { note: "B4", color: V, label: "B" },
              ],
              uitleg:
                "Alle witte toetsen van C3 tot B4. Ken je ze allemaal bij naam?",
              startOctave: 3,
              octaves: 2,
            },
          },
        ],
      },
      {
        titel: "Vrij spelen: jouw eerste 'nummer'",
        duur: "10 min",
        doel: "Plezier hebben met wat je geleerd hebt",
        stappen: [
          {
            stap: 1,
            instructie: "Maak je eigen patroon",
            details:
              "Kies 2 of 3 akkoorden en speel ze als shell voicings met links. Speel losse noten met rechts. Probeer: Cmaj7 (4 tellen) → Fmaj7 (4 tellen) → G7 (4 tellen) → Cmaj7 (4 tellen). Herhaal en varieer!",
            tip: "Dit is al een echte muzikale progressie! I-IV-V-I in C majeur. Veel bekende nummers gebruiken precies deze akkoorden.",
          },
        ],
      },
    ],
    dagTip:
      "Goed gedaan! Je hebt in één week vier akkoorden geleerd, het concept van shell voicings begrepen, en je eerste stappen in notenlezen gezet. Volgende week gaan we verder met dominant 7 akkoorden en je eerste echte jazz-progressie.",
  },

  // ============ WEEK 2: Dominant 7 en eerste progressies ============
  {
    dag: 8,
    dagLabel: "Dag 8 (Maandag)",
    thema: "F7 en G7 — meer dominant akkoorden",
    oefeningen: [
      {
        titel: "F7 leren (F-A-C-Eb)",
        duur: "10 min",
        doel: "F7 spelen en het dominant patroon herkennen",
        stappen: [
          {
            stap: 1,
            instructie: "Bouw F7 op: F-A-C-Eb",
            details:
              "Vergelijk met Fmaj7 (F-A-C-E): alleen de septiem verandert. E wordt Eb (de zwarte toets links van E).",
            pianoVoorbeeld: {
              label: "F7",
              noten: [
                { note: "F3", color: R, label: "R" },
                { note: "A3", color: T, label: "3" },
                { note: "C4", color: V, label: "5" },
                { note: "Eb4", color: Z, label: "b7" },
              ],
              uitleg:
                "F7 = F-A-C-Eb. De Eb geeft de typische dominant spanning. F7 wil oplossen naar Bbmaj7.",
              startOctave: 3,
              octaves: 2,
            },
          },
          {
            stap: 2,
            instructie: "F7 shell: F-A-Eb",
            pianoVoorbeeld: {
              label: "F7 shell voicing",
              noten: [
                { note: "F3", color: R, label: "R" },
                { note: "A3", color: T, label: "3" },
                { note: "Eb4", color: Z, label: "b7" },
              ],
              uitleg: "F7 shell = root + terts + klein septiem.",
              startOctave: 3,
              octaves: 2,
            },
          },
        ],
      },
      {
        titel: "G7 leren (G-B-D-F)",
        duur: "10 min",
        doel: "G7 spelen — het dominant akkoord dat oplost naar C",
        stappen: [
          {
            stap: 1,
            instructie: "Bouw G7 op: G-B-D-F",
            details:
              "Dit is misschien het belangrijkste akkoord in C majeur! G7 is de dominant (V7) die oplost naar Cmaj7 (I). Alle noten zijn witte toetsen.",
            pianoVoorbeeld: {
              label: "G7",
              noten: [
                { note: "G3", color: R, label: "R" },
                { note: "B3", color: T, label: "3" },
                { note: "D4", color: V, label: "5" },
                { note: "F4", color: Z, label: "b7" },
              ],
              uitleg:
                "G7 = G-B-D-F. Let op: Gmaj7 had F#, maar G7 heeft F (naturel). Dat maakt het verschil!",
              startOctave: 3,
              octaves: 2,
            },
          },
          {
            stap: 2,
            instructie: "G7 shell: G-B-F",
            pianoVoorbeeld: {
              label: "G7 shell voicing",
              noten: [
                { note: "G2", color: R, label: "R" },
                { note: "B2", color: T, label: "3" },
                { note: "F3", color: Z, label: "b7" },
              ],
              uitleg:
                "G7 shell = G-B-F. Dit is de shell voicing die je het meest zult gebruiken in C majeur.",
              startOctave: 2,
              octaves: 2,
            },
          },
          {
            stap: 3,
            instructie: "Speel G7 shell → Cmaj7 shell meerdere keren",
            details:
              "Dit is de V-I beweging met shell voicings. Oefen dit tot het automatisch gaat — je zult het in elk jazz-nummer tegenkomen.",
          },
        ],
      },
    ],
    dagTip:
      "Dominant 7 akkoorden zijn de 'motor' van harmonie. Ze creëren spanning die oplost. Zonder dominant akkoorden zou muziek saai klinken!",
  },

  {
    dag: 9,
    dagLabel: "Dag 9 (Dinsdag)",
    thema: "Shell voicings vergelijken en automatiseren",
    oefeningen: [
      {
        titel: "Alle shell voicings op een rij",
        duur: "15 min",
        doel: "Alle 6 geleerde shell voicings vlot achter elkaar spelen",
        stappen: [
          {
            stap: 1,
            instructie: "Overzicht: maj7 vs dom7 shells",
            details:
              "Je kent nu 6 shell voicings. Het verschil tussen maj7 en dom7 is altijd: de septiem is een halve toon lager bij dom7.",
            pianoVoorbeeld: {
              label: "Cmaj7 vs C7 shell",
              noten: [
                { note: "C3", color: R, label: "R" },
                { note: "E3", color: T, label: "3" },
                { note: "Bb3", color: "#ef4444", label: "b7" },
                { note: "B3", color: Z, label: "7" },
              ],
              uitleg:
                "De 7 (paars) = maj7 shell. De b7 (rood) = dom7 shell. Alleen de bovenste noot verschilt!",
              startOctave: 3,
              octaves: 2,
            },
          },
          {
            stap: 2,
            instructie:
              "Circuit: Cmaj7 → C7 → Fmaj7 → F7 → Gmaj7 → G7",
            details:
              "Speel elke shell voicing 2 tellen, dan door naar de volgende. Probeer dit 3 keer achter elkaar zonder te stoppen.",
          },
          {
            stap: 3,
            instructie: "Random oefening",
            details:
              "Noem hardop een willekeurig akkoord (bijv. 'F7') en speel de shell voicing zo snel mogelijk. Doel: binnen 3 seconden de juiste noten vinden.",
          },
        ],
      },
      {
        titel: "Shell voicings met rechterhand-melodie",
        duur: "10 min",
        doel: "Handen combineren voor het eerst",
        stappen: [
          {
            stap: 1,
            instructie: "Links shell, rechts enkele noten",
            details:
              "Speel Cmaj7 shell met links en speel langzaam C-D-E-F-G met rechts. Dan Fmaj7 shell met links en F-G-A-Bb-C met rechts. Dan G7 shell met links en G-A-B-C-D met rechts.",
            tip: "Begin heel langzaam. Het is normaal dat dit moeilijk is — je hersenen moeten leren om twee dingen tegelijk te doen.",
          },
        ],
      },
    ],
    dagTip:
      "Als je de shell voicings automatisch kunt spelen zonder na te denken, heb je een enorme stap gezet. Dat is het fundament voor alles wat komt.",
  },

  {
    dag: 10,
    dagLabel: "Dag 10 (Woensdag)",
    thema: "Notenlezen: intervallen",
    oefeningen: [
      {
        titel: "Wat zijn intervallen?",
        duur: "5 min",
        doel: "Begrijpen dat afstanden tussen noten een naam hebben",
        stappen: [
          {
            stap: 1,
            instructie: "Een interval = de afstand tussen twee noten",
            details:
              "In plaats van elke noot apart te lezen, kun je leren patronen herkennen. Als je weet dat de volgende noot 'één stap hoger' is (een secunde), hoef je niet elke noot los te ontcijferen.",
          },
        ],
      },
      {
        titel: "De secunde (1 stap)",
        duur: "10 min",
        doel: "Secunden herkennen op het keyboard en in noten",
        stappen: [
          {
            stap: 1,
            instructie: "Speel secunden: C→D, D→E, E→F, etc.",
            details:
              "Een secunde is de kleinste stap tussen twee witte toetsen. Op de notenbalk zie je dit als: van een lijn naar de ruimte erboven, of van een ruimte naar de lijn erboven.",
            pianoVoorbeeld: {
              label: "Secunden vanaf C",
              noten: [
                { note: "C4", color: R, label: "C" },
                { note: "D4", color: T, label: "D" },
              ],
              uitleg:
                "C naar D = een secunde (grote secunde, 2 halve tonen). Dit is de kleinste stap op de witte toetsen.",
              startOctave: 3,
              octaves: 2,
            },
          },
          {
            stap: 2,
            instructie: "Herken secunden op de balk",
            details:
              "Op de notenbalk staan secunden altijd direct naast elkaar: lijn-ruimte of ruimte-lijn. Als je twee noten ziet die 'kleven', is het een secunde. Je hoeft dan alleen de eerste te lezen en weet dat de tweede één stap hoger of lager is.",
          },
        ],
      },
      {
        titel: "De terts (2 stappen)",
        duur: "10 min",
        doel: "Tertsen herkennen — de bouwsteen van akkoorden",
        stappen: [
          {
            stap: 1,
            instructie: "Speel tertsen: C→E, D→F, E→G, etc.",
            details:
              "Een terts slaat één witte toets over. C naar E (sla D over). Dit is het interval waarmee akkoorden worden opgebouwd!",
            pianoVoorbeeld: {
              label: "Tertsen vanaf C",
              noten: [
                { note: "C4", color: R, label: "C" },
                { note: "E4", color: T, label: "E" },
              ],
              uitleg:
                "C naar E = een (grote) terts. Je slaat de D over. Op de balk: van lijn naar lijn, of van ruimte naar ruimte.",
              startOctave: 3,
              octaves: 2,
            },
          },
          {
            stap: 2,
            instructie: "Herken tertsen op de balk",
            details:
              "Op de notenbalk staan tertsen op twee opeenvolgende lijnen (lijn-lijn) of twee opeenvolgende ruimtes (ruimte-ruimte). Dit herken je doordat er precies één positie wordt overgeslagen.",
            tip: "Een akkoord is een stapel tertsen. Cmaj7 = C-E (terts) + E-G (terts) + G-B (terts). Als je tertsen herkent, herken je ook akkoorden!",
          },
        ],
      },
    ],
    dagTip:
      "Intervallen zijn het geheim van snel noten lezen. In plaats van elke noot apart te spellen, herken je patronen: 'dit is een stap omhoog' of 'dit is een sprong van een terts'. Dat maakt alles sneller.",
  },

  {
    dag: 11,
    dagLabel: "Dag 11 (Donderdag)",
    thema: "Voice leading: akkoorden vloeiend verbinden",
    oefeningen: [
      {
        titel: "Wat is voice leading?",
        duur: "5 min",
        doel: "Begrijpen waarom soepele overgangen belangrijk zijn",
        stappen: [
          {
            stap: 1,
            instructie: "Het principe: beweeg zo min mogelijk",
            details:
              "Als je van het ene akkoord naar het andere gaat, wil je dat je vingers zo min mogelijk bewegen. Noten die in beide akkoorden voorkomen, blijven liggen. Noten die veranderen, bewegen naar de dichtstbijzijnde noot.",
          },
        ],
      },
      {
        titel: "G7 → Cmaj7 voice leading",
        duur: "15 min",
        doel: "Zien hoe de stemmen bewegen bij V→I",
        stappen: [
          {
            stap: 1,
            instructie: "Analyseer de beweging G7 shell → Cmaj7 shell",
            details:
              "G7 shell = G-B-F. Cmaj7 shell = C-E-B. Kijk wat er gebeurt: G → C (kwint omhoog), B → C (halve toon omhoog, kan ook naar B blijven liggen als je Cmaj7 als C-E-B speelt), F → E (halve toon omlaag).",
            pianoVoorbeeld: {
              label: "G7 → Cmaj7 voice leading",
              noten: [
                { note: "G2", color: R, label: "G→" },
                { note: "B2", color: T, label: "B→" },
                { note: "F3", color: Z, label: "F→" },
                { note: "C3", color: R, label: "→C" },
                { note: "E3", color: T, label: "→E" },
                { note: "B3", color: Z, label: "→B" },
              ],
              uitleg:
                "De b7 (F) van G7 daalt een halve toon naar de 3 (E) van Cmaj7. De 3 (B) van G7 stijgt een halve toon naar de R (C) van Cmaj7. Dit is de kern van voice leading!",
              startOctave: 2,
              octaves: 2,
            },
            tip: "De 3 en b7 van een dominant akkoord vormen een 'tritonus' — de meest gespannen interval die er is. Die lost op door naar binnen toe te bewegen.",
          },
          {
            stap: 2,
            instructie: "Oefen langzaam en luister naar de stemmen",
            details:
              "Speel G7 shell, houd even vast, dan Cmaj7 shell. Probeer de individuele noten te horen bewegen. Doe dit 10 keer.",
          },
          {
            stap: 3,
            instructie: "Probeer het andersom: Cmaj7 → G7",
            details:
              "Nu in omgekeerde volgorde. Van rust naar spanning. Het voelt 'open' en alsof er een vraag wordt gesteld.",
          },
        ],
      },
    ],
    dagTip:
      "Voice leading is wat jazz 'smooth' maakt. Als je later ii-V-I leert, zul je zien dat de stemmen bijna automatisch op hun plek vallen.",
  },

  {
    dag: 12,
    dagLabel: "Dag 12 (Vrijdag)",
    thema: "Eerste mol-toonsoorten: Bbmaj7 en Eb7",
    oefeningen: [
      {
        titel: "Bbmaj7 leren (Bb-D-F-A)",
        duur: "10 min",
        doel: "Een akkoord met een mol als grondtoon spelen",
        stappen: [
          {
            stap: 1,
            instructie: "Vind Bb op het keyboard",
            details:
              "Bb (B-mol) is de zwarte toets links van B. Het is dezelfde toets als A# (A-kruis), maar in de context van akkoorden noemen we het Bb.",
            pianoVoorbeeld: {
              label: "Bbmaj7",
              noten: [
                { note: "Bb3", color: R, label: "R" },
                { note: "D4", color: T, label: "3" },
                { note: "F4", color: V, label: "5" },
                { note: "A4", color: Z, label: "7" },
              ],
              uitleg:
                "Bbmaj7 = Bb-D-F-A. Drie witte toetsen en één zwarte (de Bb zelf). Dit akkoord klinkt warm en vol.",
              startOctave: 3,
              octaves: 2,
            },
          },
          {
            stap: 2,
            instructie: "Bbmaj7 shell: Bb-D-A",
            pianoVoorbeeld: {
              label: "Bbmaj7 shell",
              noten: [
                { note: "Bb2", color: R, label: "R" },
                { note: "D3", color: T, label: "3" },
                { note: "A3", color: Z, label: "7" },
              ],
              uitleg: "Bbmaj7 shell = Bb-D-A. Root + terts + septiem.",
              startOctave: 2,
              octaves: 2,
            },
          },
        ],
      },
      {
        titel: "Eb7 leren (Eb-G-Bb-Db)",
        duur: "10 min",
        doel: "Een akkoord met meerdere mollen spelen",
        stappen: [
          {
            stap: 1,
            instructie: "Bouw Eb7 op: Eb-G-Bb-Db",
            details:
              "Dit akkoord heeft twee zwarte toetsen (Eb en Db) en twee witte (G en Bb... wacht, Bb is ook zwart!). Eigenlijk: Eb (zwart), G (wit), Bb (zwart), Db (zwart). Drie zwarte toetsen!",
            pianoVoorbeeld: {
              label: "Eb7",
              noten: [
                { note: "Eb3", color: R, label: "R" },
                { note: "G3", color: T, label: "3" },
                { note: "Bb3", color: V, label: "5" },
                { note: "Db4", color: Z, label: "b7" },
              ],
              uitleg:
                "Eb7 = Eb-G-Bb-Db. Dominant akkoorden in mol-toonsoorten gebruiken meer zwarte toetsen. Dat is normaal!",
              startOctave: 3,
              octaves: 2,
            },
          },
          {
            stap: 2,
            instructie: "Eb7 shell: Eb-G-Db",
            pianoVoorbeeld: {
              label: "Eb7 shell",
              noten: [
                { note: "Eb3", color: R, label: "R" },
                { note: "G3", color: T, label: "3" },
                { note: "Db4", color: Z, label: "b7" },
              ],
              uitleg: "Eb7 shell = Eb-G-Db.",
              startOctave: 3,
              octaves: 2,
            },
          },
        ],
      },
      {
        titel: "F7 → Bbmaj7 progressie",
        duur: "5 min",
        doel: "V→I in Bb majeur oefenen",
        stappen: [
          {
            stap: 1,
            instructie: "Speel F7 shell → Bbmaj7 shell",
            details:
              "F7 shell = F-A-Eb. Bbmaj7 shell = Bb-D-A. Dit is V→I in de toonsoort Bb majeur. Hetzelfde principe als G7→Cmaj7, maar in een andere toonsoort!",
            tip: "Elk dominant 7 akkoord wil een kwart omhoog oplossen. G7→Cmaj7, F7→Bbmaj7, C7→Fmaj7. Dit patroon geldt overal!",
          },
        ],
      },
    ],
    dagTip:
      "Zwarte toetsen zijn niet moeilijker — alleen onwennig. Hoe meer je met mol-toonsoorten oefent, hoe normaler het voelt. Jazz gebruikt alle 12 toonsoorten!",
  },

  {
    dag: 13,
    dagLabel: "Dag 13 (Zaterdag)",
    thema: "Twee akkoorden tegelijk: handen samen",
    oefeningen: [
      {
        titel: "Linkerhand shell + rechterhand akkoord",
        duur: "15 min",
        doel: "Beide handen tegelijk gebruiken met akkoorden",
        stappen: [
          {
            stap: 1,
            instructie: "Cmaj7: links shell, rechts vol akkoord",
            details:
              "Linkerhand: C3-E3-B3 (shell). Rechterhand: C4-E4-G4-B4 (vol akkoord). Speel ze tegelijk. Dit geeft een volle, rijke klank.",
            pianoVoorbeeld: {
              label: "Cmaj7 twee handen",
              noten: [
                { note: "C3", color: R, label: "R" },
                { note: "E3", color: T, label: "3" },
                { note: "B3", color: Z, label: "7" },
                { note: "C4", color: R, label: "R" },
                { note: "E4", color: T, label: "3" },
                { note: "G4", color: V, label: "5" },
                { note: "B4", color: Z, label: "7" },
              ],
              uitleg:
                "Links: shell voicing. Rechts: vol akkoord. Samen krijg je een volle jazz-klank.",
              startOctave: 3,
              octaves: 2,
            },
          },
          {
            stap: 2,
            instructie: "Wissel tussen Cmaj7 en G7, handen samen",
            details:
              "Dit is de moeilijkste oefening tot nu toe. Neem de tijd! Speel eerst links alleen (shell wisselen), dan rechts alleen, dan samen.",
            tip: "Als het te moeilijk is: begin met alleen de linkerhand shell voicings wisselen. Voeg de rechterhand later toe.",
          },
        ],
      },
      {
        titel: "Simpele begeleiding: I-V patroon",
        duur: "10 min",
        doel: "Een simpel begeleidingspatroon spelen",
        stappen: [
          {
            stap: 1,
            instructie: "Speel 4 maten Cmaj7, 4 maten G7, herhaal",
            details:
              "Links: shell voicings, speel op tel 1 en 3. Rechts: speel de grondtoon als enkele noot op tel 1. Dit is een basale begeleiding die je al kunt gebruiken bij simpele nummers.",
          },
          {
            stap: 2,
            instructie: "Voeg Fmaj7 toe: Cmaj7-Fmaj7-G7-Cmaj7",
            details:
              "Nu een I-IV-V-I progressie. Elke chord 4 tellen. Dit is de basis van talloze nummers!",
          },
        ],
      },
    ],
    dagTip:
      "Handen samen spelen is het moeilijkste onderdeel van piano. Wees geduldig met jezelf — het wordt elke dag een klein beetje makkelijker.",
  },

  {
    dag: 14,
    dagLabel: "Dag 14 (Zondag)",
    thema: "Herhaling week 2 — alles samenvoegen",
    oefeningen: [
      {
        titel: "Akkoorden marathon",
        duur: "10 min",
        doel: "Alle geleerde akkoorden vlot doorspelen",
        stappen: [
          {
            stap: 1,
            instructie: "Speel alle shell voicings achter elkaar",
            details:
              "Cmaj7 → Fmaj7 → Gmaj7 → C7 → F7 → G7 → Bbmaj7 → Eb7. Elke 2 tellen, zonder te stoppen. Als je een akkoord niet meer weet, sla het over en ga door.",
          },
          {
            stap: 2,
            instructie: "V→I oplossingen oefenen",
            details:
              "G7→Cmaj7, F7→Bbmaj7, C7→Fmaj7. Speel elke combinatie 4 keer. Focus op voice leading: welke noten bewegen, welke blijven liggen?",
          },
        ],
      },
      {
        titel: "Notenlezen check",
        duur: "10 min",
        doel: "Controleren hoever je notenlees-vaardigheid is gegroeid",
        stappen: [
          {
            stap: 1,
            instructie: "Benoem noten zo snel mogelijk",
            details:
              "Speel willekeurige witte toetsen en benoem ze. Tel hoeveel je er in 1 minuut goed kunt benoemen. Streef naar 20+.",
          },
          {
            stap: 2,
            instructie: "Herken intervallen op het keyboard",
            details:
              "Speel twee noten achter elkaar en benoem het interval: secunde (stap), terts (sprong over één). Probeer dit zonder te tellen.",
          },
        ],
      },
      {
        titel: "Eindoefening: je eerste jazz-progressie",
        duur: "10 min",
        doel: "Alles samenvoegen in een muzikaal geheel",
        stappen: [
          {
            stap: 1,
            instructie: "Speel Cmaj7 → Fmaj7 → G7 → Cmaj7 met shell voicings",
            details:
              "Dit is I-IV-V-I in C majeur. Speel het langzaam met de linkerhand. Voeg met de rechterhand losse noten uit de C-toonladder toe. Luister naar hoe het klinkt — dit is al muziek!",
            pianoVoorbeeld: {
              label: "I-IV-V-I in C majeur (shells)",
              noten: [
                { note: "C3", color: R, label: "C" },
                { note: "E3", color: T, label: "3" },
                { note: "B3", color: Z, label: "7" },
              ],
              uitleg:
                "Begin met Cmaj7 shell. Dan Fmaj7 shell (F-A-E), G7 shell (G-B-F), terug naar Cmaj7 shell.",
              startOctave: 2,
              octaves: 3,
            },
            tip: "Volgende week leer je Dm7 — dan kun je je eerste ii-V-I spelen, de heilige graal van jazz!",
          },
        ],
      },
    ],
    dagTip:
      "Twee weken klaar! Je kent nu 8 akkoorden (4 maj7, 4 dom7), shell voicings, voice leading, en de basis van notenlezen. Dat is een fantastische start. In de komende weken voeg je mineur 7 toe en leer je de ii-V-I progressie — het hart van jazz.",
  },
];
