/**
 * Speelt een Timeline af via de Web Audio-engine.
 *
 * Werkt met een "lookahead"-scheduler: elke 25 ms worden de noten ingepland
 * die in de komende 150 ms beginnen. Daardoor is de timing sample-nauwkeurig,
 * ook als de main thread even hapert.
 *
 * Positie wordt bijgehouden als reeks segmenten (audio-tijd ↔ stuk-tijd),
 * zodat snelheidswissels en herhalingen naadloos verlopen.
 */

import { getAudioContext, playClick, playNote, stopAll, unlockAudio } from "@/lib/audio";
import { firstBeatIndexAt, firstNoteIndexAt, type Timeline } from "@/lib/score-timeline";

const LOOKAHEAD = 0.15;
const TICK_MS = 25;
const START_DELAY = 0.08;

interface Segment {
  /** AudioContext-tijd waarop dit segment begint */
  audio: number;
  /** Positie in het stuk (s) op dat moment */
  pos: number;
  speed: number;
}

export interface LoopRange {
  start: number;
  end: number;
}

export class ScorePlayer {
  speed = 1;
  metronome = false;
  /** Aantal tellen aftellen voor het begin (0 = uit) */
  countIn = 0;
  mutedParts = new Set<number>();
  onEnded: (() => void) | null = null;

  private loop: LoopRange | null = null;
  private segments: Segment[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private noteIndex = 0;
  private beatIndex = 0;
  private _playing = false;
  private pausedAt = 0;

  constructor(private timeline: Timeline) {}

  get playing() {
    return this._playing;
  }

  get duration() {
    return this.timeline.duration;
  }

  setTimeline(timeline: Timeline) {
    const wasPlaying = this._playing;
    const pos = this.position();
    this.stop();
    this.timeline = timeline;
    if (wasPlaying) void this.play(Math.min(pos, timeline.duration));
  }

  setLoop(loop: LoopRange | null) {
    this.loop = loop && loop.end > loop.start ? loop : null;
    if (this._playing && this.loop) {
      const pos = this.position();
      if (pos < this.loop.start || pos > this.loop.end) {
        void this.play(this.loop.start, { countIn: false });
      }
    }
  }

  setSpeed(speed: number) {
    this.speed = Math.max(0.1, Math.min(3, speed));
    // Herstart vanaf de huidige positie: eenvoudiger en robuuster dan segmenten
    // herschrijven terwijl er al noten in de lookahead staan.
    if (this._playing && !this.isCountingIn()) {
      void this.play(this.position(), { countIn: false });
    } else if (this._playing && this.segments.length === 1) {
      this.segments[0].speed = this.speed;
    }
  }

  /** Huidige positie in het stuk (seconden bij 100%). */
  position(): number {
    const c = getAudioContext();
    if (!c || this.segments.length === 0) return this.pausedAt;
    const now = c.currentTime;
    let seg = this.segments[0];
    for (const s of this.segments) {
      if (s.audio <= now) seg = s;
      else break;
    }
    if (now < seg.audio) return seg.pos;
    const pos = seg.pos + (now - seg.audio) * seg.speed;
    return Math.min(pos, this.timeline.duration);
  }

  isCountingIn(): boolean {
    const c = getAudioContext();
    return Boolean(c && this.segments.length > 0 && c.currentTime < this.segments[0].audio);
  }

  async play(from = this.pausedAt, options: { countIn?: boolean } = {}): Promise<void> {
    const c = await unlockAudio();
    if (!c) return;
    this.halt();

    let start = Math.max(0, Math.min(from, this.timeline.duration));
    if (start >= this.timeline.duration - 0.01) start = 0;
    if (this.loop && (start < this.loop.start || start >= this.loop.end)) start = this.loop.start;

    let audioStart = c.currentTime + START_DELAY;
    if (this.countIn > 0 && options.countIn !== false) {
      const interval = this.beatIntervalAt(start) / this.speed;
      for (let k = 0; k < this.countIn; k++) {
        playClick(audioStart + k * interval, k === 0);
      }
      audioStart += this.countIn * interval;
    }

    this.segments = [{ audio: audioStart, pos: start, speed: this.speed }];
    this.noteIndex = firstNoteIndexAt(this.timeline.notes, start);
    this.beatIndex = firstBeatIndexAt(this.timeline.beats, start);
    this._playing = true;
    this.tick();
    this.timer = setInterval(() => this.tick(), TICK_MS);
  }

  pause(): number {
    const pos = this.position();
    this.halt();
    this.pausedAt = pos;
    return pos;
  }

  stop() {
    this.halt();
    this.pausedAt = 0;
  }

  seek(pos: number) {
    this.pausedAt = Math.max(0, Math.min(pos, this.timeline.duration));
    if (this._playing) void this.play(this.pausedAt);
  }

  dispose() {
    this.halt();
    this.onEnded = null;
  }

  private halt() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this._playing = false;
    this.segments = [];
    stopAll();
  }

