"use client";

import { useCallback, useState } from "react";

interface PdfUploaderProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export default function PdfUploader({ onUpload, isLoading }: PdfUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type !== "application/pdf") {
        alert("Alleen PDF-bestanden zijn toegestaan");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("Bestand is te groot (maximaal 10MB)");
        return;
      }
      setFileName(file.name);
      onUpload(file);
    },
    [onUpload]
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
        accept=".pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isLoading}
      />

      <div className="text-3xl mb-3">📄</div>

      {fileName ? (
        <div>
          <p className="text-white font-medium">{fileName}</p>
          <p className="text-xs text-slate-500 mt-1">
            {isLoading ? "Bezig met analyseren..." : "Klik of sleep om te vervangen"}
          </p>
        </div>
      ) : (
        <div>
          <p className="text-slate-300 mb-1">
            Sleep een PDF hierheen of klik om te uploaden
          </p>
          <p className="text-xs text-slate-500">Maximaal 10MB</p>
        </div>
      )}
    </div>
  );
}
