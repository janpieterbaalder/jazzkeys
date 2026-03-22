"use client";

import { parseNote, isBlackKey } from "@/lib/piano-utils";

export interface HighlightedNote {
  note: string; // e.g. "C4", "Eb3"
  color: string; // hex color
  label?: string; // e.g. "R", "3", "7"
}

interface PianoKeyboardProps {
  startOctave?: number;
  octaves?: number;
  highlightedNotes?: HighlightedNote[];
  showNoteNames?: boolean;
  size?: "sm" | "md" | "lg";
}

// White key note names in order within one octave
const WHITE_NOTES = ["C", "D", "E", "F", "G", "A", "B"];

// Black key positions relative to white key index (0-based)
// Each entry: [afterWhiteKeyIndex, noteName]
const BLACK_KEYS: [number, string][] = [
  [0, "C#"],
  [1, "D#"],
  [3, "F#"],
  [4, "G#"],
  [5, "A#"],
];

const SIZES = {
  sm: { whiteW: 28, whiteH: 100, blackW: 18, blackH: 62 },
  md: { whiteW: 36, whiteH: 130, blackW: 23, blackH: 82 },
  lg: { whiteW: 44, whiteH: 160, blackW: 28, blackH: 100 },
};

export default function PianoKeyboard({
  startOctave = 3,
  octaves = 2,
  highlightedNotes = [],
  showNoteNames = false,
  size = "md",
}: PianoKeyboardProps) {
  const dims = SIZES[size];
  const totalWhiteKeys = octaves * 7;
  const svgWidth = totalWhiteKeys * dims.whiteW;
  const svgHeight = dims.whiteH;

  // Build a map of highlighted notes by midi number for fast lookup
  const highlightMap = new Map<number, HighlightedNote>();
  for (const hn of highlightedNotes) {
    try {
      const parsed = parseNote(hn.note);
      highlightMap.set(parsed.midi, hn);
    } catch {
      // Skip invalid notes
    }
  }

  // Helper to get midi for a note name + octave
  function getMidi(name: string, octave: number): number {
    return parseNote(`${name}${octave}`).midi;
  }

  const whiteKeys: React.ReactElement[] = [];
  const blackKeys: React.ReactElement[] = [];
  const highlights: React.ReactElement[] = [];

  for (let oct = 0; oct < octaves; oct++) {
    const currentOctave = startOctave + oct;

    // White keys
    for (let i = 0; i < 7; i++) {
      const keyIndex = oct * 7 + i;
      const x = keyIndex * dims.whiteW;
      const noteName = WHITE_NOTES[i];
      const midi = getMidi(noteName, currentOctave);
      const hl = highlightMap.get(midi);

      whiteKeys.push(
        <rect
          key={`white-${keyIndex}`}
          x={x}
          y={0}
          width={dims.whiteW}
          height={dims.whiteH}
          fill={hl ? hl.color : "#1e293b"}
          stroke="#334155"
          strokeWidth={1}
          rx={0}
          className="transition-colors"
        />
      );

      // Note name or highlight label
      if (hl?.label) {
        highlights.push(
          <text
            key={`hl-label-white-${keyIndex}`}
            x={x + dims.whiteW / 2}
            y={dims.whiteH - 16}
            textAnchor="middle"
            fill="white"
            fontSize={size === "sm" ? 10 : 12}
            fontWeight="bold"
          >
            {hl.label}
          </text>
        );
      } else if (showNoteNames) {
        highlights.push(
          <text
            key={`name-white-${keyIndex}`}
            x={x + dims.whiteW / 2}
            y={dims.whiteH - 12}
            textAnchor="middle"
            fill="#64748b"
            fontSize={size === "sm" ? 8 : 10}
          >
            {noteName}
            {currentOctave}
          </text>
        );
      }
    }

    // Black keys
    for (const [afterWhite, noteName] of BLACK_KEYS) {
      const whiteIndex = oct * 7 + afterWhite;
      const x =
        (whiteIndex + 1) * dims.whiteW - dims.blackW / 2;
      const midi = getMidi(noteName, currentOctave);
      const hl = highlightMap.get(midi);

      blackKeys.push(
        <rect
          key={`black-${oct}-${noteName}`}
          x={x}
          y={0}
          width={dims.blackW}
          height={dims.blackH}
          fill={hl ? hl.color : "#020617"}
          stroke="#1e293b"
          strokeWidth={1}
          rx={0}
          className="transition-colors"
        />
      );

      if (hl?.label) {
        highlights.push(
          <text
            key={`hl-label-black-${oct}-${noteName}`}
            x={x + dims.blackW / 2}
            y={dims.blackH - 8}
            textAnchor="middle"
            fill="white"
            fontSize={size === "sm" ? 9 : 11}
            fontWeight="bold"
          >
            {hl.label}
          </text>
        );
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="w-full max-w-full"
      style={{ maxHeight: `${svgHeight}px` }}
    >
      {/* White keys first */}
      {whiteKeys}
      {/* Black keys on top */}
      {blackKeys}
      {/* Labels on top of everything */}
      {highlights}
    </svg>
  );
}
