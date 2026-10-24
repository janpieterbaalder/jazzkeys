"use client";

interface NotenBalkControlsProps {
  isPlaying: boolean;
  speed: number;
  bpm: number;
  metronome: boolean;
  rechts: boolean;
  links: boolean;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
  onMetronomeChange: (on: boolean) => void;
  onRechtsChange: (on: boolean) => void;
  onLinksChange: (on: boolean) => void;
}

const SPEEDS = [0.5, 0.75, 1, 1.25];

const toggle = (on: boolean, onClass: string) =>
  `px-2 py-0.5 rounded text-xs transition-colors border ${
    on ? onClass : "text-slate-500 border-slate-700 hover:text-slate-300 line-through"
  }`;

export default function NotenBalkControls({
  isPlaying,
  speed,
  bpm,
  metronome,
  rechts,
  links,
  onPlayPause,
  onSpeedChange,
  onReset,
  onMetronomeChange,
  onRechtsChange,
  onLinksChange,
}: NotenBalkControlsProps) {
  return (
    <div className="flex items-center gap-x-3 gap-y-2 flex-wrap px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700">
      {/* Play / Pause */}
      <button
        onClick={onPlayPause}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-colors"
        aria-label={isPlaying ? "Pauzeer" : "Afspelen"}
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Reset */}
      <button
        onClick={onReset}
        className="text-slate-500 hover:text-slate-300 transition-colors"
        aria-label="Terug naar begin"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </button>

      {/* Snelheid */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-1 tabular-nums">
          ♩ = {Math.round(bpm * speed)}
        </span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              speed === s
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-slate-500 hover:text-slate-400 border border-transparent"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onMetronomeChange(!metronome)}
          className={`px-2 py-0.5 rounded text-xs transition-colors border ${
            metronome
              ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
              : "text-slate-500 border-slate-700 hover:text-slate-300"
          }`}
        >
          Metronoom
        </button>
        <button onClick={() => onRechtsChange(!rechts)} className={toggle(rechts, "bg-blue-500/20 text-blue-300 border-blue-500/30")}>
          RH
        </button>
        <button onClick={() => onLinksChange(!links)} className={toggle(links, "bg-indigo-500/20 text-indigo-300 border-indigo-500/30")}>
          LH
        </button>
      </div>
    </div>
  );
}
