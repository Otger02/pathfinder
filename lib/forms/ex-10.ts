/**
 * EX-10 — Solicitud de autorización de residencia por circunstancias excepcionales
 * (LO 4/2000 y RD 1155/2024)
 *
 * Mapeig de checkboxes confirmat visualment al labeled PDF (29-Apr-2026).
 * Total checkboxes interactius al PDF: 54
 *   Pàgina 1: 17  (96-111 + 261)
 *   Pàgina 2:  7  (112-118)
 *   Pàgina 3: 30  (119-148)
 *
 * NOTA IMPORTANT — apartat 6 (Centre de Formació):
 *   Els checkboxes de "tipus de formació" i "modalitat de formació" NO són
 *   camps interactius del formulari AcroForm — són gràfics estàtics. Per
 *   omplir-los caldrà sobreposar marques a coordenades fixes via pdf-lib
 *   (drawText o drawImage), no via form.getCheckBox().check(). Veure
 *   form-filler.ts per la implementació.
 */

import type { FieldMap } from "@/lib/pdf/field-maps";
import type { PersonalDataField } from "@/lib/types/personal-data";

/* =========================================================
 * 1) TEXT FIELDS — mapping camps Texto1..Texto95 → PersonalData
 * ======================================================= */

export const EX_10_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // PÀGINA 1 — Apartat 1: dades persona estrangera
  Texto1: "pasaporte",
  Texto2: null, // NIE lletra
  Texto3: "nie",
  Texto4: null, // NIE control
  Texto5: "primerApellido",
  Texto6: "segundoApellido",
  Texto7: "nombre",
  Texto8: null, // dia naixement → DATE_FIELDS
  Texto9: null, // mes
  Texto10: null, // any
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

  // PÀGINA 1 — Apartat 2: familiar UE/EEE/Suïssa
  Texto27: "familiar_pasaporte",
  Texto28: null,
  Texto29: "familiar_nie",
  Texto30: null,
  Texto31: "familiar_primerApellido",
  Texto32: "familiar_segundoApellido",
  Texto33: "familiar_nombre",
  Texto34: null, // → DATE_FIELDS
  Texto35: null,
  Texto36: null,
  Texto37: "familiar_paisNacimiento",
  Texto38: "familiar_lugarNacimiento",
  Texto39: "familiar_nombrePadre",
  Texto40: "familiar_nombreMadre",
  Texto41: "familiar_domicilio",
  Texto42: "familiar_numeroDomicilio",
  Texto43: "familiar_pisoDomicilio",
  Texto44: "familiar_localidad",
  Texto45: "familiar_codigoPostal",
  Texto46: "familiar_provincia",
  Texto47: "familiar_vinculo",

  // PÀGINA 1 — Apartat 3: representant presentació
  Texto48: "repPresentacion_nombre",
  Texto49: "repPresentacion_dniNiePas",
  Texto50: "repPresentacion_domicilio",
  Texto51: "repPresentacion_numero",
  Texto52: "repPresentacion_piso",
  Texto53: "repPresentacion_localidad",
  Texto54: "repPresentacion_codigoPostal",
  Texto55: "repPresentacion_provincia",
  Texto56: "repPresentacion_telefono",
  Texto57: "repPresentacion_email",
  Texto58: "repPresentacion_repLegal",
  Texto59: "repPresentacion_repDniNiePas",
  Texto60: "repPresentacion_repTitulo",

  // PÀGINA 1 — Apartat 4: domicili notificacions
  Texto61: "notif_nombre",
  Texto62: "notif_dniNiePas",
  Texto63: "notif_domicilio",
  Texto64: "notif_numero",
  Texto65: "notif_piso",
  Texto66: "notif_localidad",
  Texto67: "notif_codigoPostal",
  Texto68: "notif_provincia",
  Texto69: "notif_telefono",
  Texto70: "notif_email",

  // PÀGINA 2 — Apartat 5: empleador (arraigo sociolaboral)
  Texto71: "empleador_nombre",
  Texto72: "empleador_nifNie",
  Texto73: "empleador_actividad",
  Texto74: "empleador_cnae",
  Texto75: "empleador_cnoSpe",
  Texto76: "empleador_domicilio",
  Texto77: "empleador_numero",
  Texto78: "empleador_piso",
  Texto79: "empleador_localidad",
  Texto80: "empleador_codigoPostal",
  Texto81: "empleador_provincia",
  Texto82: "empleador_telefono",
  Texto83: "empleador_email",
  Texto84: "empleador_repNombre",
  Texto85: "empleador_repDniNie",
  Texto86: "empleador_repTitulo",

  // PÀGINA 2 — Apartat 6: centre formació
  Texto87: "formacio_entitat",
  Texto88: "formacio_nom",
  Texto89: "formacio_codigoCurs",
  Texto90: "formacio_nifCif",
  Texto91: "formacio_direccio",
  Texto92: "formacio_provincia",
  Texto93: "formacio_duracio",
  Texto94: null, // → DATE_FIELDS
  Texto95: null,
};

