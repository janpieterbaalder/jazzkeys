"use client";

import { useMemo } from "react";
import type { MaatData, NootData } from "@/lib/claude";
import {
  parseNootNaam,
  getStaffPosition,
  getLedgerLines,
  getStemDirection,
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

// ─── Sleutel SVG Paths ─────────────────────────────────────────────

function TrebleClef({ x, y }: { x: number; y: number }) {
  // Vereenvoudigde G-sleutel als SVG text (Unicode musical symbol)
  return (
    <text
      x={x}
      y={y + 34}
      fontSize={58}
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
      y={y + 22}
      fontSize={38}
      fill="#94a3b8"
      fontFamily="serif"
      style={{ userSelect: "none" }}
    >
      {"\u{1D122}"}
    </text>
  );
}

// ─── Staff Lines ───────────────────────────────────────────────────

function StaffLines({
  topY,
  width,
}: {
  topY: number;
  width: number;
}) {
  const lines = [];
  for (let i = 0; i < 5; i++) {
    const y = topY + i * 2 * SC.STEP; // lijnen op posities 0, 2, 4, 6, 8
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

// ─── Nootkop ───────────────────────────────────────────────────────

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
  const stemDir = getStemDirection(position);
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
      {/* Hit area (grotere klikzone) */}
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

      {/* Glow effect bij selectie */}
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
          y2={
            stemDir === "up" ? y - SC.STEM_LENGTH : y + SC.STEM_LENGTH
          }
          stroke={SC.STEM_COLOR}
          strokeWidth={1.5}
        />
      )}

      {/* Vlaggen */}
      {visueel.flags > 0 && visueel.hasStem && (
        <>
          {Array.from({ length: visueel.flags }).map((_, fi) => {
            const stemX =
              stemDir === "up" ? x + hw - 1 : x - hw + 1;
            const stemEndY =
              stemDir === "up"
                ? y - SC.STEM_LENGTH
                : y + SC.STEM_LENGTH;
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

      {/* Voorteken (#/b) */}
      {accidental && (
        <text
          x={x - hw - 10}
          y={y + 4}
          fontSize={13}
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

// ─── Hoofd Component ───────────────────────────────────────────────

export default function NotenBalk({
  maatNoten,
  selectedNoot,
  onNootSelect,
  maatsoort,
}: NotenBalkProps) {
  // Bereken layout per maat
  const layout = useMemo(() => {
    let currentX = SC.LEFT_PADDING;
    const measures: {
      maat: MaatData;
      x: number;
      width: number;
      trebleNotes: { noot: NootData; x: number; y: number }[];
      bassNotes: { noot: NootData; x: number; y: number }[];
    }[] = [];

    for (const maat of maatNoten) {
      const trebleNotes: { noot: NootData; x: number; y: number }[] = [];
      const bassNotes: { noot: NootData; x: number; y: number }[] = [];

      // Groepeer noten per hand
      const rechts = maat.noten
        .filter((n) => n.hand === "rechts")
        .sort((a, b) => a.beatPositie - b.beatPositie);
      const links = maat.noten
        .filter((n) => n.hand === "links")
        .sort((a, b) => a.beatPositie - b.beatPositie);

      // Bereken breedte van deze maat
      const maxNotes = Math.max(rechts.length, links.length, 1);
      const measureWidth =
        SC.MEASURE_BASE_WIDTH + maxNotes * SC.NOTE_EXTRA_WIDTH;

      // Positioneer noten horizontaal (gelijkmatig verdeeld)
      const noteSpacing = (measureWidth - 40) / Math.max(maxNotes, 1);

      for (let i = 0; i < rechts.length; i++) {
        const noot = rechts[i];
        const noteX = currentX + 20 + i * noteSpacing;
        const { position } = getStaffPosition(noot.noot, noot.hand);
        const noteY = positionToY(position, "treble");
        trebleNotes.push({ noot, x: noteX, y: noteY });
      }

      for (let i = 0; i < links.length; i++) {
        const noot = links[i];
        const noteX = currentX + 20 + i * noteSpacing;
        const { position } = getStaffPosition(noot.noot, noot.hand);
        const noteY = positionToY(position, "bass");
        bassNotes.push({ noot, x: noteX, y: noteY });
      }

      measures.push({
        maat,
        x: currentX,
        width: measureWidth,
        trebleNotes,
        bassNotes,
      });

      currentX += measureWidth;
    }

    return { measures, totalWidth: currentX + SC.RIGHT_PADDING };
  }, [maatNoten]);

  const trebleTopY = getTrebleTopY();
  const bassTopY = getBassTopY();
  const totalHeight =
    40 + SC.STAFF_HEIGHT + SC.STAFF_GAP + SC.STAFF_HEIGHT + 30;

  const isSelectedNoot = (noot: NootData) =>
    selectedNoot !== null &&
    selectedNoot.noot === noot.noot &&
    selectedNoot.beatPositie === noot.beatPositie &&
    selectedNoot.hand === noot.hand;

  return (
    <svg
      viewBox={`0 0 ${layout.totalWidth} ${totalHeight}`}
      width={layout.totalWidth}
      height={totalHeight}
      className="block"
      style={{ minWidth: layout.totalWidth }}
    >
      {/* Achtergrond */}
      <rect
        x={0}
        y={0}
        width={layout.totalWidth}
        height={totalHeight}
        fill="#0f172a"
        rx={8}
      />

      {/* Balklijnen */}
      <StaffLines topY={trebleTopY} width={layout.totalWidth} />
      <StaffLines topY={bassTopY} width={layout.totalWidth} />

      {/* Sleutels */}
      <TrebleClef x={6} y={trebleTopY - 8} />
      <BassClef x={10} y={bassTopY - 4} />

      {/* Maatsoort */}
      {maatsoort && (
        <>
          <text
            x={44}
            y={trebleTopY + SC.STEP * 3}
            fontSize={16}
            fontWeight="bold"
            fill="#94a3b8"
            style={{ userSelect: "none" }}
          >
            {maatsoort.split("/")[0]}
          </text>
          <text
            x={44}
            y={trebleTopY + SC.STEP * 7}
            fontSize={16}
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
          {/* Maatstreep aan het begin */}
          <line
            x1={m.x}
            y1={trebleTopY}
            x2={m.x}
            y2={bassTopY + SC.STAFF_HEIGHT}
            stroke={SC.BARLINE_COLOR}
            strokeWidth={1}
          />

          {/* Akkoord label boven de balk */}
          {m.maat.akkoord && (
            <text
              x={m.x + 20}
              y={trebleTopY - 12}
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
            y={trebleTopY - 12}
            fontSize={9}
            fill="#475569"
            style={{ userSelect: "none" }}
          >
            {m.maat.maatNummer}
          </text>

          {/* Treble noten */}
          {m.trebleNotes.map((n, ni) => (
            <NoteHead
              key={`t-${mi}-${ni}`}
              x={n.x}
              y={n.y}
              noot={n.noot}
              isSelected={isSelectedNoot(n.noot)}
              onClick={() => onNootSelect(n.noot)}
            />
          ))}

          {/* Bass noten */}
          {m.bassNotes.map((n, ni) => (
            <NoteHead
              key={`b-${mi}-${ni}`}
              x={n.x}
              y={n.y}
              noot={n.noot}
              isSelected={isSelectedNoot(n.noot)}
              onClick={() => onNootSelect(n.noot)}
            />
          ))}
        </g>
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

      {/* Verbindingslijnen links (brace) */}
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
