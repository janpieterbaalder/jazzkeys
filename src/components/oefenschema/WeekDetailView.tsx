"use client";

import { useState } from "react";
import type { DagSchema } from "@/data/practice-plans";
import { oefeningId, useVoortgang } from "@/lib/use-voortgang";
import DagSchemaView from "./DagSchemaView";

interface WeekDetailViewProps {
  dagen: DagSchema[];
  fase: number;
  week: string;
}

export default function WeekDetailView({ dagen, fase, week }: WeekDetailViewProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  const { isGedaan } = useVoortgang();
  const dagKlaar = (dag: DagSchema) =>
    dag.oefeningen.length > 0 &&
    dag.oefeningen.every((_, i) => isGedaan(oefeningId(fase, week, dag.dag, i)));

  return (
    <div>
      {/* Dag selector — horizontaal scrollbaar */}
      <div className="overflow-x-auto pb-2 mb-6 -mx-1">
        <div className="flex gap-1.5 px-1 min-w-max">
          {dagen.map((dag, i) => (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                selectedDay === i
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "text-slate-500 border border-slate-800 hover:border-slate-600 hover:text-slate-400"
              }`}
            >
              <div className="flex items-center gap-1">
                Dag {dag.dag}
                {dagKlaar(dag) && <span className="text-emerald-400" aria-label="voltooid">✓</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Geselecteerde dag */}
      {dagen[selectedDay] && (
        <DagSchemaView
          dag={dagen[selectedDay]}
          idVoor={(i) => oefeningId(fase, week, dagen[selectedDay].dag, i)}
        />
      )}
    </div>
  );
}
