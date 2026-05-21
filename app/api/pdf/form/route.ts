import { NextRequest, NextResponse } from "next/server";
import { fillExForm } from "@/lib/pdf/form-filler";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { PdfFormSchema, badRequestFromZod } from "@/lib/validation/schemas";
import type { ExFormId } from "@/lib/form-config";
import type { PersonalData } from "@/lib/types/personal-data";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(ip, {
      windowMs: 60_000,
      max: 10,
      keyPrefix: "pdf-form",
    });
    if (!limit.allowed) return rateLimitResponse(limit);

    const rawBody = await req.json();
    const parsed = PdfFormSchema.safeParse(rawBody);
    if (!parsed.success) return badRequestFromZod(parsed.error);
    const { personalData, exFormId, authSlug, flatten } = parsed.data as {
      personalData: Partial<PersonalData>;
      exFormId: ExFormId;
      authSlug?: string;
      flatten?: boolean;
    };

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
    // Log only message — stack traces can include personalData values
    // (pdf-lib propagates input through error context).
    console.error(
      "[pdf/form] error:",
      err instanceof Error ? err.message : "unknown error"
    );
    return NextResponse.json(
      { error: "Failed to fill form" },
      { status: 500 }
    );
  }
}
