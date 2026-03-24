---
name: omr
description: >
  Optical Music Recognition — converting PDF sheet music into interactive web notation.
  Use this skill whenever the user wants to: convert PDF/image sheet music to MusicXML,
  render MusicXML as interactive notation in a browser, integrate Audiveris OMR into a
  web app pipeline, use OpenSheetMusicDisplay (OSMD) for sheet music rendering, build a
  dark-mode interactive music score viewer, add note-clicking/cursor/auto-scroll to sheet
  music, or work with MusicXML data (parsing, transforming, displaying). Also trigger when
  the user mentions "bladmuziek", "notenbalk", "sheet music", "music notation", "OMR",
  "Audiveris", "OSMD", "VexFlow", or "MusicXML" in context of web development.
---

# OMR: PDF Sheet Music → Interactive Web Notation

This skill covers the full pipeline from scanned/digital sheet music PDFs to interactive,
dark-mode notation in a web browser.

## The Pipeline

```
PDF/Image  →  Audiveris (OMR engine)  →  MusicXML  →  OSMD (browser renderer)  →  Interactive Score
```

Each stage has specific tools, trade-offs, and integration patterns. Read the relevant
reference file for deep detail on each component.

## Quick Decision Guide

| Task | Tool | Reference |
|------|------|-----------|
| Convert PDF to MusicXML | Audiveris CLI | `references/audiveris.md` |
| Render MusicXML in browser | OSMD | `references/osmd.md` |
| Understand MusicXML structure | — | `references/musicxml.md` |
| Full webapp integration | All of the above | This file (below) |

## Stage 1: PDF → MusicXML with Audiveris

Audiveris is a Java-based open-source OMR engine. It recognizes notes, rests, clefs, time
signatures, dynamics, slurs, ties, and more from sheet music images/PDFs.

### CLI Batch Mode (headless, no GUI)

```bash
# Basic conversion
audiveris -batch -export -output /path/to/output -- "input.pdf"

# Via Gradle (if building from source)
gradle run -PcmdLineArgs="-batch,-export,-output,/output,--,input.pdf"
```

Output: `.mxl` files (compressed MusicXML) in the output folder.

### Integration Patterns for Web Apps

Audiveris is Java — it cannot run in the browser or on serverless platforms like Vercel.
Three practical approaches:

**Option A: Microservice (recommended for production)**
Run Audiveris on a small VPS (e.g., a $5/month server) as a REST API:
1. Accept PDF uploads via HTTP POST
2. Run Audiveris CLI in batch mode
3. Return MusicXML as response
4. Cache results in database (Neon/Supabase) keyed by file hash

**Option B: Local conversion + upload**
User runs Audiveris on their own machine, then uploads the resulting MusicXML file
directly to the web app. Simple, no server costs, good for prototyping.

**Option C: Docker container**
```bash
docker run --rm -v /input:/input -v /output:/output toprock/audiveris
```
Note: the public Docker image (`toprock/audiveris`) is from 2018 and outdated.
For production, build your own from the latest Audiveris source.

### Accuracy Expectations

Audiveris is not 100% accurate. Expect:
- **Clean, printed scores** (like published sheet music): 85-95% accuracy
- **Handwritten or low-quality scans**: significantly lower
- **Common errors**: missed ties, wrong voice assignments, incorrect enharmonic spelling,
  missed dynamics, beam grouping issues

Always store the original MusicXML so users can manually correct errors later. Consider
a "correction mode" in your UI where users can flag/fix mistakes.

## Stage 2: MusicXML → Interactive Browser Rendering with OSMD

OpenSheetMusicDisplay (OSMD) is a TypeScript library that renders MusicXML as real sheet
music in the browser using VexFlow. See `references/osmd.md` for full API details.

### Quick Setup

```bash
npm install opensheetmusicdisplay
```

### Basic Integration (React)

```tsx
import { OpenSheetMusicDisplay as OSMD } from "opensheetmusicdisplay";
import { useEffect, useRef } from "react";

function SheetMusic({ musicXml }: { musicXml: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OSMD | null>(null);

  useEffect(() => {
    if (!containerRef.current || !musicXml) return;

    const osmd = new OSMD(containerRef.current, {
      // Dark mode
      darkMode: true,
      pageBackgroundColor: "#0f172a",
      defaultColorMusic: "#e2e8f0",

      // Note colors per voice
      defaultColorNotehead: "#60a5fa",
      defaultColorStem: "#94a3b8",
      defaultColorRest: "#64748b",

      // Layout
      backend: "svg",
      drawMeasureNumbers: true,
      drawTimeSignatures: true,
      drawSlurs: true,
      drawFingerings: false,

      // Cursor
      followCursor: true,
    });

    osmd.load(musicXml).then(() => {
      osmd.render();
      osmdRef.current = osmd;
    });

    return () => { osmdRef.current = null; };
  }, [musicXml]);

  return <div ref={containerRef} />;
}
```

### Dark Mode Configuration

