/**
 * Hulpfuncties die werken op de door OpenSheetMusicDisplay gerenderde SVG.
 */

/** x-posities (SVG-pixels) van alle maatstrepen, gesorteerd en ontdubbeld. */
export function getBarlineXs(svgEl: SVGSVGElement): number[] {
  const xs = new Set<number>();
  for (const r of svgEl.querySelectorAll("rect")) {
    const w = parseFloat(r.getAttribute("width") || "0");
    const h = parseFloat(r.getAttribute("height") || "0");
    // Maatstrepen: smalle (≤ 2px), hoge (> 30px) rechthoeken
    if (w <= 2 && h > 30) {
      xs.add(Math.round(parseFloat(r.getAttribute("x") || "0") * 100) / 100);
    }
  }
  return [...xs].sort((a, b) => a - b);
}

/**
 * Post-render correcties voor "Midwayer" (Joep Beving), een music21-export
 * waarin OSMD de bas-rusten in maat 1–12 te laag plaatst en de fermate in
 * maat 12 tegen de balk drukt.
 *
 * LET OP: dit is specifiek voor dat ene bestand (maatnummers en kleuren zijn
 * hard gecodeerd). Alleen aanroepen via `renderFixes="midwayer"`.
 */
export function applyMidwayerFixes(svgEl: SVGSVGElement) {
  // Find bass staff top Y from barline rects.
  // Barlines are 1px-wide, ~41px-tall rects. Treble barlines start at ~85,
  // bass barlines start at ~195. We need the highest bass barline Y.
  const rects = svgEl.querySelectorAll("rect");
  let trebleBarY = Infinity;
  let bassBarY = -Infinity;
  for (const r of rects) {
    const w = parseFloat(r.getAttribute("width") || "0");
    const h = parseFloat(r.getAttribute("height") || "0");
    if (w <= 2 && h > 30 && h < 60) {
      const y = parseFloat(r.getAttribute("y") || "0");
      trebleBarY = Math.min(trebleBarY, y);
      bassBarY = Math.max(bassBarY, y);
    }
  }

  if (bassBarY <= trebleBarY) return;

  // Bass staff: top line = bassBarY, bottom line = bassBarY + barHeight
  const bassTopLine = bassBarY;
  const bassStaffHeight = 41; // 5 lines, 4 spaces of ~10px

  // Find the X boundary of measure 12: the 12th barline marks the end of measure 12.
  // Barlines are 1px-wide tall rects sorted by X position.
  const barlineXs: number[] = [];
  for (const r of rects) {
    const w = parseFloat(r.getAttribute("width") || "0");
    const h = parseFloat(r.getAttribute("height") || "0");
    if (w <= 2 && h > 30 && h < 60) {
      barlineXs.push(parseFloat(r.getAttribute("x") || "0"));
    }
  }
  const uniqueBarXs = [...new Set(barlineXs.map(x => Math.round(x)))].sort((a, b) => a - b);
  // The 12th unique barline X is the right edge of measure 12
  const maxX = uniqueBarXs.length >= 12 ? uniqueBarXs[11] + 5 : Infinity;

  // Move rest-colored paths (#64748b) in the bass staff to the top line.
  // Only for the first 12 measures (multi-voice section).
  // Filter: must be complex path (dLen > 500) to avoid moving stems/simple elements.
  const restColor = "#64748b";
  const paths = svgEl.querySelectorAll("path");
  for (const p of paths) {
    if (p.getAttribute("fill") !== restColor) continue;
    const d = p.getAttribute("d") || "";
    if (d.length < 500) continue; // Skip simple paths (stems, etc.)
    const match = d.match(/^M([\d.e+-]+)[\s,]+([\d.e+-]+)/);
    if (!match) continue;
    const px = parseFloat(match[1]);
    const py = parseFloat(match[2]);

    // Only first 12 measures
    if (px > maxX) continue;

    // Target rest paths in the bass staff area (from just below top line to below bottom)
    if (py < bassTopLine + 3 || py > bassTopLine + bassStaffHeight + 15) continue;

    // Shift up to sit on the bass top line
    const delta = bassTopLine - py;
    if (Math.abs(delta) > 1) {
      p.setAttribute("transform", `translate(0, ${delta})`);
    }
  }

  // Fix bass fermata in measure 12: the fermata is a complex glyph path
  // (24 C-curves, fill=#60a5fa) that sits just above the bass staff (y≈190).
  // Move it slightly upward so it doesn't crowd the staff.
  const m12StartX = uniqueBarXs.length >= 11 ? uniqueBarXs[10] : 0;
  const m12EndX = uniqueBarXs.length >= 12 ? uniqueBarXs[11] : 0;
  if (m12StartX > 0 && m12EndX > 0) {
    for (const p of paths) {
      if (p.getAttribute("fill") !== "#60a5fa") continue;
      const d = p.getAttribute("d") || "";
      const cCount = (d.match(/C/g) || []).length;
      // Fermata glyph has ~24 C-curves and is a large path (dLen > 1800)
      if (cCount < 20 || cCount > 28 || d.length < 1800) continue;
      const match = d.match(/^M([\d.e+-]+)[\s,]+([\d.e+-]+)/);
      if (!match) continue;
      const px = parseFloat(match[1]);
      const py = parseFloat(match[2]);
      // Must be within measure 12 X range and near the bass staff top
      if (px < m12StartX || px > m12EndX) continue;
      if (py < bassTopLine - 20 || py > bassTopLine + 5) continue;
      // Shift upward by 10px
      p.setAttribute("transform", "translate(0, -10)");
    }
  }
}
