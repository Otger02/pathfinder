/**
 * EX-32 — Sol·licitud d'autorització de residència per circumstàncies
 * excepcionals per raó d'arrelament extraordinari (Disposició Addicional
 * 21a RD 1155/2024, introduïda per RD 316/2026).
 *
 * Destinatari: persones en situació administrativa irregular que van
 * arribar a Espanya abans de l'1/1/2026 i acrediten 5 mesos de
 * residència continuada.
 *
 * Termini de la convocatòria: 16/04/2026 — 30/06/2026.
 *
 * ⚠️ TEMPLATE FLAT — sense camps AcroForm interactius (7 pàgines, 0 camps).
 *
 * Com que no hi ha camps interactius, omplim l'Apartat 1 (Datos de la
 * persona extranjera) amb un OVERLAY de `drawText`, igual que l'apartat 6
 * d'EX-10. Les coordenades s'han derivat de les posicions dels widgets
 * d'EX-31 (mateixa família de formulari del MICTM, mateix layout, mateixa
 * mida A4 595×842) confirmades visualment amb les captures de l'usuari.
 *
 * NOTA: les coordenades són una estimació a partir del formulari germà
 * EX-31. Poden necessitar un ajust fi de ±pocs punts si el text no cau
 * exactament sobre les línies. Genera `scripts/test-fill-ex32.ts` i revisa
 * `public/forms/test-ex32-filled.pdf` per calibrar.
 *
 * La resta del formulari (apartats 2-6: representant, notificacions, tipus
 * d'autorització, bloc de menors, declaració responsable) es deixa per
 * omplir manualment o via Sede Electrónica.
 */

import type { PersonalDataField } from "@/lib/types/personal-data";

// FieldMap interface requirements — EX-32 has no AcroForm fields, so these
// are all empty. The actual fill happens via the overlay below.
export const EX_32_TEXT_FIELDS: Record<string, PersonalDataField | null> = {};
export const EX_32_DATE_FIELDS: Record<string, { dd: string; mm: string; yyyy: string }> = {};
export const EX_32_SEXO_CHECKBOXES: Record<string, string> = {};
export const EX_32_TIPO_DOC_CHECKBOXES: Record<string, string> = {};
export const EX_32_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {};
export const EX_32_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};
export const EX_32_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {};
export const EX_32_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {};
export const EX_32_CONSENTIMIENTO_CHECKBOX = "";

/* =========================================================
 * drawText OVERLAY — Apartat 1 (persona extranjera), page 1.
 * Coordinates in PDF points, origin bottom-left. page is 1-indexed.
 * ======================================================= */

export interface OverlayTextMark {
  key: PersonalDataField;
  page: number;
  x: number;
  y: number;
}

/**
 * Apartat 1 single-line text fields.
 * Y values are the LABEL BASELINE (calibrated against the form's own text via
 * pdfjs getTextContent — values sit on the same baseline as their label,
 * which lands them on the fill-in line just to the right).
 */
export const EX_32_OVERLAY_TEXT: OverlayTextMark[] = [
  { key: "pasaporte", page: 1, x: 103, y: 672 },
  { key: "nie", page: 1, x: 368, y: 672 },
  { key: "primerApellido", page: 1, x: 98, y: 654 },
  { key: "segundoApellido", page: 1, x: 392, y: 654 },
  { key: "nombre", page: 1, x: 88, y: 635 },
  { key: "lugarNacimiento", page: 1, x: 257, y: 618 },
  { key: "paisNacimiento", page: 1, x: 453, y: 618 },
  { key: "nacionalidad", page: 1, x: 102, y: 598 },
  { key: "nombrePadre", page: 1, x: 120, y: 581 },
  { key: "nombreMadre", page: 1, x: 377, y: 581 },
  { key: "domicilio", page: 1, x: 127, y: 562 },
  { key: "numeroDomicilio", page: 1, x: 496, y: 563 },
  { key: "pisoDomicilio", page: 1, x: 541, y: 563 },
  { key: "localidad", page: 1, x: 100, y: 544 },
  { key: "codigoPostal", page: 1, x: 354, y: 544 },
  { key: "provincia", page: 1, x: 472, y: 545 },
  { key: "telefono", page: 1, x: 121, y: 526 },
  { key: "email", page: 1, x: 303, y: 526 },
  { key: "representanteLegal", page: 1, x: 172, y: 511 },
  { key: "representanteDniNiePas", page: 1, x: 423, y: 511 },
  { key: "representanteTitulo", page: 1, x: 516, y: 512 },
];

/** Fecha de nacimiento — three boxes DD / MM / YYYY on page 1. */
export const EX_32_OVERLAY_FECHA = {
  page: 1,
  y: 617,
  ddX: 134,
  mmX: 167,
  yyyyX: 192,
};

/** Sexo checkbox marks — value → box position (draw "X" at the box). */
export const EX_32_OVERLAY_SEXO: Record<string, { page: number; x: number; y: number }> = {
  X: { page: 1, x: 476, y: 636 },
  H: { page: 1, x: 510, y: 636 },
  M: { page: 1, x: 540, y: 636 },
};

/** Estado civil checkbox marks — value → box position. */
export const EX_32_OVERLAY_ESTADO: Record<string, { page: number; x: number; y: number }> = {
  soltero: { page: 1, x: 418, y: 599 },
  casado: { page: 1, x: 447, y: 599 },
  viudo: { page: 1, x: 475, y: 599 },
  divorciado: { page: 1, x: 504, y: 599 },
  separado_pareja_hecho: { page: 1, x: 532, y: 599 },
};
