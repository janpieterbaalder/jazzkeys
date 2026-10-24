"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import type { MaatData, NootData } from "@/lib/analyse-schema";
import { parseNote } from "@/lib/piano-utils";
import { playNote, unlockAudio } from "@/lib/audio";
import { buildMaatNotenTimeline, notesSoundingAt } from "@/lib/score-timeline";
import { ScorePlayer } from "@/lib/score-player";
import PianoKeyboard from "@/components/piano/PianoKeyboard";
import NotenBalk from "./NotenBalk";
import NotenBalkControls from "./NotenBalkControls";

interface InteractieveNotenWeergaveProps {
  maatNoten: MaatData[];
  maatsoort?: string;
  bpm?: number;
}

const HAND_COLOR = { rechts: "#60a5fa", links: "#818cf8" } as const;

export default function InteractieveNotenWeergave({
  maatNoten,
  maatsoort,
  bpm = 80,
}: InteractieveNotenWeergaveProps) {
  const [selectedNoot, setSelectedNoot] = useState<NootData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [metronome, setMetronome] = useState(false);
  const [rechts, setRechts] = useState(true);
  const [links, setLinks] = useState(true);
  const [actieveNoten, setActieveNoten] = useState<Set<NootData>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const activeKeyRef = useRef("");

  const timeline = useMemo(
    () => buildMaatNotenTimeline(maatNoten, maatsoort, bpm),
    [maatNoten, maatsoort, bpm]
  );

  const playerRef = useRef<ScorePlayer | null>(null);
  useEffect(() => {
    const player = new ScorePlayer(timeline);
    player.onEnded = () => {
      setIsPlaying(false);
      activeKeyRef.current = "";
      setActieveNoten(new Set());
    };
    playerRef.current = player;
    return () => {
      player.dispose();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [timeline]);

  useEffect(() => { playerRef.current?.setSpeed(speed); }, [speed, timeline]);
  useEffect(() => { if (playerRef.current) playerRef.current.metronome = metronome; }, [metronome, timeline]);
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.mutedParts = new Set([...(rechts ? [] : [0]), ...(links ? [] : [1])]);
    }
  }, [rechts, links, timeline]);

  // Bereken het bereik van het keyboard op basis van alle noten
  const { startOctave, octaves } = useMemo(() => {
    let minOctave = 4;
    let maxOctave = 4;

    for (const maat of maatNoten) {
      for (const noot of maat.noten) {
        try {
          const parsed = parseNote(noot.noot);
          if (parsed.octave < minOctave) minOctave = parsed.octave;
          if (parsed.octave > maxOctave) maxOctave = parsed.octave;
        } catch {
          // Skip ongeldige noten (en rusten)
        }
      }
    }

    const range = Math.max(2, maxOctave - minOctave + 1);
    return { startOctave: minOctave, octaves: range };
  }, [maatNoten]);

  // Highlighted notes voor de piano: klinkende noten tijdens afspelen, anders de selectie
  const highlightedNotes = useMemo(() => {
    const bron = actieveNoten.size > 0 ? [...actieveNoten] : selectedNoot ? [selectedNoot] : [];
    return bron
      .filter((n) => n.type !== "rust")
      .map((n) => ({ note: n.noot, color: HAND_COLOR[n.hand], label: n.noot }));
  }, [actieveNoten, selectedNoot]);

  const startFrameLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const tick = () => {
      const player = playerRef.current;
      if (!player) return;
      const pos = player.position();
      const sounding = notesSoundingAt(timeline.notes, pos).filter(
        (n) => !player.mutedParts.has(n.part)
      );
      const key = sounding.map((n) => `${n.start}:${n.midi}`).join(",");
      if (key !== activeKeyRef.current) {
        activeKeyRef.current = key;
        setActieveNoten(new Set(sounding.map((n) => n.ref as NootData)));
        // Meescrollen: eerste klinkende noot op ~1/3 van links
        requestAnimationFrame(() => {
          const el = scrollRef.current;
          const target = el?.querySelector<SVGGElement>('[data-actief="true"]');
          const x = target ? parseFloat(target.dataset.x ?? "0") : null;
          if (el && x !== null) {
            el.scrollTo({ left: Math.max(0, x - el.clientWidth / 3), behavior: "smooth" });
          }
        });
      }
      if (player.playing) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [timeline]);

  const handlePlayPause = async () => {
    const player = playerRef.current;
    if (!player) return;
    if (player.playing) {
      player.pause();
      setIsPlaying(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    await player.play();
    setIsPlaying(true);
    startFrameLoop();
  };

  const handleReset = () => {
    playerRef.current?.stop();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIsPlaying(false);
    activeKeyRef.current = "";
    setActieveNoten(new Set());
    scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  const handleSelect = (noot: NootData) => {
    setSelectedNoot(noot);
    if (noot.type === "rust") return;
    try {
      const midi = parseNote(noot.noot).midi;
      void unlockAudio().then(() => playNote(midi, { duration: 0.9 }));
    } catch {
      // ongeldige nootnaam
    }
  };

  return (
    <div className="space-y-3">
      {/* Controls */}
      <NotenBalkControls
        isPlaying={isPlaying}
        speed={speed}
        bpm={bpm}
        metronome={metronome}
        rechts={rechts}
        links={links}
        onPlayPause={handlePlayPause}
        onSpeedChange={setSpeed}
        onReset={handleReset}
        onMetronomeChange={setMetronome}
        onRechtsChange={setRechts}
        onLinksChange={setLinks}
      />

      {/* Notenbalk (horizontaal scrollbaar) */}
      <div
        ref={scrollRef}
        className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <NotenBalk
          maatNoten={maatNoten}
          selectedNoot={selectedNoot}
          onNootSelect={handleSelect}
          maatsoort={maatsoort}
          actieveNoten={actieveNoten}
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
          {selectedNoot && !isPlaying ? (
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
                    {selectedNoot.duur.replace(/_/g, " ")}
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
              {isPlaying
                ? "Kijk mee: de klinkende noten lichten op"
                : "Klik op een noot om hem te horen en uitleg te zien"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