/* =========================================================
 * 2) DATE FIELDS — split DD/MM/YYYY
 * ======================================================= */

export const EX_10_DATE_FIELDS: Record<
  string,
  { dd: string; mm: string; yyyy: string }
> = {
  fechaNacimiento: { dd: "Texto8", mm: "Texto9", yyyy: "Texto10" },
  familiar_fechaNacimiento: { dd: "Texto34", mm: "Texto35", yyyy: "Texto36" },
  formacio_fechaInici: { dd: "Texto94", mm: "Texto95", yyyy: "" },
  formacio_fechaFi: { dd: "", mm: "", yyyy: "" },
};

/* =========================================================
 * 3) CHECKBOXES — Pàgina 1
 * ======================================================= */

/** Sexo del solicitante (apartat 1) */
export const EX_10_SOLICITANTE_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación96": "X", // X* (no binari)
  "Casilla de verificación97": "H", // Hombre
  "Casilla de verificación98": "M", // Mujer
};

/**
 * Estado civil del solicitante (apartat 1) — 5 opcions, no 4.
 * Bug corregit: la casella 103 és "separado/pareja de hecho", no "familiar sexo".
 */
export const EX_10_SOLICITANTE_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación99": "soltero", // S
  "Casilla de verificación100": "casado", // C
  "Casilla de verificación101": "viudo", // V
  "Casilla de verificación102": "divorciado", // D
  "Casilla de verificación103": "separado_pareja_hecho", // Sp
};

/** Sexo del familiar UE/EEE/Suïssa — números desplaçats vs. solicitant */
export const EX_10_FAMILIAR_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación104": "X",
  "Casilla de verificación105": "H",
  "Casilla de verificación106": "M",
};

/** Estado civil del familiar UE/EEE/Suïssa */
export const EX_10_FAMILIAR_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación107": "soltero",
  "Casilla de verificación108": "casado",
  "Casilla de verificación109": "viudo",
  "Casilla de verificación110": "divorciado",
  "Casilla de verificación111": "separado_pareja_hecho",
};

/**
 * Consentiment per a notificacions a la Dirección Electrónica Habilitada Única.
 * Per defecte ha d'anar marcat (opt-in usual del formulari oficial).
 */
export const EX_10_CONSENTIMIENTO_CHECKBOX = "Casilla de verificación261";

/* =========================================================
 * 4) CHECKBOXES — Pàgina 2
 * ======================================================= */

/** Tipus de document d'identitat aportat (apartat 1, "PASAPORTE / N.I.E.") */
export const EX_10_TIPO_DOC_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación112": "pasaporte",
  "Casilla de verificación113": "nie",
  "Casilla de verificación114": "cedula_inscripcion",
  "Casilla de verificación115": "titulo_viaje",
};

