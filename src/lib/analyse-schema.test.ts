import { describe, expect, it } from "vitest";
import { z } from "zod";
import { controleerMaten, PdfAnalyseSchema, type NootData } from "./analyse-schema";

const n = (over: Partial<NootData>): NootData => ({
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

describe("controleerMaten", () => {
  it("accepteert volle maten, akkoorden en meerdere stemmen", () => {
    const result = controleerMaten(
      [
        {
          maatNummer: 1,
          noten: [
            n({ beatPositie: 1, duur: "half" }),
            n({ noot: "E4", beatPositie: 1, duur: "half" }), // akkoordnoot
            n({ beatPositie: 3, duur: "half" }),
            n({ noot: "G3", stem: "omlaag", duur: "heel" }),
            n({ noot: "C3", hand: "links", duur: "heel" }),
          ],
        },
      ],
      "4/4"
    );
    expect(result).toEqual([]);
  });

  it("meldt maten waarin tellen ontbreken (maar niet een opmaat)", () => {
    const result = controleerMaten(
      [
        { maatNummer: 0, noten: [n({ beatPositie: 4 })] }, // opmaat
        { maatNummer: 1, noten: [n({ duur: "half" }), n({ beatPositie: 3 })] },
      ],
      "4/4"
    );
    expect(result).toEqual([
      { maatNummer: 1, hand: "rechts", stem: "omhoog", verwacht: 4, gevonden: 3 },
    ]);
  });

  it("rekent met de maatsoort", () => {
    expect(
      controleerMaten([{ maatNummer: 1, noten: [n({ duur: "half_met_punt" })] }], "3/4")
    ).toEqual([]);
  });
});

describe("PdfAnalyseSchema", () => {
  it("is om te zetten naar JSON Schema zonder open objecten", () => {
    const schema = z.toJSONSchema(PdfAnalyseSchema) as Record<string, unknown>;
    const json = JSON.stringify(schema);
    expect(json).toContain('"maatNoten"');
    // Structured outputs vereist additionalProperties:false op elk object
    const objects = json.match(/"type":"object"/g)?.length ?? 0;
    const closed = json.match(/"additionalProperties":false/g)?.length ?? 0;
    expect(closed).toBe(objects);
  });
});
