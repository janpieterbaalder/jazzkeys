/**
 * Tijdlijn van een stuk: welke noot klinkt wanneer, en waar staat die op het
 * scherm. Alle tijden zijn in seconden bij 100% snelheid.
 *
 * - `buildOsmdTimeline` leest een gerenderd OpenSheetMusicDisplay-stuk uit
 *   (echte nootlengtes, overbindingen, tempo-aanduidingen, herhalingen).
 * - `buildMaatNotenTimeline` doet hetzelfde voor de MaatData van de Claude-analyse.
 * - De overige functies zijn pure helpers (getest in score-timeline.test.ts).
 */

import type { MaatData, NootData } from "@/lib/analyse-schema";
import { parseNote } from "@/lib/piano-utils";

export const DEFAULT_BPM = 80;

export interface TimelineNote {
  midi: number;
  start: number;
  duration: number;
  /** 0 = rechterhand / bovenste balk, 1 = linkerhand / onderste balk */
  part: number;
  /** Optionele verwijzing naar de bron (bijv. NootData) voor highlighting. */
  ref?: unknown;
}

export interface TimelineBeat {
  time: number;
  accent: boolean;
}

export interface TimelineStep {
  time: number;
  x: number;
  /** x waar de afspeellijn naartoe glijdt tot de volgende stap */
  nextX: number;
  nextTime: number;
}

export interface TimelineMeasure {
  number: number;
  start: number;
  end: number;
}

export interface Timeline {
  notes: TimelineNote[];
  beats: TimelineBeat[];
  steps: TimelineStep[];
  /** Eerste keer dat elke maat klinkt (voor herhaal-selectie) */
  measures: TimelineMeasure[];
  duration: number;
  bpm: number;
  beatsPerMeasure: number;
}

// ─── Pure helpers ────────────────────────────────────────────────

