/**
 * Staff utilities — mapping noten naar posities op de notenbalk.
 *
 * Grand Staff: G-sleutel (treble) boven, F-sleutel (bass) onder.
 * Elke balk heeft 5 lijnen. Positie 0 = bovenste lijn, positie 8 = onderste lijn.
 * Oneven posities = ruimtes, even posities = lijnen.
 */

// Diatonische nootvolgorde (zonder octaaf)
const DIATONIC_NOTES = ["C", "D", "E", "F", "G", "A", "B"] as const;

/**
 * Bereken de diatonische index van een noot (C0=0, D0=1, ... B0=6, C1=7, etc.)
 */
function diatonicIndex(noteName: string, octave: number): number {
  // Verwijder accidentals voor diatonische positie
  const base = noteName.charAt(0);
  const idx = DIATONIC_NOTES.indexOf(base as (typeof DIATONIC_NOTES)[number]);
  if (idx === -1) return 0;
  return octave * 7 + idx;
}

/**
 * Parse een nootstring ("C4", "Eb3", "F#5") naar bestanddelen.
 */
export function parseNootNaam(noot: string): {
  base: string; // "C", "D", etc.
  accidental: "" | "#" | "b";
  octave: number;
} {
  const match = noot.match(/^([A-G])([#b]?)(\d)$/);
  if (!match) return { base: "C", accidental: "", octave: 4 };
  return {
    base: match[1],
    accidental: match[2] as "" | "#" | "b",
    octave: parseInt(match[3]),
  };
}

// ─── G-sleutel (treble) positie ────────────────────────────────────
// Lijn 1 (onderste) = E4, Lijn 5 (bovenste) = F5
// Referentie: E4 heeft diatonische index = 4*7+2 = 30
const TREBLE_BOTTOM_LINE_INDEX = diatonicIndex("E", 4); // E4 = lijn 1 = positie 8

/**
 * Bereken de Y-positie op de G-sleutel.
 * Positie 8 = onderste lijn (E4), positie 0 = bovenste lijn (F5).
 * Positie kan negatief zijn (boven de balk) of >8 (onder de balk).
 * Elke stap = halve lijn-afstand.
 */
export function trebleStaffPosition(noteName: string, octave: number): number {
  const noteIdx = diatonicIndex(noteName, octave);
  // Hoe hoger de noot, hoe lager de positie (hoger op de balk)
  return TREBLE_BOTTOM_LINE_INDEX - noteIdx + 8;
}

// ─── F-sleutel (bass) positie ──────────────────────────────────────
// Lijn 1 (onderste) = G2, Lijn 5 (bovenste) = A3
const BASS_BOTTOM_LINE_INDEX = diatonicIndex("G", 2); // G2 = lijn 1 = positie 8

export function bassStaffPosition(noteName: string, octave: number): number {
  const noteIdx = diatonicIndex(noteName, octave);
  return BASS_BOTTOM_LINE_INDEX - noteIdx + 8;
}

/**
 * Bepaal of een noot op de G-sleutel (treble) of F-sleutel (bass) hoort.
 * Noten B3 en hoger → treble, B3 en lager → bass.
 * Uitzonderingen: als "hand" is opgegeven, gebruik dat.
 */
export function getStaffForNote(
  noteName: string,
  octave: number,
  hand?: "rechts" | "links"
): "treble" | "bass" {
  if (hand === "rechts") return "treble";
  if (hand === "links") return "bass";
  // Automatisch: C4 en hoger = treble, B3 en lager = bass
  const idx = diatonicIndex(noteName, octave);
  const middleCIdx = diatonicIndex("C", 4);
  return idx >= middleCIdx ? "treble" : "bass";
}

/**
 * Bereken de staff-positie (welke balk + y-offset).
 */
export function getStaffPosition(
  noot: string,
  hand?: "rechts" | "links"
): {
  staff: "treble" | "bass";
  position: number; // 0=top line, 8=bottom line, kan buiten bereik
} {
  const { base, octave } = parseNootNaam(noot);
  const staff = getStaffForNote(base, octave, hand);

  const position =
    staff === "treble"
      ? trebleStaffPosition(base, octave)
      : bassStaffPosition(base, octave);

  return { staff, position };
}

/**
 * Bereken welke hulplijnen nodig zijn voor een noot.
 * Lijnen liggen op posities 0, 2, 4, 6, 8 (de 5 staff-lijnen).
 * Noten met positie < 0 of > 8 hebben hulplijnen nodig.
 * Retourneert array van y-posities waar hulplijnen moeten komen.
 */
export function getLedgerLines(position: number): number[] {
  const ledgers: number[] = [];

  if (position < 0) {
    // Boven de balk — hulplijnen op 0, -2, -4, etc. tot we de noot bereiken
    for (let p = -2; p >= position; p -= 2) {
      ledgers.push(p);
    }
    // Als de noot zelf op een lijn zit (even positie), voeg die toe
    if (position % 2 === 0 && !ledgers.includes(position)) {
      ledgers.push(position);
    }
  } else if (position > 8) {
    // Onder de balk
    for (let p = 10; p <= position; p += 2) {
      ledgers.push(p);
    }
    if (position % 2 === 0 && !ledgers.includes(position)) {
      ledgers.push(position);
    }
  }

  // Speciale gevallen: midden-C (positie 12 op treble = onder de balk)
  // wordt al afgehandeld door de logica hierboven

  return ledgers;
}

/**
 * Stem richting: omhoog als de noot op of onder de middenlijn (positie 4) zit.
 */
export function getStemDirection(position: number): "up" | "down" {
  return position >= 4 ? "up" : "down";
}

// ─── Noot-duur naar visuele eigenschappen ──────────────────────────

export type DuurType = "heel" | "half" | "kwart" | "achtste" | "zestiende";

export interface NootVisueel {
  filled: boolean; // gevulde nootkop?
  hasStem: boolean; // heeft een stok?
  flags: number; // aantal vlaggen (0, 1, 2)
  headWidth: number; // breedte nootkop
  headHeight: number; // hoogte nootkop
}

export function getDuurVisueel(duur: string): NootVisueel {
  switch (duur) {
    case "heel":
      return {
        filled: false,
        hasStem: false,
        flags: 0,
        headWidth: 14,
        headHeight: 10,
      };
    case "half":
      return {
        filled: false,
        hasStem: true,
        flags: 0,
        headWidth: 12,
        headHeight: 9,
      };
    case "kwart":
      return {
        filled: true,
        hasStem: true,
        flags: 0,
        headWidth: 12,
        headHeight: 9,
      };
    case "achtste":
      return {
        filled: true,
        hasStem: true,
        flags: 1,
        headWidth: 12,
        headHeight: 9,
      };
    case "zestiende":
      return {
        filled: true,
        hasStem: true,
        flags: 2,
        headWidth: 12,
        headHeight: 9,
      };
    default:
      return {
        filled: true,
        hasStem: true,
        flags: 0,
        headWidth: 12,
        headHeight: 9,
      };
  }
}

// ─── Layout constanten ─────────────────────────────────────────────

export const STAFF_CONSTANTS = {
  /** Afstand tussen twee opeenvolgende balkposities (halve lijn-afstand) */
  STEP: 6,
  /** Afstand tussen de 5 lijnen: 4 ruimtes × 2 stappen × STEP */
  STAFF_HEIGHT: 8 * 6, // 48px
  /** Ruimte tussen treble en bass staff */
  STAFF_GAP: 50,
  /** Breedte per maat (basis, schaalt met aantal noten) */
  MEASURE_BASE_WIDTH: 180,
  /** Extra breedte per noot in een maat */
  NOTE_EXTRA_WIDTH: 30,
  /** Padding links (voor sleutel + maatsoort) */
  LEFT_PADDING: 60,
  /** Padding rechts per maat */
  RIGHT_PADDING: 20,
  /** Stoklengte */
  STEM_LENGTH: 30,
  /** Kleur: balklijnen */
  LINE_COLOR: "rgba(100, 116, 139, 0.35)", // slate-500/35
  /** Kleur: maatstrepen */
  BARLINE_COLOR: "rgba(100, 116, 139, 0.5)",
  /** Kleur: nootkoppen normaal (rechts) */
  NOTE_COLOR_RIGHT: "#60a5fa", // blue-400
  /** Kleur: nootkoppen normaal (links) */
  NOTE_COLOR_LEFT: "#818cf8", // indigo-400
  /** Kleur: geselecteerde noot */
  NOTE_COLOR_SELECTED: "#fbbf24", // amber-400
  /** Kleur: stokken */
  STEM_COLOR: "#94a3b8", // slate-400
  /** Kleur: hulplijnen */
  LEDGER_COLOR: "rgba(100, 116, 139, 0.4)",
  /** Kleur: accidental tekst */
  ACCIDENTAL_COLOR: "#cbd5e1", // slate-300
  /** Kleur: akkoord label */
  CHORD_COLOR: "#60a5fa", // blue-400
};

/**
 * Bereken de totale breedte voor een set maten.
 */
export function calculateTotalWidth(measures: { noten: unknown[] }[]): number {
  let width = STAFF_CONSTANTS.LEFT_PADDING;
  for (const maat of measures) {
    const noteCount = Math.max(maat.noten.length, 1);
    width +=
      STAFF_CONSTANTS.MEASURE_BASE_WIDTH +
      noteCount * STAFF_CONSTANTS.NOTE_EXTRA_WIDTH;
  }
  width += STAFF_CONSTANTS.RIGHT_PADDING;
  return width;
}

/**
 * Bereken de totale hoogte van de grand staff.
 */
export function calculateTotalHeight(): number {
  // Ruimte boven treble (akkoord labels + noten boven balk)
  const topMargin = 40;
  // Treble staff
  const trebleHeight = STAFF_CONSTANTS.STAFF_HEIGHT;
  // Gap
  const gap = STAFF_CONSTANTS.STAFF_GAP;
  // Bass staff
  const bassHeight = STAFF_CONSTANTS.STAFF_HEIGHT;
  // Ruimte onder bass (noten onder balk)
  const bottomMargin = 30;

  return topMargin + trebleHeight + gap + bassHeight + bottomMargin;
}

/**
 * Y-coördinaat van de bovenste lijn van elke balk.
 */
export function getTrebleTopY(): number {
  return 40; // topMargin
}

export function getBassTopY(): number {
  return 40 + STAFF_CONSTANTS.STAFF_HEIGHT + STAFF_CONSTANTS.STAFF_GAP;
}

/**
 * Converteer een staff-positie naar een absolute Y-coördinaat.
 */
export function positionToY(
  position: number,
  staff: "treble" | "bass"
): number {
  const topY = staff === "treble" ? getTrebleTopY() : getBassTopY();
  // Positie 0 = bovenste lijn = topY
  // Elke stap is STEP pixels omlaag
  return topY + position * STAFF_CONSTANTS.STEP;
}
