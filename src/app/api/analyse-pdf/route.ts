import { NextRequest, NextResponse } from "next/server";
import { analyseerPdf } from "@/lib/claude";
import { db } from "@/lib/db";
import { analyses } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Geen bestand geüpload" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Alleen PDF-bestanden zijn toegestaan" },
        { status: 400 }
      );
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Bestand is te groot (maximaal 10MB)" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const result = await analyseerPdf(base64);

    // Opslaan in database (als beschikbaar)
    if (db) {
      try {
        const [saved] = await db
          .insert(analyses)
          .values({
            titel: result.stukInfo.titel || file.name,
            type: "pdf",
            invoer: file.name,
            resultaat: result,
          })
          .returning({ id: analyses.id });

        return NextResponse.json({ ...result, id: saved.id });
      } catch {
        // Database fout — geef resultaat toch terug
      }
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("PDF analyse fout:", error);
    const message =
      error instanceof Error ? error.message : "Onbekende fout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
