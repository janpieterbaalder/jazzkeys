"use client";

import { useState } from "react";
import type { DagSchema } from "@/data/practice-plans";
import DagSchemaView from "./DagSchemaView";

interface WeekDetailViewProps {
  dagen: DagSchema[];
}

export default function WeekDetailView({ dagen }: WeekDetailViewProps) {
  const [selectedDay, setSelectedDay] = useState(0);

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
              <div>Dag {dag.dag}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Geselecteerde dag */}
      {dagen[selectedDay] && <DagSchemaView dag={dagen[selectedDay]} />}
    </div>
  );
}
