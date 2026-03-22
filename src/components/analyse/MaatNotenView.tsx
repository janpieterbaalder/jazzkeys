"use client";

import type { MaatData, NootData } from "@/lib/claude";
import NootKaart from "./NootKaart";

interface MaatNotenViewProps {
  maat: MaatData;
  selectedNoot: NootData | null;
  onNootSelect: (noot: NootData) => void;
}

export default function MaatNotenView({
  maat,
  selectedNoot,
  onNootSelect,
}: MaatNotenViewProps) {
  const rechtsNoten = maat.noten.filter((n) => n.hand === "rechts");
  const linksNoten = maat.noten.filter((n) => n.hand === "links");

  // Sorteer op beat positie
  rechtsNoten.sort((a, b) => a.beatPositie - b.beatPositie);
  linksNoten.sort((a, b) => a.beatPositie - b.beatPositie);

  const isSelected = (noot: NootData) =>
    selectedNoot !== null &&
    selectedNoot.noot === noot.noot &&
    selectedNoot.beatPositie === noot.beatPositie &&
    selectedNoot.hand === noot.hand;

  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Maat {maat.maatNummer}
        </span>
        {maat.akkoord && (
          <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium">
            {maat.akkoord}
          </span>
        )}
      </div>

      {/* Rechterhand */}
      {rechtsNoten.length > 0 && (
        <div className="mb-2">
          <div className="text-[10px] text-blue-400/60 uppercase tracking-wider mb-1">
            RH
          </div>
          <div className="flex flex-wrap gap-1.5">
            {rechtsNoten.map((noot, i) => (
              <NootKaart
                key={`r-${i}`}
                noot={noot}
                isSelected={isSelected(noot)}
                onClick={() => onNootSelect(noot)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Linkerhand */}
      {linksNoten.length > 0 && (
        <div>
          <div className="text-[10px] text-indigo-400/60 uppercase tracking-wider mb-1">
            LH
          </div>
          <div className="flex flex-wrap gap-1.5">
            {linksNoten.map((noot, i) => (
              <NootKaart
                key={`l-${i}`}
                noot={noot}
                isSelected={isSelected(noot)}
                onClick={() => onNootSelect(noot)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
