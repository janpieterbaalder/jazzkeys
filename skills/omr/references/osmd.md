# OpenSheetMusicDisplay (OSMD) — Browser Renderer Reference

## Overview

OSMD is a TypeScript library that renders MusicXML as interactive sheet music
in web browsers. Built on VexFlow (music engraving engine).

**Website**: https://opensheetmusicdisplay.org/
**GitHub**: https://github.com/opensheetmusicdisplay/opensheetmusicdisplay
**npm**: `opensheetmusicdisplay`
**License**: BSD-3-Clause (free for commercial use)
**Latest**: v1.9.0 (March 2025)

## Installation

```bash
npm install opensheetmusicdisplay
```

## Basic Usage

```ts
import { OpenSheetMusicDisplay as OSMD } from "opensheetmusicdisplay";

// Create instance with a container element
const osmd = new OSMD(document.getElementById("sheet-music"), options);

// Load MusicXML (string or URL)
await osmd.load(musicXmlString);
// or: await osmd.load("https://example.com/score.musicxml");

// Render
osmd.render();
```

## Configuration Options (IOSMDOptions)

### Dark Mode & Colors
```ts
{
  darkMode: true,                        // Black bg, white notation
  pageBackgroundColor: "#0f172a",        // Custom background
  defaultColorMusic: "#e2e8f0",          // All notation elements
  defaultColorNotehead: "#60a5fa",       // Note heads specifically
  defaultColorStem: "#94a3b8",           // Stems
  defaultColorRest: "#64748b",           // Rest symbols
  defaultColorLabel: "#cbd5e1",          // Text labels
  defaultColorTitle: "#f1f5f9",          // Score title
}
```

### Rendering Control
```ts
{
  backend: "svg",                        // "svg" or "canvas"
  autoResize: true,                      // Responsive scaling
  drawTitle: true,
  drawSubtitle: true,
  drawComposer: true,
  drawMeasureNumbers: true,
  measureNumberInterval: 1,              // Show every N measures
  drawTimeSignatures: true,
  drawMetronomeMarks: true,
  drawFingerings: false,
  drawLyrics: true,
  drawSlurs: true,
  drawCredits: false,
}
```

### Content Range (partial rendering)
```ts
{
  drawFromMeasureNumber: 1,              // Start at measure N
  drawUpToMeasureNumber: 16,             // End at measure N
  drawUpToPageNumber: 1,                 // Limit pages
}
```

### Layout
```ts
{
  pageFormat: "Endless",                 // "A4 P", "A4 L", "Endless"
  spacingFactorSoftmax: 1.0,            // Note spacing density
  stretchLastSystemLine: false,          // Justify last line
  renderSingleHorizontalStaffline: false,
}
```

### Cursor & Playback
```ts
{
  disableCursor: false,
  followCursor: true,                    // Auto-scroll with cursor
  cursorsOptions: [{                     // Multiple cursors
    type: 0,                             // 0=standard, 1=thin
    color: "#60a5fa",
    alpha: 0.5,
  }],
}
```

### Note Coloring
```ts
{
  coloringEnabled: true,
  coloringMode: 0,                       // Custom coloring mode
  coloringSetCustom: ["#ff0000", ...],   // Custom color palette
}
```

### XML Processing
```ts
{
  onXMLRead: (xml) => modifiedXml,       // Transform XML before rendering
  newSystemFromXML: true,                // Respect line breaks in XML
  newPageFromXML: true,                  // Respect page breaks in XML
  useXMLMeasureNumbers: true,
}
```

## Cursor API

```ts
// Show/hide cursor
osmd.cursor.show();
osmd.cursor.hide();

// Navigate
osmd.cursor.next();           // Advance one beat
osmd.cursor.previous();       // Go back one beat
osmd.cursor.reset();          // Go to beginning

// Check position
osmd.cursor.iterator.EndReached;   // boolean
osmd.cursor.iterator.CurrentMeasureIndex;

// Auto-play at tempo
function autoPlay(bpm: number) {
  const ms = 60000 / bpm;
  const timer = setInterval(() => {
    if (osmd.cursor.iterator.EndReached) {
      clearInterval(timer);
      return;
    }
    osmd.cursor.next();
  }, ms);
  return timer;
}
```

## Accessing Notes Programmatically

OSMD exposes the full music data model after loading:

```ts
// All source measures
const measures = osmd.Sheet.SourceMeasures;

for (const measure of measures) {
  // Each measure has vertical containers (one per beat position)
  for (const container of measure.VerticalSourceStaffEntryContainers) {
    for (const staffEntry of container.StaffEntries) {
      if (!staffEntry) continue;
      for (const voiceEntry of staffEntry.VoiceEntries) {
        for (const note of voiceEntry.Notes) {
          // note.Pitch — pitch info
          // note.Length — duration
          // note.NoteheadColor — can set individual colors
        }
      }
    }
  }
}
```

## React Integration

### Official React Component
```bash
npm install react-opensheetmusicdisplay
```

### Custom React Component (more control)
```tsx
"use client";
import { useEffect, useRef, useCallback } from "react";
import type { OpenSheetMusicDisplay as OSMDType } from "opensheetmusicdisplay";

interface Props {
  musicXml: string;
  onNoteClick?: (note: { pitch: string; measure: number }) => void;
}

export default function MusicScore({ musicXml, onNoteClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OSMDType | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!containerRef.current || !musicXml) return;

      // Dynamic import (OSMD is large, avoid SSR)
      const { OpenSheetMusicDisplay } = await import("opensheetmusicdisplay");

      if (!mounted) return;

      const osmd = new OpenSheetMusicDisplay(containerRef.current, {
        darkMode: true,
        pageBackgroundColor: "#0f172a",
        defaultColorMusic: "#e2e8f0",
        defaultColorNotehead: "#60a5fa",
        defaultColorStem: "#94a3b8",
        backend: "svg",
        autoResize: true,
        drawMeasureNumbers: true,
        followCursor: true,
      });

      await osmd.load(musicXml);
      osmd.render();
      osmdRef.current = osmd;
    }

    init();
    return () => { mounted = false; };
  }, [musicXml]);

  return (
    <div
      ref={containerRef}
      className="overflow-x-auto"
      style={{ minHeight: 200 }}
    />
  );
}
```

## Horizontal Scrolling (Endless Mode)

For mobile landscape / horizontal scroll:
```ts
{
  pageFormat: "Endless",        // One continuous horizontal line
  renderSingleHorizontalStaffline: true,
}
```
Wrap the container in `overflow-x-auto` for touch scrolling.

## Performance Notes

- OSMD is a large library (~1MB). Use dynamic imports to avoid SSR issues
- For very long scores (100+ measures), consider rendering in chunks using
  `drawFromMeasureNumber` / `drawUpToMeasureNumber`
- SVG backend is better for interactivity (clickable elements)
- Canvas backend is faster for very large scores
