import { NextRequest, NextResponse } from "next/server";
import { analyseerAkkoorden, toAnalyseError } from "@/lib/claude";
import { db } from "@/lib/db";
import { analyses } from "@/db/schema";

export const maxDuration = 120;

const MAX_LENGTH = 400;

export async function POST(request: NextRequest) {
  let chords: unknown;
  try {
    ({ chords } = await request.json());
  } catch {
    return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
  }

  if (typeof chords !== "string" || chords.trim().length === 0) {
    return NextResponse.json({ error: "Voer akkoorden in" }, { status: 400 });
  }
  const input = chords.trim().replace(/\s+/g, " ");
  if (input.length > MAX_LENGTH) {
    return NextResponse.json(
      { error: `Maximaal ${MAX_LENGTH} tekens — analyseer een kortere progressie` },
      { status: 400 }
    );
  }

  try {
    const result = await analyseerAkkoorden(input);

    // Opslaan in database (als beschikbaar)
    if (db) {
      try {
        const [saved] = await db
          .insert(analyses)
          .values({ titel: input, type: "akkoorden", invoer: input, resultaat: result })
          .returning({ id: analyses.id });
        return NextResponse.json({ ...result, id: saved.id });
      } catch (error) {
        // Database fout — geef resultaat toch terug
        console.error("Analyse opslaan mislukt:", error);
      }
    }
    return NextResponse.json(result);
  } catch (error) {
    const err = toAnalyseError(error);
    console.error("Akkoord analyse fout:", error);
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
}
