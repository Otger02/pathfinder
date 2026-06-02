/**
 * EX-31 — Sol·licitud d'autorització de residència per circumstàncies
 * excepcionals per raó d'arrelament (Disposició Addicional 20a RD 1155/2024,
 * introduïda per RD 316/2026).
 *
 * Destinatari: persones sol·licitants de protecció internacional (PI) que
 * van demanar asil abans de l'1/1/2026 i compleixen residència mínima.
 *
 * Termini de la convocatòria: 16/04/2026 — 30/06/2026.
 *
 * Camps del PDF AcroForm (inspeccionats amb pdf-lib):
 *   - 141 PDFTextField (Texto1 .. Texto140, Texto183)
 *   - 47 PDFCheckBox (Casilla de verificación 141 .. 187)
 *   - 6 pàgines
 *
 * COBERTURA: Apartat 1 (sol·licitant) complet i VERIFICAT.
 *
 * Les posicions dels 188 widgets es van extreure amb
 * scripts/label-ex31.ts (vegeu docs/ex31-field-positions.md i
 * public/forms/EX-31-labeled.pdf). L'Apartat 1 (Texto1..Texto26 +
 * sexe/estat civil) coincideix posició a posició amb l'Apartat 1
 * d'EX-10, així que el mapatge és fiable.
 *
 * El formulari conté blocs de persona addicionals repetits
 * (Texto27..Texto140) per a unitats familiars que sol·liciten juntes.
 * Aquests es deixen DELIBERADAMENT sense mapar (null): la immensa
 * majoria de sol·licitants són individuals, i mapar malament un bloc
 * familiar seria pitjor que deixar-lo en blanc perquè l'usuari
 * l'ompli a mà. Es mapejaran quan es verifiquin visualment.
 *
 * Comportament actual: l'API serveix el PDF amb tot l'Apartat 1 ja
 * omplert (dades personals + sexe + estat civil + data de naixement)
 * i l'usuari completa els blocs addicionals si cal.
 */

import type { FieldMap } from "@/lib/pdf/field-maps";
import type { PersonalDataField } from "@/lib/types/personal-data";

/* =========================================================
 * 1) TEXT FIELDS — apartat 1 (solicitante) confirmed by pattern
 * ======================================================= */

export const EX_31_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // PÀGINA 1 — Apartat 1: datos del solicitante (standard EX layout)
  Texto1: "pasaporte",
  Texto2: null, // NIE letra
  Texto3: "nie",
  Texto4: null, // NIE control
  Texto5: "primerApellido",
  Texto6: "segundoApellido",
  Texto7: "nombre",
  Texto8: null, // fecha nacimiento DD → DATE_FIELDS
  Texto9: null, // MM
  Texto10: null, // YYYY
  Texto11: "lugarNacimiento",
  Texto12: "paisNacimiento",
  Texto13: "nacionalidad",
  Texto14: "nombrePadre",
  Texto15: "nombreMadre",
  Texto16: "domicilio",
  Texto17: "numeroDomicilio",
  Texto18: "pisoDomicilio",
  Texto19: "localidad",
  Texto20: "codigoPostal",
  Texto21: "provincia",
  Texto22: "telefono",
  Texto23: "email",
  Texto24: "representanteLegal",
  Texto25: "representanteDniNiePas",
  Texto26: "representanteTitulo",

  // PÀGINA 2-6 — apartats 2..6 (NIA expediente asilo, residencia 5 meses,
  // antecedentes penales, notificaciones, consentimiento, firma).
  // PENDIENTE de mapeo visual — todos null per ara.
  ...Object.fromEntries(
    Array.from({ length: 114 }, (_, i) => [`Texto${27 + i}`, null])
  ),
  Texto183: null,
};

/* =========================================================
 * 2) DATE FIELDS — DD/MM/YYYY splits
 * ======================================================= */

export const EX_31_DATE_FIELDS: Record<string, { dd: string; mm: string; yyyy: string }> = {
  fechaNacimiento: { dd: "Texto8", mm: "Texto9", yyyy: "Texto10" },
};

/* =========================================================
 * 3) CHECKBOXES — Apartat 1 (sol·licitant), verified by position
 *    against the EX-10 X/H/M and S/C/V/D/Sp conventions.
 * ======================================================= */

// Sexo (apartat 1), y≈645, left→right by x: 187(473) 141(507) 142(537)
export const EX_31_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación187": "X", // X* (no binari)
  "Casilla de verificación141": "H", // Hombre
  "Casilla de verificación142": "M", // Mujer
};

// Estado civil (apartat 1), y≈608, left→right: 143 144 145 146 147
export const EX_31_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación143": "soltero",
  "Casilla de verificación144": "casado",
  "Casilla de verificación145": "viudo",
  "Casilla de verificación146": "divorciado",
  "Casilla de verificación147": "separado_pareja_hecho",
};

// Tipo doc / circumstància / etc. — not part of apartat 1 identity block;
// left empty pending visual verification of the rest of the form.
export const EX_31_TIPO_DOC_CHECKBOXES: Record<string, string> = {};
export const EX_31_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};
export const EX_31_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {};
export const EX_31_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {};
export const EX_31_CONSENTIMIENTO_CHECKBOX = "";
