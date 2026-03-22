import { NextRequest, NextResponse } from "next/server";
import { analyseerAkkoorden } from "@/lib/claude";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chords } = body;

    if (!chords || typeof chords !== "string" || chords.trim().length === 0) {
      return NextResponse.json(
        { error: "Voer akkoorden in" },
        { status: 400 }
      );
    }

    const result = await analyseerAkkoorden(chords.trim());

    return NextResponse.json(result);
  } catch (error) {
    console.error("Akkoord analyse fout:", error);
    const message =
      error instanceof Error ? error.message : "Onbekende fout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
