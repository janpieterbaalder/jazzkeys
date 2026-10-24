import { describe, expect, it } from "vitest";
import { getVoicing, midiToNote, parseNote } from "./piano-utils";

describe("parseNote", () => {
  it("rekent midi-nummers uit, ook voor mollen", () => {
    expect(parseNote("C4").midi).toBe(60);
    expect(parseNote("A4").midi).toBe(69);
    expect(parseNote("Bb3").midi).toBe(58);
    expect(parseNote("F#5").midi).toBe(78);
    expect(() => parseNote("H2")).toThrow();
  });
  it("is omkeerbaar via midiToNote", () => {
    expect(midiToNote(61)).toBe("C#4");
  });
});

describe("getVoicing", () => {
  it("shell voicing Dm7 = D-F-C", () => {
    expect(getVoicing("D", "min7", "shell").notes).toEqual(["D3", "F3", "C4"]);
  });
  it("rootless A G7 = B-D-F-A", () => {
    expect(getVoicing("G", "dom7", "rootless-a").notes).toEqual(["B3", "D4", "F4", "A4"]);
  });
});
