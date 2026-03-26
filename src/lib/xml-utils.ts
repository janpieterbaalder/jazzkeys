/**
 * MusicXML preprocessor — normalizes split-part piano XMLs into proper grand staff format.
 *
 * Problem: music21 exports piano as 2 separate <part> elements instead of
 * 1 part with <staves>2</staves>. OSMD then treats them as separate instruments
 * and mispositions rests.
 *
 * This preprocessor detects this pattern and merges the parts into a single
 * grand staff piano part before OSMD renders it.
 */

/**
 * Detect whether this MusicXML has a split piano that needs merging.
 * Heuristic: exactly 2 parts where Part 1 has G-clef and Part 2 has F-clef,
 * or part names suggest piano hands.
 */
function isSplitPiano(doc: Document): boolean {
  const parts = doc.querySelectorAll("score-partwise > part");
  if (parts.length !== 2) return false;

  // Check if the single-part already has <staves>2</staves> — if so, it's already correct
  const staves = parts[0].querySelector("attributes > staves");
  if (staves) return false;

  // Check clef signs
  const clef1 = parts[0].querySelector("measure > attributes > clef > sign");
  const clef2 = parts[1].querySelector("measure > attributes > clef > sign");

  if (clef1?.textContent === "G" && clef2?.textContent === "F") return true;

  // Check part names
  const partList = doc.querySelectorAll("part-list > score-part");
  if (partList.length === 2) {
    const name1 = partList[0].querySelector("part-name")?.textContent?.toLowerCase() ?? "";
    const name2 = partList[1].querySelector("part-name")?.textContent?.toLowerCase() ?? "";
    const pianoKeywords = ["piano", "rechts", "links", "right", "left", "instrument1"];
    const match1 = pianoKeywords.some((k) => name1.includes(k));
    const match2 = pianoKeywords.some((k) => name2.includes(k));
    if (match1 && match2) return true;
  }

  return false;
}

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
 * Merge two separate piano parts into one grand staff part.
 */
function mergePianoParts(doc: Document): void {
  const parts = doc.querySelectorAll("score-partwise > part");
  const treblePart = parts[0];
  const bassPart = parts[1];

  const trebleMeasures = treblePart.querySelectorAll("measure");
  const bassMeasures = bassPart.querySelectorAll("measure");

  // Step 1: Update part-list to single piano part with both clefs
  const partList = doc.querySelector("part-list");
  if (partList) {
    const scoreParts = partList.querySelectorAll("score-part");
    // Keep the first, remove the second
    const firstScorePart = scoreParts[0];
    firstScorePart.querySelector("part-name")!.textContent = "Piano";
    if (scoreParts[1]) scoreParts[1].remove();
  }

  // Step 2: Process each treble measure — add staff/voice to notes, then append bass notes
  const measureCount = Math.max(trebleMeasures.length, bassMeasures.length);

  for (let i = 0; i < measureCount; i++) {
    const trebleMeasure = i < trebleMeasures.length ? trebleMeasures[i] : null;
    const bassMeasure = i < bassMeasures.length ? bassMeasures[i] : null;

    if (!trebleMeasure) continue;

    // Add <staves>2</staves> to the first measure's attributes
    if (i === 0) {
      let attrs = trebleMeasure.querySelector("attributes");
      if (!attrs) {
        attrs = doc.createElement("attributes");
        trebleMeasure.insertBefore(attrs, trebleMeasure.firstChild);
      }

      // Add staves declaration
      if (!attrs.querySelector("staves")) {
        const stavesEl = doc.createElement("staves");
        stavesEl.textContent = "2";
        // Insert after <time> or at end of attributes
        const time = attrs.querySelector("time");
        if (time && time.nextSibling) {
          attrs.insertBefore(stavesEl, time.nextSibling);
        } else {
          attrs.appendChild(stavesEl);
        }
      }

      // Add second clef (F-clef for staff 2)
      const existingClefs = attrs.querySelectorAll("clef");
      const hasStaff2Clef = Array.from(existingClefs).some(
        (c) => c.getAttribute("number") === "2"
      );
      if (!hasStaff2Clef) {
        // Get bass clef info from the bass part
        const bassClef = bassMeasure?.querySelector("attributes > clef");
        const newClef = doc.createElement("clef");
        newClef.setAttribute("number", "2");
        const sign = doc.createElement("sign");
        sign.textContent = bassClef?.querySelector("sign")?.textContent ?? "F";
        const line = doc.createElement("line");
        line.textContent = bassClef?.querySelector("line")?.textContent ?? "4";
        newClef.appendChild(sign);
        newClef.appendChild(line);
        attrs.appendChild(newClef);
      }

      // Mark the existing treble clef as staff 1
      const trebleClef = existingClefs[0];
      if (trebleClef && !trebleClef.getAttribute("number")) {
        trebleClef.setAttribute("number", "1");
      }

      // Copy key and time from bass part if missing
      if (bassMeasure) {
        const bassAttrs = bassMeasure.querySelector("attributes");
        if (bassAttrs) {
          // Copy key signature to staff 2 if needed (usually same, but just in case)
          const bassKey = bassAttrs.querySelector("key");
          if (bassKey && !Array.from(attrs.querySelectorAll("key")).some(k => k.getAttribute("number") === "2")) {
            // Only add if different from treble key
            const trebleKey = attrs.querySelector("key");
            const trebleFifths = trebleKey?.querySelector("fifths")?.textContent;
            const bassFifths = bassKey.querySelector("fifths")?.textContent;
            if (trebleFifths !== bassFifths) {
              const newKey = bassKey.cloneNode(true) as Element;
              newKey.setAttribute("number", "2");
              attrs.appendChild(newKey);
            }
          }
        }
      }
    }

    // Step 3: Add <staff>1</staff> to all treble notes that don't have a staff
    addStaffToNotes(trebleMeasure, "1", doc);

    // Remap treble voices: ensure they use 1-2
    remapVoices(trebleMeasure, { "1": "1", "2": "2" }, "1", doc);

    // Step 4: Append bass measure content with <staff>2</staff>
    if (bassMeasure) {
      // Calculate total duration of treble part for the backup element
      const trebleDuration = calculateMeasureDuration(trebleMeasure);

      if (trebleDuration > 0) {
        // Add backup to go back to start of measure
        const backup = doc.createElement("backup");
        const durEl = doc.createElement("duration");
        durEl.textContent = String(trebleDuration);
        backup.appendChild(durEl);
        trebleMeasure.appendChild(backup);
      }

      // Copy all note elements from bass measure, adding staff=2
      const bassNotes = bassMeasure.querySelectorAll("note, forward, backup");
      for (const node of bassNotes) {
        const clone = node.cloneNode(true) as Element;
        if (clone.tagName === "note") {
          addStaffElement(clone, "2", doc);
          // Remap bass voices to 3-4 (avoid collision with treble 1-2)
          remapVoiceElement(clone, { "5": "3", "6": "4" }, "3", doc);
        }
        trebleMeasure.appendChild(clone);
      }
    }
  }

  // Step 5: Remove the bass part entirely
  bassPart.remove();
}

