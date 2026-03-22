import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyses } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  if (!db) {
    return NextResponse.json([]);
  }

  try {
    const results = await db
      .select({
        id: analyses.id,
        titel: analyses.titel,
        type: analyses.type,
        invoer: analyses.invoer,
        createdAt: analyses.createdAt,
      })
      .from(analyses)
      .orderBy(desc(analyses.createdAt))
      .limit(50);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Analyses ophalen mislukt:", error);
    return NextResponse.json([]);
  }
}
