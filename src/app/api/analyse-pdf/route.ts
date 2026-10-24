import { NextRequest, NextResponse } from "next/server";
import { analyseerPdf, toAnalyseError } from "@/lib/claude";
import { db } from "@/lib/db";
import { analyses } from "@/db/schema";

// Noot-voor-noot lezen van een PDF kan minuten duren.
export const maxDuration = 300;

// Vercel weigert request bodies groter dan 4,5 MB; houd marge voor de form-data.
const MAX_BYTES = 4 * 1024 * 1024;
const HEARTBEAT_MS = 10_000;

/**
 * Antwoord is een NDJSON-stream (één JSON-object per regel):
 *   {"type":"progress","fase":"lezen"|"schrijven","maat":n}
 *   {"type":"ping"}                               — houdt de verbinding open
 *   {"type":"result","data":PdfAnalyseResult & {id?}}
 *   {"type":"error","error":"...","status":n}
 * Invoerfouten komen als gewone JSON met status 400.
 */
export async function POST(request: NextRequest) {
  let file: File | null;
  try {
    const formData = await request.formData();
    const value = formData.get("file");
    file = value instanceof File ? value : null;
  } catch {
    return NextResponse.json({ error: "Ongeldig formulier" }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "Geen bestand geüpload" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Bestand is te groot (maximaal 4 MB). Upload alleen de pagina's die je wilt oefenen." },
      { status: 413 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return NextResponse.json({ error: "Dit is geen geldig PDF-bestand" }, { status: 400 });
  }
  const base64 = buffer.toString("base64");
  const fileName = file.name;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
        } catch {
          /* client is weg */
        }
      };
      const heartbeat = setInterval(() => send({ type: "ping" }), HEARTBEAT_MS);

      try {
        const result = await analyseerPdf(base64, (p) => send({ type: "progress", ...p }));

        let id: string | undefined;
        if (db) {
          try {
            const [saved] = await db
              .insert(analyses)
              .values({
                titel: result.stukInfo.titel || fileName,
                type: "pdf",
                invoer: fileName,
                resultaat: result,
              })
              .returning({ id: analyses.id });
            id = saved.id;
          } catch (error) {
            // Database fout — resultaat toch teruggeven
            console.error("Analyse opslaan mislukt:", error);
          }
        }
        send({ type: "result", data: { ...result, id } });
      } catch (error) {
        const err = toAnalyseError(error);
        console.error("PDF analyse fout:", error);
        send({ type: "error", error: err.message, status: err.status });
      } finally {
        clearInterval(heartbeat);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