  private beatIntervalAt(pos: number): number {
    const beats = this.timeline.beats;
    for (let i = 0; i < beats.length - 1; i++) {
      if (beats[i + 1].time > pos) {
        const d = beats[i + 1].time - beats[i].time;
        if (d > 0.05) return d;
      }
    }
    return 60 / (this.timeline.bpm || 80);
  }

  private pruneSegments(now: number) {
    // Houd alleen het laatste segment dat al begonnen is plus alle toekomstige.
    let keepFrom = 0;
    for (let i = 0; i < this.segments.length; i++) {
      if (this.segments[i].audio <= now) keepFrom = i;
    }
    if (keepFrom > 0) this.segments = this.segments.slice(keepFrom);
  }

  private tick() {
    const c = getAudioContext();
    if (!c || !this._playing) return;
    const { notes, beats, duration } = this.timeline;
    const horizonAudio = c.currentTime + LOOKAHEAD;

    // Maximaal een paar herhaal-sprongen per tick (beschermt tegen piepkleine loops).
    for (let guard = 0; guard < 4; guard++) {
      const seg = this.segments[this.segments.length - 1];
      const horizonPos = seg.pos + Math.max(0, horizonAudio - seg.audio) * seg.speed;
      const loop = this.loop;
      const limit = loop ? Math.min(horizonPos, loop.end) : horizonPos;
      const toAudio = (pos: number) => seg.audio + (pos - seg.pos) / seg.speed;

      while (this.noteIndex < notes.length && notes[this.noteIndex].start < limit) {
        const n = notes[this.noteIndex++];
        if (n.start < seg.pos - 1e-6 || this.mutedParts.has(n.part)) continue;
        const maxDur = loop ? loop.end - n.start : n.duration;
        playNote(n.midi, {
          when: toAudio(n.start),
          duration: Math.max(0.05, Math.min(n.duration, maxDur) / seg.speed),
          velocity: n.part === 0 ? 0.7 : 0.6,
        });
      }

      while (this.beatIndex < beats.length && beats[this.beatIndex].time < limit) {
        const b = beats[this.beatIndex++];
        if (b.time < seg.pos - 1e-6 || !this.metronome) continue;
        playClick(toAudio(b.time), b.accent);
      }

      if (loop && horizonPos >= loop.end) {
        this.segments.push({ audio: toAudio(loop.end), pos: loop.start, speed: seg.speed });
        this.pruneSegments(c.currentTime);
        this.noteIndex = firstNoteIndexAt(notes, loop.start);
        this.beatIndex = firstBeatIndexAt(beats, loop.start);
        continue;
      }
      break;
    }

    if (!this.loop && this.position() >= duration - 1e-3) {
      this.halt();
      this.pausedAt = 0;
      this.onEnded?.();
    }
  }
}
