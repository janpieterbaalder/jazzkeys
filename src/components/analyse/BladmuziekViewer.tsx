"use client";

import { useEffect, useState } from "react";
import OsmdRenderer from "./OsmdRenderer";

interface BladmuziekViewerProps {
  xmlUrl: string;
  titel?: string;
  toMeasure?: number;
}

export default function BladmuziekViewer({
  xmlUrl,
  titel,
  toMeasure,
}: BladmuziekViewerProps) {
  const [musicXml, setMusicXml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(xmlUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((xml) => {
        setMusicXml(xml);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Kon bestand niet laden");
        setLoading(false);
      });
  }, [xmlUrl]);

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
      <OsmdRenderer musicXml={musicXml} toMeasure={toMeasure} />
    </div>
  );
}
