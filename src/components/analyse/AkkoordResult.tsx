"use client";

import type { AkkoordAnalyseResult } from "@/lib/claude";

interface AkkoordResultProps {
  result: AkkoordAnalyseResult;
}

export default function AkkoordResult({ result }: AkkoordResultProps) {
  return (
    <div className="space-y-6">
      {/* Toonsoort */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500">Toonsoort:</span>
        <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 font-medium">
          {result.toonsoort}
        </span>
      </div>

      {/* Akkoord analyse */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          Akkoordanalyse
        </h3>
        <div className="space-y-2">
          {result.analyse.map((item, i) => (
            <div
              key={i}
              className="p-3 rounded-lg border border-slate-800 bg-slate-900/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-semibold">{item.akkoord}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                  {item.functie}
                </span>
              </div>
              <p className="text-sm text-slate-400">{item.uitleg}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Voicing suggesties */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          Voicing Suggesties
        </h3>
        <div className="space-y-2">
          {result.voicingSuggesties.map((vs, i) => (
            <div
              key={i}
              className="p-3 rounded-lg border border-slate-800 bg-slate-900/50"
            >
              <div className="font-medium text-white mb-2">{vs.akkoord}</div>
              <div className="grid gap-1 text-sm">
                <div className="flex gap-2">
                  <span className="text-slate-500 min-w-fit">Shell:</span>
                  <span className="text-slate-300">{vs.shell}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-slate-500 min-w-fit">Rootless A:</span>
                  <span className="text-slate-300">{vs.rootlessA}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-slate-500 min-w-fit">Rootless B:</span>
                  <span className="text-slate-300">{vs.rootlessB}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Oefenplan */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Oefenplan</h3>
        <div className="space-y-1.5">
          {result.oefenplan.map((stap, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-blue-500 mt-0.5">○</span>
              {stap}
            </div>
          ))}
        </div>
      </div>

      {/* Jazz variaties */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          Jazz Variaties
        </h3>
        <div className="space-y-1.5">
          {result.jazzVariaties.map((variatie, i) => (
            <div
              key={i}
              className="p-3 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-sm text-slate-300"
            >
              {variatie}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
