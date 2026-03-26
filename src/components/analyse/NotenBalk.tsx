"use client";

import { useMemo } from "react";
import type { MaatData, NootData } from "@/lib/claude";
import {
  parseNootNaam,
  getStaffPosition,
  getLedgerLines,
  getDuurVisueel,
  positionToY,
  getTrebleTopY,
  getBassTopY,
  STAFF_CONSTANTS as SC,
} from "@/lib/staff-utils";

interface NotenBalkProps {
  maatNoten: MaatData[];
  selectedNoot: NootData | null;
  onNootSelect: (noot: NootData) => void;
  maatsoort?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────

function isRust(noot: NootData): boolean {
  return noot.type === "rust" || noot.noot === "rust";
}

/** Bepaal stem-richting: gebruik noot.stem als beschikbaar, anders automatisch */
function stemDirection(noot: NootData, position: number): "up" | "down" {
  if (noot.stem === "omhoog") return "up";
  if (noot.stem === "omlaag") return "down";
  // Automatisch: noten op of onder middenlijn → stok omhoog
  return position >= 4 ? "up" : "down";
}

// ─── Sleutel SVG ──────────────────────────────────────────────────

function TrebleClef({ x, y }: { x: number; y: number }) {
  return (
    <text
      x={x}
      y={y + 46}
      fontSize={72}
      fill="#94a3b8"
      fontFamily="serif"
      style={{ userSelect: "none" }}
    >
      {"\u{1D11E}"}
    </text>
  );
}

function BassClef({ x, y }: { x: number; y: number }) {
  return (
    <text
      x={x}
      y={y + 28}
      fontSize={46}
      fill="#94a3b8"
      fontFamily="serif"
      style={{ userSelect: "none" }}
    >
      {"\u{1D122}"}
    </text>
  );
}

// ─── Staff Lines ──────────────────────────────────────────────────

function StaffLines({ topY, width }: { topY: number; width: number }) {
  const lines = [];
  for (let i = 0; i < 5; i++) {
    const y = topY + i * 2 * SC.STEP;
    lines.push(
      <line
        key={`line-${topY}-${i}`}
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke={SC.LINE_COLOR}
        strokeWidth={1}
      />
    );
  }
  return <>{lines}</>;
}

// ─── Rust Symbolen ────────────────────────────────────────────────

function RestSymbol({
  x,
  y,
  duur,
  onClick,
  isSelected,
}: {
  x: number;
  y: number;
  duur: string;
  onClick: () => void;
  isSelected: boolean;
}) {
  const color = isSelected ? SC.NOTE_COLOR_SELECTED : "#64748b";
  const baseDuur = duur.replace(/_met_punt|_punt|punt/g, "").replace(/_$/, "");
  const isDotted = duur.includes("punt");

  // y = center of the staff (position 4 = middenlijn)
  const centerY = y;

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      {/* Hit area */}
      <rect x={x - 10} y={centerY - 16} width={20} height={32} fill="transparent" />

      {baseDuur === "heel" && (
        // Hele rust: blokje hangend aan de 4e lijn (positie 2)
        <rect x={x - 8} y={centerY - SC.STEP * 2} width={16} height={6} fill={color} />
      )}

      {baseDuur === "half" && (
        // Halve rust: blokje liggend op de 3e lijn (positie 4)
        <rect x={x - 8} y={centerY} width={16} height={6} fill={color} />
      )}

      {baseDuur === "kwart" && (
        // Kwartrust: zigzag-achtig symbool
        <path
          d={`M${x - 4},${centerY - 12} L${x + 4},${centerY - 4} L${x - 4},${centerY + 4} L${x + 4},${centerY + 12}`}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {baseDuur === "achtste" && (
        // Achtste rust: punt met staart
        <>
          <circle cx={x + 2} cy={centerY - 4} r={2.5} fill={color} />
          <path
            d={`M${x + 2},${centerY - 4} Q${x - 4},${centerY + 4} ${x},${centerY + 12}`}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
          />
        </>
      )}

      {baseDuur === "zestiende" && (
        // Zestiende rust: twee punten met staarten
        <>
          <circle cx={x + 2} cy={centerY - 8} r={2.5} fill={color} />
          <circle cx={x + 2} cy={centerY} r={2.5} fill={color} />
          <path
            d={`M${x + 2},${centerY - 8} Q${x - 4},${centerY} ${x},${centerY + 12}`}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
          />
        </>
      )}

      {/* Punt bij gepunteerde rust */}
      {isDotted && <circle cx={x + 12} cy={centerY} r={2} fill={color} />}
    </g>
  );
}

// ─── Nootkop ──────────────────────────────────────────────────────

function NoteHead({
  x,
  y,
  noot,
  isSelected,
  onClick,
}: {
  x: number;
  y: number;
  noot: NootData;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { accidental } = parseNootNaam(noot.noot);
  const visueel = getDuurVisueel(noot.duur);
  const { staff, position } = getStaffPosition(noot.noot, noot.hand);
  const stemDir = stemDirection(noot, position);
  const ledgerLines = getLedgerLines(position);

  const isRechts = noot.hand === "rechts";
  const noteColor = isSelected
    ? SC.NOTE_COLOR_SELECTED
    : isRechts
      ? SC.NOTE_COLOR_RIGHT
      : SC.NOTE_COLOR_LEFT;

  const hw = visueel.headWidth / 2;
  const hh = visueel.headHeight / 2;

  return (
    <g
      onClick={onClick}
      style={{ cursor: "pointer" }}
      className="transition-transform"
    >
      {/* Hit area */}
      <rect
        x={x - hw - 6}
        y={y - hh - 6}
        width={visueel.headWidth + 12}
        height={visueel.headHeight + 12}
        fill="transparent"
      />

      {/* Hulplijnen */}
      {ledgerLines.map((lp) => {
        const ly = positionToY(lp, staff);
        return (
          <line
            key={`ledger-${lp}`}
            x1={x - hw - 6}
            y1={ly}
            x2={x + hw + 6}
            y2={ly}
            stroke={SC.LEDGER_COLOR}
            strokeWidth={1}
          />
        );
      })}

      {/* Nootkop */}
      <ellipse
        cx={x}
        cy={y}
        rx={hw}
        ry={hh}
        fill={visueel.filled ? noteColor : "transparent"}
        stroke={noteColor}
        strokeWidth={visueel.filled ? 0 : 2}
        transform={`rotate(-10, ${x}, ${y})`}
      />

      {/* Glow bij selectie */}
      {isSelected && (
        <ellipse
          cx={x}
          cy={y}
          rx={hw + 4}
          ry={hh + 4}
          fill="transparent"
          stroke={SC.NOTE_COLOR_SELECTED}
          strokeWidth={1}
          opacity={0.4}
          transform={`rotate(-10, ${x}, ${y})`}
        />
      )}

      {/* Stok (stem) */}
      {visueel.hasStem && (
        <line
          x1={stemDir === "up" ? x + hw - 1 : x - hw + 1}
          y1={y}
          x2={stemDir === "up" ? x + hw - 1 : x - hw + 1}
          y2={stemDir === "up" ? y - SC.STEM_LENGTH : y + SC.STEM_LENGTH}
          stroke={SC.STEM_COLOR}
          strokeWidth={1.5}
        />
      )}

      {/* Vlaggen */}
      {visueel.flags > 0 && visueel.hasStem && (
        <>
          {Array.from({ length: visueel.flags }).map((_, fi) => {
            const stemX = stemDir === "up" ? x + hw - 1 : x - hw + 1;
            const stemEndY = stemDir === "up" ? y - SC.STEM_LENGTH : y + SC.STEM_LENGTH;
            const flagOffset = fi * 8;
            const flagDir = stemDir === "up" ? 1 : -1;

            return (
              <path
                key={`flag-${fi}`}
                d={
                  stemDir === "up"
                    ? `M${stemX},${stemEndY + flagOffset} Q${stemX + 12},${stemEndY + flagOffset + 10 * flagDir} ${stemX + 6},${stemEndY + flagOffset + 18 * flagDir}`
                    : `M${stemX},${stemEndY - flagOffset} Q${stemX - 12},${stemEndY - flagOffset + 10 * flagDir} ${stemX - 6},${stemEndY - flagOffset + 18 * flagDir}`
                }
                fill="none"
                stroke={SC.STEM_COLOR}
                strokeWidth={1.5}
              />
            );
          })}
        </>
      )}

      {/* Punt (dotted noot) */}
      {visueel.dotted && (
        <circle cx={x + hw + 5} cy={y} r={2.5} fill={noteColor} />
      )}

      {/* Voorteken (#/b) */}
      {accidental && (
        <text
          x={x - hw - 12}
          y={y + 5}
          fontSize={14}
          fill={SC.ACCIDENTAL_COLOR}
          fontFamily="serif"
          style={{ userSelect: "none" }}
        >
          {accidental === "#" ? "\u266F" : "\u266D"}
        </text>
      )}
    </g>
  );
}

// ─── Overbinding (Tie) ────────────────────────────────────────────

function TieCurve({
  x1,
  y1,
  x2,
  y2,
  direction,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  direction: "up" | "down";
}) {
  const midX = (x1 + x2) / 2;
  const curveHeight = direction === "up" ? -14 : 14;
  const cy = Math.min(y1, y2) + curveHeight;

  return (
    <path
      d={`M${x1},${y1} Q${midX},${cy} ${x2},${y2}`}
      fill="none"
      stroke="#94a3b8"
      strokeWidth={1.5}
      opacity={0.6}
    />
  );
}

// ─── Dynamiek Label ───────────────────────────────────────────────

function DynamicLabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text
      x={x}
      y={y}
      fontSize={16}
      fontStyle="italic"
      fontWeight="bold"
      fill="#94a3b8"
      fontFamily="serif"
      style={{ userSelect: "none" }}
    >
      {text}
    </text>
  );
}

// ─── Layout Berekening ────────────────────────────────────────────

interface PositionedItem {
  noot: NootData;
  x: number;
  y: number;
  staff: "treble" | "bass";
}

interface MeasureLayout {
  maat: MaatData;
  x: number;
  width: number;
  items: PositionedItem[];
}

/**
 * Bereken X-positie op basis van beat-positie (proportioneel binnen maat).
 * Beat 1 = start, beat 4.5 = bijna einde.
 */
function beatToX(beat: number, measureX: number, measureWidth: number, beatsPerMeasure: number): number {
  const padding = 30;
  const usableWidth = measureWidth - padding * 2;
  const fraction = (beat - 1) / beatsPerMeasure;
  return measureX + padding + fraction * usableWidth;
}

// ─── Hoofd Component ──────────────────────────────────────────────

export default function NotenBalk({
  maatNoten,
  selectedNoot,
  onNootSelect,
  maatsoort,
}: NotenBalkProps) {
  const beatsPerMeasure = maatsoort
    ? parseInt(maatsoort.split("/")[0]) || 4
    : 4;

  const layout = useMemo(() => {
    let currentX = SC.LEFT_PADDING;
    const measures: MeasureLayout[] = [];

    for (const maat of maatNoten) {
      const items: PositionedItem[] = [];

      // Tel unieke beats voor maatbreedte
      const uniqueBeats = new Set(maat.noten.map((n) => n.beatPositie));
      const noteCount = Math.max(uniqueBeats.size, 2);
      const measureWidth = SC.MEASURE_BASE_WIDTH + noteCount * SC.NOTE_EXTRA_WIDTH;

      for (const noot of maat.noten) {
        const noteX = beatToX(noot.beatPositie, currentX, measureWidth, beatsPerMeasure);

        if (isRust(noot)) {
          // Rusten: positioneer in het midden van de juiste balk
          const staff = noot.hand === "rechts" ? "treble" : "bass";
          const topY = staff === "treble" ? getTrebleTopY() : getBassTopY();
          const centerY = topY + 4 * SC.STEP; // Positie 4 = middenlijn
          items.push({ noot, x: noteX, y: centerY, staff });
        } else {
          // Noten: bereken Y op basis van nootnaam
          const { staff, position } = getStaffPosition(noot.noot, noot.hand);
          const noteY = positionToY(position, staff);
          items.push({ noot, x: noteX, y: noteY, staff });
        }
      }

      measures.push({ maat, x: currentX, width: measureWidth, items });
      currentX += measureWidth;
    }

    return { measures, totalWidth: currentX + SC.RIGHT_PADDING };
  }, [maatNoten, beatsPerMeasure]);

  const trebleTopY = getTrebleTopY();
  const bassTopY = getBassTopY();
  const totalHeight = 50 + SC.STAFF_HEIGHT + SC.STAFF_GAP + SC.STAFF_HEIGHT + 40;

  const isSelectedNoot = (noot: NootData) =>
    selectedNoot !== null &&
    selectedNoot.noot === noot.noot &&
    selectedNoot.beatPositie === noot.beatPositie &&
    selectedNoot.hand === noot.hand;

  // Zoek overbindingen: noten met verbinding die doorlopen naar de volgende maat
  const ties: { x1: number; y1: number; x2: number; y2: number; direction: "up" | "down" }[] = [];
  for (let mi = 0; mi < layout.measures.length; mi++) {
    const m = layout.measures[mi];
    for (const item of m.items) {
      if (item.noot.verbinding === "overbinding" && mi + 1 < layout.measures.length) {
        // Zoek de corresponderende noot in de volgende maat
        const nextMeasure = layout.measures[mi + 1];
        const match = nextMeasure.items.find(
          (ni) => ni.noot.noot === item.noot.noot && ni.noot.hand === item.noot.hand && !isRust(ni.noot)
        );
        if (match) {
          const dir = item.noot.stem === "omlaag" ? "down" : "up";
          ties.push({ x1: item.x, y1: item.y, x2: match.x, y2: match.y, direction: dir });
        }
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${layout.totalWidth} ${totalHeight}`}
      width={layout.totalWidth}
      height={totalHeight}
      className="block"
      style={{ minWidth: layout.totalWidth }}
    >
      {/* Achtergrond */}
      <rect x={0} y={0} width={layout.totalWidth} height={totalHeight} fill="#0f172a" rx={8} />

      {/* Balklijnen */}
      <StaffLines topY={trebleTopY} width={layout.totalWidth} />
      <StaffLines topY={bassTopY} width={layout.totalWidth} />

      {/* Sleutels */}
      <TrebleClef x={6} y={trebleTopY - 12} />
      <BassClef x={10} y={bassTopY - 6} />

      {/* Maatsoort */}
      {maatsoort && (
        <>
          <text
            x={50}
            y={trebleTopY + SC.STEP * 3}
            fontSize={20}
            fontWeight="bold"
            fill="#94a3b8"
            style={{ userSelect: "none" }}
          >
            {maatsoort.split("/")[0]}
          </text>
          <text
            x={50}
            y={trebleTopY + SC.STEP * 7}
            fontSize={20}
            fontWeight="bold"
            fill="#94a3b8"
            style={{ userSelect: "none" }}
          >
            {maatsoort.split("/")[1]}
          </text>
        </>
      )}

      {/* Maten */}
      {layout.measures.map((m, mi) => (
        <g key={mi}>
          {/* Maatstreep */}
          <line
            x1={m.x}
            y1={trebleTopY}
            x2={m.x}
            y2={bassTopY + SC.STAFF_HEIGHT}
            stroke={SC.BARLINE_COLOR}
            strokeWidth={1}
          />

          {/* Akkoord label */}
          {m.maat.akkoord && (
            <text
              x={m.x + 20}
              y={trebleTopY - 14}
              fontSize={13}
              fontWeight="600"
              fill={SC.CHORD_COLOR}
              style={{ userSelect: "none" }}
            >
              {m.maat.akkoord}
            </text>
          )}

          {/* Maatnummer */}
          <text
            x={m.x + 4}
            y={trebleTopY - 14}
            fontSize={9}
            fill="#475569"
            style={{ userSelect: "none" }}
          >
            {m.maat.maatNummer}
          </text>

          {/* Dynamiek */}
          {m.maat.dynamiek && (
            <DynamicLabel
              x={m.x + 10}
              y={trebleTopY + SC.STAFF_HEIGHT + 18}
              text={m.maat.dynamiek}
            />
          )}

          {/* Noten en rusten */}
          {m.items.map((item, ni) => {
            if (isRust(item.noot)) {
              return (
                <RestSymbol
                  key={`r-${mi}-${ni}`}
                  x={item.x}
                  y={item.y}
                  duur={item.noot.duur}
                  isSelected={isSelectedNoot(item.noot)}
                  onClick={() => onNootSelect(item.noot)}
                />
              );
            }
            return (
              <NoteHead
                key={`n-${mi}-${ni}`}
                x={item.x}
                y={item.y}
                noot={item.noot}
                isSelected={isSelectedNoot(item.noot)}
                onClick={() => onNootSelect(item.noot)}
              />
            );
          })}
        </g>
      ))}

      {/* Overbindingen */}
      {ties.map((tie, ti) => (
        <TieCurve key={`tie-${ti}`} {...tie} />
      ))}

      {/* Eindstreep */}
      <line
        x1={layout.totalWidth - SC.RIGHT_PADDING}
        y1={trebleTopY}
        x2={layout.totalWidth - SC.RIGHT_PADDING}
        y2={bassTopY + SC.STAFF_HEIGHT}
        stroke={SC.BARLINE_COLOR}
        strokeWidth={2}
      />

      {/* Brace links */}
      <line
        x1={0}
        y1={trebleTopY}
        x2={0}
        y2={bassTopY + SC.STAFF_HEIGHT}
        stroke={SC.BARLINE_COLOR}
        strokeWidth={3}
      />
    </svg>
  );
}
