"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { normalizePianoXml } from "@/lib/xml-utils";

interface OsmdRendererProps {
  musicXml: string;
  fromMeasure?: number;
  toMeasure?: number;
}

interface PianoKey {
  note: string;
  octave: number;
  isBlack: boolean;
  midi: number;
  label?: string;
}

// Measure position extracted from rendered SVG barlines
interface MeasurePos {
  startX: number;
  endX: number;
  width: number;
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

// Post-render fix: move bass staff rests to the top line.
// Uses barline rects to determine bass staff position, then shifts rest-colored
// SVG paths that are in the lower half of the bass staff up to the top line.
function fixDisplacedRests(_osmd: unknown, svgEl: SVGSVGElement) {
  // Find bass staff top Y from barline rects.
  // Barlines are 1px-wide, ~41px-tall rects. Treble barlines start at ~85,
  // bass barlines start at ~195. We need the highest bass barline Y.
  const rects = svgEl.querySelectorAll("rect");
  let trebleBarY = Infinity;
  let bassBarY = -Infinity;
  for (const r of rects) {
    const w = parseFloat(r.getAttribute("width") || "0");
    const h = parseFloat(r.getAttribute("height") || "0");
    if (w <= 2 && h > 30 && h < 60) {
      const y = parseFloat(r.getAttribute("y") || "0");
      trebleBarY = Math.min(trebleBarY, y);
      bassBarY = Math.max(bassBarY, y);
    }
  }

  if (bassBarY <= trebleBarY) return;

  // Bass staff: top line = bassBarY, bottom line = bassBarY + barHeight
  const bassTopLine = bassBarY;
  const bassStaffHeight = 41; // 5 lines, 4 spaces of ~10px

  // Find the X boundary of measure 12: the 12th barline marks the end of measure 12.
  // Barlines are 1px-wide tall rects sorted by X position.
  const barlineXs: number[] = [];
  for (const r of rects) {
    const w = parseFloat(r.getAttribute("width") || "0");
    const h = parseFloat(r.getAttribute("height") || "0");
    if (w <= 2 && h > 30 && h < 60) {
      barlineXs.push(parseFloat(r.getAttribute("x") || "0"));
    }
  }
  const uniqueBarXs = [...new Set(barlineXs.map(x => Math.round(x)))].sort((a, b) => a - b);
  // The 12th unique barline X is the right edge of measure 12
  const maxX = uniqueBarXs.length >= 12 ? uniqueBarXs[11] + 5 : Infinity;

  // Move rest-colored paths (#64748b) in the bass staff to the top line.
  // Only for the first 12 measures (multi-voice section).
  // Filter: must be complex path (dLen > 500) to avoid moving stems/simple elements.
  const restColor = "#64748b";
  const paths = svgEl.querySelectorAll("path");
  for (const p of paths) {
    if (p.getAttribute("fill") !== restColor) continue;
    const d = p.getAttribute("d") || "";
    if (d.length < 500) continue; // Skip simple paths (stems, etc.)
    const match = d.match(/^M([\d.e+-]+)[\s,]+([\d.e+-]+)/);
    if (!match) continue;
    const px = parseFloat(match[1]);
    const py = parseFloat(match[2]);

    // Only first 12 measures
    if (px > maxX) continue;

    // Target rest paths in the bass staff area (from just below top line to below bottom)
    if (py < bassTopLine + 3 || py > bassTopLine + bassStaffHeight + 15) continue;

    // Shift up to sit on the bass top line
    const delta = bassTopLine - py;
    if (Math.abs(delta) > 1) {
      p.setAttribute("transform", `translate(0, ${delta})`);
    }
  }

  // Fix bass fermata in measure 12: the fermata is a complex glyph path
  // (24 C-curves, fill=#60a5fa) that sits just above the bass staff (y≈190).
  // Move it slightly upward so it doesn't crowd the staff.
  const m12StartX = uniqueBarXs.length >= 11 ? uniqueBarXs[10] : 0;
  const m12EndX = uniqueBarXs.length >= 12 ? uniqueBarXs[11] : 0;
  if (m12StartX > 0 && m12EndX > 0) {
    for (const p of paths) {
      if (p.getAttribute("fill") !== "#60a5fa") continue;
      const d = p.getAttribute("d") || "";
      const cCount = (d.match(/C/g) || []).length;
      // Fermata glyph has ~24 C-curves and is a large path (dLen > 1800)
      if (cCount < 20 || cCount > 28 || d.length < 1800) continue;
      const match = d.match(/^M([\d.e+-]+)[\s,]+([\d.e+-]+)/);
      if (!match) continue;
      const px = parseFloat(match[1]);
      const py = parseFloat(match[2]);
      // Must be within measure 12 X range and near the bass staff top
      if (px < m12StartX || px > m12EndX) continue;
      if (py < bassTopLine - 20 || py > bassTopLine + 5) continue;
      // Shift upward by 10px
      p.setAttribute("transform", "translate(0, -10)");
    }
  }
}

// Extract barline X positions from the rendered SVG to get measure boundaries
function extractMeasurePositions(svgEl: SVGSVGElement): MeasurePos[] {
  const rects = svgEl.querySelectorAll("rect");
  const xs = new Set<number>();

  for (const r of rects) {
    const w = parseFloat(r.getAttribute("width") || "0");
    const h = parseFloat(r.getAttribute("height") || "0");
    // Barlines: very narrow rects (width ≤ 2) that are tall (height > 30)
    if (w <= 2 && h > 30) {
      xs.add(Math.round(parseFloat(r.getAttribute("x") || "0") * 100) / 100);
    }
  }

  const sorted = [...xs].sort((a, b) => a - b);
  const measures: MeasurePos[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const startX = sorted[i];
    const endX = sorted[i + 1];
    measures.push({ startX, endX, width: endX - startX });
  }

  return measures;
}

export default function OsmdRenderer({ musicXml, fromMeasure, toMeasure }: OsmdRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<unknown>(null);
  const playlineRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);
  const [speed, setSpeed] = useState(100);
  const speedRef = useRef(100);
  const [showPiano, setShowPiano] = useState(false);
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const [clickedNotes, setClickedNotes] = useState<Set<number>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Measure-based playback state
  const measuresRef = useRef<MeasurePos[]>([]);
  const playbackRef = useRef<{
    measureIndex: number;
    measureStartTime: number;
    msPerMeasure: number;
  } | null>(null);

