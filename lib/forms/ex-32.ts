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
 * ⚠️ TEMPLATE FLAT — sense camps AcroForm interactius.
 *
 * Comprovat amb pdf-lib: la versió pública distribuïda al juny 2026 a
 * inclusion.gob.es té 7 pàgines i 0 camps AcroForm. La versió
 * "Editable" anunciada al portal retorna una pàgina HTML embolicada en
 * comptes del PDF — possiblement un bug del CMS del MICTM.
 *
 * Implicacions:
 *  - L'API serveix el PDF tal qual.
 *  - L'usuari ha d'omplir-lo manualment (a mà o amb un PDF editor).
 *  - Quan el MICTM publiqui la versió editable correcta o algú extregui
 *    coordenades visuals dels camps, afegirem un drawText overlay similar
 *    al de l'apartat 6 d'EX-10.
 *
 * Mentrestant, Pathfinder afegeix valor a través de:
 *  - Decision tree que confirma elegibilitat
 *  - Checklist de documents a aportar
 *  - Procedural notes locals (cita prèvia, oficines, requisits no escrits)
 *  - Enllaç directe a la Sede Electrónica si l'usuari prefereix telemàtic
 */

import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_32_TEXT_FIELDS: Record<string, PersonalDataField | null> = {};
export const EX_32_DATE_FIELDS: Record<string, { dd: string; mm: string; yyyy: string }> = {};

export const EX_32_SEXO_CHECKBOXES: Record<string, string> = {};
export const EX_32_TIPO_DOC_CHECKBOXES: Record<string, string> = {};
export const EX_32_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {};
export const EX_32_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};
export const EX_32_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {};
export const EX_32_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {};
export const EX_32_CONSENTIMIENTO_CHECKBOX = "";
