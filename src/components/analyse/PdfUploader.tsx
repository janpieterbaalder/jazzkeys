"use client";

import { useCallback, useState } from "react";

interface PdfUploaderProps {
  onUpload: (file: File) => void;
  onXmlUpload: (xmlContent: string, fileName: string) => void;
  isLoading: boolean;
}

const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "text/xml",
  "application/xml",
]);

const ACCEPTED_EXTENSIONS = [".pdf", ".xml", ".musicxml"];
const MAX_PDF_BYTES = 4 * 1024 * 1024;
const MAX_XML_BYTES = 10 * 1024 * 1024;

function getFileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

function isAcceptedFile(file: File): "pdf" | "xml" | null {
  const ext = getFileExtension(file.name);
  if (ext === ".pdf" || file.type === "application/pdf") return "pdf";
  if (ext === ".xml" || ext === ".musicxml" || ACCEPTED_TYPES.has(file.type)) return "xml";
  return null;
}

export default function PdfUploader({ onUpload, onXmlUpload, isLoading }: PdfUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"pdf" | "xml" | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      const type = isAcceptedFile(file);
      setFout(null);
      if (!type) {
        setFout("Alleen PDF- en MusicXML-bestanden (.pdf, .xml, .musicxml) zijn toegestaan.");
        return;
      }
      // PDF gaat naar de server (hostinglimiet ~4,5 MB); XML blijft in de browser.
      const max = type === "pdf" ? MAX_PDF_BYTES : MAX_XML_BYTES;
      if (file.size > max) {
        setFout(
          type === "pdf"
            ? "PDF is te groot (maximaal 4 MB). Upload alleen de pagina's die je wilt oefenen."
            : "MusicXML-bestand is te groot (maximaal 10 MB)."
        );
        return;
      }

      setFileName(file.name);
      setFileType(type);

      if (type === "pdf") {
        onUpload(file);
      } else {
        // XML: read as text and pass directly — no API key needed
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result as string;
          if (!text.includes("<score-partwise")) {
            setFout("Dit XML-bestand is geen MusicXML-partituur.");
            return;
          }
          onXmlUpload(text, file.name);
        };
        reader.onerror = () => setFout("Kon het bestand niet lezen.");
        reader.readAsText(file);
      }
    },
    [onUpload, onXmlUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all ${
        isDragging
          ? "border-blue-500 bg-blue-500/10"
          : "border-slate-700 bg-slate-900/30 hover:border-slate-600"
      } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
    >
      <input
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(",")}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isLoading}
      />

      <div className="text-3xl mb-3">{fileType === "xml" ? "🎵" : "📄"}</div>

      {fileName ? (
        <div>
          <p className="text-white font-medium">{fileName}</p>
          <p className="text-xs text-slate-500 mt-1">
            {isLoading
              ? "Bezig met analyseren..."
              : fileType === "xml"
                ? "MusicXML — wordt direct weergegeven"
                : "Klik of sleep om te vervangen"}
          </p>
        </div>
      ) : (
        <div>
          <p className="text-slate-300 mb-1">
            Sleep een PDF of MusicXML hierheen
          </p>
          <p className="text-xs text-slate-500">
            PDF wordt geanalyseerd met AI — XML wordt direct weergegeven
          </p>
        </div>
      )}

      {fout && (
        <p className="relative mt-3 text-sm text-red-400" role="alert">
          {fout}
        </p>
      )}
    </div>
  );
}
