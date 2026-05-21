import { NextRequest, NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase-server";
import { z } from "zod";
import { badRequestFromZod } from "@/lib/validation/schemas";

const CreateNoteSchema = z.object({
  content: z.string().min(1).max(4000),
});

const DeleteNoteSchema = z.object({
  note_id: z.string().uuid(),
});

/**
 * GET /api/cases/[id]/notes — list notes for the conversation, newest first.
 * Auth required. RLS guarantees the caller only sees their own notes.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("case_notes")
    .select("id, content, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to load notes" }, { status: 500 });
  }

  return NextResponse.json({ notes: data ?? [] });
}

/**
 * POST /api/cases/[id]/notes — create a new note.
 * Body: { content: string }. RLS WITH CHECK confirms the conversation
 * belongs to the user before insert succeeds.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = CreateNoteSchema.safeParse(raw);
  if (!parsed.success) return badRequestFromZod(parsed.error);

  const { data, error } = await supabase
    .from("case_notes")
    .insert({
      conversation_id: id,
      user_id: user.id,
      content: parsed.data.content.trim(),
    })
    .select("id, content, created_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }

  return NextResponse.json({ note: data });
}

/**
 * DELETE /api/cases/[id]/notes — delete a note belonging to the user.
 * Body: { note_id: uuid }. RLS rejects deletes on rows owned by others.
 */
export async function DELETE(
  req: NextRequest,
  _ctx: { params: Promise<{ id: string }> }
) {
  const supabase = await createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = DeleteNoteSchema.safeParse(raw);
  if (!parsed.success) return badRequestFromZod(parsed.error);

  const { error } = await supabase
    .from("case_notes")
    .delete()
    .eq("id", parsed.data.note_id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
