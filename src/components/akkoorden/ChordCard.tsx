"use client";

import PianoKeyboard from "@/components/piano/PianoKeyboard";
import {
  type ChordType,
  type VoicingType,
  getVoicing,
  CHORD_SYMBOLS,
  CHORD_LABELS,
  TONE_COLORS,
  ROOT_DISPLAY,
} from "@/lib/piano-utils";

interface ChordCardProps {
  root: string;
  chordType: ChordType;
  voicingType: VoicingType;
}

export default function ChordCard({
  root,
  chordType,
  voicingType,
}: ChordCardProps) {
  const voicing = getVoicing(root, chordType, voicingType);
  const symbol = CHORD_SYMBOLS[chordType];
  const label = CHORD_LABELS[chordType];

  const highlightedNotes = voicing.notes.map((note, i) => ({
    note,
    color: TONE_COLORS[voicing.labels[i]] || "#60a5fa",
    label: voicing.labels[i],
  }));

  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30">
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-lg font-bold text-white">
          {root}
          {symbol}
        </span>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <div className="text-xs text-slate-500 mb-3">
        {voicing.notes.join(" — ")}
      </div>
      <PianoKeyboard
        startOctave={3}
        octaves={2}
        highlightedNotes={highlightedNotes}
        size="sm"
      />
    </div>
  );
}