/** Hijos en edat d'escolarització obligatòria escolaritzats? */
export const EX_10_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación116": "si",
  "Casilla de verificación117": "no",
  "Casilla de verificación118": "no_aplica",
};

/* =========================================================
 * 5) CHECKBOXES — Pàgina 3 (TIPO SOLICITUD + CIRCUNSTANCIA)
 * ======================================================= */

/**
 * El formulari oficial NO inclou "renovación" ni "modificación". La casella 119
 * marca el HEADER "TIPO DE SOLICITUD"; les opcions reals són 120-122.
 */
export const EX_10_TIPO_SOLICITUD_HEADER_CHECKBOX = "Casilla de verificación119";

export const EX_10_TIPO_SOLICITUD_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación120": "residencia_inicial",
  "Casilla de verificación121": "prorroga",
  "Casilla de verificación122": "provisional",
};

/**
 * Igual que 119, la casella 123 marca el HEADER "TIPO DE AUTORIZACIÓN".
 * Les circumstàncies reals comencen a la casella 124.
 */
export const EX_10_TIPO_AUTORIZACION_HEADER_CHECKBOX = "Casilla de verificación123";

/**
 * Circumstància excepcional concreta (art. RD 1155/2024).
 *
 * Slugs alineats amb `lib/form-config.ts AUTH_TO_EX` (català). Els arraigos
 * (segunda oportunidad, sociolaboral, social, socioformatiu, familiar) usen
 * exactament els slugs catalans del form-config.
 *
 * Els slugs granulars (humanitarias_*, vg_*, vs_*, trata_*, etc.) NO existeixen
 * encara a form-config; són sub-vies del PDF que el sistema de slot-filling
 * pot utilitzar quan el form-config s'expandeixi. De moment, els 9 slugs
 * generals catalans del form-config (residencia_humanitaria, victima_*, etc.)
 * cauen al genèric humanitarias_victimas_delitos / vg_mujer_extranjera /
 * vs_victima_extranjera / trata_colaboracion_investigacion via form-filler.
 */
export const EX_10_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {
  // Arraigos (art. 127) — slugs en català per coherència amb form-config.ts
  "Casilla de verificación124": "arraigo_segona_oportunitat", // 127.a
  "Casilla de verificación125": "arraigo_sociolaboral", // 127.b
  "Casilla de verificación126": "arraigo_social", // 127.c
  "Casilla de verificación127": "arraigo_socioformatiu", // 127.d
  "Casilla de verificación128": "arraigo_familiar", // 127.e

  // Razones humanitarias (art. 128)
  "Casilla de verificación129": "humanitarias_victimas_delitos", // 128.2
  "Casilla de verificación130": "humanitarias_enfermedad_grave", // 128.3.1º
  "Casilla de verificación131": "humanitarias_progenitor_enfermo", // 128.3.2º
  "Casilla de verificación132": "humanitarias_peligro_seguridad", // 128.4

  // Colaboración / interés público (art. 129)
  "Casilla de verificación133": "colaboracion_autoridades_ajenas_redes", // 129.1
  "Casilla de verificación134": "interes_publico_seguridad_nacional", // 129.1
  "Casilla de verificación135": "colaboracion_autoridad_laboral", // 129.2

  // Violencia de género (arts. 133-134)
  "Casilla de verificación136": "vg_mujer_extranjera", // 133.1
  "Casilla de verificación137": "vg_hijo_menor_tutelado", // 134.2
  "Casilla de verificación138": "vg_padre_madre", // 134.2

  // Violencia sexual (arts. 137-141)
  "Casilla de verificación139": "vs_victima_extranjera", // 137.2
  "Casilla de verificación140": "vs_hijo_menor_tutelado", // 138.2
  "Casilla de verificación141": "vs_padre_madre", // 138.2
  "Casilla de verificación142": "vs_adulto_responsable_menor", // 141.2

  // Trata y redes organizadas (arts. 143, 152)
  "Casilla de verificación143": "redes_organizadas_victima_testigo", // 143
  "Casilla de verificación144": "trata_colaboracion_investigacion", // 152.1
  "Casilla de verificación145": "trata_situacion_personal", // 152.1
  "Casilla de verificación146": "trata_hijo_menor_tutelado", // 152.1

  // Disposiciones adicionales / supuestos extraordinarios
  "Casilla de verificación147": "ccee_no_previstas_da2", // RD 1155/2024 DA 2ª
  "Casilla de verificación148": "ccee_dana_2024_prorroga", // Acuerdo 11/feb/2025
};

