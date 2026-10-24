/**
 * MusicXML-preprocessor: repareert bekende exportfouten voordat OSMD rendert.
 *
 * - music21 nummert soms alle maten "0"
 * - Audiveris zet de G-sleutel soms op lijn 3
 *
 * Gesplitste pianopartijen (twee <part>-elementen) worden bewust NIET
 * samengevoegd: OSMD rendert die correct als grand staff.
 */

/**
 * Fix measure numbers that are all "0" (music21 bug).
 */
function fixMeasureNumbers(doc: Document): void {
  const parts = doc.querySelectorAll("score-partwise > part");
  for (const part of parts) {
    const measures = part.querySelectorAll("measure");
    const allZero = Array.from(measures).every(
      (m) => m.getAttribute("number") === "0"
    );
    if (allZero) {
      measures.forEach((m, i) => m.setAttribute("number", String(i + 1)));
    }
  }
}

/**
 * Fix non-standard clef lines from Audiveris (G-clef on line 3 → line 2).
 */
function fixClefLines(doc: Document): void {
  const clefs = doc.querySelectorAll("clef");
  for (const clef of clefs) {
    const sign = clef.querySelector("sign");
    const line = clef.querySelector("line");
    if (sign?.textContent === "G" && line?.textContent === "3") {
      line.textContent = "2";
    }
  }
}

/**
 * Main entry point: normalize a MusicXML string for proper piano grand staff rendering.
 * Safe to call on any MusicXML — returns unchanged XML if no fixes are needed.
 */
export function normalizePianoXml(xmlString: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "application/xml");

  // Check for parse errors
  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    console.warn("XML parse error, returning original:", parseError.textContent);
    return xmlString;
  }

  // Fix measure numbers (music21 bug: all measures numbered "0")
  fixMeasureNumbers(doc);

  // Fix clef lines (Audiveris: G-clef on line 3)
  fixClefLines(doc);

  return new XMLSerializer().serializeToString(doc);
}
