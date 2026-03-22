"use client";

import { useState, useMemo } from "react";
import type { MaatData, NootData } from "@/lib/claude";
import { parseNote } from "@/lib/piano-utils";
import PianoKeyboard from "@/components/piano/PianoKeyboard";
import MaatNotenView from "./MaatNotenView";

interface InteractieveNotenWeergaveProps {
  maatNoten: MaatData[];
}

export default function InteractieveNotenWeergave({
  maatNoten,
}: InteractieveNotenWeergaveProps) {
  const [selectedNoot, setSelectedNoot] = useState<NootData | null>(null);

  // Bereken het bereik van het keyboard op basis van alle noten
  const { startOctave, octaves } = useMemo(() => {
    let minOctave = 4;
    let maxOctave = 4;

    for (const maat of maatNoten) {
      for (const noot of maat.noten) {
        try {
          const parsed = parseNote(noot.noot);
          if (parsed) {
            if (parsed.octave < minOctave) minOctave = parsed.octave;
            if (parsed.octave > maxOctave) maxOctave = parsed.octave;
          }
        } catch {
          // Skip ongeldige noten
        }
      }
    }

    // Zorg voor minimaal 2 octaven
    const range = Math.max(2, maxOctave - minOctave + 1);
    return { startOctave: minOctave, octaves: range };
  }, [maatNoten]);

  // Highlighted notes voor de piano
  const highlightedNotes = useMemo(() => {
    if (!selectedNoot) return [];

    const isRechts = selectedNoot.hand === "rechts";
    return [
      {
        note: selectedNoot.noot,
        color: isRechts ? "#60a5fa" : "#818cf8",
        label: selectedNoot.noot,
      },
    ];
  }, [selectedNoot]);

  return (
    <div className="space-y-3">
      {/* Titel */}
      <div className="flex items-center gap-2 mb-2">
        <h4 className="text-sm font-semibold text-white">
          Interactieve notenweergave
        </h4>
        <span className="text-xs text-slate-500">
          Klik op een noot om te zien waar deze op het keyboard zit
        </span>
      </div>

      {/* Maten */}
      <div className="space-y-2">
        {maatNoten.map((maat, i) => (
          <MaatNotenView
            key={i}
            maat={maat}
            selectedNoot={selectedNoot}
            onNootSelect={setSelectedNoot}
          />
        ))}
      </div>

      {/* Sticky piano + noot detail */}
      <div className="sticky bottom-0 z-10 pt-3 pb-1 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
        <div className="p-3 rounded-xl border border-slate-700 bg-slate-900">
          <div className="overflow-x-auto">
            <PianoKeyboard
              startOctave={startOctave}
              octaves={octaves}
              highlightedNotes={highlightedNotes}
              size="sm"
              showNoteNames={true}
            />
          </div>

          {/* Noot detail */}
          {selectedNoot ? (
            <div className="mt-3 p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-lg font-bold ${
                    selectedNoot.hand === "rechts"
                      ? "text-blue-400"
                      : "text-indigo-400"
                  }`}
                >
                  {selectedNoot.noot}
                </span>
                <span className="text-xs text-slate-500">
                  {selectedNoot.hand === "rechts"
                    ? "Rechterhand"
                    : "Linkerhand"}
                </span>
                {selectedNoot.duur && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
                    {selectedNoot.duur}
                  </span>
                )}
              </div>
              {selectedNoot.balkPositie && (
                <p className="text-xs text-slate-400 mb-1">
                  <span className="text-slate-500">Positie op de balk:</span>{" "}
                  {selectedNoot.balkPositie}
                </p>
              )}
              {selectedNoot.uitleg && (
                <p className="text-xs text-slate-300">{selectedNoot.uitleg}</p>
              )}
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-600 text-center">
              Klik op een noot hierboven om details te zien
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
