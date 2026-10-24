"use client";

import { useState } from "react";
import type { DagSchema } from "@/data/practice-plans";
import PianoKeyboard from "@/components/piano/PianoKeyboard";
import PlayNotesButton from "@/components/piano/PlayNotesButton";
import { useVoortgang } from "@/lib/use-voortgang";

interface DagSchemaViewProps {
  dag: DagSchema;
  /** Unieke id per oefening voor het bijhouden van voortgang */
  idVoor: (oefeningIndex: number) => string;
}

export default function DagSchemaView({ dag, idVoor }: DagSchemaViewProps) {
  const [expandedOefening, setExpandedOefening] = useState<number | null>(0);
  const { isGedaan, toggle } = useVoortgang();
  const gedaan = dag.oefeningen.filter((_, i) => isGedaan(idVoor(i))).length;

  const totalMinutes = dag.oefeningen.reduce((sum, o) => {
    const match = o.duur.match(/(\d+)/);
    return sum + (match ? parseInt(match[1]) : 0);
  }, 0);

  return (
    <div>
      {/* Dag header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-lg font-bold text-white">{dag.dagLabel}</h3>
          <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
            ~{totalMinutes} min
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              gedaan === dag.oefeningen.length
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {gedaan}/{dag.oefeningen.length} gedaan
          </span>
        </div>
        <p className="text-blue-400 font-medium">{dag.thema}</p>
      </div>

      {/* Oefeningen */}
      <div className="space-y-3">
        {dag.oefeningen.map((oefening, i) => {
          const isExpanded = expandedOefening === i;
          const klaar = isGedaan(idVoor(i));

          return (
            <div
              key={i}
              className={`rounded-xl border overflow-hidden ${
                klaar ? "border-emerald-500/30 bg-emerald-500/5" : "border-slate-800 bg-slate-900/50"
              }`}
            >
              {/* Oefening header */}
              <div className="flex items-center hover:bg-slate-800/30 transition-colors">
                <button
                  onClick={() => toggle(idVoor(i))}
                  className={`flex-shrink-0 ml-4 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center border transition-colors ${
                    klaar
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "bg-blue-500/20 border-transparent text-blue-400 hover:border-emerald-400"
                  }`}
                  aria-pressed={klaar}
                  aria-label={klaar ? `Oefening ${i + 1} gedaan — klik om te wissen` : `Markeer oefening ${i + 1} als gedaan`}
                  title={klaar ? "Gedaan" : "Markeer als gedaan"}
                >
                  {klaar ? "✓" : i + 1}
                </button>
              <button
                onClick={() => setExpandedOefening(isExpanded ? null : i)}
                className="flex-1 min-w-0 text-left p-4 pl-3 flex items-center justify-between"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <div className="text-white font-medium truncate">
                      {oefening.titel}
                    </div>
                    <div className="text-xs text-slate-500">
                      {oefening.duur} — {oefening.doel}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-slate-500 transition-transform flex-shrink-0 ml-2 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                >
                  &#9662;
                </span>
              </button>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                  {oefening.stappen.map((stap) => (
                    <div key={stap.stap} className="pl-4 border-l-2 border-blue-500/30">
                      <div className="text-sm font-semibold text-blue-400 mb-1">
                        Stap {stap.stap}
                      </div>
                      <div className="text-sm text-white font-medium mb-1">
                        {stap.instructie}
                      </div>

                      {stap.details && (
                        <p className="text-sm text-slate-400 leading-relaxed mb-2">
                          {stap.details}
                        </p>
                      )}

                      {stap.pianoVoorbeeld && (
                        <div className="my-3 p-3 rounded-lg border border-slate-700 bg-slate-800/50">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="text-xs font-medium text-white">
                              {stap.pianoVoorbeeld.label}
                            </div>
                            <PlayNotesButton
                              notes={stap.pianoVoorbeeld.noten.map((n) => n.note)}
                            />
                          </div>
                          <div className="overflow-x-auto">
                            <PianoKeyboard
                              startOctave={stap.pianoVoorbeeld.startOctave ?? 3}
                              octaves={stap.pianoVoorbeeld.octaves ?? 2}
                              highlightedNotes={stap.pianoVoorbeeld.noten}
                              size="sm"
                            />
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            {stap.pianoVoorbeeld.uitleg}
                          </p>
                        </div>
                      )}

                      {stap.tip && (
                        <div className="mt-2 p-3 rounded-lg border border-blue-500/30 bg-blue-500/10">
                          <div className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">
                            Tip
                          </div>
                          <p className="text-xs text-slate-300">
                            {stap.tip}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dag tip */}
      {dag.dagTip && (
        <div className="mt-4 p-4 rounded-lg border border-blue-500/30 bg-blue-500/10">
          <div className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">
            Dag-tip
          </div>
          <p className="text-sm text-slate-300">{dag.dagTip}</p>
        </div>
      )}
    </div>
  );
}
