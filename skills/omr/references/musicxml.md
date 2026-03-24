# MusicXML Format Reference

## Overview

MusicXML is the standard open format for exchanging digital sheet music.
It's supported by virtually all music notation software (MuseScore, Finale,
Sibelius, Dorico, etc.) and is the bridge between OMR engines and renderers.

**Spec**: https://www.w3.org/2021/06/musicxml40/
**Current version**: 4.0
**Format**: XML-based (.musicxml or compressed .mxl)

## Basic Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN"
  "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <work>
    <work-title>Midwayer</work-title>
  </work>
  <identification>
    <creator type="composer">Joep Beving</creator>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>Piano</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <!-- notes, rests, clefs, time signatures, etc. -->
    </measure>
  </part>
</score-partwise>
```

## Key Elements

### Attributes (at start of piece or when they change)
```xml
<attributes>
  <divisions>4</divisions>        <!-- subdivisions per quarter note -->
  <key>
    <fifths>0</fifths>            <!-- 0=C/Am, 1=G, -1=F, etc. -->
    <mode>major</mode>
  </key>
  <time>
    <beats>4</beats>
    <beat-type>4</beat-type>       <!-- 4/4 time -->
  </time>
  <clef>
    <sign>G</sign>                 <!-- G=treble, F=bass, C=alto -->
    <line>2</line>
  </clef>
</attributes>
```

### Notes
```xml
<!-- Quarter note C4 (middle C) -->
<note>
  <pitch>
    <step>C</step>
    <octave>4</octave>
  </pitch>
  <duration>4</duration>           <!-- in divisions -->
  <type>quarter</type>
  <stem>up</stem>
  <voice>1</voice>
  <staff>1</staff>
</note>

<!-- Dotted half note -->
<note>
  <pitch>
    <step>G</step>
    <octave>4</octave>
  </pitch>
  <duration>12</duration>          <!-- 8 + 4 = 12 divisions -->
  <type>half</type>
  <dot/>                           <!-- augmentation dot -->
  <stem>up</stem>
  <voice>1</voice>
</note>

<!-- Rest -->
<note>
  <rest/>
  <duration>4</duration>
  <type>quarter</type>
  <voice>1</voice>
</note>

<!-- Accidentals -->
<note>
  <pitch>
    <step>B</step>
    <alter>-1</alter>              <!-- -1=flat, 1=sharp, 0=natural -->
    <octave>3</octave>
  </pitch>
  <duration>4</duration>
  <type>quarter</type>
  <accidental>flat</accidental>
</note>
```

### Voices (multiple voices on same staff)
Voice 1 typically has stems up, voice 2 has stems down.
```xml
<!-- Voice 1: melody -->
<note>
  <pitch><step>E</step><octave>5</octave></pitch>
  <duration>4</duration>
  <type>quarter</type>
  <voice>1</voice>
  <stem>up</stem>
</note>

<!-- Voice 2: accompaniment (same beat) -->
<note>
  <pitch><step>C</step><octave>4</octave></pitch>
  <duration>12</duration>
  <type>half</type>
  <dot/>
  <voice>2</voice>
  <stem>down</stem>
</note>
```

### Chords (multiple notes sounding simultaneously)
Use `<chord/>` to stack notes at the same beat position:
```xml
<note>
  <pitch><step>C</step><octave>4</octave></pitch>
  <duration>4</duration>
  <type>quarter</type>
</note>
<note>
  <chord/>                        <!-- same onset as previous note -->
  <pitch><step>E</step><octave>4</octave></pitch>
  <duration>4</duration>
  <type>quarter</type>
</note>
```

### Ties
```xml
<!-- First note: start tie -->
<note>
  <pitch><step>G</step><octave>4</octave></pitch>
  <duration>8</duration>
  <type>half</type>
  <tie type="start"/>
  <notations>
    <tied type="start"/>
  </notations>
</note>

<!-- Second note (next measure): stop tie -->
<note>
  <pitch><step>G</step><octave>4</octave></pitch>
  <duration>4</duration>
  <type>quarter</type>
  <tie type="stop"/>
  <notations>
    <tied type="stop"/>
  </notations>
</note>
```

### Dynamics
```xml
<direction placement="below">
  <direction-type>
    <dynamics>
      <p/>                        <!-- piano (soft) -->
    </dynamics>
  </direction-type>
</direction>
```

### Slurs
```xml
<note>
  <pitch>...</pitch>
  <notations>
    <slur type="start" number="1"/>
  </notations>
</note>
<!-- ... more notes ... -->
<note>
  <pitch>...</pitch>
  <notations>
    <slur type="stop" number="1"/>
  </notations>
</note>
```

### Pedal
```xml
<direction>
  <direction-type>
    <pedal type="start"/>
  </direction-type>
</direction>
```

## Duration Math

The `<divisions>` element defines how many subdivisions fit in a quarter note.
If divisions=4:
- Whole note: duration=16
- Half note: duration=8
- Dotted half: duration=12 (8 + 4)
- Quarter note: duration=4
- Eighth note: duration=2
- Sixteenth note: duration=1

## Grand Staff (Piano)

Piano uses two staves. In MusicXML, this is one `<part>` with two `<staff>` elements:

```xml
<attributes>
  <staves>2</staves>
  <clef number="1"><sign>G</sign><line>2</line></clef>
  <clef number="2"><sign>F</sign><line>4</line></clef>
</attributes>

<!-- Treble staff note -->
<note>
  <pitch><step>G</step><octave>4</octave></pitch>
  <staff>1</staff>
  <voice>1</voice>
</note>

<!-- Bass staff note -->
<note>
  <pitch><step>C</step><octave>3</octave></pitch>
  <staff>2</staff>
  <voice>3</voice>      <!-- voices 1-2 for staff 1, 3-4 for staff 2 -->
</note>
```

## Compressed MusicXML (.mxl)

.mxl files are ZIP archives containing:
- `META-INF/container.xml` — points to the main .musicxml file
- `*.musicxml` — the actual score data

To read .mxl in JavaScript:
```ts
import JSZip from "jszip";

async function readMxl(buffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const container = await zip.file("META-INF/container.xml")?.async("text");
  // Parse container to find the musicxml filename
  const match = container?.match(/full-path="([^"]+)"/);
  const xmlFile = match?.[1] || Object.keys(zip.files).find(f => f.endsWith(".musicxml"));
  if (!xmlFile) throw new Error("No MusicXML found in .mxl");
  return zip.file(xmlFile)!.async("text");
}
```
