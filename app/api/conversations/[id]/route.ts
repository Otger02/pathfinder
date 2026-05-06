import { NextRequest, NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabaseAuth = await createAuthServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("id, language, auth_slugs, chat_sub_phase, collected_data, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Also pull the message history so the chat can hydrate on resume
  // (so the user sees the assistant summary they got the previous turn,
  // not just a 'Datos confirmados' welcome line).
  const { data: messages } = await supabase
    .from("messages")
    .select("role, content, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .limit(60);

  return NextResponse.json({ ...data, messages: messages ?? [] });
}

/**
 * Allow the user to manually move between sub-phases (e.g. clicking the
 * Datos tab from Resumen to go back to data collection). Only fields
 * the user is allowed to mutate from the UI are accepted.
 */
const ALLOWED_SUBPHASES = new Set([
  "conversa",
  "resum",
  "document",
  "enviament",
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabaseAuth = await createAuthServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { chat_sub_phase?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (
    typeof body.chat_sub_phase === "string" &&
    ALLOWED_SUBPHASES.has(body.chat_sub_phase)
  ) {
    updates.chat_sub_phase = body.chat_sub_phase;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  // Use the auth client so RLS (auth.uid() = user_id) prevents touching
  // someone else's conversation.
  const { error } = await supabaseAuth
    .from("conversations")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
