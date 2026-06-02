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
 * ⚠️ COBERTURA PARCIAL.
 *
 * Aquest field map està en mode "skeleton" — només l'Apartat 1 (Datos
 * del solicitante, Texto1..Texto26) està mapat amb confiança a partir
 * del patró estàndard dels EX. Els camps restants (Texto27..Texto140,
 * checkboxes 141..187) requereixen inspecció visual del PDF per
 * verificar la correspondència amb cada secció (residència, antecedents
 * penals per país, notificacions, etc.) i s'aniran omplint en commits
 * posteriors.
 *
 * Comportament actual: l'API serveix el PDF amb els ~22 camps base ja
 * omplerts i l'usuari completa la resta manualment. Millor que no oferir
 * el formulari en plena finestra de regularització extraordinària 2026.
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
 * 3) CHECKBOXES — placeholders. PENDING visual mapping.
 * ======================================================= */

export const EX_31_SEXO_CHECKBOXES: Record<string, string> = {};
export const EX_31_TIPO_DOC_CHECKBOXES: Record<string, string> = {};
export const EX_31_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {};
export const EX_31_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};
export const EX_31_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {};
export const EX_31_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {};
export const EX_31_CONSENTIMIENTO_CHECKBOX = "";
