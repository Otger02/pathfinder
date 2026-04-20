import { NextRequest, NextResponse } from "next/server";
import { fillExForm } from "@/lib/pdf/form-filler";
import type { ExFormId } from "@/lib/form-config";
import type { PersonalData } from "@/lib/types/personal-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { personalData, exFormId, authSlug, flatten } = body as {
      personalData: Partial<PersonalData>;
      exFormId: ExFormId;
      authSlug?: string;
      flatten?: boolean;
    };

    if (!personalData || !exFormId) {
      return NextResponse.json(
        { error: "Missing personalData or exFormId" },
        { status: 400 }
      );
    }

    const pdfBytes = await fillExForm(exFormId, personalData, authSlug, flatten);

    if (!pdfBytes) {
      return NextResponse.json(
        { error: `Form ${exFormId} template or field map not available` },
        { status: 404 }
      );
    }

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${exFormId}-filled.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Form fill error:", err instanceof Error ? err.stack : err);
    return NextResponse.json(
      { error: "Failed to fill form", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
