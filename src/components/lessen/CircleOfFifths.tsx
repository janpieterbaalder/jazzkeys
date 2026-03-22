"use client";

import { useState } from "react";

const KEYS = [
  { major: "C", minor: "Am", sharps: 0, flats: 0 },
  { major: "G", minor: "Em", sharps: 1, flats: 0 },
  { major: "D", minor: "Bm", sharps: 2, flats: 0 },
  { major: "A", minor: "F♯m", sharps: 3, flats: 0 },
  { major: "E", minor: "C♯m", sharps: 4, flats: 0 },
  { major: "B", minor: "G♯m", sharps: 5, flats: 0 },
  { major: "F♯", minor: "D♯m", sharps: 6, flats: 0 },
  { major: "D♭", minor: "B♭m", sharps: 0, flats: 5 },
  { major: "A♭", minor: "Fm", sharps: 0, flats: 4 },
  { major: "E♭", minor: "Cm", sharps: 0, flats: 3 },
  { major: "B♭", minor: "Gm", sharps: 0, flats: 2 },
  { major: "F", minor: "Dm", sharps: 0, flats: 1 },
];

export default function CircleOfFifths() {
  const [selected, setSelected] = useState<number | null>(null);

  const cx = 160;
  const cy = 160;
  const outerR = 140;
  const innerR = 95;
  const textOuterR = 118;
  const textInnerR = 75;

  return (
    <div>
      <svg viewBox="0 0 320 320" className="w-full">
        {/* Background circles */}
        <circle
          cx={cx}
          cy={cy}
          r={outerR}
          fill="none"
          stroke="#334155"
          strokeWidth="1"
        />
        <circle
          cx={cx}
          cy={cy}
          r={innerR}
          fill="none"
          stroke="#334155"
          strokeWidth="1"
        />

        {/* Segments */}
        {KEYS.map((key, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const nextAngle = ((i + 1) * 30 - 90) * (Math.PI / 180);
          const isSelected = selected === i;

          // Outer segment (major)
          const outerX1 = cx + outerR * Math.cos(angle);
          const outerY1 = cy + outerR * Math.sin(angle);
          const outerX2 = cx + outerR * Math.cos(nextAngle);
          const outerY2 = cy + outerR * Math.sin(nextAngle);
          const innerX1 = cx + innerR * Math.cos(angle);
          const innerY1 = cy + innerR * Math.sin(angle);
          const innerX2 = cx + innerR * Math.cos(nextAngle);
          const innerY2 = cy + innerR * Math.sin(nextAngle);

          // Text positions
          const textAngle = ((i * 30 + 15 - 90) * Math.PI) / 180;
          const majorTextX = cx + textOuterR * Math.cos(textAngle);
          const majorTextY = cy + textOuterR * Math.sin(textAngle);
          const minorTextX = cx + textInnerR * Math.cos(textAngle);
          const minorTextY = cy + textInnerR * Math.sin(textAngle);

          return (
            <g key={i}>
              {/* Outer segment path (major key) */}
              <path
                d={`M ${innerX1} ${innerY1} L ${outerX1} ${outerY1} A ${outerR} ${outerR} 0 0 1 ${outerX2} ${outerY2} L ${innerX2} ${innerY2} A ${innerR} ${innerR} 0 0 0 ${innerX1} ${innerY1}`}
                fill={isSelected ? "rgba(59, 130, 246, 0.3)" : "rgba(30, 41, 59, 0.5)"}
                stroke="#334155"
                strokeWidth="1"
                onClick={() => setSelected(isSelected ? null : i)}
                className="cursor-pointer hover:fill-blue-500/20 transition-colors"
              />

              {/* Inner segment (minor key) */}
              <path
                d={`M ${cx} ${cy} L ${innerX1} ${innerY1} A ${innerR} ${innerR} 0 0 1 ${innerX2} ${innerY2} Z`}
                fill={isSelected ? "rgba(59, 130, 246, 0.15)" : "rgba(15, 23, 42, 0.5)"}
                stroke="#334155"
                strokeWidth="1"
                onClick={() => setSelected(isSelected ? null : i)}
                className="cursor-pointer hover:fill-blue-500/10 transition-colors"
              />

              {/* Major key text */}
              <text
                x={majorTextX}
                y={majorTextY}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isSelected ? "#60a5fa" : "#e2e8f0"}
                fontSize="14"
                fontWeight="bold"
                className="pointer-events-none"
              >
                {key.major}
              </text>

              {/* Minor key text */}
              <text
                x={minorTextX}
                y={minorTextY}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isSelected ? "#818cf8" : "#64748b"}
                fontSize="11"
                className="pointer-events-none"
              >
                {key.minor}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Info panel */}
      {selected !== null && (
        <div className="mt-4 p-4 rounded-lg border border-slate-800 bg-slate-900/50 text-center">
          <div className="text-lg font-bold text-white">
            {KEYS[selected].major} majeur / {KEYS[selected].minor}
          </div>
          <div className="text-sm text-slate-400 mt-1">
            {KEYS[selected].sharps > 0
              ? `${KEYS[selected].sharps} kruis${KEYS[selected].sharps > 1 ? "en" : ""}`
              : KEYS[selected].flats > 0
                ? `${KEYS[selected].flats} mol${KEYS[selected].flats > 1 ? "len" : ""}`
                : "Geen voortekens"}
          </div>
        </div>
      )}
    </div>
  );
}
