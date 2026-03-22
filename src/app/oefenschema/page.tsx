"use client";

import { useState } from "react";
import { practicePhases } from "@/data/practice-plans";
import WeekDetailView from "@/components/oefenschema/WeekDetailView";

export default function OefenschemaPage() {
  const [selectedPhase, setSelectedPhase] = useState(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  const phase = practicePhases[selectedPhase];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
        Oefenschema
      </h1>
      <p className="text-slate-400 mb-8">
        Een gestructureerd leerpad van 12 maanden — van beginner tot
        jazz-pianist. Kies je fase en volg het dagelijkse schema.
      </p>

      {/* Phase selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
        {practicePhases.map((p, i) => (
          <button
            key={i}
            onClick={() => {
              setSelectedPhase(i);
              setExpandedDay(null);
              setExpandedWeek(null);
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedPhase === i
                ? "border-blue-500/50 bg-blue-500/10"
                : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
            }`}
          >
            <div className="text-xs text-slate-500 mb-1">Fase {p.phase}</div>
            <div
              className={`font-semibold text-sm ${selectedPhase === i ? "text-blue-400" : "text-white"}`}
            >
              {p.title}
            </div>
            <div className="text-xs text-slate-500 mt-1">{p.period}</div>
          </button>
        ))}
      </div>

      {/* Phase detail */}
      <div className="space-y-8">
        {/* Description & goals */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">
            Fase {phase.phase}: {phase.title}
          </h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            {phase.description}
          </p>

          <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/50">
            <div className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-2">
              Doelen
            </div>
            <ul className="space-y-1.5">
              {phase.goals.map((goal, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-blue-500 mt-0.5">&#9675;</span>
                  {goal}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Daily routine */}
        <section>
          <h3 className="text-lg font-semibold text-white mb-4">
            Dagelijks Schema
          </h3>
          <div className="text-xs text-slate-500 mb-3">
            Totaal:{" "}
            {phase.dailyRoutine.reduce((sum, block) => {
              const mins = parseInt(block.duration);
              return sum + (isNaN(mins) ? 0 : mins);
            }, 0)}{" "}
            minuten
          </div>

          <div className="space-y-2">
            {phase.dailyRoutine.map((block, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 text-xs text-blue-400 font-medium">
                      {block.duration}
                    </div>
                    <div className="font-medium text-white text-sm">
                      {block.title}
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-slate-500 transition-transform ${expandedDay === i ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {expandedDay === i && (
                  <div className="px-4 pb-4 pt-0">
                    <ul className="space-y-1.5 ml-[4.25rem]">
                      {block.activities.map((activity, j) => (
                        <li
                          key={j}
                          className="text-sm text-slate-400 flex items-start gap-2"
                        >
                          <span className="text-slate-600 mt-0.5">&bull;</span>
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Weekly focus */}
        <section>
          <h3 className="text-lg font-semibold text-white mb-4">
            Weekoverzicht
          </h3>
          <div className="space-y-3">
            {phase.weeklyFocus.map((week, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden"
              >
                <button
                  onClick={() =>
                    week.dagen
                      ? setExpandedWeek(expandedWeek === i ? null : i)
                      : undefined
                  }
                  className={`w-full text-left p-4 ${week.dagen ? "hover:bg-slate-800/30 cursor-pointer" : "cursor-default"} transition-colors`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs text-blue-400 font-medium min-w-fit">
                      {week.week}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {week.focus}
                    </span>
                    {week.dagen && (
                      <span className="ml-auto flex items-center gap-1 text-xs text-blue-400">
                        {expandedWeek === i ? "Inklappen" : `${week.dagen.length} dagen`}
                        <svg
                          className={`w-3 h-3 transition-transform ${expandedWeek === i ? "rotate-180" : ""}`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">{week.details}</p>
                </button>

                {/* Expanded dag-voor-dag detail */}
                {expandedWeek === i && week.dagen && (
                  <div className="px-4 pb-4 border-t border-slate-800">
                    <div className="pt-4">
                      <WeekDetailView dagen={week.dagen} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Standards */}
        <section>
          <h3 className="text-lg font-semibold text-white mb-3">
            Aanbevolen Standards
          </h3>
          <div className="flex flex-wrap gap-2">
            {phase.standards.map((standard, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 text-sm text-slate-300"
              >
                {standard}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
