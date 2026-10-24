"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { normalizePianoXml } from "@/lib/xml-utils";
import { applyMidwayerFixes, getBarlineXs } from "@/lib/osmd-svg";
import {
  buildOsmdTimeline,
  notesSoundingAt,
  timeAtX,
  xAtTime,
  type Timeline,
} from "@/lib/score-timeline";
import { ScorePlayer } from "@/lib/score-player";
import { playChord, unlockAudio } from "@/lib/audio";

export type RenderFixes = "midwayer";

interface OsmdRendererProps {
  musicXml: string;
  fromMeasure?: number;
  toMeasure?: number;
  /** Bestand-specifieke correcties na het renderen (zie lib/osmd-svg.ts) */
  renderFixes?: RenderFixes;
}

interface PianoKey {
  note: string;
  octave: number;
  isBlack: boolean;
  midi: number;
  label?: string;
}

function buildPianoKeys(): PianoKey[] {
  const whiteNotes = ["C", "D", "E", "F", "G", "A", "B"];
  const blackAfter = new Set(["C", "D", "F", "G", "A"]);
  const midiBase: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const keys: PianoKey[] = [];
  for (let oct = 2; oct <= 6; oct++) {
    for (const n of whiteNotes) {
      const midi = (oct + 1) * 12 + midiBase[n];
      keys.push({ note: n, octave: oct, isBlack: false, midi, label: n === "C" ? `C${oct}` : undefined });
      if (blackAfter.has(n)) keys.push({ note: n + "#", octave: oct, isBlack: true, midi: midi + 1 });
    }
  }
  keys.push({ note: "C", octave: 7, isBlack: false, midi: 96, label: "C7" });
  return keys;
}

const PIANO_KEYS = buildPianoKeys();
const WHITE_KEYS = PIANO_KEYS.filter((k) => !k.isBlack);
const BLACK_KEYS = PIANO_KEYS.filter((k) => k.isBlack);

// Kleuren volgens CLAUDE.md: rechterhand blauw, linkerhand indigo, aangeklikt amber.
const RH_KEY = "bg-blue-400 border-blue-500";
const LH_KEY = "bg-indigo-400 border-indigo-500";
const CLICK_KEY = "bg-amber-400 border-amber-500";

const btn =
  "px-2.5 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50 border";
const btnOff = "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700";
const btnOn = "bg-blue-600/20 text-blue-300 border-blue-500/40";

