"use client";

import { useState } from "react";
import PdfUploader from "@/components/analyse/PdfUploader";
import ChordInput from "@/components/analyse/ChordInput";
import StukjeView from "@/components/analyse/StukjeView";
import AkkoordResult from "@/components/analyse/AkkoordResult";
import type { PdfAnalyseResult, AkkoordAnalyseResult } from "@/lib/claude";

type AnalyseMode = "idle" | "loading" | "pdf-result" | "chord-result" | "error";

export default function AnalysePage() {
  const [mode, setMode] = useState<AnalyseMode>("idle");
  const [pdfResult, setPdfResult] = useState<PdfAnalyseResult | null>(null);
  const [chordResult, setChordResult] = useState<AkkoordAnalyseResult | null>(
    null
  );
  const [selectedFragment, setSelectedFragment] = useState(0);
  const [error, setError] = useState("");

  const handlePdfUpload = async (file: File) => {
    setMode("loading");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/analyse-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Er ging iets mis");
      }

      setPdfResult(data);
      setSelectedFragment(0);
      setMode("pdf-result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
      setMode("error");
    }
  };

  const handleChordSubmit = async (chords: string) => {
    setMode("loading");
    setError("");

    try {
      const res = await fetch("/api/analyse-akkoorden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chords }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Er ging iets mis");
      }

      setChordResult(data);
      setMode("chord-result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
      setMode("error");
    }
  };

  const isLoading = mode === "loading";

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
        Analyse
      </h1>
      <p className="text-slate-400 mb-8">
        Upload bladmuziek om stap voor stap noten te leren lezen, of voer
        akkoorden in voor jazz-analyse.
      </p>

      {/* Input section */}
      <div className="space-y-6 mb-8">
        <PdfUploader onUpload={handlePdfUpload} isLoading={isLoading} />
        <ChordInput onSubmit={handleChordSubmit} isLoading={isLoading} />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="p-8 rounded-xl border border-slate-800 bg-slate-900/50 text-center">
          <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-400">
            Bezig met analyseren... Dit kan even duren.
          </p>
        </div>
      )}

      {/* Error */}
      {mode === "error" && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => setMode("idle")}
            className="text-xs text-red-400/70 hover:text-red-400 mt-2 underline"
          >
            Probeer opnieuw
          </button>
        </div>
      )}

      {/* PDF Result */}
      {mode === "pdf-result" && pdfResult && (
        <div>
          {/* Stuk info */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 mb-6">
            <h2 className="text-xl font-bold text-white mb-2">
              {pdfResult.stukInfo.titel}
            </h2>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="text-slate-400">
                Toonsoort:{" "}
                <span className="text-white">
                  {pdfResult.stukInfo.toonsoort}
                </span>
              </span>
              <span className="text-slate-400">
                Maatsoort:{" "}
                <span className="text-white">
                  {pdfResult.stukInfo.maatsoort}
                </span>
              </span>
              {pdfResult.stukInfo.tempo && (
                <span className="text-slate-400">
                  Tempo:{" "}
                  <span className="text-white">
                    {pdfResult.stukInfo.tempo}
                  </span>
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  pdfResult.stukInfo.moeilijkheidsgraad === "beginner"
                    ? "bg-green-500/20 text-green-400"
                    : pdfResult.stukInfo.moeilijkheidsgraad === "gemiddeld"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                }`}
              >
                {pdfResult.stukInfo.moeilijkheidsgraad}
              </span>
            </div>
          </div>

          {/* Fragment selector */}
          <div className="mb-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
              Fragmenten
            </div>
            <div className="flex flex-wrap gap-1.5">
              {pdfResult.fragmenten.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedFragment(i)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedFragment === i
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "text-slate-400 border border-slate-700 hover:border-slate-600"
                  }`}
                >
                  Maat {f.maten}
                </button>
              ))}
            </div>
          </div>

          {/* Selected fragment */}
          {pdfResult.fragmenten[selectedFragment] && (
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Fragment {pdfResult.fragmenten[selectedFragment].nummer}:{" "}
                    Maat {pdfResult.fragmenten[selectedFragment].maten}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {pdfResult.fragmenten[selectedFragment].beschrijving}
                  </p>
                </div>
              </div>

              <StukjeView
                fragment={pdfResult.fragmenten[selectedFragment]}
              />

              {/* Navigation */}
              <div className="flex justify-between mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={() =>
                    setSelectedFragment(Math.max(0, selectedFragment - 1))
                  }
                  disabled={selectedFragment === 0}
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  &larr; Vorig fragment
                </button>
                <button
                  onClick={() =>
                    setSelectedFragment(
                      Math.min(
                        pdfResult.fragmenten.length - 1,
                        selectedFragment + 1
                      )
                    )
                  }
                  disabled={
                    selectedFragment === pdfResult.fragmenten.length - 1
                  }
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Volgend fragment &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Reset */}
          <button
            onClick={() => {
              setMode("idle");
              setPdfResult(null);
            }}
            className="mt-6 text-sm text-slate-500 hover:text-slate-400 transition-colors"
          >
            Nieuwe analyse starten
          </button>
        </div>
      )}

      {/* Chord Result */}
      {mode === "chord-result" && chordResult && (
        <div>
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
            <AkkoordResult result={chordResult} />
          </div>

          <button
            onClick={() => {
              setMode("idle");
              setChordResult(null);
            }}
            className="mt-6 text-sm text-slate-500 hover:text-slate-400 transition-colors"
          >
            Nieuwe analyse starten
          </button>
        </div>
      )}
    </div>
  );
}
