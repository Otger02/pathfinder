import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { generateSummaryPdf } from "@/lib/pdf/summary-generator";
import { getFormsForAuth } from "@/lib/form-config";
import type { PersonalData } from "@/lib/types/personal-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { personalData, authorizationSlug, lang = "es" } = body as {
      personalData: PersonalData;
      authorizationSlug: string;
      lang: string;
    };

    if (!personalData || !authorizationSlug) {
      return NextResponse.json(
        { error: "Missing personalData or authorizationSlug" },
        { status: 400 }
      );
    }

    // Fetch authorization info from Supabase
    const supabase = createServiceClient();
    const { data: auth } = await supabase
      .from("authorizations")
      .select("*")
      .eq("slug", authorizationSlug)
      .single();

    // Build authorization info for the PDF
    const exForms = getFormsForAuth(authorizationSlug);
    const authInfo = {
      slug: authorizationSlug,
      name: auth?.nom?.[lang] || auth?.nom?.es || authorizationSlug,
      description: auth?.descripcio?.[lang] || auth?.descripcio?.es || "",
      requirements: extractTexts(auth?.requisits, lang),
      steps: extractTexts(auth?.passos, lang),
      laws: Array.isArray(auth?.lleis) ? auth.lleis : [],
      exForms: exForms.map((f) => f.id),
      deadline: auth?.termini_dies
        ? `${auth.termini_dies} ${lang === "es" ? "días" : lang === "en" ? "days" : lang === "fr" ? "jours" : "days"}`
        : null,
    };

    const pdfBytes = await generateSummaryPdf({
      personalData,
      authorization: authInfo,
      lang,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="pathfinder-${authorizationSlug}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

/**
 * Extract localized text strings from JSONB array fields
 * (requisits or passos from the authorizations table).
 */
function extractTexts(
  items: unknown,
  lang: string
): string[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item: Record<string, unknown>) => {
      // Shape: { text: { es: "...", en: "..." }, ... } or { accio: { es: "..." } }
      const textObj =
        (item.text as Record<string, string>) ||
        (item.accio as Record<string, string>);
      if (textObj && typeof textObj === "object") {
        return textObj[lang] || textObj.es || "";
      }
      if (typeof item === "string") return item;
      return "";
    })
    .filter(Boolean);
}
