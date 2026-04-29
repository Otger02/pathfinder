import { computeMissingFields, shouldTransitionToResum } from "@/lib/collection-engine";

const BASE = {
  nombre: "Mohamed", primerApellido: "Aziz",
  fechaNacimiento: "1990-01-01", nacionalidad: "Marroquí",
  tipoDocumento: "pasaporte" as const, numeroDocumento: "BK123",
  domicilio: "Calle X", localidad: "Barcelona",
  codigoPostal: "08001", provincia: "Barcelona",
};

let allOk = true;
function expect(label: string, actual: unknown, check: (v: unknown) => boolean) {
  const ok = check(actual);
  console.log(`${ok ? "✓" : "✗"} ${label}:`, actual);
  if (!ok) allOk = false;
}

// A — arraigo_social, no tipoSolicitud → should include tipoSolicitud
const missingA = computeMissingFields(["arraigo_social"], BASE);
expect("A includes tipoSolicitud", missingA, v => (v as string[]).includes("tipoSolicitud"));
expect("A excludes familiar_nombre", missingA, v => !(v as string[]).includes("familiar_nombre"));

// B — arraigo_social + tipoSolicitud filled → should transition
const fullSocial = { ...BASE, tipoSolicitud: "residencia_inicial" as const };
expect("B shouldTransition arraigo_social", shouldTransitionToResum(["arraigo_social"], fullSocial), v => v === true);

// C — arraigo_sociolaboral, no empleador → required includes empleador_nombre + nifNie
const missingC = computeMissingFields(["arraigo_sociolaboral"], BASE);
expect("C includes empleador_nombre", missingC, v => (v as string[]).includes("empleador_nombre"));
expect("C includes empleador_nifNie", missingC, v => (v as string[]).includes("empleador_nifNie"));
// recommended NOT active yet (no empleador started)
expect("C excludes empleador_actividad (no context)", missingC, v => !(v as string[]).includes("empleador_actividad"));

// D — arraigo_sociolaboral + empleador started → empleador_actividad becomes active
const withEmpleador = { ...BASE, tipoSolicitud: "residencia_inicial" as const, empleador_nombre: "ACME S.L.", empleador_nifNie: "B12345678" };
const missingD = computeMissingFields(["arraigo_sociolaboral"], withEmpleador);
expect("D includes empleador_actividad (context active)", missingD, v => (v as string[]).includes("empleador_actividad"));
expect("D excludes empleador_nombre (filled)", missingD, v => !(v as string[]).includes("empleador_nombre"));

// E — arraigo_familiar + familiar block complete → recommended (sexo, estadoCivil) active
const withFamiliar = { ...BASE, tipoSolicitud: "residencia_inicial" as const, familiar_nombre: "Ibrahim", familiar_primerApellido: "Bah", familiar_vinculo: "cónyuge" };
const missingE = computeMissingFields(["arraigo_familiar"], withFamiliar);
expect("E includes familiar_sexo (recommended active)", missingE, v => (v as string[]).includes("familiar_sexo"));
expect("E includes familiar_estadoCivil (recommended active)", missingE, v => (v as string[]).includes("familiar_estadoCivil"));
expect("E excludes familiar_nombre (filled)", missingE, v => !(v as string[]).includes("familiar_nombre"));

// F — arraigo_socioformatiu, no formacio → required includes entitat + nifCif
const missingF = computeMissingFields(["arraigo_socioformatiu"], BASE);
expect("F includes formacio_entitat", missingF, v => (v as string[]).includes("formacio_entitat"));
// recommended NOT active yet
expect("F excludes formacio_tipus (no context)", missingF, v => !(v as string[]).includes("formacio_tipus"));

// G — arraigo_socioformatiu + formacio started → recommended active
const withFormacio = { ...BASE, tipoSolicitud: "residencia_inicial" as const, formacio_entitat: "CIFO", formacio_nifCif: "Q1234567A" };
const missingG = computeMissingFields(["arraigo_socioformatiu"], withFormacio);
expect("G includes formacio_tipus (recommended active)", missingG, v => (v as string[]).includes("formacio_tipus"));

console.log(allOk ? "\nAll checks OK" : "\nSome checks FAILED");
if (!allOk) process.exit(1);