/**
 * Add <staff> element to all <note> elements in a measure that don't have one.
 */
function addStaffToNotes(measure: Element, staffNum: string, doc: Document): void {
  const notes = measure.querySelectorAll("note");
  for (const note of notes) {
    addStaffElement(note, staffNum, doc);
  }
}

/**
 * Add <staff> element to a single note if it doesn't have one.
 * MusicXML element order: pitch/rest, duration, tie, voice, type, dot, accidental,
 * time-modification, stem, notehead, staff, beam, notations, lyric
 * So <staff> must come after <stem> (or <notehead>, <type>) and before <beam>.
 */
function addStaffElement(note: Element, staffNum: string, doc: Document): void {
  if (note.querySelector("staff")) return;
  const staff = doc.createElement("staff");
  staff.textContent = staffNum;
  // Insert in correct MusicXML order: after stem > notehead > type > voice > duration
  const stem = note.querySelector("stem");
  const notehead = note.querySelector("notehead");
  const type = note.querySelector("type");
  const dots = note.querySelectorAll("dot");
  const lastDot = dots.length > 0 ? dots[dots.length - 1] : null;
  const accidental = note.querySelector("accidental");
  const timeMod = note.querySelector("time-modification");

  // Find the best insertion point: after the latest of stem/notehead/accidental/dot/type
  const candidates = [stem, notehead, timeMod, accidental, lastDot as Element | null, type].filter(Boolean) as Element[];
  // Pick the one that appears latest in the document
  let insertAfter: Element | null = null;
  for (const c of candidates) {
    if (!insertAfter || c.compareDocumentPosition(insertAfter) & Node.DOCUMENT_POSITION_PRECEDING) {
      insertAfter = c;
    }
  }

  if (insertAfter && insertAfter.nextSibling) {
    note.insertBefore(staff, insertAfter.nextSibling);
  } else if (insertAfter) {
    note.parentNode?.appendChild(staff);
  } else {
    // Fallback: insert at end
    note.appendChild(staff);
  }
}

/**
 * Remap <voice> elements within a measure. If a note has no voice, assign defaultVoice.
 */
function remapVoices(
  measure: Element,
  voiceMap: Record<string, string>,
  defaultVoice: string,
  doc: Document
): void {
  const notes = measure.querySelectorAll("note");
  for (const note of notes) {
    remapVoiceElement(note, voiceMap, defaultVoice, doc);
  }
}

/**
 * Remap or add <voice> element on a single note.
 */
function remapVoiceElement(
  note: Element,
  voiceMap: Record<string, string>,
  defaultVoice: string,
  doc: Document
): void {
  let voiceEl = note.querySelector("voice");
  if (voiceEl) {
    const current = voiceEl.textContent ?? "";
    if (voiceMap[current]) {
      voiceEl.textContent = voiceMap[current];
    }
  } else {
    // Add voice element if missing
    voiceEl = doc.createElement("voice");
    voiceEl.textContent = defaultVoice;
    // Insert after <duration>
    const duration = note.querySelector("duration");
    if (duration && duration.nextSibling) {
      note.insertBefore(voiceEl, duration.nextSibling);
    } else {
      note.appendChild(voiceEl);
    }
  }
}

/**
 * Calculate the total forward duration of a measure (for the backup element).
 * Only counts top-level forward movement (not backup sections).
 */
function calculateMeasureDuration(measure: Element): number {
  let duration = 0;
  let inBackup = false;

  for (const child of measure.children) {
    if (child.tagName === "backup") {
      inBackup = true;
      continue;
    }
    if (child.tagName === "note" && !inBackup) {
      // If it's a chord note (has <chord>), don't add duration
      if (child.querySelector("chord")) continue;
      const dur = child.querySelector("duration");
      if (dur) duration += parseInt(dur.textContent ?? "0", 10);
    }
    if (child.tagName === "forward" && !inBackup) {
      const dur = child.querySelector("duration");
      if (dur) duration += parseInt(dur.textContent ?? "0", 10);
    }
  }

  return duration;
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

  // Note: We do NOT merge split piano parts. OSMD handles 2-part piano XMLs
  // correctly (as confirmed by testing with Soundslice). The original structure
  // from music21/Audiveris is valid MusicXML.

  return new XMLSerializer().serializeToString(doc);
}
