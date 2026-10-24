import { describe, expect, it } from "vitest";
import type { MaatData, NootData } from "@/lib/analyse-schema";
import {
  buildMaatNotenTimeline,
  duurInKwarten,
  firstNoteIndexAt,
  notesSoundingAt,
  parseMaatsoort,
  parseTempo,
  timeAtX,
  xAtTime,
  type TimelineStep,
} from "./score-timeline";

const noot = (over: Partial<NootData>): NootData => ({
  noot: "C4",
  type: "noot",
  duur: "kwart",
  beatPositie: 1,
  hand: "rechts",
  stem: "omhoog",
  balkPositie: "",
  uitleg: "",
  ...over,
});

describe("duurInKwarten", () => {
  it("kent basisduren en puntnoten", () => {
    expect(duurInKwarten("heel")).toBe(4);
    expect(duurInKwarten("half")).toBe(2);
    expect(duurInKwarten("kwart")).toBe(1);
    expect(duurInKwarten("achtste")).toBe(0.5);
    expect(duurInKwarten("zestiende")).toBe(0.25);
    expect(duurInKwarten("half_met_punt")).toBe(3);
    expect(duurInKwarten("kwart_met_punt")).toBe(1.5);
  });
});

describe("parseTempo / parseMaatsoort", () => {
  it("haalt een BPM uit vrije tekst", () => {
    expect(parseTempo("♩ = 92")).toBe(92);
    expect(parseTempo("Andante (76)")).toBe(76);
    expect(parseTempo("Andante")).toBeNull();
    expect(parseTempo("")).toBeNull();
    expect(parseTempo("5")).toBeNull();
  });
  it("leest maatsoorten met fallback naar 4/4", () => {
    expect(parseMaatsoort("3/4")).toEqual({ beats: 3, unit: 4 });
    expect(parseMaatsoort("6 / 8")).toEqual({ beats: 6, unit: 8 });
    expect(parseMaatsoort("C")).toEqual({ beats: 4, unit: 4 });
    expect(parseMaatsoort(undefined)).toEqual({ beats: 4, unit: 4 });
  });
});

describe("buildMaatNotenTimeline", () => {
  const maten: MaatData[] = [
    {
      maatNummer: 1,
      noten: [
        noot({ noot: "rust", type: "rust", beatPositie: 1 }),
        noot({ noot: "E4", beatPositie: 2 }),
        noot({ noot: "G4", beatPositie: 3, duur: "half", verbinding: "overbinding" }),
        noot({ noot: "C3", hand: "links", duur: "heel" }),
      ],
    },
    {
      maatNummer: 2,
      noten: [
        noot({ noot: "G4", beatPositie: 1, duur: "kwart" }),
        noot({ noot: "A4", beatPositie: 2, duur: "half_met_punt" }),
        noot({ noot: "C3", hand: "links", duur: "heel" }),
      ],
    },
  ];

  it("zet tellen om naar seconden en slaat rusten over", () => {
    const tl = buildMaatNotenTimeline(maten, "4/4", 60);
    expect(tl.duration).toBe(8);
    expect(tl.beatsPerMeasure).toBe(4);
    expect(tl.beats).toHaveLength(8);
    expect(tl.beats.filter((b) => b.accent).map((b) => b.time)).toEqual([0, 4]);
    const e4 = tl.notes.find((n) => n.midi === 64)!;
    expect(e4.start).toBe(1);
    expect(e4.duration).toBe(1);
    expect(tl.notes.find((n) => n.midi === 48)?.part).toBe(1);
  });

  it("voegt overgebonden noten samen tot één langere noot", () => {
    const tl = buildMaatNotenTimeline(maten, "4/4", 60);
    const g4 = tl.notes.filter((n) => n.midi === 67);
    expect(g4).toHaveLength(1);
    expect(g4[0].start).toBe(2);
    expect(g4[0].duration).toBe(3); // half (2) + kwart (1)
  });

  it("schaalt met de bpm en de maatsoort-eenheid", () => {
    const tl = buildMaatNotenTimeline(
      [{ maatNummer: 1, noten: [noot({ beatPositie: 4, duur: "kwart" })] }],
      "6/8",
      120
    );
    // 6/8: tel = achtste, 120 tellen/min → 0.5 s per tel; kwart = 2 tellen = 1 s
    expect(tl.notes[0].start).toBe(1.5);
    expect(tl.notes[0].duration).toBe(1);
    expect(tl.duration).toBe(3);
  });
});

describe("notesSoundingAt / firstNoteIndexAt", () => {
  const notes = [
    { start: 0, duration: 4, midi: 48 },
    { start: 1, duration: 1, midi: 64 },
    { start: 2, duration: 1, midi: 67 },
  ];
  it("vindt klinkende noten", () => {
    expect(notesSoundingAt(notes, 1.5).map((n) => n.midi).sort()).toEqual([48, 64]);
    expect(notesSoundingAt(notes, 2).map((n) => n.midi).sort()).toEqual([48, 67]);
    expect(notesSoundingAt(notes, 5)).toEqual([]);
  });
  it("binary search op starttijd", () => {
    expect(firstNoteIndexAt(notes, 0)).toBe(0);
    expect(firstNoteIndexAt(notes, 0.5)).toBe(1);
    expect(firstNoteIndexAt(notes, 2)).toBe(2);
    expect(firstNoteIndexAt(notes, 9)).toBe(3);
  });
});

describe("xAtTime / timeAtX", () => {
  // Twee stappen, daarna een herhaling terug naar x=100
  const steps: TimelineStep[] = [
    { time: 0, x: 100, nextX: 200, nextTime: 1 },
    { time: 1, x: 200, nextX: 300, nextTime: 2 },
    { time: 2, x: 100, nextX: 200, nextTime: 3 },
  ];
  it("interpoleert tussen stappen", () => {
    expect(xAtTime(steps, 0)).toBe(100);
    expect(xAtTime(steps, 0.5)).toBe(150);
    expect(xAtTime(steps, 1.5)).toBe(250);
    expect(xAtTime(steps, 2.25)).toBe(125);
    expect(xAtTime([], 3)).toBe(0);
  });
  it("kiest bij herhalingen de dichtstbijzijnde doorgang", () => {
    expect(timeAtX(steps, 150, 0)).toBe(0.5);
    expect(timeAtX(steps, 150, 3)).toBe(2.5);
    expect(timeAtX(steps, 50)).toBe(0);
  });
});
