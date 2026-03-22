"use client";

import { useState } from "react";
import type { DagSchema } from "@/data/practice-plans";
import PianoKeyboard from "@/components/piano/PianoKeyboard";

interface DagSchemaViewProps {
  dag: DagSchema;
}

export default function DagSchemaView({ dag }: DagSchemaViewProps) {
  const [expandedOefening, setExpandedOefening] = useState<number | null>(0);

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
        </div>
        <p className="text-blue-400 font-medium">{dag.thema}</p>
      </div>

      {/* Oefeningen */}
      <div className="space-y-3">
        {dag.oefeningen.map((oefening, i) => {
          const isExpanded = expandedOefening === i;

          return (
            <div
              key={i}
              className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden"
            >
              {/* Oefening header */}
              <button
                onClick={() => setExpandedOefening(isExpanded ? null : i)}
                className="w-full text-left p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
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
                          <div className="text-xs font-medium text-white mb-2">
                            {stap.pianoVoorbeeld.label}
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
