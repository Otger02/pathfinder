/**
 * scripts/test-fill-ex32.ts
 *
 * Generates a sample filled EX-32 to calibrate the drawText overlay.
 * EX-32 is a flat PDF — Apartat 1 is filled by drawing text at coordinates
 * derived from the sibling EX-31 form. Open the output and check the text
 * lands on the form lines; if it's off by a few points, nudge the values
 * in lib/forms/ex-32.ts (EX_32_OVERLAY_*).
 *
 * Output: public/forms/test-ex32-filled.pdf (gitignored).
 * Run: npx tsx scripts/test-fill-ex32.ts
 */

import { writeFileSync } from "fs";
import { join } from "path";
import { fillExForm } from "../lib/pdf/form-filler";
import type { PersonalData } from "../lib/types/personal-data";

const sample: Partial<PersonalData> = {
  pasaporte: "AB1234567",
  tipoDocumento: "pasaporte",
  numeroDocumento: "AB1234567",
  primerApellido: "Diallo",
  segundoApellido: "",
  nombre: "Mariama",
  sexo: "M",
  estadoCivil: "casado",
  fechaNacimiento: "1990-07-25",
  lugarNacimiento: "Dakar",
  paisNacimiento: "Senegal",
  nacionalidad: "Senegalesa",
  nombrePadre: "Ousmane",
  nombreMadre: "Aminata",
  domicilio: "Carrer Major",
  numeroDomicilio: "12",
  pisoDomicilio: "2",
  localidad: "Lleida",
  codigoPostal: "25001",
  provincia: "Lleida",
  telefono: "611223344",
  email: "mariama.diallo@example.com",
};

async function main() {
  const bytes = await fillExForm(
    "EX-32",
    sample,
    "regularitzacio_extraordinaria_irregular"
  );
  if (!bytes) {
    console.error("fillExForm returned null");
    process.exit(1);
  }
  const out = join(process.cwd(), "public", "forms", "test-ex32-filled.pdf");
  writeFileSync(out, bytes);
  console.log(`✓ Wrote ${out} (${Math.round(bytes.length / 1024)} KB)`);
  console.log("Open page 1 and verify the overlay text sits on the form lines.");
  console.log("If misaligned, adjust EX_32_OVERLAY_* coords in lib/forms/ex-32.ts.");
}

main().catch((e) => { console.error(e); process.exit(1); });
