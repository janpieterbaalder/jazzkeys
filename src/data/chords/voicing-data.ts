import type { ChordType, VoicingType } from "@/lib/piano-utils";

export interface VoicingCategory {
  slug: string;
  title: string;
  description: string;
  voicingType: VoicingType;
  chordTypes: ChordType[];
  explanation: string;
}

export const VOICING_CATEGORIES: VoicingCategory[] = [
  {
    slug: "shell",
    title: "Shell Voicings",
    description: "De basis van jazz piano: root + 3e + 7e",
    voicingType: "shell",
    chordTypes: ["maj7", "dom7", "min7", "min7b5", "dim7"],
    explanation:
      "Shell voicings zijn de eenvoudigste jazz voicings. Je speelt slechts drie noten: de grondtoon (root), de terts (3e) en de septiem (7e). De kwint wordt weggelaten omdat die het minst bijdraagt aan het karakter van het akkoord. Dit is de perfecte eerste stap van drieklanken naar jazz.",
  },
  {
    slug: "rootless-a",
    title: "Rootless Voicings Type A",
    description: "Zonder grondtoon: 3-5-7-9",
    voicingType: "rootless-a",
    chordTypes: ["maj7", "dom7", "min7", "min7b5"],
    explanation:
      "Rootless voicings laten de grondtoon weg — die speelt de bassist. Type A stapelt de tonen als 3-5-7-9 van onder naar boven. Dit geeft je toegang tot rijkere klanken met uitbreidingen (9e). Populair gemaakt door Bill Evans.",
  },
  {
    slug: "rootless-b",
    title: "Rootless Voicings Type B",
    description: "Zonder grondtoon: 7-9-3-5",
    voicingType: "rootless-b",
    chordTypes: ["maj7", "dom7", "min7", "min7b5"],
    explanation:
      "Type B is de inversie van Type A: 7-9-3-5. Door af te wisselen tussen Type A en Type B krijg je betere voice leading — de noten hoeven minder ver te springen tussen akkoorden. Gebruik Type A en Type B afwisselend in een ii-V-I progressie.",
  },
];
