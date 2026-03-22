"use client";

import { useState } from "react";

interface ChordInputProps {
  onSubmit: (chords: string) => void;
  isLoading: boolean;
}

export default function ChordInput({ onSubmit, isLoading }: ChordInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label className="block text-sm text-slate-400 mb-2">
        Of voer akkoorden handmatig in:
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="bijv. Dm7 - G7 - Cmaj7 - A7"
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900/50 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 text-sm disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "..." : "Analyseer"}
        </button>
      </div>
      <p className="text-xs text-slate-600 mt-1.5">
        Scheid akkoorden met een streepje, komma of spatie
      </p>
    </form>
  );
}
