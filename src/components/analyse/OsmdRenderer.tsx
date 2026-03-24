"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface OsmdRendererProps {
  musicXml: string;
  fromMeasure?: number;
  toMeasure?: number;
}

// Piano key: note name, octave, black/white, MIDI number
interface PianoKey {
  note: string;
  octave: number;
  isBlack: boolean;
  midi: number;
  label?: string;
}

// Build piano keys for range C2-C7 (5 octaves + high C)
function buildPianoKeys(): PianoKey[] {
  const whiteNotes = ["C", "D", "E", "F", "G", "A", "B"];
  const blackAfter = new Set(["C", "D", "F", "G", "A"]); // these have a sharp
  const midiBase: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const keys: PianoKey[] = [];

  for (let oct = 2; oct <= 6; oct++) {
    for (const n of whiteNotes) {
      const midi = (oct + 1) * 12 + midiBase[n];
      keys.push({ note: n, octave: oct, isBlack: false, midi, label: n === "C" ? `C${oct}` : undefined });
      if (blackAfter.has(n)) {
        keys.push({ note: n + "#", octave: oct, isBlack: true, midi: midi + 1 });
      }
    }
  }
  // Add C7
  keys.push({ note: "C", octave: 7, isBlack: false, midi: 96, label: "C7" });
  return keys;
}

const PIANO_KEYS = buildPianoKeys();

