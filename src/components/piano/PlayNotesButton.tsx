"use client";

import { parseNote } from "@/lib/piano-utils";
import { playChord, unlockAudio } from "@/lib/audio";

interface PlayNotesButtonProps {
  notes: string[];
  /** Toon ook een knop om de noten één voor één (gebroken) te spelen. */
  withArpeggio?: boolean;
  className?: string;
}

function toMidi(notes: string[]): number[] {
  const result: number[] = [];
  for (const n of notes) {
    try {
      result.push(parseNote(n).midi);
    } catch {
      // ongeldige noot overslaan
    }
  }
  return result;
}

const base =
  "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors border";

export default function PlayNotesButton({
  notes,
  withArpeggio = true,
  className = "",
}: PlayNotesButtonProps) {
  const midis = toMidi(notes);
  if (midis.length === 0) return null;

  const play = async (arpeggio: number) => {
    await unlockAudio();
    playChord(midis, { arpeggio, duration: arpeggio ? 0.9 : 1.6 });
  };

  return (
    <div className={`flex gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={() => play(0)}
        className={`${base} bg-blue-500/15 text-blue-300 border-blue-500/30 hover:bg-blue-500/25`}
        aria-label={midis.length > 1 ? "Speel akkoord" : "Speel noot"}
      >
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
        {midis.length > 1 ? "Akkoord" : "Speel"}
      </button>
      {withArpeggio && midis.length > 1 && (
        <button
          type="button"
          onClick={() => play(0.28)}
          className={`${base} text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-500`}
          aria-label="Speel de noten één voor één"
        >
          Gebroken
        </button>
      )}
    </div>
  );
}
