import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyses } from "@/db/schema";
import { eq } from "drizzle-orm";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!db) {
    return NextResponse.json(
      { error: "Database niet beschikbaar" },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: "Analyse niet gevonden" }, { status: 404 });
    }

    const [result] = await db
      .select()
      .from(analyses)
      .where(eq(analyses.id, id))
      .limit(1);

    if (!result) {
      return NextResponse.json(
        { error: "Analyse niet gevonden" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analyse ophalen mislukt:", error);
    return NextResponse.json(
      { error: "Kon analyse niet ophalen" },
      { status: 500 }
    );
  }
}
