/**
 * scripts/test-fill-ex31.ts
 *
 * Generates a sample filled EX-31 to verify the Apartat 1 mapping works
 * end-to-end. The data below is what the bot would have extracted from a
 * natural-language conversation like:
 *
 *   "Hola, me llamo Youssef El Amrani, soy de Marruecos. Pedí asilo en
 *    Barcelona en 2024. Nací el 12 de marzo de 1992 en Tánger, mi padre
 *    se llama Ahmed y mi madre Fatima. Vivo en la calle Sants 45, 3º,
 *    08014 Barcelona. Mi teléfono es 632145987..."
 *
 * Output: public/forms/test-ex31-filled.pdf (gitignored).
 * Run: npx tsx scripts/test-fill-ex31.ts
 */

import { writeFileSync } from "fs";
import { join } from "path";
import { fillExForm } from "../lib/pdf/form-filler";
import type { PersonalData } from "../lib/types/personal-data";

// Natural-language-derived sample data (Apartat 1 — solicitante).
const sample: Partial<PersonalData> = {
  pasaporte: "AB1234567",
  tipoDocumento: "pasaporte",
  numeroDocumento: "AB1234567",
  primerApellido: "El Amrani",
  segundoApellido: "",
  nombre: "Youssef",
  sexo: "H",
  estadoCivil: "soltero",
  fechaNacimiento: "1992-03-12",
  lugarNacimiento: "Tánger",
  paisNacimiento: "Marruecos",
  nacionalidad: "Marroquí",
  nombrePadre: "Ahmed",
  nombreMadre: "Fatima",
  domicilio: "Calle Sants",
  numeroDomicilio: "45",
  pisoDomicilio: "3º",
  localidad: "Barcelona",
  codigoPostal: "08014",
  provincia: "Barcelona",
  telefono: "632145987",
  email: "youssef.elamrani@example.com",
};

async function main() {
  const bytes = await fillExForm(
    "EX-31",
    sample,
    "regularitzacio_extraordinaria_protec_intl"
  );
  if (!bytes) {
    console.error("fillExForm returned null — template or field map missing");
    process.exit(1);
  }
  const out = join(process.cwd(), "public", "forms", "test-ex31-filled.pdf");
  writeFileSync(out, bytes);
  console.log(`✓ Wrote ${out} (${Math.round(bytes.length / 1024)} KB)`);
  console.log("Open it and verify Apartat 1 (datos del solicitante) is filled:");
  console.log("  pasaporte, nombre, apellidos, sexo (H), estado civil (soltero),");
  console.log("  fecha nacimiento (12/03/1992), lugar/país, nacionalidad,");
  console.log("  nombre padre/madre, domicilio, localidad, CP, provincia, teléfono, email.");
}

main().catch((e) => { console.error(e); process.exit(1); });
