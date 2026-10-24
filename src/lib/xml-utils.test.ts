// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { normalizePianoXml } from "./xml-utils";

const score = (measures: string, clefLine = 2) => `<?xml version="1.0"?>
<score-partwise version="4.0">
  <part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list>
  <part id="P1">
    <measure number="0"><attributes><clef><sign>G</sign><line>${clefLine}</line></clef></attributes></measure>
    ${measures}
  </part>
</score-partwise>`;

describe("normalizePianoXml", () => {
  it("hernummert maten die allemaal 0 zijn (music21)", () => {
    const out = normalizePianoXml(score('<measure number="0"/><measure number="0"/>'));
    expect(out).toContain('number="1"');
    expect(out).toContain('number="3"');
  });

  it("zet een G-sleutel op lijn 3 terug naar lijn 2 (Audiveris)", () => {
    const out = normalizePianoXml(score("", 3));
    expect(out).toContain("<line>2</line>");
  });

  it("laat ongeldige XML ongemoeid", () => {
    expect(normalizePianoXml("<niet-af")).toBe("<niet-af");
  });
});
