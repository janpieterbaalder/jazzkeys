"use client";

import { useEffect, useState } from "react";
import OsmdRenderer, { type RenderFixes } from "./OsmdRenderer";

interface BladmuziekViewerProps {
  xmlUrl?: string;
  xmlContent?: string;
  titel?: string;
  toMeasure?: number;
  renderFixes?: RenderFixes;
}

interface Fetched {
  url: string;
  xml?: string;
  error?: string;
}

export default function BladmuziekViewer({
  xmlUrl,
  xmlContent,
  titel,
  toMeasure,
  renderFixes,
}: BladmuziekViewerProps) {
  const [fetched, setFetched] = useState<Fetched | null>(null);

  // Alleen ophalen als er geen XML-inhoud is meegegeven
  useEffect(() => {
    if (xmlContent || !xmlUrl) return;
    let cancelled = false;
    fetch(xmlUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((xml) => {
        if (!cancelled) setFetched({ url: xmlUrl, xml });
      })
      .catch((err) => {
        if (!cancelled) {
          setFetched({ url: xmlUrl, error: err instanceof Error ? err.message : "Kon bestand niet laden" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [xmlUrl, xmlContent]);

  const current = fetched?.url === xmlUrl ? fetched : null;
  const musicXml = xmlContent ?? current?.xml ?? null;
  const error = xmlContent ? null : current?.error ?? null;
  const loading = !xmlContent && Boolean(xmlUrl) && !current;

  if (loading) {
    return (
      <div className="p-8 rounded-xl border border-slate-800 bg-slate-900/50 text-center">
        <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-400">Bladmuziek laden...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-900/20 border border-red-800 p-4 text-red-300">
        <p className="font-medium">Kon bladmuziek niet laden</p>
        <p className="text-sm mt-1 opacity-70">{error}</p>
      </div>
    );
  }

  if (!musicXml) return null;

  return (
    <div className="space-y-4">
      {titel && (
        <h2 className="text-xl font-bold text-white">{titel}</h2>
      )}
      <OsmdRenderer musicXml={musicXml} toMeasure={toMeasure} renderFixes={renderFixes} />
    </div>
  );
}
