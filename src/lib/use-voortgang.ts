"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Voortgang in het oefenschema: welke oefeningen zijn afgevinkt.
 * Opgeslagen in localStorage (per browser), dus geen account nodig.
 */

const KEY = "jazzkeys:voortgang:v1";
const EMPTY: Record<string, number> = {};

let cache: Record<string, number> | null = null;
const listeners = new Set<() => void>();

function read(): Record<string, number> {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    cache = parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    cache = {};
  }
  return cache!;
}

function write(next: Record<string, number>) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* privé-modus of opslag vol: alleen in geheugen bijhouden */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function oefeningId(fase: number, week: string, dag: number, oefening: number) {
  return `f${fase}|${week}|d${dag}|o${oefening}`;
}

export function useVoortgang() {
  const voortgang = useSyncExternalStore(subscribe, read, () => EMPTY);

  const isGedaan = useCallback((id: string) => Boolean(voortgang[id]), [voortgang]);

  const toggle = useCallback((id: string) => {
    const current = read();
    const next = { ...current };
    if (next[id]) delete next[id];
    else next[id] = Date.now();
    write(next);
  }, []);

  const aantalGedaan = useCallback(
    (prefix: string) => Object.keys(voortgang).filter((k) => k.startsWith(prefix)).length,
    [voortgang]
  );

  /** Aantal opeenvolgende dagen (t/m vandaag of gisteren) waarop iets is afgevinkt. */
  const reeks = (() => {
    const dagen = new Set(
      Object.values(voortgang).map((t) => new Date(t).toDateString())
    );
    let count = 0;
    const d = new Date();
    if (!dagen.has(d.toDateString())) d.setDate(d.getDate() - 1);
    while (dagen.has(d.toDateString())) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  return { isGedaan, toggle, aantalGedaan, reeks, totaal: Object.keys(voortgang).length };
}