export default function OsmdRenderer({ musicXml, fromMeasure, toMeasure, renderFixes }: OsmdRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<unknown>(null);
  const playlineRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const timelineRef = useRef<Timeline | null>(null);
  const playerRef = useRef<ScorePlayer | null>(null);
  const [playing, setPlaying] = useState(false);
  const [countingIn, setCountingIn] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [metronome, setMetronome] = useState(false);
  const [countIn, setCountIn] = useState(false);
  const [rhOn, setRhOn] = useState(true);
  const [lhOn, setLhOn] = useState(true);
  const [loopOn, setLoopOn] = useState(false);
  const [loopFrom, setLoopFrom] = useState(1);
  const [loopTo, setLoopTo] = useState(4);
  const [currentMeasure, setCurrentMeasure] = useState<number | null>(null);

  const [showPiano, setShowPiano] = useState(true);
  const [activeNotes, setActiveNotes] = useState<Map<number, number>>(new Map());
  const [clickedNotes, setClickedNotes] = useState<Set<number>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerBoxRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeKeyRef = useRef("");
  /** CSS-schaal van de SVG (fullscreen); playline-x = svg-x × schaal */
  const scaleRef = useRef(1);
  /** Afstand playline ↔ linkerrand viewport tijdens pauze (voor herpositioneren via scroll) */
  const lineViewOffsetRef = useRef<number | null>(null);
  const lineMovedRef = useRef(false);

  // Fullscreen via <dialog> — works on all browsers including iOS Safari.
  // The player DOM node is moved into the dialog when entering fullscreen,
  // and moved back when exiting. This preserves the OSMD-rendered SVG.
  const dialogRef = useRef<HTMLDialogElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const placePlayline = useCallback((svgX: number) => {
    const line = playlineRef.current;
    if (!line) return;
    line.style.left = `${svgX * scaleRef.current}px`;
    line.style.display = "block";
  }, []);

  // Scale the OSMD SVG so the full grand staff fits the available height.
  // The SVG has ~65px top margin and ~75px bottom margin around the actual
  // staff content. In fullscreen we crop these margins to use more space.
  const scaleScoreToFit = useCallback(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    const svg = scroll.querySelector("svg") as SVGSVGElement | null;
    if (!svg) return;
    const svgH = parseFloat(svg.getAttribute("height") || "0");
    if (svgH <= 0) return;
    const availH = scroll.clientHeight;
    if (availH <= 0 || availH >= svgH) {
      svg.style.transform = "";
      svg.style.transformOrigin = "";
      scaleRef.current = 1;
      return;
    }
    // Crop top/bottom margins of the SVG to make the staves bigger
    const topCrop = 50;  // px of empty space above treble staff
    const bottomCrop = 50; // px of empty space below bass staff
    const contentH = svgH - topCrop - bottomCrop;
    const scale = Math.min(1, availH / contentH);
    // Scale then shift up to hide the top margin
    svg.style.transform = `scale(${scale}) translateY(${-topCrop}px)`;
    svg.style.transformOrigin = "top left";
    scaleRef.current = scale;
  }, []);

  const resetScale = useCallback(() => {
    const svg = scrollRef.current?.querySelector("svg");
    if (svg) { svg.style.transform = ""; svg.style.transformOrigin = ""; }
    scaleRef.current = 1;
  }, []);

  const enterFullscreen = useCallback(() => {
    const dialog = dialogRef.current;
    const player = playerBoxRef.current;
    if (!dialog || !player) return;
    dialog.appendChild(player);
    dialog.showModal();
    setIsFullscreen(true);
    history.pushState({ fullscreen: true }, "");
    try { (screen.orientation as unknown as { lock?: (o: string) => Promise<void> }).lock?.("landscape").catch(() => {}); } catch {}
    // Scale score after layout settles
    requestAnimationFrame(() => requestAnimationFrame(scaleScoreToFit));
  }, [scaleScoreToFit]);

  const exitFullscreen = useCallback(() => {
    // Sluiten van de dialog triggert het "close"-event, dat de speler terugzet.
    dialogRef.current?.close();
  }, []);

  // Handle dialog close (Escape key, close button) and mobile back-button
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      const player = playerBoxRef.current;
      const wrapper = wrapperRef.current;
      resetScale();
      if (player && wrapper) wrapper.appendChild(player);
      setIsFullscreen(false);
      try { (screen.orientation as unknown as { unlock?: () => void }).unlock?.(); } catch {}
    };
    dialog.addEventListener("close", handleClose);

    const handlePopState = () => {
      if (dialog.open) dialog.close();
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      dialog.removeEventListener("close", handleClose);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [resetScale]);

  // Re-scale score when piano is toggled in fullscreen, or on orientation change
  useEffect(() => {
    if (isFullscreen) {
      requestAnimationFrame(() => requestAnimationFrame(scaleScoreToFit));
    }
  }, [isFullscreen, showPiano, scaleScoreToFit]);

  useEffect(() => {
    const handleResize = () => { if (isFullscreen) scaleScoreToFit(); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isFullscreen, scaleScoreToFit]);

  // ── Afspeel-loop (alleen visueel; audio wordt door ScorePlayer gepland) ──
  const startFrameLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const tick = () => {
      const player = playerRef.current;
      const tl = timelineRef.current;
      const scroll = scrollRef.current;
      if (!player || !tl) return;

      const pos = player.position();
      const svgX = xAtTime(tl.steps, pos);
      placePlayline(svgX);

      if (scroll) {
        const x = svgX * scaleRef.current;
        const viewWidth = scroll.clientWidth;
        const lineVisible = x > scroll.scrollLeft - 50 && x < scroll.scrollLeft + viewWidth + 50;
        if (lineVisible) {
          // Houd de lijn op ~1/3 van links; bij een sprong (herhaling) direct mee.
          const target = x - viewWidth / 3;
          const diff = target - scroll.scrollLeft;
          scroll.scrollLeft += Math.abs(diff) > viewWidth ? diff : diff * 0.08;
        } else {
          scroll.scrollLeft = x - viewWidth / 3;
        }
      }

      // Klinkende noten → piano (key = midi, value = hand)
      const sounding = notesSoundingAt(tl.notes, pos).filter((n) => !player.mutedParts.has(n.part));
      const key = sounding.map((n) => `${n.midi}:${n.part}`).sort().join(",");
      if (key !== activeKeyRef.current) {
        activeKeyRef.current = key;
        setActiveNotes(new Map(sounding.map((n) => [n.midi, n.part])));
      }

      const measure = tl.measures.find((m) => pos >= m.start && pos < m.end);
      setCurrentMeasure(measure?.number ?? null);
      setCountingIn(player.isCountingIn());

      if (player.playing) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [placePlayline]);

  const clearHighlights = useCallback(() => {
    activeKeyRef.current = "";
    setActiveNotes(new Map());
    setCountingIn(false);
  }, []);

  // Initialize OSMD
  useEffect(() => {
    let mounted = true;
    const container = containerRef.current;

    async function init() {
      if (!container || !musicXml) return;
      try {
        setLoading(true);
        setError(null);
        const { OpenSheetMusicDisplay } = await import("opensheetmusicdisplay");
        if (!mounted) return;
        container.innerHTML = "";

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
          ...(fromMeasure !== undefined && { drawFromMeasureNumber: fromMeasure }),
          ...(toMeasure !== undefined && { drawUpToMeasureNumber: toMeasure }),
        };

        const osmd = new OpenSheetMusicDisplay(container, options);
        // Normalize XML structure (measure numbers, clef lines)
        await osmd.load(normalizePianoXml(musicXml));
        if (!mounted) return;
        osmd.render();

        if (scrollRef.current) scrollRef.current.scrollLeft = 0;

        const svgEl = container.querySelector("svg");
        const barlines = svgEl ? getBarlineXs(svgEl) : [];
        if (svgEl && renderFixes === "midwayer") applyMidwayerFixes(svgEl);

        const tl = buildOsmdTimeline(osmd, barlines);
        osmdRef.current = osmd;
        timelineRef.current = tl;
        playerRef.current?.dispose();
        const player = new ScorePlayer(tl);
        player.onEnded = () => {
          setPlaying(false);
          clearHighlights();
          if (playlineRef.current) playlineRef.current.style.display = "none";
        };
        playerRef.current = player;
        setTimeline(tl);
        const firstMeasure = tl.measures[0]?.number ?? 1;
        setLoopFrom(firstMeasure);
        setLoopTo(Math.min(firstMeasure + 3, tl.measures[tl.measures.length - 1]?.number ?? firstMeasure));
        setLoading(false);
      } catch (err) {
        if (mounted) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("OSMD init error:", err);
          setError(msg);
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      playerRef.current?.dispose();
      playerRef.current = null;
      setPlaying(false);
    };
  }, [musicXml, fromMeasure, toMeasure, renderFixes, clearHighlights]);

  // Instellingen doorzetten naar de speler
  useEffect(() => { playerRef.current?.setSpeed(speed / 100); }, [speed, timeline]);
  useEffect(() => { if (playerRef.current) playerRef.current.metronome = metronome; }, [metronome, timeline]);
  useEffect(() => { if (playerRef.current) playerRef.current.countIn = countIn ? (timeline?.beatsPerMeasure ?? 4) : 0; }, [countIn, timeline]);
  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    p.mutedParts = new Set([...(rhOn ? [] : [0]), ...(lhOn ? [] : [1])]);
  }, [rhOn, lhOn, timeline]);

  const loopRange = useMemo(() => {
    if (!loopOn || !timeline) return null;
    const lo = Math.min(loopFrom, loopTo);
    const hi = Math.max(loopFrom, loopTo);
    const a = timeline.measures.find((m) => m.number === lo);
    const b = timeline.measures.find((m) => m.number === hi);
    return a && b ? { start: a.start, end: b.end } : null;
  }, [loopOn, loopFrom, loopTo, timeline]);

  useEffect(() => { playerRef.current?.setLoop(loopRange); }, [loopRange]);

  // Click/tap handler for notes — works with CSS-scaled SVG
  const handleNoteClick = useCallback((e: React.MouseEvent) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const osmd = osmdRef.current as any;
    if (!osmd) return;
    try {
      const svgEl = containerRef.current?.querySelector("svg") as SVGSVGElement | null;
      if (!svgEl) return;

      // Get the SVG's bounding rect (accounts for CSS transform: scale())
      const svgRect = svgEl.getBoundingClientRect();
      const svgW = parseFloat(svgEl.getAttribute("width") || "1");
      const svgH = parseFloat(svgEl.getAttribute("height") || "1");
      const scaleX = svgRect.width / svgW;
      const scaleY = svgRect.height / svgH;
      const svgX = (e.clientX - svgRect.left) / scaleX;
      const svgY = (e.clientY - svgRect.top) / scaleY;

      const clickedMidi = new Set<number>();
      let hitX: number | null = null;
      // Base hit-area in SVG units; scaled inversely with CSS zoom so taps
      // stay accurate on small screens. Keep small to avoid overlapping neighbours.
      const baseTolerance = 6;
      const tolerance = baseTolerance / Math.min(scaleX, scaleY, 1);
      for (const musicPage of osmd.GraphicSheet.MusicPages) {
        for (const system of musicPage.MusicSystems) {
          for (const staffLine of system.StaffLines) {
            for (const measure of staffLine.Measures) {
              for (const staffEntry of measure.staffEntries) {
                for (const gve of staffEntry.graphicalVoiceEntries) {
                  for (const gNote of gve.notes) {
                    if (gNote.sourceNote?.isRest()) continue;
                    const absPos = gNote.PositionAndShape?.AbsolutePosition;
                    if (!absPos) continue;
                    const noteX = absPos.x * 10;
                    const noteY = absPos.y * 10;
                    if (Math.abs(noteX - svgX) < tolerance * 3 && Math.abs(noteY - svgY) < tolerance) {
                      const halfTone = gNote.sourceNote?.halfTone;
                      if (halfTone !== undefined) clickedMidi.add(halfTone + 12);
                      hitX = noteX;
                    }
                  }
                }
              }
            }
          }
        }
      }
      if (clickedMidi.size > 0) {
        void unlockAudio().then(() => playChord([...clickedMidi], { duration: 1 }));
        setClickedNotes(clickedMidi);
        if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = setTimeout(() => setClickedNotes(new Set()), 2000);

        // Gepauzeerd: aangeklikte noot wordt het nieuwe startpunt.
        const player = playerRef.current;
        const tl = timelineRef.current;
        if (player && tl && !player.playing && hitX !== null) {
          const t = timeAtX(tl.steps, hitX, player.position());
          player.seek(t);
          placePlayline(xAtTime(tl.steps, t));
          lineMovedRef.current = false;
          const scroll = scrollRef.current;
          if (scroll) lineViewOffsetRef.current = xAtTime(tl.steps, t) * scaleRef.current - scroll.scrollLeft;
        }
      }
    } catch { /* ignore */ }
  }, [placePlayline]);

  useEffect(() => () => { if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current); }, []);

  const pausePlayback = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    player.pause();
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    setPlaying(false);
    clearHighlights();
    // Onthoud waar de lijn staat t.o.v. de viewport
    const line = playlineRef.current;
    const scroll = scrollRef.current;
    if (line && scroll) {
      lineViewOffsetRef.current = (parseFloat(line.style.left) || 0) - scroll.scrollLeft;
      lineMovedRef.current = false;
    }
  }, [clearHighlights]);

  const startPlayback = useCallback(async () => {
    const player = playerRef.current;
    const tl = timelineRef.current;
    if (!player || !tl) return;
    let from = player.position();
    // Lijn verschoven via scrollen tijdens pauze → start vanaf die plek
    const line = playlineRef.current;
    if (lineMovedRef.current && line && line.style.display !== "none") {
      from = timeAtX(tl.steps, (parseFloat(line.style.left) || 0) / scaleRef.current, from);
    }
    lineViewOffsetRef.current = null;
    lineMovedRef.current = false;
    if (from <= 0 && scrollRef.current) scrollRef.current.scrollLeft = 0;
    await player.play(from);
    setPlaying(true);
    startFrameLoop();
  }, [startFrameLoop]);

  const togglePlay = useCallback(() => {
    if (playerRef.current?.playing) pausePlayback();
    else void startPlayback();
  }, [pausePlayback, startPlayback]);

  // When paused, move the playline with the scroll so the user can reposition
  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    const handleScroll = () => {
      if (playerRef.current?.playing) return;
      const offset = lineViewOffsetRef.current;
      if (offset === null) return;
      const line = playlineRef.current;
      if (!line || line.style.display === "none") return;
      line.style.left = `${scroll.scrollLeft + offset}px`;
      lineMovedRef.current = true;
    };
    scroll.addEventListener("scroll", handleScroll);
    return () => scroll.removeEventListener("scroll", handleScroll);
  }, []);

  const resetPlayback = useCallback(() => {
    playerRef.current?.stop();
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    setPlaying(false);
    clearHighlights();
    setCurrentMeasure(null);
    lineViewOffsetRef.current = null;
    lineMovedRef.current = false;
    if (playlineRef.current) playlineRef.current.style.display = "none";
    if (scrollRef.current) scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
    setClickedNotes(new Set());
  }, [clearHighlights]);

  // Spatiebalk = afspelen/pauze (niet als de focus in een invoerveld of knop staat)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat || !timelineRef.current) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, button, [contenteditable]")) return;
      e.preventDefault();
      togglePlay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay]);

  const pressKey = useCallback((midi: number) => {
    void unlockAudio().then(() => playChord([midi], { duration: 0.9 }));
    setClickedNotes(new Set([midi]));
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => setClickedNotes(new Set()), 300);
  }, []);

  if (error) {
    return (
      <div className="rounded-lg bg-red-900/20 border border-red-800 p-4 text-red-300">
        <p className="font-medium">Fout bij laden notenbalk</p>
        <p className="text-sm mt-1 opacity-70">{error}</p>
      </div>
    );
  }

  const whiteKeyWidth = 100 / WHITE_KEYS.length;
  const keyClass = (midi: number, base: string) => {
    if (clickedNotes.has(midi)) return CLICK_KEY;
    const part = activeNotes.get(midi);
    if (part === 0) return RH_KEY;
    if (part === 1) return LH_KEY;
    return base;
  };

  const pianoKeyboard = (height: string) => (
    <div className={`relative ${height} bg-slate-950 rounded-lg border border-slate-700/50 overflow-hidden select-none touch-manipulation`}>
      {WHITE_KEYS.map((key, i) => (
        <div
          key={`w-${key.note}${key.octave}`}
          onPointerDown={(e) => { e.preventDefault(); pressKey(key.midi); }}
          className={`absolute top-0 bottom-0 border-r transition-colors duration-75 cursor-pointer ${keyClass(key.midi, "bg-slate-100 border-slate-300")}`}
          style={{ left: `${i * whiteKeyWidth}%`, width: `${whiteKeyWidth}%` }}
        >
          {key.label && (
            <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] pointer-events-none ${activeNotes.has(key.midi) ? "text-white" : "text-slate-400"}`}>
              {key.label}
            </span>
          )}
        </div>
      ))}
      {BLACK_KEYS.map((key) => {
        const baseNote = key.note.charAt(0);
        const whiteIdx = WHITE_KEYS.findIndex((w) => w.note === baseNote && w.octave === key.octave);
        if (whiteIdx < 0) return null;
        const left = (whiteIdx + 0.62) * whiteKeyWidth;
        return (
          <div
            key={`b-${key.note}${key.octave}`}
            onPointerDown={(e) => { e.preventDefault(); pressKey(key.midi); }}
            className={`absolute top-0 rounded-b-sm transition-colors duration-75 cursor-pointer ${keyClass(key.midi, "bg-slate-900")}`}
            style={{ left: `${left}%`, width: `${whiteKeyWidth * 0.7}%`, height: "58%", zIndex: 1 }}
          />
        );
      })}
    </div>
  );

  const measureNumbers = timeline?.measures.map((m) => m.number) ?? [];
  const bpmShown = timeline ? Math.round(timeline.bpm * (speed / 100)) : null;

  const controlsBar = () => (
    <div className="flex flex-col gap-1.5 px-1">
      <div className="flex items-center gap-1.5 flex-wrap">
        <button onClick={togglePlay} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium disabled:opacity-50 transition-colors" title="Afspelen/pauze (spatiebalk)">
          {playing ? (
            <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>{countingIn ? "Aftellen…" : "Pauze"}</>
          ) : (
            <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>Afspelen</>
          )}
        </button>
        <button onClick={resetPlayback} disabled={loading} className={`${btn} ${btnOff}`} title="Terug naar begin">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
        </button>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700">
          <span className="text-xs text-slate-400 tabular-nums w-14" title="Tempo (kwartnoten per minuut)">
            {bpmShown !== null ? `♩ = ${bpmShown}` : "♩"}
          </span>
          <input type="range" min={25} max={200} step={5} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-20 h-1 accent-blue-500" aria-label="Snelheid" />
          <span className="text-xs text-slate-500 w-9 text-right tabular-nums">{speed}%</span>
        </div>
        <button onClick={() => setMetronome((v) => !v)} className={`${btn} ${metronome ? btnOn : btnOff}`} title="Metronoom">
          Metronoom
        </button>
        <button onClick={() => setCountIn((v) => !v)} className={`${btn} ${countIn ? btnOn : btnOff}`} title="Eén maat aftellen voor het begin">
          Aftellen
        </button>
        {currentMeasure !== null && (
          <span className="text-xs text-slate-500 tabular-nums">Maat {currentMeasure}</span>
        )}
        <div className="flex items-center gap-1.5 ml-auto">
          <button onClick={() => setShowPiano(!showPiano)} className={`${btn} ${showPiano ? btnOn : btnOff}`}>
            Piano
          </button>
          {isFullscreen ? (
            <button onClick={exitFullscreen} className="px-2 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm transition-colors" title="Sluiten">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          ) : (
            <button onClick={enterFullscreen} disabled={loading} className={`${btn} ${btnOff} px-2`} title="Volledig scherm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" /></svg>
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap text-sm">
        <span className="text-xs text-slate-500">Handen:</span>
        <button onClick={() => setRhOn((v) => !v)} className={`${btn} py-1 ${rhOn ? "bg-blue-500/20 text-blue-300 border-blue-500/40" : btnOff + " line-through"}`} title="Rechterhand aan/uit">
          Rechts
        </button>
        <button onClick={() => setLhOn((v) => !v)} className={`${btn} py-1 ${lhOn ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" : btnOff + " line-through"}`} title="Linkerhand aan/uit">
          Links
        </button>
        <span className="w-px h-5 bg-slate-700 mx-1" />
        <button onClick={() => setLoopOn((v) => !v)} disabled={!timeline} className={`${btn} py-1 ${loopOn ? btnOn : btnOff}`} title="Een stuk herhalen">
          Herhaal
        </button>
        {loopOn && measureNumbers.length > 0 && (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            maat
            <select value={loopFrom} onChange={(e) => setLoopFrom(Number(e.target.value))} className="bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-slate-200">
              {measureNumbers.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            t/m
            <select value={loopTo} onChange={(e) => setLoopTo(Number(e.target.value))} className="bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-slate-200">
              {measureNumbers.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </span>
        )}
        {loading && <span className="text-sm text-slate-400 animate-pulse ml-2">Laden...</span>}
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        .fs-dialog {
          padding: 0; margin: 0; border: none;
          width: 100vw; max-width: 100vw;
          height: 100vh; max-height: 100vh;
          height: 100dvh; max-height: 100dvh;
          background: #020617;
          padding-left: env(safe-area-inset-left, 0px);
          padding-right: env(safe-area-inset-right, 0px);
          padding-top: calc(25px + env(safe-area-inset-top, 0px));
          padding-bottom: env(safe-area-inset-bottom, 0px);
          overflow: hidden;
        }
        .fs-dialog::backdrop { background: #020617; }
      `}</style>
      <div ref={wrapperRef}>
        <div ref={playerBoxRef} className={`${isFullscreen ? "bg-slate-950 flex flex-col w-full h-full p-0.5 gap-0.5" : "space-y-2"}`}>
          {controlsBar()}
          {showPiano && pianoKeyboard(isFullscreen ? "h-14 sm:h-20" : "h-20")}
          <div
            ref={scrollRef}
            onClick={handleNoteClick}
            className={`relative overflow-x-auto overflow-y-hidden cursor-pointer ${isFullscreen ? "flex-1 border-0" : "rounded-lg border border-slate-700/50"}`}
            style={{ minHeight: loading ? 200 : "auto" }}
          >
            <div ref={containerRef} />
            {/* Playline — volgt de werkelijke nootposities in het tempo van het stuk */}
            <div
              ref={playlineRef}
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{
                display: "none",
                width: "2px",
                background: "linear-gradient(to bottom, transparent 5%, #ef4444 15%, #ef4444 85%, transparent 95%)",
                zIndex: 10,
                left: 0,
              }}
            />
          </div>
          {!isFullscreen && (
            <p className="text-[11px] text-slate-600 px-1">
              Tik op een noot om hem te horen en daar te beginnen · spatiebalk = afspelen/pauze · scroll tijdens pauze om de rode lijn te verplaatsen
            </p>
          )}
        </div>
      </div>
      <dialog ref={dialogRef} className="fs-dialog" />
    </>
  );
}
