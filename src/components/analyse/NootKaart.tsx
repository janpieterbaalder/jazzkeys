"use client";

import type { NootData } from "@/lib/claude";

interface NootKaartProps {
  noot: NootData;
  isSelected: boolean;
  onClick: () => void;
}

const DUUR_LABELS: Record<string, string> = {
  heel: "\u{1D15D}",
  half: "\u{1D15E}",
  kwart: "\u{1D15F}",
  achtste: "\u{1D160}",
  zestiende: "\u{1D161}",
};

export default function NootKaart({ noot, isSelected, onClick }: NootKaartProps) {
  const isRechts = noot.hand === "rechts";

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
        isSelected
          ? isRechts
            ? "bg-blue-500/30 text-blue-300 border border-blue-400/50 scale-105"
            : "bg-indigo-500/30 text-indigo-300 border border-indigo-400/50 scale-105"
          : isRechts
            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
            : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20"
      }`}
    >
      <span className="font-bold">{noot.noot}</span>
      {DUUR_LABELS[noot.duur] && (
        <span className="text-xs opacity-60">{DUUR_LABELS[noot.duur]}</span>
      )}
    </button>
  );
}
