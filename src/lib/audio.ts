/**
 * Web Audio piano-synth + metronoom. Geen samples nodig: elke noot is een
 * kleine additieve synth (grondtoon + boventonen) met een piano-achtige
 * envelop en een filter dat dichtgaat naarmate de noot uitklinkt.
 *
 * Alles draait op één gedeelde AudioContext. Browsers staan audio pas toe na
 * een gebruikersactie, dus roep `unlockAudio()` aan vanuit een klik/tap.
 */

interface Voice {
  gain: GainNode;
  sources: AudioScheduledSourceNode[];
  endTime: number;
}

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
const voices = new Set<Voice>();

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;

  ctx = new Ctor({ latencyHint: "interactive" });

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.knee.value = 12;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.25;

  master = ctx.createGain();
  master.gain.value = 0.8;
  master.connect(compressor);
  compressor.connect(ctx.destination);

  return ctx;
}

/** Moet vanuit een gebruikersactie aangeroepen worden (iOS/Safari/Chrome autoplay-regels). */
export async function unlockAudio(): Promise<AudioContext | null> {
  const c = getAudioContext();
  if (c && c.state !== "running") {
    try {
      await c.resume();
    } catch {
      /* browser weigert — volgende klik opnieuw proberen */
    }
  }
  return c;
}

export function setMasterVolume(volume: number) {
  getAudioContext();
  if (master) master.gain.value = Math.max(0, Math.min(1, volume));
}

// Relatieve sterkte van de boventonen. Lage noten krijgen meer boventonen,
// hoge noten klinken zuiverder — zoals bij een echte piano.
const PARTIALS = [1, 0.5, 0.28, 0.16, 0.09, 0.05];

export interface PlayNoteOptions {
  /** AudioContext-tijd waarop de noot begint. Standaard: nu. */
  when?: number;
  /** Duur in seconden (tot de demper valt). */
  duration?: number;
  /** 0..1 */
  velocity?: number;
}

export function playNote(midi: number, options: PlayNoteOptions = {}): void {
  const c = getAudioContext();
  if (!c || !master) return;
  if (c.state !== "running") void c.resume();

  const when = Math.max(c.currentTime, options.when ?? c.currentTime);
  const duration = Math.max(0.05, options.duration ?? 1);
  const velocity = Math.max(0.05, Math.min(1, options.velocity ?? 0.7));
  const freq = midiToFrequency(midi);

  // Lage noten klinken langer na dan hoge.
  const decay = Math.max(0.6, Math.min(6, 9 - (midi - 21) * 0.09));
  const release = 0.18;
  const releaseStart = when + duration;
  const endTime = releaseStart + release + 0.05;

  const voiceGain = c.createGain();
  const peak = 0.22 * velocity;
  voiceGain.gain.setValueAtTime(0, when);
  voiceGain.gain.linearRampToValueAtTime(peak, when + 0.004);
  // Twee-traps verval: snelle aanslag-daling, dan langzaam uitklinken.
  voiceGain.gain.setTargetAtTime(peak * 0.45, when + 0.004, 0.08);
  voiceGain.gain.setTargetAtTime(0.0001, when + 0.12, decay / 3);
  voiceGain.gain.cancelScheduledValues(releaseStart);
  voiceGain.gain.setTargetAtTime(0.0001, releaseStart, release / 3);

  // Helderheid: filter opent bij de aanslag en sluit tijdens het uitklinken.
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 0.7;
  const bright = Math.min(16000, freq * (6 + velocity * 10));
  filter.frequency.setValueAtTime(bright, when);
  filter.frequency.setTargetAtTime(Math.max(freq * 2, 600), when + 0.01, 0.4);

  filter.connect(voiceGain);
  voiceGain.connect(master);

  const sources: AudioScheduledSourceNode[] = [];
  const partialCount = midi < 48 ? 6 : midi < 72 ? 5 : 3;
  for (let i = 0; i < partialCount; i++) {
    const partialFreq = freq * (i + 1) * (1 + 0.0004 * i * i); // lichte inharmoniciteit
    if (partialFreq > 18000) break;
    const osc = c.createOscillator();
    osc.type = i === 0 ? "triangle" : "sine";
    osc.frequency.value = partialFreq;
    osc.detune.value = (i % 2 === 0 ? 1 : -1) * 2;
    const g = c.createGain();
    g.gain.value = PARTIALS[i];
    osc.connect(g);
    g.connect(filter);
    osc.start(when);
    osc.stop(endTime);
    sources.push(osc);
  }

  const voice: Voice = { gain: voiceGain, sources, endTime };
  voices.add(voice);
  sources[0]?.addEventListener("ended", () => {
    voices.delete(voice);
    voiceGain.disconnect();
  });
}

export interface PlayChordOptions extends PlayNoteOptions {
  /** Seconden tussen de noten (0 = blokakkoord). */
  arpeggio?: number;
}

export function playChord(midis: number[], options: PlayChordOptions = {}): void {
  const c = getAudioContext();
  if (!c) return;
  const start = options.when ?? c.currentTime + 0.01;
  const step = options.arpeggio ?? 0;
  const sorted = [...midis].sort((a, b) => a - b);
  sorted.forEach((midi, i) => {
    playNote(midi, {
      ...options,
      when: start + i * step,
      duration: (options.duration ?? 1.4) + (sorted.length - 1 - i) * step,
    });
  });
}

/** Korte metronoom-tik. `accent` = eerste tel van de maat. */
export function playClick(when?: number, accent = false): void {
  const c = getAudioContext();
  if (!c || !master) return;
  const t = Math.max(c.currentTime, when ?? c.currentTime);
  const osc = c.createOscillator();
  osc.type = "square";
  osc.frequency.value = accent ? 1760 : 1175;
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(accent ? 0.18 : 0.11, t + 0.001);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  osc.connect(g);
  g.connect(master);
  osc.start(t);
  osc.stop(t + 0.06);
  const voice: Voice = { gain: g, sources: [osc], endTime: t + 0.06 };
  voices.add(voice);
  osc.addEventListener("ended", () => {
    voices.delete(voice);
    g.disconnect();
  });
}

/** Stopt alle klinkende én alle nog geplande noten. */
export function stopAll(): void {
  const c = ctx;
  if (!c) return;
  const now = c.currentTime;
  for (const voice of voices) {
    try {
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setTargetAtTime(0, now, 0.015);
      for (const s of voice.sources) s.stop(now + 0.08);
    } catch {
      /* bron was al gestopt */
    }
  }
  voices.clear();
}
