"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { VOICING_CATEGORIES } from "@/data/chords/voicing-data";
import { ALL_ROOTS, ROOT_DISPLAY, CHORD_LABELS, type ChordType } from "@/lib/piano-utils";
import ChordCard from "@/components/akkoorden/ChordCard";

export default function VoicingTypePage() {
  const params = useParams();
  const slug = params.type as string;

  const category = VOICING_CATEGORIES.find((c) => c.slug === slug);

  const [selectedRoot, setSelectedRoot] = useState<string | null>(null);
  const [selectedChordType, setSelectedChordType] = useState<ChordType | null>(
    null
  );

  if (!category) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400 mb-4">Categorie niet gevonden.</p>
        <Link href="/akkoorden" className="text-blue-400 hover:underline">
          Terug naar akkoorden
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/akkoorden"
        className="text-sm text-slate-500 hover:text-blue-400 transition-colors mb-6 inline-block"
      >
        &larr; Akkoorden
      </Link>

      <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
        {category.title}
      </h1>
      <p className="text-slate-400 mb-8 max-w-2xl">{category.explanation}</p>

      {/* Filter: root notes */}
      <div className="mb-4">
        <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">
          Grondtoon
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedRoot(null)}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              selectedRoot === null
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-slate-400 border border-slate-700 hover:border-slate-600"
            }`}
          >
            Alle
          </button>
          {ALL_ROOTS.map((root) => (
            <button
              key={root}
              onClick={() =>
                setSelectedRoot(selectedRoot === root ? null : root)
              }
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                selectedRoot === root
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "text-slate-400 border border-slate-700 hover:border-slate-600"
              }`}
            >
              {root}
            </button>
          ))}
        </div>
      </div>

      {/* Filter: chord types */}
      <div className="mb-8">
        <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">
          Akkoordtype
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedChordType(null)}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              selectedChordType === null
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-slate-400 border border-slate-700 hover:border-slate-600"
            }`}
          >
            Alle
          </button>
          {category.chordTypes.map((ct) => (
            <button
              key={ct}
              onClick={() =>
                setSelectedChordType(selectedChordType === ct ? null : ct)
              }
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                selectedChordType === ct
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "text-slate-400 border border-slate-700 hover:border-slate-600"
              }`}
            >
              {CHORD_LABELS[ct]}
            </button>
          ))}
        </div>
      </div>

      {/* Chord grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(selectedRoot ? [selectedRoot] : [...ALL_ROOTS]).map((root) =>
          (selectedChordType
            ? [selectedChordType]
            : category.chordTypes
          ).map((ct) => (
            <ChordCard
              key={`${root}-${ct}`}
              root={root}
              chordType={ct}
              voicingType={category.voicingType}
            />
          ))
        )}
      </div>
    </div>
  );
}