export default function OsmdRenderer({
  musicXml,
  fromMeasure,
  toMeasure,
}: OsmdRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [showPiano, setShowPiano] = useState(false);
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const [clickedNotes, setClickedNotes] = useState<Set<number>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const enterFullscreen = useCallback(() => {
    if (playerRef.current?.requestFullscreen) {
      playerRef.current.requestFullscreen().catch(() => {});
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Initialize OSMD
  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!containerRef.current || !musicXml) return;

      try {
        setLoading(true);
        setError(null);

        const { OpenSheetMusicDisplay } = await import("opensheetmusicdisplay");
        if (!mounted || !containerRef.current) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const options: any = {
          darkMode: true,
          pageBackgroundColor: "#0f172a",
          defaultColorMusic: "#cbd5e1",
          defaultColorNotehead: "#60a5fa",
          defaultColorStem: "#94a3b8",
          defaultColorRest: "#64748b",
          defaultColorLabel: "#94a3b8",
          defaultColorTitle: "#f1f5f9",

          backend: "svg",
          autoResize: false,
          renderSingleHorizontalStaffline: true,
          drawTitle: false,
          drawSubtitle: false,
          drawComposer: false,
          drawCredits: false,
          drawPartNames: false,
          drawPartAbbreviations: false,
          drawMeasureNumbers: true,
          drawMeasureNumbersOnlyAtSystemStart: false,
          drawTimeSignatures: true,
          drawMetronomeMarks: false,
          drawFingerings: false,
          drawLyrics: false,
          drawSlurs: true,

          followCursor: false,
          cursorsOptions: [{ type: 0, color: "#3b82f680", alpha: 0.4 }],

          onXMLRead: (xml: string) =>
            xml.replace(/<sign>G<\/sign>(\s*)<line>3<\/line>/g, "<sign>G</sign>$1<line>2</line>"),

          ...(fromMeasure !== undefined && { drawFromMeasureNumber: fromMeasure }),
          ...(toMeasure !== undefined && { drawUpToMeasureNumber: toMeasure }),
        };

        const osmd = new OpenSheetMusicDisplay(containerRef.current, options);
        await osmd.load(musicXml);
        osmd.render();

        if (scrollRef.current) scrollRef.current.scrollLeft = 0;

        // Add click handler for notes on the SVG
        containerRef.current.addEventListener("click", handleNoteClick);

        osmdRef.current = osmd;
        setLoading(false);
      } catch (err) {
        if (mounted) {
          const msg = err instanceof Error ? err.message + "\n" + err.stack : String(err);
          console.error("OSMD init error:", msg);
          setError(msg);
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
      containerRef.current?.removeEventListener("click", handleNoteClick);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicXml, fromMeasure, toMeasure]);

  // Handle clicking on notes in the SVG to highlight piano keys
  const handleNoteClick = useCallback((e: Event) => {
    const mouseEvent = e as MouseEvent;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const osmd = osmdRef.current as any;
    if (!osmd) return;

    // Find the closest note element to the click
    const target = mouseEvent.target as Element;
    if (!target) return;

    // OSMD renders notes as SVG elements. Try to find a GraphicalNote at click position.
    try {
      const svgEl = containerRef.current?.querySelector("svg");
      if (!svgEl) return;

      const pt = svgEl.createSVGPoint();
      pt.x = mouseEvent.clientX;
      pt.y = mouseEvent.clientY;
      const svgPt = pt.matrixTransform(svgEl.getScreenCTM()?.inverse());

      // Search through all graphical notes to find one near the click
      const clickedMidi = new Set<number>();
      const tolerance = 8; // pixels tolerance

      for (const musicPage of osmd.GraphicSheet.MusicPages) {
        for (const system of musicPage.MusicSystems) {
          for (const staffLine of system.StaffLines) {
            for (const measure of staffLine.Measures) {
              for (const staffEntry of measure.staffEntries) {
                for (const gve of staffEntry.graphicalVoiceEntries) {
                  for (const gNote of gve.notes) {
                    if (gNote.sourceNote?.isRest()) continue;
                    const pos = gNote.PositionAndShape;
                    if (!pos) continue;
                    const absPos = pos.AbsolutePosition;
                    if (!absPos) continue;

                    // Convert OSMD units to SVG pixels (OSMD uses 10 units per staff space)
                    const noteX = absPos.x * 10;
                    const noteY = absPos.y * 10;

                    if (
                      Math.abs(noteX - svgPt.x) < tolerance * 3 &&
                      Math.abs(noteY - svgPt.y) < tolerance
                    ) {
                      const halfTone = gNote.sourceNote?.halfTone;
                      if (halfTone !== undefined) {
                        clickedMidi.add(halfTone + 12);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (clickedMidi.size > 0) {
        setClickedNotes(clickedMidi);
        if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = setTimeout(() => setClickedNotes(new Set()), 2000);
      }
    } catch {
      // ignore click detection errors
    }
  }, []);

  // Get active MIDI notes from cursor position
  const getActiveNotesFromCursor = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const osmd = osmdRef.current as any;
    if (!osmd?.cursor) return new Set<number>();

    const notes = new Set<number>();
    try {
      const iterator = osmd.cursor.iterator;
      if (!iterator?.CurrentVoiceEntries) return notes;

      for (const ve of iterator.CurrentVoiceEntries) {
        for (const note of ve.Notes) {
          if (note && !note.isRest() && note.halfTone !== undefined) {
            // OSMD halfTone: C4=48 internally, standard MIDI C4=60 → add 12
            notes.add(note.halfTone + 12);
          }
        }
      }
    } catch {
      // ignore cursor read errors
    }
    return notes;
  }, []);

  // Auto-scroll to keep cursor visible
  const scrollToCursor = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const osmd = osmdRef.current as any;
    if (!osmd?.cursor || !scrollRef.current) return;

    try {
      const cursorEl = osmd.cursor.cursorElement;
      if (!cursorEl) return;
      const cursorRect = cursorEl.getBoundingClientRect();
      const scrollRect = scrollRef.current.getBoundingClientRect();
      const cursorCenter = cursorRect.left - scrollRect.left + scrollRef.current.scrollLeft;
      const viewCenter = scrollRef.current.clientWidth / 3;

      scrollRef.current.scrollTo({
        left: cursorCenter - viewCenter,
        behavior: "smooth",
      });
    } catch {
      // ignore scroll errors
    }
  }, []);

  const togglePlay = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const osmd = osmdRef.current as any;
    if (!osmd) return;

    if (playing) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      osmd.cursor.hide();
      setPlaying(false);
      setActiveNotes(new Set());
    } else {
      osmd.cursor.show();
      osmd.cursor.reset();
      setActiveNotes(getActiveNotesFromCursor());
      scrollToCursor();

      const baseBpm = 60;
      const ms = 60000 / (baseBpm * (speed / 100));
      timerRef.current = setInterval(() => {
        if (osmd.cursor.iterator.EndReached) {
          if (timerRef.current) clearInterval(timerRef.current);
          osmd.cursor.hide();
          setPlaying(false);
          setActiveNotes(new Set());
          return;
        }
        osmd.cursor.next();
        setActiveNotes(getActiveNotesFromCursor());
        scrollToCursor();
      }, ms);
      setPlaying(true);
    }
  }, [playing, speed, getActiveNotesFromCursor, scrollToCursor]);

  // Update interval when speed changes during playback
  useEffect(() => {
    if (!playing) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const osmd = osmdRef.current as any;
    if (!osmd) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const baseBpm = 60;
    const ms = 60000 / (baseBpm * (speed / 100));
    timerRef.current = setInterval(() => {
      if (osmd.cursor.iterator.EndReached) {
        if (timerRef.current) clearInterval(timerRef.current);
        osmd.cursor.hide();
        setPlaying(false);
        setActiveNotes(new Set());
        return;
      }
      osmd.cursor.next();
      setActiveNotes(getActiveNotesFromCursor());
      scrollToCursor();
    }, ms);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [speed, playing, getActiveNotesFromCursor, scrollToCursor]);

  const resetCursor = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const osmd = osmdRef.current as any;
    if (!osmd) return;
    if (timerRef.current) clearInterval(timerRef.current);
    osmd.cursor.hide();
    osmd.cursor.reset();
    setPlaying(false);
    setActiveNotes(new Set());
    setClickedNotes(new Set());
    if (scrollRef.current) scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
  }, []);

  if (error) {
    return (
      <div className="rounded-lg bg-red-900/20 border border-red-800 p-4 text-red-300">
        <p className="font-medium">Fout bij laden notenbalk</p>
        <p className="text-sm mt-1 opacity-70">{error}</p>
      </div>
    );
  }

  // Combine active (from cursor) and clicked (from user click) notes
  const highlightedNotes = new Set([...activeNotes, ...clickedNotes]);

  const whiteKeys = PIANO_KEYS.filter((k) => !k.isBlack);
  const whiteKeyWidth = 100 / whiteKeys.length;

  // Piano keyboard component (reusable in both normal and fullscreen)
  const pianoKeyboard = (height: string) => (
    <div className={`relative ${height} bg-slate-950 rounded-lg border border-slate-700/50 overflow-hidden select-none`}>
      {whiteKeys.map((key, i) => {
        const isActive = highlightedNotes.has(key.midi);
        return (
          <div
            key={`w-${key.note}${key.octave}`}
            className={`absolute top-0 bottom-0 border-r transition-colors duration-75 ${
              isActive ? "bg-blue-500 border-blue-600" : "bg-slate-100 border-slate-300"
            }`}
            style={{ left: `${i * whiteKeyWidth}%`, width: `${whiteKeyWidth}%` }}
          >
            {key.label && (
              <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] ${
                isActive ? "text-white" : "text-slate-400"
              }`}>
                {key.label}
              </span>
            )}
          </div>
        );
      })}
      {PIANO_KEYS.filter((k) => k.isBlack).map((key) => {
        const isActive = highlightedNotes.has(key.midi);
        const baseNote = key.note.charAt(0);
        const whiteIdx = whiteKeys.findIndex(
          (w) => w.note === baseNote && w.octave === key.octave
        );
        if (whiteIdx < 0) return null;
        const left = (whiteIdx + 0.62) * whiteKeyWidth;
        return (
          <div
            key={`b-${key.note}${key.octave}`}
            className={`absolute top-0 rounded-b-sm transition-colors duration-75 ${
              isActive ? "bg-blue-400" : "bg-slate-900"
            }`}
            style={{ left: `${left}%`, width: `${whiteKeyWidth * 0.7}%`, height: "58%", zIndex: 1 }}
          />
        );
      })}
    </div>
  );

  const stopAndExit = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const osmd = osmdRef.current as any;
    if (osmd) {
      if (timerRef.current) clearInterval(timerRef.current);
      osmd.cursor.hide();
      osmd.cursor.reset();
    }
    setPlaying(false);
    setActiveNotes(new Set());
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
    exitFullscreen();
  }, [exitFullscreen]);

  // Controls bar component
  const controlsBar = () => (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Stop button — only in fullscreen, exits fullscreen + stops playback */}
      {isFullscreen && (
        <button
          onClick={stopAndExit}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
          Stop
        </button>
      )}

      <button
        onClick={togglePlay}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium disabled:opacity-50 transition-colors"
      >
        {playing ? (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
            Pauze
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Afspelen
          </>
        )}
      </button>
      <button
        onClick={resetCursor}
        disabled={loading}
        className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm disabled:opacity-50 transition-colors"
      >
        Reset
      </button>

      <div className="flex items-center gap-2 ml-auto">
        <span className="text-xs text-slate-500">Snelheid:</span>
        <input
          type="range"
          min={25}
          max={200}
          step={25}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-20 h-1 accent-blue-500"
        />
        <span className="text-xs text-slate-400 w-10 text-right">{speed}%</span>
      </div>

      <button
        onClick={() => setShowPiano(!showPiano)}
        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
          showPiano
            ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
            : "bg-slate-700 hover:bg-slate-600 text-slate-300"
        }`}
      >
        Piano
      </button>

      {/* Fullscreen button — only when NOT in fullscreen */}
      {!isFullscreen && (
        <button
          onClick={enterFullscreen}
          disabled={loading}
          className="px-2 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm disabled:opacity-50 transition-colors"
          title="Volledig scherm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
          </svg>
        </button>
      )}

      {loading && (
        <span className="text-sm text-slate-400 animate-pulse">Laden...</span>
      )}
    </div>
  );

  return (
    <div ref={playerRef} className={`${isFullscreen ? "bg-slate-950 flex flex-col h-screen p-1 gap-1" : "space-y-2"}`}>
      {/* Controls */}
      {controlsBar()}

      {/* Piano keyboard */}
      {showPiano && pianoKeyboard(isFullscreen ? "h-24" : "h-20")}

      {/* Score container — horizontal scroll, fills remaining space in fullscreen */}
      <div
        ref={scrollRef}
        className={`overflow-x-auto overflow-y-hidden cursor-pointer ${
          isFullscreen ? "flex-1 border-0" : "rounded-lg border border-slate-700/50"
        }`}
        style={{ minHeight: loading ? 200 : "auto" }}
      >
        <div ref={containerRef} />
      </div>
    </div>
  );
}
