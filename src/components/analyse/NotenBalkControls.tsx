"use client";

interface NotenBalkControlsProps {
  isPlaying: boolean;
  speed: number;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
}

const SPEEDS = [0.5, 1, 1.5, 2];

export default function NotenBalkControls({
  isPlaying,
  speed,
  onPlayPause,
  onSpeedChange,
  onReset,
}: NotenBalkControlsProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700">
      {/* Play / Pause */}
      <button
        onClick={onPlayPause}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
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
        className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
        aria-label="Terug naar begin"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </button>

      {/* Snelheid */}
      <div className="flex items-center gap-1 ml-2">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-1">
          Snelheid
        </span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              speed === s
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-slate-500 hover:text-slate-400"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Landscape hint */}
      <div className="ml-auto text-[10px] text-slate-600 hidden portrait:flex items-center gap-1">
        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
          <path d="M16.48 2.52c3.27 1.55 5.61 4.72 5.97 8.48h1.5C23.44 4.84 18.29 0 12 0l-.66.03 3.81 3.81 1.33-1.32zm-6.25-.77c-.59-.59-1.54-.59-2.12 0L1.75 8.11c-.59.59-.59 1.54 0 2.12l12.02 12.02c.59.59 1.54.59 2.12 0l6.36-6.36c.59-.59.59-1.54 0-2.12L10.23 1.75zm4.6 19.44L2.81 9.17l6.36-6.36 12.02 12.02-6.36 6.38zm-7.31.29l-1.33 1.32c-3.27-1.55-5.61-4.72-5.97-8.48h-1.5C.56 19.16 5.71 24 12 24l.66-.03-3.81-3.81-.03.04z" />
        </svg>
        Draai voor beter zicht
      </div>
    </div>
  );
}
