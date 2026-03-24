# Audiveris — OMR Engine Reference

## Overview

Audiveris is an open-source Java application for Optical Music Recognition (OMR).
It converts sheet music images and PDFs into MusicXML format.

**Repository**: https://github.com/Audiveris/audiveris
**License**: AGPL-3.0
**Language**: Java
**Output**: MusicXML 4.0 (.mxl compressed format)

## Installation

### Pre-built Installers (recommended)
Download from https://github.com/Audiveris/audiveris/releases
Since v5.5, installers include a bundled JRE — no separate Java install needed.

Available for: Windows, macOS, Linux.

### Build from Source
```bash
git clone https://github.com/Audiveris/audiveris.git
cd audiveris
./gradlew build
```
Requires: JDK 21+, Gradle.

### Docker
```bash
# Outdated public image (2018):
docker run --rm -v /input:/input -v /output:/output toprock/audiveris

# Better: build your own from latest source
docker build -t audiveris-latest .
```

## CLI Usage

### Basic Syntax
```bash
audiveris [OPTIONS] [--] [INPUT_FILES]
```

### Key Options

| Flag | Description |
|------|-------------|
| `-batch` | Run without GUI (headless mode) |
| `-export` | Export to MusicXML after processing |
| `-output <dir>` | Output directory for .omr and .mxl files |
| `-transcribe` | Full transcription pipeline |
| `-option <key>=<value>` | Override specific engine settings |

### Common Commands

```bash
# Convert a single PDF to MusicXML
audiveris -batch -export -output ./output -- "My Score.pdf"

# Convert multiple files
audiveris -batch -export -output ./output -- file1.pdf file2.png file3.tiff

# Via Gradle (development)
gradle run -PcmdLineArgs="-batch,-export,-output,./output,--,input.pdf"
```

### Input Formats
- PDF files (each page treated as a separate image)
- PNG, TIFF, JPG images
- `.omr` project files (resume previous work)

### Output
- `.omr` — Audiveris project file (intermediate, can be reopened for editing)
- `.mxl` — Compressed MusicXML (the standard export format)

When a score contains multiple movements, each becomes a separate .mxl file.

## Recognition Capabilities

### What Audiveris Recognizes
- Staff lines (5-line staves, grand staff)
- Clefs (treble, bass, alto, tenor)
- Key signatures
- Time signatures
- Note heads (filled, hollow, whole)
- Stems, beams, flags
- Rests (whole, half, quarter, eighth, sixteenth)
- Dots (augmentation dots)
- Accidentals (sharp, flat, natural, double sharp, double flat)
- Ties, slurs
- Dynamics (p, f, mf, ff, pp, etc.)
- Articulations (staccato, accent, tenuto)
- Tuplets (triplets, etc.)
- Grace notes
- Lyrics (using external OCR)
- Chord symbols (partially)
- Repeat signs, volta brackets

### Recognition Techniques
- Ad-hoc algorithms for staff line detection
- Morphological image processing for beams
- Template matching for note heads
- Neural networks for fixed-size symbols
- External OCR (Tesseract) for text/lyrics

## Accuracy & Limitations

### Expected Accuracy
- **Published/printed scores** (IMSLP quality): 85-95%
- **High-quality scans** (300 DPI+, good contrast): 80-90%
- **Low-quality scans** (< 200 DPI, skewed): 50-70%
- **Handwritten scores**: Very low, not designed for this

### Common Errors
1. **Voice assignment** — Polyphonic passages often need manual correction
2. **Ties vs slurs** — Thin curved lines can be ambiguous
3. **Cross-staff notes** — Notes that cross between treble and bass clef
4. **Grace notes** — Small notes sometimes missed or misidentified
5. **Complex rhythms** — Tuplets, syncopation may be simplified
6. **Dynamics** — Small text can be missed
7. **Chord symbols** — Only partially supported

### Tips for Better Results
1. Use 300 DPI scans minimum
2. Ensure good contrast (black on white)
3. Deskew (straighten) images before processing
4. Crop to just the music (remove titles, margins if possible)
5. Process one page at a time for complex scores

## Building a Microservice

For web app integration, wrap Audiveris in a simple HTTP service:

```python
# Simple Flask wrapper (Python calling Java CLI)
from flask import Flask, request, send_file
import subprocess, tempfile, os

app = Flask(__name__)

@app.route("/convert", methods=["POST"])
def convert():
    pdf = request.files["pdf"]
    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = os.path.join(tmpdir, "input.pdf")
        pdf.save(input_path)

        subprocess.run([
            "audiveris", "-batch", "-export",
            "-output", tmpdir, "--", input_path
        ], check=True, timeout=120)

        # Find the .mxl output
        mxl_files = [f for f in os.listdir(tmpdir) if f.endswith(".mxl")]
        if not mxl_files:
            return {"error": "No MusicXML output"}, 500

        return send_file(os.path.join(tmpdir, mxl_files[0]),
                        mimetype="application/vnd.recordare.musicxml+xml")
```

## Project Files (.omr)

Audiveris stores intermediate recognition data in XML-based .omr files.
These contain:
- Original image references
- Detected staff geometry
- Recognized symbols with positions
- Inter-symbol relationships (beaming, slurring)
- User corrections (if edited in GUI)

The .omr format is fully documented and accessible via Java API,
allowing custom tools to read/modify recognition data.
