"use client";

import { useMemo } from "react";
import { controleerMaten, type Fragment } from "@/lib/analyse-schema";
import InteractieveNotenWeergave from "./InteractieveNotenWeergave";

interface StukjeViewProps {
  fragment: Fragment;
  maatsoort?: string;
  bpm?: number;
}

const fmt = (kwarten: number) =>
  `${Number.isInteger(kwarten) ? kwarten : kwarten.toFixed(2).replace(/0$/, "")} ${kwarten === 1 ? "kwartnoot" : "kwartnoten"}`;

export default function StukjeView({ fragment, maatsoort, bpm }: StukjeViewProps) {
  const waarschuwingen = useMemo(
    () => (fragment.maatNoten ? controleerMaten(fragment.maatNoten, maatsoort) : []),
    [fragment.maatNoten, maatsoort]
  );

  return (
    <div className="space-y-4">
      {/* Interactieve notenbalk — als maatNoten beschikbaar is */}
      {fragment.maatNoten && fragment.maatNoten.length > 0 && (
        <InteractieveNotenWeergave
          maatNoten={fragment.maatNoten}
          maatsoort={maatsoort}
          bpm={bpm}
        />
      )}

      {/* Controle: vullen de noten de maat? Zo niet, dan heeft de AI waarschijnlijk iets gemist. */}
      {waarschuwingen.length > 0 && (
        <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10">
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
            Controleer met de bladmuziek
          </div>
          <ul className="text-xs text-slate-300 space-y-0.5">
            {waarschuwingen.slice(0, 6).map((w, i) => (
              <li key={i}>
                Maat {w.maatNummer}, {w.hand === "rechts" ? "rechterhand" : "linkerhand"}
                {w.stem === "omlaag" ? " (onderste stem)" : ""}: {fmt(w.gevonden)} gevonden, {fmt(w.verwacht)} verwacht
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-slate-500 mt-1">
            De analyse is automatisch gemaakt; hier mist waarschijnlijk een noot of rust, of klopt een duur niet.
          </p>
        </div>
      )}

      {/* Noten uitleg */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-2">
          Wat staat er?
        </h4>
        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-slate-800/50">
            <div className="text-xs text-blue-400 font-medium mb-1">
              Rechterhand
            </div>
            <p className="text-sm text-slate-300">
              {fragment.notenUitleg.rechterhand}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50">
            <div className="text-xs text-blue-400 font-medium mb-1">
              Linkerhand
            </div>
            <p className="text-sm text-slate-300">
              {fragment.notenUitleg.linkerhand}
            </p>
          </div>
        </div>
      </div>

      {/* Akkoord analyse */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-2">
          Welke akkoorden?
        </h4>
        <div className="p-3 rounded-lg bg-slate-800/50">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {fragment.akkoordAnalyse.akkoorden.map((akkoord, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-sm font-medium"
              >
                {akkoord}
              </span>
            ))}
          </div>
          <p className="text-sm text-slate-300">
            {fragment.akkoordAnalyse.uitleg}
          </p>
          {fragment.akkoordAnalyse.jazzVarianten.length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-slate-500">Jazz-varianten: </span>
              <span className="text-xs text-slate-400">
                {fragment.akkoordAnalyse.jazzVarianten.join(", ")}
              </span>
            </div>
          )}
          {fragment.akkoordAnalyse.voicingSuggesties && (
            <p className="text-xs text-slate-400 mt-1">
              {fragment.akkoordAnalyse.voicingSuggesties}
            </p>
          )}
        </div>
      </div>

      {/* Leesstrategie */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-2">
          Hoe lees je dit?
        </h4>
        <p className="text-sm text-slate-300">{fragment.leesStrategie}</p>
      </div>

      {/* Ritme */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-2">Ritme</h4>
        <p className="text-sm text-slate-300">{fragment.ritmeUitleg}</p>
      </div>

      {/* Oefentip */}
      <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/10">
        <div className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">
          Oefentip
        </div>
        <p className="text-sm text-slate-300">{fragment.oefentip}</p>
      </div>

      {/* Jazz tip */}
      <div className="p-3 rounded-lg border border-indigo-500/30 bg-indigo-500/10">
        <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">
          Jazz Versie
        </div>
        <p className="text-sm text-slate-300">{fragment.jazzTip}</p>
      </div>
    </div>
  );
}