```ts
const darkModeOptions = {
  darkMode: true,
  pageBackgroundColor: "#0f172a",     // slate-900
  defaultColorMusic: "#e2e8f0",       // slate-200 (all notation)
  defaultColorNotehead: "#60a5fa",    // blue-400 (note heads)
  defaultColorStem: "#94a3b8",        // slate-400 (stems)
  defaultColorRest: "#64748b",        // slate-500 (rests)
  defaultColorLabel: "#cbd5e1",       // slate-300 (text labels)
  defaultColorTitle: "#f1f5f9",       // slate-100 (title)
};
```

### Note Interaction (clicking)

OSMD renders SVG elements. To make notes clickable:

```ts
// After osmd.render(), query the SVG for note elements
const svgElement = containerRef.current?.querySelector("svg");
if (svgElement) {
  svgElement.addEventListener("click", (e) => {
    const target = e.target as SVGElement;
    // OSMD note heads have class "vf-notehead"
    const notehead = target.closest(".vf-notehead");
    if (notehead) {
      // Find the corresponding OSMD note object
      // This requires walking the OSMD data model
      handleNoteClick(notehead);
    }
  });
}
```

For more reliable note interaction, walk the OSMD internal model:
```ts
// Access all notes programmatically
for (const measureIterator of osmd.Sheet.SourceMeasures) {
  for (const staffEntry of measureIterator.VerticalSourceStaffEntryContainers) {
    // Each entry contains notes, rests, etc.
  }
}
```

### Cursor & Auto-Scroll

```ts
// Enable cursor
osmd.cursor.show();

// Auto-advance at tempo
function playAlongCursor(bpm: number) {
  const beatDuration = 60000 / bpm;
  const interval = setInterval(() => {
    if (osmd.cursor.iterator.EndReached) {
      clearInterval(interval);
      return;
    }
    osmd.cursor.next();
  }, beatDuration);
  return interval;
}

// Reset
osmd.cursor.reset();
```

## Stage 3: Full Pipeline Integration

### Recommended Architecture for a Next.js App

```
┌──────────────────┐     ┌─────────────────┐     ┌──────────────┐
│  User uploads PDF │────▶│  API Route       │────▶│  Audiveris   │
│  (browser)        │     │  /api/convert    │     │  (microservice│
└──────────────────┘     └────────┬────────┘     │   or local)  │
                                  │               └──────┬───────┘
                                  │                      │
                                  ▼                      ▼
                         ┌─────────────────┐     MusicXML returned
                         │  Store in DB     │◀────────────┘
                         │  (Neon/Postgres) │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  OSMD renders    │
                         │  in browser      │
                         │  (dark mode,     │
                         │   interactive)   │
                         └─────────────────┘
```

### Database Schema (Drizzle ORM)

```ts
export const musicScores = pgTable("music_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  originalPdfHash: text("original_pdf_hash").notNull().unique(),
  musicXml: text("music_xml").notNull(),
  metadata: jsonb("metadata"), // key, time sig, tempo, etc.
  createdAt: timestamp("created_at").defaultNow(),
});
```

Key by PDF hash so the same file is never processed twice.

### API Route Example

```ts
// app/api/convert/route.ts
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("pdf") as File;
  const buffer = Buffer.from(await file.arrayBuffer());

  // Check if already processed
  const hash = createHash("sha256").update(buffer).digest("hex");
  const existing = await db.select().from(musicScores)
    .where(eq(musicScores.originalPdfHash, hash)).limit(1);

  if (existing.length > 0) {
    return Response.json({ musicXml: existing[0].musicXml });
  }

  // Send to Audiveris microservice
  const musicXml = await callAudiverisService(buffer);

  // Store result
  await db.insert(musicScores).values({
    title: file.name.replace(".pdf", ""),
    originalPdfHash: hash,
    musicXml,
  });

  return Response.json({ musicXml });
}
```

## Error Handling & Quality

### Common OMR Errors and Mitigations

| Error | Cause | Mitigation |
|-------|-------|------------|
| Wrong note pitch | Poor scan quality | Pre-process images (contrast, deskew) |
| Missing ties/slurs | Thin curved lines | Audiveris settings tuning |
| Wrong voice assignment | Complex polyphony | Let user correct in UI |
| Missing dynamics | Small text | May need OCR tuning |
| Wrong key signature | Ambiguous accidentals | Cross-check with harmonic analysis |

### Pre-processing Tips

Before sending to Audiveris:
1. **Deskew** the image (straighten rotated scans)
2. **Increase contrast** (black notes on white background)
3. **Remove margins** (crop to just the music)
4. **Resolution**: 300 DPI is ideal; lower may cause errors

### User Correction Workflow

Since OMR is never 100% accurate, build a correction flow:
1. Show rendered MusicXML via OSMD
2. Let user click on incorrect notes
3. Provide a simple editor (change pitch, duration, add/remove)
4. Save corrections back to the MusicXML in the database
