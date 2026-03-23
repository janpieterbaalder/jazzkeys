"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import type { MaatData, NootData } from "@/lib/claude";
import { parseNote } from "@/lib/piano-utils";
import PianoKeyboard from "@/components/piano/PianoKeyboard";
import NotenBalk from "./NotenBalk";
import NotenBalkControls from "./NotenBalkControls";

interface InteractieveNotenWeergaveProps {
  maatNoten: MaatData[];
  maatsoort?: string;
}

export default function InteractieveNotenWeergave({
  maatNoten,
  maatsoort,
}: InteractieveNotenWeergaveProps) {
  const [selectedNoot, setSelectedNoot] = useState<NootData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

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

  // Auto-scroll animatie
  const animate = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const scrollSpeed = speed * 0.8; // pixels per frame
    el.scrollLeft += scrollSpeed;

    // Stop als we aan het einde zijn
    if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
      setIsPlaying(false);
      return;
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [speed]);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animate]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);

  const handleReset = () => {
    setIsPlaying(false);
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  };

  const handleSpeedChange = (newSpeed: number) => setSpeed(newSpeed);

  return (
    <div className="space-y-3">
      {/* Controls */}
      <NotenBalkControls
        isPlaying={isPlaying}
        speed={speed}
        onPlayPause={handlePlayPause}
        onSpeedChange={handleSpeedChange}
        onReset={handleReset}
      />

      {/* Notenbalk (horizontaal scrollbaar) */}
      <div
        ref={scrollRef}
        className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <NotenBalk
          maatNoten={maatNoten}
          selectedNoot={selectedNoot}
          onNootSelect={setSelectedNoot}
          maatsoort={maatsoort}
        />
      </div>

      {/* Scroll hint voor mobiel */}
      <div className="text-center text-[10px] text-slate-600 md:hidden">
        Swipe naar rechts om door het stuk te scrollen
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
              Klik op een noot in de notenbalk om details te zien
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