/* =========================================================
 * 6) APARTAT 6 — Centre de Formació (NO INTERACTIUS)
 * ======================================================= */

/**
 * Coordenades dels checkboxes gràfics de l'apartat 6 (no interactius).
 * Caldrà sobreposar una "X" amb pdf-lib `page.drawText()` quan calgui marcar-los.
 * Coordenades en punts PDF (origen bottom-left), pàgina 2.
 */
export const EX_10_FORMACIO_TIPUS_COORDS = {
  eso_postobligatoria: { page: 2, x: 73, y: 766 },
  certificado_profesional: { page: 2, x: 73, y: 749 },
  eso_adultos_presencial: { page: 2, x: 73, y: 732 },
  sepe: { page: 2, x: 73, y: 715 },
} as const;

export const EX_10_FORMACIO_MODALITAT_COORDS = {
  presencial: { page: 2, x: 73, y: 422 },
  a_distancia: { page: 2, x: 144, y: 422 },
  mixta: { page: 2, x: 230, y: 422 },
} as const;

/* =========================================================
 * 7) HELPERS — slug → field
 * ======================================================= */

/**
 * Map invers slug → field name del PDF, per a quan tenim un authSlug del
 * decision tree i necessitem saber quina casella marcar.
 */
export const EX_10_CIRCUNSTANCIA_SLUG_TO_FIELD: Record<string, string> = Object.fromEntries(
  Object.entries(EX_10_CIRCUNSTANCIA_CHECKBOXES).map(([field, slug]) => [slug, field])
);

export const EX_10_TIPO_SOLICITUD_SLUG_TO_FIELD: Record<string, string> = Object.fromEntries(
  Object.entries(EX_10_TIPO_SOLICITUD_CHECKBOXES).map(([field, slug]) => [slug, field])
);

/**
 * Aliases per als slugs genèrics catalans del form-config.ts que no tenen
 * mapping directe a una casella del PDF. Apunten al slug més proper de
 * `EX_10_CIRCUNSTANCIA_CHECKBOXES` perquè el PDF marqui *alguna* opció.
 *
 * Quan vulguis distingir sub-vies (per ex. víctima de tracta amb fill menor
 * vs sense), expandeix `lib/form-config.ts AUTH_TO_EX` amb els slugs
 * granulars i actualitza l'arbre de decisions perquè els nodes resultat
 * usin aquests slugs específics.
 */
const SLUG_ALIASES: Record<string, string> = {
  residencia_humanitaria: "humanitarias_victimas_delitos",
  victima_violencia_genere: "vg_mujer_extranjera",
  victima_violencia_sexual: "vs_victima_extranjera",
  victima_trata: "trata_situacion_personal",
  colaboracio_autoritats_policials: "colaboracion_autoridades_ajenas_redes",
  colaboracio_interes_public: "interes_publico_seguridad_nacional",
  colaboracio_contra_xarxes_admin: "colaboracion_autoridad_laboral",
  colaboracio_contra_xarxes_policial: "colaboracion_autoridades_ajenas_redes",
  residencia_retorn_voluntari: "ccee_no_previstas_da2",
};

/**
 * Resol l'authSlug de l'arbre de decisions a la casella de circumstància
 * que cal marcar al PDF. Retorna null si l'slug no es correspon amb cap
 * circumstància de l'EX-10 (per ex. és un node intermedi de l'arbre).
 */
