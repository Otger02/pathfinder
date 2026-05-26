import { NextRequest } from "next/server";

export const runtime = "nodejs";

const OPENAI_TRANSCRIBE_URL = "https://api.openai.com/v1/audio/transcriptions";
const OPENAI_TRANSCRIBE_MODEL = "gpt-4o-mini-transcribe";

function normalizeLanguage(raw: FormDataEntryValue | null): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;

  if (trimmed.startsWith("ca")) return "ca";
  if (trimmed.startsWith("es")) return "es";
  if (trimmed.startsWith("en")) return "en";
  if (trimmed.startsWith("fr")) return "fr";
  if (trimmed.startsWith("ar")) return "ar";
  return trimmed.slice(0, 2);
}

export async function POST(req: NextRequest) {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return Response.json(
        { error: "OpenAI transcription is not configured" },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const audio = formData.get("audio");
    if (!(audio instanceof File)) {
      return Response.json({ error: "audio file required" }, { status: 400 });
    }

    if (audio.size === 0) {
      return Response.json({ error: "audio file is empty" }, { status: 400 });
    }

    const payload = new FormData();
    payload.append(
      "file",
      new File([await audio.arrayBuffer()], audio.name || "voice-input.webm", {
        type: audio.type || "audio/webm",
      })
    );
    payload.append("model", OPENAI_TRANSCRIBE_MODEL);
    payload.append("response_format", "json");

    const language = normalizeLanguage(formData.get("lang"));
    if (language) {
      payload.append("language", language);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    try {
      const response = await fetch(OPENAI_TRANSCRIBE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
        },
        body: payload,
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text();
        return Response.json(
          { error: `OpenAI transcription failed: ${body.slice(0, 300)}` },
          { status: response.status }
        );
      }

      const data = (await response.json()) as { text?: string };
      const text = typeof data.text === "string" ? data.text.trim() : "";

      return Response.json({ text });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return Response.json({ error: message }, { status: 500 });
  }
}