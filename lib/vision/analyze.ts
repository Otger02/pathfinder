/**
 * Document vision analysis.
 *
 * Takes a photo of a document (passport, padró, TIE, an official letter…)
 * and returns:
 *   - extracted PersonalData fields (passport number, names, dates, address)
 *   - a plain-language explanation of what the document is / says
 *   - any deadlines the document mentions (resolution appeal windows, citas…)
 *
 * PRIVACY: the image lives in memory for the duration of one API call and
 * is never written to disk, storage, or the database. Only the extracted
 * fields (after consent checks at the route layer) are persisted.
 *
 * Model: Sonnet — a mis-OCRed passport number on a real application has
 * worse consequences than the extra cents per call. The route rate-limits
 * hard (5/min/IP) so spend stays bounded.
 */

import { normalizeCollectedPersonalDataInput } from "@/lib/tool-definitions";
import type { PersonalData } from "@/lib/types/personal-data";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const VISION_MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 1500;

export type VisionMediaType = "image/jpeg" | "image/png" | "image/webp";

export interface DocumentDeadline {
  /** ISO date if the document states one, otherwise null */
  date: string | null;
  /** What happens / must happen by that date, in the user's language */
  description: string;
}

export interface DocumentAnalysis {
  documentType: string;
  fields: Partial<PersonalData>;
  explanation: string;
  deadlines: DocumentDeadline[];
}

const LANG_NAMES: Record<string, string> = {
  ca: "català",
  es: "castellano",
  en: "English",
  fr: "français",
  ar: "العربية (Modern Standard Arabic)",
};

const ANALYZE_TOOL = {
  name: "analyze_document",
  description:
    "Report the structured analysis of the photographed document. Always call this tool exactly once.",
  input_schema: {
    type: "object" as const,
    properties: {
      document_type: {
        type: "string",
        description:
          "Short label for what the document is, in the user's language. E.g. 'Passaport del Marroc', 'Certificado de empadronamiento', 'Resolución de denegación'.",
      },
      fields: {
        type: "object",
        description:
          "Personal data fields read VERBATIM from the document. Keys (use only those that are clearly legible): pasaporte, nie, nombre, primerApellido, segundoApellido, fechaNacimiento (YYYY-MM-DD), lugarNacimiento, paisNacimiento, nacionalidad, sexo (H/M/X), estadoCivil, domicilio, numeroDomicilio, pisoDomicilio, localidad, codigoPostal, provincia, telefono, email, nombrePadre, nombreMadre. NEVER guess or infer a value that is not printed on the document — omit the key instead.",
        additionalProperties: true,
      },
      explanation: {
        type: "string",
        description:
          "2-6 sentence plain-language explanation of what this document is and, if it's a letter/resolution, what it says and what the person should do. Written in the user's language for someone who may have low literacy. No legal jargon without explaining it.",
      },
      deadlines: {
        type: "array",
        description:
          "Deadlines the document states (appeal windows, appointment dates, expiry dates). Empty array if none.",
        items: {
          type: "object",
          properties: {
            date: {
              type: ["string", "null"],
              description:
                "ISO date YYYY-MM-DD if the document states or lets you compute one, else null",
            },
            description: {
              type: "string",
              description: "What must happen by then, in the user's language",
            },
          },
          required: ["description"],
        },
      },
    },
    required: ["document_type", "fields", "explanation", "deadlines"],
  },
};

/**
 * Analyze one document image. Throws on API failure; the route maps that
 * to a friendly error. Returns normalized fields (enum-checked, trimmed)
 * ready to merge into collected_data.
 */
export async function analyzeDocumentImage(options: {
  imageBase64: string;
  mediaType: VisionMediaType;
  idioma: string;
}): Promise<DocumentAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const langName = LANG_NAMES[options.idioma] ?? "castellano";

  const systemPrompt = `Ets l'analitzador de documents de Pathfinder, una eina humanitària que ajuda persones migrants a Espanya amb tràmits d'estrangeria.

L'usuari fotografia un document (passaport, NIE/TIE, certificat d'empadronament, una carta o resolució oficial, un contracte...). La teva feina:
1. Identificar QUÈ és el document.
2. Extreure les dades personals que hi apareixen, LITERALMENT — mai inventis ni infereixis un valor que no es llegeixi clarament. Si un camp no es llegeix bé, omet-lo.
3. Explicar en llenguatge molt senzill (l'usuari pot tenir baixa alfabetització) què és i, si és una carta o resolució, què diu i què hauria de fer la persona.
4. Detectar terminis: dates límit de recursos, cites, caducitats. Una resolució denegatòria sol obrir un termini de recurs (p. ex. recurs de reposició: 1 mes des de la notificació) — si el document indica la data de notificació, calcula la data límit.

Idioma de l'usuari: ${langName}. Escriu document_type, explanation i les descriptions dels deadlines en aquest idioma.

Crida SEMPRE l'eina analyze_document exactament un cop.`;

  const resp = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      tools: [ANALYZE_TOOL],
      tool_choice: { type: "tool", name: "analyze_document" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: options.mediaType,
                data: options.imageBase64,
              },
            },
            {
              type: "text",
              text: "Analitza aquest document.",
            },
          ],
        },
      ],
    }),
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Anthropic vision ${resp.status}: ${body.slice(0, 200)}`);
  }

  const data = (await resp.json()) as {
    content?: Array<{
      type: string;
      name?: string;
      input?: Record<string, unknown>;
    }>;
  };

  const toolBlock = data.content?.find(
    (b) => b.type === "tool_use" && b.name === "analyze_document"
  );
  if (!toolBlock?.input) {
    throw new Error("Vision response contained no analyze_document tool call");
  }

  const input = toolBlock.input;
  const rawFields = (
    input.fields && typeof input.fields === "object" ? { ...input.fields } : {}
  ) as Record<string, unknown>;

  // Bridge: the vision prompt asks for `pasaporte`/`nie` keys (matching the
  // document layout), but the chat tool schema — and therefore the
  // normalizer — models documents as numeroDocumento + tipoDocumento.
  // Convert before normalizing so the value isn't dropped. (form-filler
  // bridges the other way when filling PDFs.)
  if (!rawFields.numeroDocumento) {
    if (typeof rawFields.pasaporte === "string" && rawFields.pasaporte.trim()) {
      rawFields.numeroDocumento = rawFields.pasaporte;
      rawFields.tipoDocumento = rawFields.tipoDocumento ?? "pasaporte";
    } else if (typeof rawFields.nie === "string" && rawFields.nie.trim()) {
      rawFields.numeroDocumento = rawFields.nie;
      rawFields.tipoDocumento = rawFields.tipoDocumento ?? "nie";
    }
  }

  const deadlines: DocumentDeadline[] = Array.isArray(input.deadlines)
    ? (input.deadlines as Array<Record<string, unknown>>)
        .filter((d) => typeof d?.description === "string")
        .map((d) => ({
          date:
            typeof d.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d.date)
              ? d.date
              : null,
          description: String(d.description).slice(0, 500),
        }))
        .slice(0, 10)
    : [];

  return {
    documentType:
      typeof input.document_type === "string"
        ? input.document_type.slice(0, 200)
        : "Document",
    // Reuse the chat tool's normalizer: enum checks, trimming, array fields.
    fields: normalizeCollectedPersonalDataInput(rawFields),
    explanation:
      typeof input.explanation === "string"
        ? input.explanation.slice(0, 4000)
        : "",
    deadlines,
  };
}
