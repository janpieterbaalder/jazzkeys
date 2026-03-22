// All 12 note names (using sharps)
const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

// Flat-to-sharp mapping for normalization
const FLAT_TO_SHARP: Record<string, string> = {
  Db: "C#",
  Eb: "D#",
  Fb: "E",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
  Cb: "B",
};

export type NoteName = (typeof NOTE_NAMES)[number];

// Parse a note like "C4", "Eb3", "F#5" into { name, octave, midi }
export function parseNote(note: string): {
  name: string;
  octave: number;
  midi: number;
} {
  const match = note.match(/^([A-G][#b]?)(\d)$/);
  if (!match) throw new Error(`Invalid note: ${note}`);

  let name = match[1];
  const octave = parseInt(match[2]);

  // Normalize flats to sharps
  if (name.includes("b") && FLAT_TO_SHARP[name]) {
    name = FLAT_TO_SHARP[name];
  }

  const noteIndex = NOTE_NAMES.indexOf(name as NoteName);
  if (noteIndex === -1) throw new Error(`Unknown note name: ${name}`);

  const midi = (octave + 1) * 12 + noteIndex;
  return { name, octave, midi };
}

export function midiToNote(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

export function isBlackKey(noteName: string): boolean {
  const name = FLAT_TO_SHARP[noteName] || noteName;
  return name.includes("#");
}

export function noteNameToIndex(name: string): number {
  const normalized = FLAT_TO_SHARP[name] || name;
  return NOTE_NAMES.indexOf(normalized as NoteName);
}

// ── Chord formulas (intervals in semitones from root) ───────────────

export type ChordType =
  | "maj"
  | "min"
  | "dom7"
  | "maj7"
  | "min7"
  | "min7b5"
  | "dim7"
  | "dom9"
  | "maj9"
  | "min9"
  | "dom13";

export const CHORD_FORMULAS: Record<ChordType, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dom7: [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  min7b5: [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
  dom9: [0, 4, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14],
  min9: [0, 3, 7, 10, 14],
  dom13: [0, 4, 7, 10, 14, 21],
};

export const CHORD_LABELS: Record<ChordType, string> = {
  maj: "Majeur",
  min: "Mineur",
  dom7: "Dominant 7",
  maj7: "Majeur 7",
  min7: "Mineur 7",
  min7b5: "Half verminderd",
  dim7: "Verminderd 7",
  dom9: "Dominant 9",
  maj9: "Majeur 9",
  min9: "Mineur 9",
  dom13: "Dominant 13",
};

export const CHORD_SYMBOLS: Record<ChordType, string> = {
  maj: "",
  min: "m",
  dom7: "7",
  maj7: "maj7",
  min7: "m7",
  min7b5: "m7♭5",
  dim7: "dim7",
  dom9: "9",
  maj9: "maj9",
  min9: "m9",
  dom13: "13",
};

// Get the notes of a chord given root and type
export function getChordNotes(
  root: string,
  type: ChordType,
  octave: number = 4
): string[] {
  const rootIndex = noteNameToIndex(root);
  const formula = CHORD_FORMULAS[type];
  const rootMidi = (octave + 1) * 12 + rootIndex;

  return formula.map((interval) => midiToNote(rootMidi + interval));
}

// ── Voicing types ───────────────────────────────────────────────────

export type VoicingType = "shell" | "rootless-a" | "rootless-b";

// Shell voicing: root + 3rd + 7th
export function getShellVoicing(
  root: string,
  type: ChordType,
  octave: number = 3
): { notes: string[]; labels: string[] } {
  const rootIndex = noteNameToIndex(root);
  const formula = CHORD_FORMULAS[type];
  const rootMidi = (octave + 1) * 12 + rootIndex;

  // Root
  const rootNote = midiToNote(rootMidi);

  // 3rd (interval index 1)
  const thirdInterval = formula[1];
  const thirdNote = midiToNote(rootMidi + thirdInterval);

  // 7th (interval index 3, if exists; otherwise use 5th)
  if (formula.length >= 4) {
    const seventhInterval = formula[3];
    // Choose inversion: if 3rd is below 7th, keep as is; voice lead
    const seventhNote = midiToNote(rootMidi + seventhInterval);
    return {
      notes: [rootNote, thirdNote, seventhNote],
      labels: ["R", "3", "7"],
    };
  }

  // For triads, use root + 3rd + 5th
  const fifthInterval = formula[2];
  const fifthNote = midiToNote(rootMidi + fifthInterval);
  return {
    notes: [rootNote, thirdNote, fifthNote],
    labels: ["R", "3", "5"],
  };
}

// Rootless Type A: 3-5-7-9
export function getRootlessA(
  root: string,
  type: ChordType,
  octave: number = 3
): { notes: string[]; labels: string[] } {
  const rootIndex = noteNameToIndex(root);
  const formula = CHORD_FORMULAS[type];
  const rootMidi = (octave + 1) * 12 + rootIndex;

  if (formula.length < 4) {
    return getShellVoicing(root, type, octave);
  }

  const third = formula[1];
  const fifth = formula[2];
  const seventh = formula[3];
  const ninth = 14; // major 9th (can be modified for altered chords)

  return {
    notes: [
      midiToNote(rootMidi + third),
      midiToNote(rootMidi + fifth),
      midiToNote(rootMidi + seventh),
      midiToNote(rootMidi + ninth),
    ],
    labels: ["3", "5", "7", "9"],
  };
}

// Rootless Type B: 7-9-3-5
export function getRootlessB(
  root: string,
  type: ChordType,
  octave: number = 3
): { notes: string[]; labels: string[] } {
  const rootIndex = noteNameToIndex(root);
  const formula = CHORD_FORMULAS[type];
  const rootMidi = (octave + 1) * 12 + rootIndex;

  if (formula.length < 4) {
    return getShellVoicing(root, type, octave);
  }

  const third = formula[1];
  const fifth = formula[2];
  const seventh = formula[3];
  const ninth = 14;

  return {
    notes: [
      midiToNote(rootMidi + seventh),
      midiToNote(rootMidi + ninth),
      midiToNote(rootMidi + third + 12), // 3rd up an octave
      midiToNote(rootMidi + fifth + 12), // 5th up an octave
    ],
    labels: ["7", "9", "3", "5"],
  };
}

// Get voicing by type
export function getVoicing(
  root: string,
  chordType: ChordType,
  voicingType: VoicingType,
  octave: number = 3
): { notes: string[]; labels: string[] } {
  switch (voicingType) {
    case "shell":
      return getShellVoicing(root, chordType, octave);
    case "rootless-a":
      return getRootlessA(root, chordType, octave);
    case "rootless-b":
      return getRootlessB(root, chordType, octave);
  }
}

// ── Interval names ──────────────────────────────────────────────────

export const INTERVAL_NAMES: Record<number, string> = {
  0: "Priem",
  1: "Kleine secunde",
  2: "Grote secunde",
  3: "Kleine terts",
  4: "Grote terts",
  5: "Reine kwart",
  6: "Tritonus",
  7: "Reine kwint",
  8: "Kleine sext",
  9: "Grote sext",
  10: "Kleine septiem",
  11: "Grote septiem",
  12: "Octaaf",
};

// ── All 12 root notes for iteration ─────────────────────────────────

export const ALL_ROOTS = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

// Display name for roots (with enharmonic)
export const ROOT_DISPLAY: Record<string, string> = {
  C: "C",
  "C#": "C♯ / D♭",
  D: "D",
  "D#": "D♯ / E♭",
  E: "E",
  F: "F",
  "F#": "F♯ / G♭",
  G: "G",
  "G#": "G♯ / A♭",
  A: "A",
  "A#": "A♯ / B♭",
  B: "B",
};

// Function labels for chord tones
export const TONE_COLORS: Record<string, string> = {
  R: "#60a5fa", // blue-400 — root
  "3": "#3b82f6", // blue-500 — third
  "5": "#2563eb", // blue-600 — fifth
  "7": "#818cf8", // indigo-400 — seventh
  "9": "#a78bfa", // violet-400 — ninth
  "11": "#c084fc", // purple-400 — eleventh
  "13": "#e879f9", // fuchsia-400 — thirteenth
};