function lastIndexAtOrBefore<T>(items: T[], value: number, key: (t: T) => number): number {
  let lo = 0;
  let hi = items.length - 1;
  let result = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (key(items[mid]) <= value) {
      result = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return result;
}

/** Index van de eerste noot met start >= time (notes gesorteerd op start). */
export function firstNoteIndexAt(notes: { start: number }[], time: number): number {
  let lo = 0;
  let hi = notes.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (notes[mid].start < time - 1e-6) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function firstBeatIndexAt(beats: TimelineBeat[], time: number): number {
  let lo = 0;
  let hi = beats.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (beats[mid].time < time - 1e-6) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Horizontale positie van de afspeellijn op tijdstip `time`. */
export function xAtTime(steps: TimelineStep[], time: number): number {
  if (steps.length === 0) return 0;
  const i = lastIndexAtOrBefore(steps, time, (s) => s.time);
  if (i < 0) return steps[0].x;
  const s = steps[i];
  const span = s.nextTime - s.time;
  const t = span > 0 ? Math.min(1, (time - s.time) / span) : 0;
  return s.x + (s.nextX - s.x) * t;
}

/**
 * Tijdstip dat hoort bij een x-positie. Bij herhalingen komt een x meerdere
 * keren voor; dan wint de keer die het dichtst bij `near` ligt.
 */
export function timeAtX(steps: TimelineStep[], x: number, near = 0): number {
  let best: number | null = null;
  for (const s of steps) {
    const lo = Math.min(s.x, s.nextX);
    const hi = Math.max(s.x, s.nextX);
    if (x < lo || x > hi) continue;
    const span = s.nextX - s.x;
    const t = span !== 0 ? (x - s.x) / span : 0;
    const time = s.time + (s.nextTime - s.time) * t;
    if (best === null || Math.abs(time - near) < Math.abs(best - near)) best = time;
  }
  if (best !== null) return best;
  if (steps.length === 0 || x <= steps[0].x) return 0;
  return steps[steps.length - 1].time;
}

/** Noten die op tijdstip `time` klinken. */
export function notesSoundingAt<T extends { start: number; duration: number }>(
  notes: T[],
  time: number
): T[] {
  const result: T[] = [];
  // Eerste index met start > time (upper bound)
  let lo = 0;
  let hi = notes.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (notes[mid].start <= time + 1e-9) lo = mid + 1;
    else hi = mid;
  }
  for (let i = lo - 1; i >= 0; i--) {
    const n = notes[i];
    // Aanname: geen enkele noot is langer dan 30 s — begrenst de terugwaartse scan.
    if (time - n.start > 30) break;
    if (n.start <= time && time < n.start + n.duration) result.push(n);
  }
  return result;
}

/** Haal een BPM-getal uit een vrije tekst als "♩ = 92", "Andante (76)" of "Swing 120". */
export function parseTempo(text: string | undefined | null): number | null {
  if (!text) return null;
  const match = text.match(/(\d{2,3})/);
  if (!match) return null;
  const bpm = parseInt(match[1], 10);
  return bpm >= 20 && bpm <= 320 ? bpm : null;
}

/** "kwart_met_punt" → 1.5 (in kwartnoten). */
export function duurInKwarten(duur: string): number {
  const dotted = duur.includes("punt");
  const base = duur.replace(/_met_punt|_punt|punt/g, "").replace(/_$/, "");
  const lengths: Record<string, number> = {
    heel: 4,
    half: 2,
    kwart: 1,
    achtste: 0.5,
    zestiende: 0.25,
    tweeendertigste: 0.125,
  };
  const len = lengths[base] ?? 1;
  return dotted ? len * 1.5 : len;
}

export function parseMaatsoort(maatsoort?: string): { beats: number; unit: number } {
  const match = maatsoort?.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) return { beats: 4, unit: 4 };
  const beats = parseInt(match[1], 10);
  const unit = parseInt(match[2], 10);
  return {
    beats: beats > 0 && beats <= 32 ? beats : 4,
    unit: [1, 2, 4, 8, 16].includes(unit) ? unit : 4,
  };
}

function isRust(noot: NootData): boolean {
  return noot.type === "rust" || noot.noot === "rust";
}

// ─── Claude MaatData → tijdlijn ──────────────────────────────────

export function buildMaatNotenTimeline(
  maatNoten: MaatData[],
  maatsoort?: string,
  bpm: number = DEFAULT_BPM
): Timeline {
  const { beats: beatsPerMeasure, unit } = parseMaatsoort(maatsoort);
  // `beatPositie` telt in de eenheid van de maatsoort; bpm geldt voor die eenheid.
  const secPerBeat = 60 / bpm;
  const beatsPerQuarter = unit / 4;
  const notes: TimelineNote[] = [];
  const beats: TimelineBeat[] = [];
  const measures: TimelineMeasure[] = [];

  maatNoten.forEach((maat, mi) => {
    const measureStart = mi * beatsPerMeasure * secPerBeat;
    measures.push({
      number: maat.maatNummer,
      start: measureStart,
      end: measureStart + beatsPerMeasure * secPerBeat,
    });
    for (let b = 0; b < beatsPerMeasure; b++) {
      beats.push({ time: measureStart + b * secPerBeat, accent: b === 0 });
    }

    for (const noot of maat.noten) {
      if (isRust(noot)) continue;
      let midi: number;
      try {
        midi = parseNote(noot.noot).midi;
      } catch {
        continue;
      }
      const beatOffset = Math.max(0, (noot.beatPositie || 1) - 1);
      const start = measureStart + beatOffset * secPerBeat;
      const duration = duurInKwarten(noot.duur) * beatsPerQuarter * secPerBeat;
      notes.push({ midi, start, duration, part: noot.hand === "links" ? 1 : 0, ref: noot });
    }
  });

  // Overbindingen: verleng de eerste noot en laat de vervolgnoot niet opnieuw aanslaan.
  notes.sort((a, b) => a.start - b.start || a.midi - b.midi);
  const merged: TimelineNote[] = [];
  const consumed = new Set<TimelineNote>();
  for (const n of notes) {
    if (consumed.has(n)) continue;
    let current = n;
    let end = n.start + n.duration;
    while ((current.ref as NootData | undefined)?.verbinding === "overbinding") {
      const next = notes.find(
        (m) =>
          !consumed.has(m) &&
          m !== current &&
          m.midi === current.midi &&
          m.part === current.part &&
          Math.abs(m.start - end) < 0.02
      );
      if (!next) break;
      consumed.add(next);
      end = next.start + next.duration;
      current = next;
    }
    merged.push({ ...n, duration: end - n.start });
  }

  const duration = Math.max(
    measures.length ? measures[measures.length - 1].end : 0,
    ...merged.map((n) => n.start + n.duration)
  );

  return { notes: merged, beats, steps: [], measures, duration, bpm, beatsPerMeasure };
}

// ─── OpenSheetMusicDisplay → tijdlijn ────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
interface RawStep {
  w: number; // tijd in hele noten (doorlopend, inclusief herhalingen)
  x: number;
  bpm: number;
}

/**
 * Leest het gerenderde OSMD-stuk uit. `barlineXs` (gesorteerde x-posities van
 * maatstrepen in SVG-pixels) bepaalt waar de afspeellijn aan het eind van een
 * maat naartoe glijdt.
 */
export function buildOsmdTimeline(
  osmd: any,
  barlineXs: number[],
  fallbackBpm = DEFAULT_BPM
): Timeline {
  const sheet = osmd.Sheet;
  const rules = osmd.EngravingRules;
  const hasBpm = Boolean(sheet?.HasBPMInfo);
  const clampBpm = (v: unknown) => {
    const n = typeof v === "number" && isFinite(v) ? v : fallbackBpm;
    return Math.max(20, Math.min(320, n));
  };
  const startBpm = hasBpm ? clampBpm(sheet.DefaultStartTempoInBpm) : fallbackBpm;

  const rawSteps: RawStep[] = [];
  const rawNotes: { midi: number; w: number; dw: number; part: number }[] = [];
  const rawMeasures: { number: number; w: number; dw: number; beatW: number; beats: number }[] = [];

  const it = sheet.MusicPartManager.getIterator();
  let lastMeasureIndex = -1;
  let safety = 0;
  while (!it.EndReached && safety++ < 200000) {
    const w: number = it.CurrentEnrolledTimestamp.RealValue;
    const bpm = hasBpm ? clampBpm(it.CurrentBpm) : fallbackBpm;
    const measureIndex: number = it.CurrentMeasureIndex;

    if (measureIndex !== lastMeasureIndex || it.JumpOccurred) {
      const m = it.CurrentMeasure;
      const rel: number = it.CurrentRelativeInMeasureTimestamp?.RealValue ?? 0;
      const ts = m?.ActiveTimeSignature;
      const denom: number = ts?.Denominator ?? 4;
      rawMeasures.push({
        number: m?.MeasureNumber ?? measureIndex + 1,
        w: w - rel,
        dw: m?.Duration?.RealValue ?? 1,
        beatW: denom >= 2 ? 1 / denom : 1 / 4,
        beats: denom >= 2 ? (ts?.Numerator ?? 4) : Math.round((m?.Duration?.RealValue ?? 1) * 4),
      });
      lastMeasureIndex = measureIndex;
    }

    let x = Infinity;
    for (const ve of it.CurrentVoiceEntries ?? []) {
      if (ve.IsGrace) continue;
      const staffId: number = ve.ParentSourceStaffEntry?.ParentStaff?.idInMusicSheet ?? 0;
      for (const note of ve.Notes ?? []) {
        const gNote = rules?.GNote?.(note);
        const absX = gNote?.PositionAndShape?.AbsolutePosition?.x;
        if (typeof absX === "number") x = Math.min(x, absX * 10);
        if (note.isRest()) continue;
        let dw: number = note.Length?.RealValue ?? 0.25;
        const tie = note.NoteTie;
        if (tie) {
          if (tie.StartNote !== note) continue; // vervolg van een overbinding: niet opnieuw aanslaan
          dw = tie.Duration?.RealValue ?? dw;
        }
        if (typeof note.halfTone !== "number") continue;
        rawNotes.push({ midi: note.halfTone + 12, w, dw, part: staffId === 0 ? 0 : 1 });
      }
    }
    if (isFinite(x)) rawSteps.push({ w, x, bpm });
    else if (rawSteps.length) rawSteps.push({ w, x: rawSteps[rawSteps.length - 1].x, bpm });
    it.moveToNext();
  }

  // Tempo-kaart: hele noten → seconden (bpm in kwartnoten).
  const anchors: { w: number; s: number; bpm: number }[] = [];
  for (const step of rawSteps) {
    const prev = anchors[anchors.length - 1];
    if (!prev) anchors.push({ w: step.w, s: 0, bpm: step.bpm });
    else if (step.bpm !== prev.bpm || step.w < prev.w) {
      anchors.push({ w: step.w, s: prev.s + (step.w - prev.w) * (240 / prev.bpm), bpm: step.bpm });
    }
  }
  if (anchors.length === 0) anchors.push({ w: 0, s: 0, bpm: startBpm });
  const toSec = (w: number) => {
    const i = Math.max(0, lastIndexAtOrBefore(anchors, w, (a) => a.w));
    const a = anchors[i];
    return a.s + (w - a.w) * (240 / a.bpm);
  };

  const notes: TimelineNote[] = rawNotes
    .map((n) => {
      const start = toSec(n.w);
      return { midi: n.midi, start, duration: Math.max(0.05, toSec(n.w + n.dw) - start), part: n.part };
    })
    .sort((a, b) => a.start - b.start || a.midi - b.midi);

  const beats: TimelineBeat[] = [];
  const seenMeasures = new Set<number>();
  const measures: TimelineMeasure[] = [];
  for (const m of rawMeasures) {
    const count = Math.max(1, Math.round(m.dw / m.beatW));
    for (let k = 0; k < count; k++) {
      beats.push({ time: toSec(m.w + k * m.beatW), accent: k === 0 });
    }
    if (!seenMeasures.has(m.number)) {
      seenMeasures.add(m.number);
      measures.push({ number: m.number, start: toSec(m.w), end: toSec(m.w + m.dw) });
    }
  }

  const lastMeasure = rawMeasures[rawMeasures.length - 1];
  const duration = Math.max(
    lastMeasure ? toSec(lastMeasure.w + lastMeasure.dw) : 0,
    ...notes.map((n) => n.start + n.duration)
  );

  const sortedBars = [...barlineXs].sort((a, b) => a - b);
  const barAfter = (x: number) => sortedBars.find((b) => b > x + 1) ?? x + 30;
  const steps: TimelineStep[] = rawSteps.map((s, i) => {
    const next = rawSteps[i + 1];
    const time = toSec(s.w);
    const nextTime = next ? toSec(next.w) : duration;
    const nextX = next && next.x > s.x ? next.x : barAfter(s.x);
    return { time, x: s.x, nextX, nextTime };
  });

  // Maatsoort van de eerste volle maat (een opmaat is korter).
  const fullMeasure = rawMeasures.find((m) => Math.abs(m.dw - m.beats * m.beatW) < 1e-6) ?? rawMeasures[0];
  const beatsPerMeasure = fullMeasure ? Math.max(1, fullMeasure.beats) : 4;

  return { notes, beats, steps, measures, duration, bpm: startBpm, beatsPerMeasure };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