export function resolveCircunstanciaCheckbox(authSlug: string): string | null {
  const directMatch = EX_10_CIRCUNSTANCIA_SLUG_TO_FIELD[authSlug];
  if (directMatch) return directMatch;
  const alias = SLUG_ALIASES[authSlug];
  if (alias) return EX_10_CIRCUNSTANCIA_SLUG_TO_FIELD[alias] ?? null;
  return null;
}

/**
 * Resol el tipus de sol·licitud al PDF. Per defecte "residencia_inicial"
 * (el cas més comú per autoritzacions excepcionals).
 */
export function resolveTipoSolicitudCheckbox(
  tipo: keyof typeof EX_10_TIPO_SOLICITUD_SLUG_TO_FIELD = "residencia_inicial"
): string {
  return (
    EX_10_TIPO_SOLICITUD_SLUG_TO_FIELD[tipo] ??
    EX_10_TIPO_SOLICITUD_SLUG_TO_FIELD.residencia_inicial
  );
}

/* =========================================================
 * 8) BACKWARD-COMPAT ALIASES per als field-maps existents
 * ======================================================= */
// Els re-exports a `lib/pdf/field-maps/ex-10.ts` i el lazy loader a
// `lib/pdf/field-maps/index.ts` esperen aquests noms vells. Mantenim els
// alies per no haver de tocar tot l'andamiatge.

export const EX_10_SEXO_CHECKBOXES = EX_10_SOLICITANTE_SEXO_CHECKBOXES;
export const EX_10_ESTADO_CIVIL_CHECKBOXES = EX_10_SOLICITANTE_ESTADO_CIVIL_CHECKBOXES;
// El "tipo autorización" del FieldMap antic és semànticament la
// "circumstància excepcional" del nou mapping.
export const EX_10_TIPO_AUTORIZACION_CHECKBOXES = EX_10_CIRCUNSTANCIA_CHECKBOXES;
// Els checkboxes de formació del PDF NO són interactius (són gràfics).
// Es marquen via coordenades a `EX_10_FORMACIO_*_COORDS`. Records buits
// per satisfer el FieldMap interface.
export const EX_10_FORMACIO_TIPUS_CHECKBOXES: Record<string, string> = {};
export const EX_10_FORMACIO_MODALITAT_CHECKBOXES: Record<string, string> = {};

/* =========================================================
 * 9) FIELD MAP EXPORT
 * ======================================================= */

export const EX_10_FIELD_MAP: FieldMap = {
  textFields: EX_10_TEXT_FIELDS,
  sexoCheckboxes: EX_10_SOLICITANTE_SEXO_CHECKBOXES,
  tipoDocCheckboxes: EX_10_TIPO_DOC_CHECKBOXES,
  estadoCivilCheckboxes: EX_10_SOLICITANTE_ESTADO_CIVIL_CHECKBOXES,
  circunstanciaCheckboxes: EX_10_CIRCUNSTANCIA_CHECKBOXES,
  tipoAutorizacionCheckboxes: EX_10_CIRCUNSTANCIA_CHECKBOXES,
  hijosEscolarizacionCheckboxes: EX_10_HIJOS_ESCOLARIZACION_CHECKBOXES as unknown as Record<string, boolean>,
  consentimientoCheckbox: EX_10_CONSENTIMIENTO_CHECKBOX,
  dateFields: EX_10_DATE_FIELDS,
  familiarSexoCheckboxes: EX_10_FAMILIAR_SEXO_CHECKBOXES,
  familiarEstadoCivilCheckboxes: EX_10_FAMILIAR_ESTADO_CIVIL_CHECKBOXES,
  formacioTipusCheckboxes: EX_10_FORMACIO_TIPUS_CHECKBOXES,
  formacioModalitatCheckboxes: EX_10_FORMACIO_MODALITAT_CHECKBOXES,
};
