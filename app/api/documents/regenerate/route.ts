import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { createAuthServerClient } from "@/lib/supabase-server";
import { fillExForm } from "@/lib/pdf/form-filler";
import { generateSummaryPdf } from "@/lib/pdf/summary-generator";
import { getFormsForAuth, type ExFormId } from "@/lib/form-config";
import type { PersonalData } from "@/lib/types/personal-data";

function extractTexts(items: unknown, lang: string): string[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item: Record<string, unknown>) => {
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      conversation_id,
      formId,
      lang = "ca",
      inline,
    } = body as {
      conversation_id?: string;
      formId?: string;
      lang?: string;
      inline?: boolean;
    };

    if (!conversation_id || !formId) {
      return NextResponse.json(
        { error: "conversation_id and formId are required" },
        { status: 400 }
      );
    }

    // 1. Authenticated user — RLS will prevent reading other users' rows.
    const auth = await createAuthServerClient();
    const {
      data: { user },
    } = await auth.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2. Load the conversation through the auth client (enforces user_id match).
    const { data: conv, error: convErr } = await auth
      .from("conversations")
      .select("id, user_id, auth_slugs, collected_data")
      .eq("id", conversation_id)
      .single();

    if (convErr || !conv) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const personalData = (conv.collected_data ?? {}) as Partial<PersonalData>;
    const authSlug = (conv.auth_slugs as string[] | null)?.[0] ?? null;

    if (!authSlug) {
      return NextResponse.json(
        { error: "Conversation has no auth_slug" },
        { status: 400 }
      );
    }

    // 3. Generate the PDF.
    let pdfBytes: Uint8Array | null = null;
    let downloadName = `pathfinder-${formId}.pdf`;

    if (formId === "summary") {
      const supabase = createServiceClient();
      const { data: authRow } = await supabase
        .from("authorizations")
        .select("*")
        .eq("slug", authSlug)
        .single();

      const exForms = getFormsForAuth(authSlug);
      const authInfo = {
        slug: authSlug,
        name:
          authRow?.nom?.[lang] || authRow?.nom?.es || authSlug,
        description:
          authRow?.descripcio?.[lang] || authRow?.descripcio?.es || "",
        requirements: extractTexts(authRow?.requisits, lang),
        steps: extractTexts(authRow?.passos, lang),
        laws: Array.isArray(authRow?.lleis) ? authRow.lleis : [],
        exForms: exForms.map((f) => f.id),
        deadline: authRow?.termini_dies
          ? `${authRow.termini_dies} ${
              lang === "es"
                ? "días"
                : lang === "en"
                ? "days"
                : lang === "fr"
                ? "jours"
                : lang === "ar"
                ? "يوم"
                : "dies"
            }`
          : null,
      };

      pdfBytes = await generateSummaryPdf({
        personalData: personalData as PersonalData,
        authorization: authInfo,
        lang,
      });
      downloadName = `pathfinder-resumen-${authSlug}.pdf`;
    } else {
      // EX form — formId is something like "EX-10"
      pdfBytes = await fillExForm(
        formId as ExFormId,
        personalData,
        authSlug
      );
      downloadName = `pathfinder-${formId}.pdf`;
    }

    if (!pdfBytes) {
      return NextResponse.json(
        { error: `Could not generate ${formId}` },
        { status: 500 }
      );
    }

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${
          inline ? "inline" : "attachment"
        }; filename="${downloadName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[regenerate] error:", err);
    return NextResponse.json(
      { error: "Failed to regenerate document" },
      { status: 500 }
    );
  }
}
