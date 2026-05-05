/**
 * scripts/seed-otger.ts
 *
 * Seeds 3 realistic Pathfinder cases for the user otger02@gmail.com.
 * The cases trace a coherent fictional journey of Mamadou Diallo (19,
 * Senegalese, ex-tutelado in Barcelona): asylum exploration → arraigo
 * socioformatiu → arraigo sociolaboral.
 *
 * Run: npx tsx scripts/seed-otger.ts
 *
 * SAFETY: this script first DELETES every conversation row owned by the
 * target user before inserting the seed data. Don't run it against an
 * account that already has real data you care about.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// ── Load .env.local manually (tsx doesn't forward Node's --env-file) ──
{
  const envPath = join(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    const raw = readFileSync(envPath, "utf-8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2];
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TARGET_EMAIL = "otger02@gmail.com";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    "ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local"
  );
  process.exit(1);
}

interface InsertResult {
  error: { code?: string; message?: string } | null;
}

async function main() {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  /**
   * Inserts a conversation row, falling back to dropping the `updated_at`
   * column if Supabase doesn't know about it. The dashboard / documents
   * pages order by updated_at — when the column is missing we just rely
   * on created_at instead.
   */
  let supportsUpdatedAt = true;
  async function insertConversation(
    payload: Record<string, unknown>
  ): Promise<void> {
    const apply = supportsUpdatedAt ? payload : stripUpdatedAt(payload);
    const { error } = (await supabase
      .from("conversations")
      .insert(apply)) as InsertResult;
    if (error) {
      const missingCol =
        error.code === "PGRST204" && /updated_at/.test(error.message ?? "");
      if (missingCol && supportsUpdatedAt) {
        supportsUpdatedAt = false;
        console.warn(
          "  ⚠ updated_at column not present — retrying without it"
        );
        const retry = (await supabase
          .from("conversations")
          .insert(stripUpdatedAt(payload))) as InsertResult;
        if (retry.error) throw retry.error;
        return;
      }
      throw error;
    }
  }

  function stripUpdatedAt(
    payload: Record<string, unknown>
  ): Record<string, unknown> {
    const copy = { ...payload };
    delete copy.updated_at;
    return copy;
  }

  // ── 1. Find the user by email ──────────────────────────────
  const { data, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) throw usersError;

  const user = data.users.find((u) => u.email === TARGET_EMAIL);
  if (!user) {
    console.error(
      `ERROR: user ${TARGET_EMAIL} not found. Create them first via the auth flow or Supabase dashboard.`
    );
    process.exit(1);
  }
  console.log(`Found user: ${user.id} (${TARGET_EMAIL})`);

  // ── 2. Wipe existing conversations (clean slate) ───────────
  const { error: delErr } = await supabase
    .from("conversations")
    .delete()
    .eq("user_id", user.id);
  if (delErr) throw delErr;
  console.log("Cleaned existing conversations");

  // ── 3. Compute timestamps ──────────────────────────────────
  const now = new Date();
  const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

  // ── 4. Insert the 3 conversations ──────────────────────────
  // Note: the conversations table has no `situacio_legal` column;
  // situation is derived from auth_slugs[0] at read time.

  // PROCESS 1 — Asylum (paused, abandoned)
  await insertConversation({
    user_id: user.id,
    user_code: "web-anonymous",
    language: "ca",
    country: "ES",
    auth_slugs: [],
    chat_sub_phase: "conversa",
    consent_given: true,
    collected_data: {
      nombre: "Mamadou",
      primerApellido: "Diallo",
      nacionalidad: "Senegalesa",
      _tree_path: [
        "Vull demanar asil",
        "A Espanya, en territori nacional",
        "No, encara no l'he sol·licitada",
        "Fa més d'1 mes",
      ],
      _tree_node_id: "b4-r-fora-termini",
      _tree_node_text: "Fora del termini d'1 mes — però encara és possible",
    },
    created_at: threeWeeksAgo.toISOString(),
    updated_at: threeWeeksAgo.toISOString(),
  });

  // PROCESS 2 — Arraigo socioformatiu (active, second pass)
  await insertConversation({
    user_id: user.id,
    user_code: "web-anonymous",
    language: "ca",
    country: "ES",
    auth_slugs: ["arraigo_socioformatiu"],
    chat_sub_phase: "conversa",
    consent_given: true,
    collected_data: {
      nombre: "Mamadou",
      primerApellido: "Diallo",
      segundoApellido: "Sow",
      fechaNacimiento: "2005-03-15",
      paisNacimiento: "Senegal",
      lugarNacimiento: "Dakar",
      nacionalidad: "Senegalesa",
      sexo: "H",
      estadoCivil: "soltero",
      tipoDocumento: "pasaporte",
      numeroDocumento: "A12345678",
      domicilio: "Carrer de la Pau",
      numeroDomicilio: "25",
      localidad: "Barcelona",
      provincia: "Barcelona",
      codigoPostal: "08001",
      formacio_entitat: "Centre de Formació Cuina BCN",
      formacio_nom: "Certificat professional cuiner/a",
      formacio_nifCif: "G65432189",
      tipoSolicitud: "residencia_inicial",
      documents_obtained: ["EX-10"],
      _tree_path: [
        "No tinc papers",
        "Sí, el tinc",
        "No, sóc major d'edat sense tutela",
        "No / no ho sé",
        "Més de 2 anys",
        "No",
        "Sí, estic matriculat o ho puc fer",
      ],
      _tree_node_id: "b1-r-formatiu",
      _tree_node_text: "Arraigo socioformatiu",
    },
    created_at: oneWeekAgo.toISOString(),
    updated_at: oneWeekAgo.toISOString(),
  });

  // PROCESS 3 — Arraigo sociolaboral (most recent, most complete)
  await insertConversation({
    user_id: user.id,
    user_code: "web-anonymous",
    language: "ca",
    country: "ES",
    auth_slugs: ["arraigo_sociolaboral"],
    chat_sub_phase: "conversa",
    consent_given: true,
    collected_data: {
      nombre: "Mamadou",
      primerApellido: "Diallo",
      segundoApellido: "Sow",
      fechaNacimiento: "2005-03-15",
      paisNacimiento: "Senegal",
      lugarNacimiento: "Dakar",
      nacionalidad: "Senegalesa",
      sexo: "H",
      estadoCivil: "soltero",
      tipoDocumento: "pasaporte",
      numeroDocumento: "A12345678",
      domicilio: "Carrer de la Pau",
      numeroDomicilio: "25",
      pisoDomicilio: "2n 1a",
      localidad: "Barcelona",
      provincia: "Barcelona",
      codigoPostal: "08001",
      telefono: "612345678",
      empleador_nombre: "Construccions Molina SL",
      empleador_nifNie: "B12345678",
      empleador_actividad: "Construcció",
      empleador_domicilio: "Avinguda Meridiana",
      empleador_numero: "45",
      empleador_localidad: "Barcelona",
      empleador_codigoPostal: "08026",
      empleador_provincia: "Barcelona",
      empleador_telefono: "934567890",
      tipoSolicitud: "residencia_inicial",
      documents_obtained: ["EX-10", "summary"],
      _tree_path: [
        "No tinc papers",
        "Sí, el tinc",
        "No, sóc major d'edat sense tutela",
        "No / no ho sé",
        "Més de 2 anys",
        "Sí, tinc contracte o precontracte",
      ],
      _tree_node_id: "b1-r-laboral",
      _tree_node_text: "Arraigo sociolaboral",
    },
    created_at: twoDaysAgo.toISOString(),
    updated_at: fourHoursAgo.toISOString(), // most recent activity
  });

  console.log();
  console.log(`✓ 3 processos creats per a ${TARGET_EMAIL}`);
  console.log("  1. Asil — pausat (fa 3 setmanes)");
  console.log("  2. Arraigo socioformatiu — actiu (fa 1 setmana)");
  console.log("  3. Arraigo sociolaboral — actiu (fa 2 dies, modificat fa 4h)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