  // Fullscreen via <dialog> — works on all browsers including iOS Safari.
  // The player DOM node is moved into the dialog when entering fullscreen,
  // and moved back when exiting. This preserves the OSMD-rendered SVG.
  const dialogRef = useRef<HTMLDialogElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Scale the OSMD SVG so the full grand staff fits the available height
  const scaleScoreToFit = useCallback(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    const svg = scroll.querySelector("svg");
    if (!svg) return;
    const svgH = parseFloat(svg.getAttribute("height") || "0");
    if (svgH <= 0) return;
    const availH = scroll.clientHeight;
    if (availH <= 0 || availH >= svgH) {
      // Enough space — remove any scaling
      svg.style.transform = "";
      svg.style.transformOrigin = "";
      return;
    }
    const scale = availH / svgH;
    svg.style.transform = `scale(${scale})`;
    svg.style.transformOrigin = "top left";
  }, []);

  const enterFullscreen = useCallback(() => {
    const dialog = dialogRef.current;
    const player = playerRef.current;
    if (!dialog || !player) return;
    dialog.appendChild(player);
    dialog.showModal();
    setIsFullscreen(true);
    history.pushState({ fullscreen: true }, "");
    try { screen.orientation?.lock?.("landscape").catch(() => {}); } catch {}
    // Scale score after layout settles
    requestAnimationFrame(() => requestAnimationFrame(scaleScoreToFit));
  }, [scaleScoreToFit]);

  const exitFullscreen = useCallback(() => {
    const dialog = dialogRef.current;
    const player = playerRef.current;
    const wrapper = wrapperRef.current;
    if (!player || !wrapper) return;
    // Remove scaling before moving back
    const svg = scrollRef.current?.querySelector("svg");
    if (svg) { svg.style.transform = ""; svg.style.transformOrigin = ""; }
    dialog?.close();
    wrapper.appendChild(player);
    setIsFullscreen(false);
    try { screen.orientation?.unlock?.(); } catch {}
  }, []);

  // Handle dialog close (Escape key) and mobile back-button
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      const player = playerRef.current;
      const wrapper = wrapperRef.current;
      // Remove SVG scaling
      const svg = scrollRef.current?.querySelector("svg");
      if (svg) { svg.style.transform = ""; svg.style.transformOrigin = ""; }
      if (player && wrapper) wrapper.appendChild(player);
      setIsFullscreen(false);
      try { screen.orientation?.unlock?.(); } catch {}
    };
    dialog.addEventListener("close", handleClose);

    const handlePopState = () => {
      if (dialog.open) {
        dialog.close();
        // handleClose fires automatically via the close event
      }
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      dialog.removeEventListener("close", handleClose);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

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

  // Keep speedRef in sync
  useEffect(() => { speedRef.current = speed; }, [speed]);

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
          // No alignRests — OSMD default positioning works for treble staff
          followCursor: false,
          cursorsOptions: [{ type: 0, color: "#3b82f600", alpha: 0 }],
          ...(fromMeasure !== undefined && { drawFromMeasureNumber: fromMeasure }),
          ...(toMeasure !== undefined && { drawUpToMeasureNumber: toMeasure }),
        };

        const osmd = new OpenSheetMusicDisplay(containerRef.current, options);
        // Normalize XML structure (merge split piano parts, fix measure numbers, clef lines)
        const normalizedXml = normalizePianoXml(musicXml);
        await osmd.load(normalizedXml);
        osmd.render();

        if (scrollRef.current) scrollRef.current.scrollLeft = 0;

        // Post-render: fix displaced bass rests and extract measure positions
        const svgEl = containerRef.current.querySelector("svg");
        if (svgEl) {
          fixDisplacedRests(osmd, svgEl);
          measuresRef.current = extractMeasurePositions(svgEl);
        }

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
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      playingRef.current = false;
      containerRef.current?.removeEventListener("click", handleNoteClick);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicXml, fromMeasure, toMeasure]);

  // Click handler for notes
  const handleNoteClick = useCallback((e: Event) => {
    const mouseEvent = e as MouseEvent;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const osmd = osmdRef.current as any;
    if (!osmd) return;
    const target = mouseEvent.target as Element;
    if (!target) return;
    try {
      const svgEl = containerRef.current?.querySelector("svg");
      if (!svgEl) return;
      const pt = svgEl.createSVGPoint();
      pt.x = mouseEvent.clientX;
      pt.y = mouseEvent.clientY;
      const svgPt = pt.matrixTransform(svgEl.getScreenCTM()?.inverse());
      const clickedMidi = new Set<number>();
      const tolerance = 8;
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
                    if (Math.abs(noteX - svgPt.x) < tolerance * 3 && Math.abs(noteY - svgPt.y) < tolerance) {
                      const halfTone = gNote.sourceNote?.halfTone;
                      if (halfTone !== undefined) clickedMidi.add(halfTone + 12);
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
    } catch { /* ignore */ }
  }, []);

  // ── Measure-based playback with requestAnimationFrame ──
  // Each measure takes exactly the same musical time (4 beats in 4/4).
  // The scroll speed adapts per measure based on its pixel width.

  const calcMsPerMeasure = useCallback(() => {
    // 4/4 time = 4 beats per measure. BPM = 80 base.
    const bpm = 80;
    const beatsPerMeasure = 4;
    return (beatsPerMeasure * 60000 / bpm) / (speedRef.current / 100);
  }, []);

  const animateFrame = useCallback((now: number) => {
    if (!playingRef.current) return;

    const pb = playbackRef.current;
    const measures = measuresRef.current;
    const scroll = scrollRef.current;
    const line = playlineRef.current;

    if (!pb || !scroll || !line || measures.length === 0) return;

    // How far into the current measure are we?
    const elapsed = now - pb.measureStartTime;
    // Recalculate msPerMeasure each frame so speed changes take effect immediately
    const msPerMeasure = calcMsPerMeasure();
    const t = Math.min(elapsed / msPerMeasure, 1);

    const measure = measures[pb.measureIndex];
    if (!measure) { stopPlayback(); return; }

    // Linear interpolation within the current measure
    const currentX = measure.startX + (measure.endX - measure.startX) * t;

    // Position playline
    line.style.left = `${currentX}px`;
    line.style.display = "block";

    // Smooth scroll: keep playline at ~1/3 from left edge
    const viewWidth = scroll.clientWidth;
    const targetScroll = currentX - viewWidth / 3;
    scroll.scrollLeft += (targetScroll - scroll.scrollLeft) * 0.06;

    // If measure is complete, advance to next
    if (t >= 1) {
      const nextIdx = pb.measureIndex + 1;
      if (nextIdx >= measures.length) {
        stopPlayback();
        return;
      }
      playbackRef.current = {
        measureIndex: nextIdx,
        measureStartTime: now,
        msPerMeasure,
      };
    }

    rafRef.current = requestAnimationFrame(animateFrame);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calcMsPerMeasure]);

  const stopPlayback = useCallback(() => {
    playingRef.current = false;
    playbackRef.current = null;
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    setPlaying(false);
    setActiveNotes(new Set());
    if (playlineRef.current) playlineRef.current.style.display = "none";
  }, []);

  const togglePlay = useCallback(() => {
    if (playing) {
      stopPlayback();
    } else {
      const measures = measuresRef.current;
      if (measures.length === 0) return;

      playingRef.current = true;
      setPlaying(true);

      // Start from first measure
      playbackRef.current = {
        measureIndex: 0,
        measureStartTime: performance.now(),
        msPerMeasure: calcMsPerMeasure(),
      };

      if (scrollRef.current) scrollRef.current.scrollLeft = 0;

      rafRef.current = requestAnimationFrame(animateFrame);
    }
  }, [playing, stopPlayback, calcMsPerMeasure, animateFrame]);

  const resetPlayback = useCallback(() => {
    stopPlayback();
    if (scrollRef.current) scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
    setClickedNotes(new Set());
  }, [stopPlayback]);


  if (error) {
    return (
      <div className="rounded-lg bg-red-900/20 border border-red-800 p-4 text-red-300">
        <p className="font-medium">Fout bij laden notenbalk</p>
        <p className="text-sm mt-1 opacity-70">{error}</p>
      </div>
    );
  }

  const highlightedNotes = new Set([...activeNotes, ...clickedNotes]);
  const whiteKeys = PIANO_KEYS.filter((k) => !k.isBlack);
  const whiteKeyWidth = 100 / whiteKeys.length;

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
              <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] ${isActive ? "text-white" : "text-slate-400"}`}>
                {key.label}
              </span>
            )}
          </div>
        );
      })}
      {PIANO_KEYS.filter((k) => k.isBlack).map((key) => {
        const isActive = highlightedNotes.has(key.midi);
        const baseNote = key.note.charAt(0);
        const whiteIdx = whiteKeys.findIndex((w) => w.note === baseNote && w.octave === key.octave);
        if (whiteIdx < 0) return null;
        const left = (whiteIdx + 0.62) * whiteKeyWidth;
        return (
          <div
            key={`b-${key.note}${key.octave}`}
            className={`absolute top-0 rounded-b-sm transition-colors duration-75 ${isActive ? "bg-blue-400" : "bg-slate-900"}`}
            style={{ left: `${left}%`, width: `${whiteKeyWidth * 0.7}%`, height: "58%", zIndex: 1 }}
          />
        );
      })}
    </div>
  );

  const controlsBar = () => (
    <div className="flex items-center gap-1.5 flex-wrap px-1">
      <button onClick={togglePlay} disabled={loading} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium disabled:opacity-50 transition-colors">
        {playing ? (
          <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>Pauze</>
        ) : (
          <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>Afspelen</>
        )}
      </button>
      <button onClick={resetPlayback} disabled={loading} className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm disabled:opacity-50 transition-colors">
        Reset
      </button>
      <div className="flex items-center gap-1.5 ml-auto">
        <span className="text-xs text-slate-500 hidden sm:inline">Snelheid:</span>
        <input type="range" min={25} max={200} step={25} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-16 h-1 accent-blue-500" />
        <span className="text-xs text-slate-400 w-8 text-right">{speed}%</span>
      </div>
      <button onClick={() => setShowPiano(!showPiano)} className={`px-2.5 py-1.5 rounded-lg text-sm transition-colors ${showPiano ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}`}>
        Piano
      </button>
      {isFullscreen ? (
        <button onClick={exitFullscreen} className="px-2 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors" title="Sluiten">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      ) : (
        <button onClick={enterFullscreen} disabled={loading} className="px-2 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm disabled:opacity-50 transition-colors" title="Volledig scherm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" /></svg>
        </button>
      )}
      {loading && <span className="text-sm text-slate-400 animate-pulse">Laden...</span>}
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
          padding-top: env(safe-area-inset-top, 0px);
          padding-bottom: env(safe-area-inset-bottom, 0px);
          overflow: hidden;
        }
        .fs-dialog::backdrop { background: #020617; }
      `}</style>
      <div ref={wrapperRef}>
        <div ref={playerRef} className={`${isFullscreen ? "bg-slate-950 flex flex-col w-full h-full p-1 gap-1" : "space-y-2"}`}>
          {controlsBar()}
          {showPiano && pianoKeyboard(isFullscreen ? "h-14 sm:h-20" : "h-20")}
          <div
            ref={scrollRef}
            className={`relative overflow-x-auto overflow-y-hidden cursor-pointer ${isFullscreen ? "flex-1 border-0" : "rounded-lg border border-slate-700/50"}`}
            style={{ minHeight: loading ? 200 : "auto" }}
          >
            <div ref={containerRef} />
            {/* Playline — thin vertical red line that glides over the score at measure-tempo */}
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
        </div>
      </div>
      <dialog ref={dialogRef} className="fs-dialog" />
    </>
  );
}
