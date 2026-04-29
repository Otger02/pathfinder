/**
 * EX-00 — Autorización de estancia de larga duración
 * 3 pages, 95 fields. Naming convention: generic (Textfield, Textfield-N).
 */
import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_00_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Solicitante ──────────────────────────────
  "Textfield":          "numeroDocumento",    // pasaporte / doc número
  "Textfield-0":        null,                 // NIE letra
  "Textfield-1":        "nie",                // NIE número
  "Textfield-2":        null,                 // NIE dígito control
  "x":                  "primerApellido",     // único apellido visible entre NIE y nombre
  "Textfield-3":        "nombre",
  // Fecha nacimiento: split DD/MM/YYYY
  "Fecha de nacimientoz": null,               // DD
  "Texto-1":            null,                 // MM
  "Textfield-4":        null,                 // YYYY
  "Estado civil3 S":    "lugarNacimiento",
  "Textfield-5":        "paisNacimiento",
  "Textfield-6":        "nacionalidad",
  // Estado civil: checkboxes below (C/V/D/Sp/ChkBox-0)
  "Textfield-8":        "domicilio",
  "N":                  "numeroDomicilio",    // "N" = Número (calle)
  "Piso":               "pisoDomicilio",
  "CP":                 "codigoPostal",       // CP = Código Postal
  "Textfield-9":        "localidad",
  "Textfield-10":       "provincia",
  "Textfield-12":       "telefono",
  "Textfield-13":       "email",
  "Textfield-15":       "nombrePadre",
  "Textfield-17":       "nombreMadre",
  "D NIN IEPAS":        "representanteDniNiePas",
  "Textfield-21":       "representanteLegal",
  "Textfield-23":       "representanteTitulo",
  "Textfield-25":       null,                 // campo adicional representante

  // ── Apartado 2: Representante presentación ───────────────
  "Textfield-26":       "repPresentacion_nombre",
  "Piso-0":             "repPresentacion_dniNiePas",   // campo mal nombrado en PDF
  "Provincia-0":        "repPresentacion_domicilio",   // campo mal nombrado en PDF
  "Textfield-27":       "repPresentacion_numero",
  "Textfield-28":       "repPresentacion_piso",
  "Textfield-29":       "repPresentacion_localidad",
  "Textfield-30":       "repPresentacion_codigoPostal",
  "Textfield-32":       "repPresentacion_provincia",
  "Textfield-33":       "repPresentacion_telefono",
  "Titulo4":            "repPresentacion_email",        // campo mal nombrado en PDF (pos 10)
  "Textfield-35":       "repPresentacion_repLegal",
  "Textfield-37":       "repPresentacion_repDniNiePas",
  "Textfield-39":       "repPresentacion_repTitulo",

  // ── Apartado 3: Notificaciones ───────────────────────────
  "Textfield-40":       "notif_nombre",
  "Textfield-41":       "notif_dniNiePas",
  "Textfield-42":       "notif_domicilio",
  "Textfield-43":       "notif_numero",
  "Textfield-44":       "notif_piso",
  "Textfield-45":       "notif_localidad",
  "Email":              "notif_email",        // campo "Email" = email (posición AcroForm ≠ visual)
  "Textfield-47":       "notif_codigoPostal",
  "Textfield-48":       "notif_provincia",
  "Textfield-51":       "notif_telefono",
};

export const EX_00_SEXO_CHECKBOXES: Record<string, string> = {
  "H":      "H",
  "M":      "M",
  "ChkBox": "X",
};

export const EX_00_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "C":        "casado",
  "V":        "viudo",
  "D":        "divorciado",
  "Sp":       "pareja_hecho",
  "ChkBox-0": "soltero",
};

export const EX_00_TIPO_DOC_CHECKBOXES: Record<string, string> = {
  // EX-00 no tiene checkbox de tipo doc explícito — se infiere del campo relleno
};

export const EX_00_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {
  // EX-00 no tiene checkbox de circunstancia
};

export const EX_00_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {
  // ── INICIAL ──
  "INICIAL":                                                    "inicial",
  "Estancia por movilidad de alumnos art 443":                  "estancia_movilidad_alumnos",
  "Autorizacion de estancia por estudios superiores a":         "estancia_estudios_superiores",
  "Autorizacion de estancia por estudios no superiore":         "estancia_estudios_no_superiores",
  "Formacion reglada para el empleo certificado de pr":         "formacion_reglada_empleo",
  "Estudiante convenio Andorra":                                "estudiante_convenio_andorra",
  "Familiar de titular autorizacion de estancia para":          "familiar_titular_estancia",
  "Estancia en base a instrucciones dictadas por Cons":         "estancia_instrucciones_consejo",
  "Otros":                                                      "otros_inicial",
  // ── PRORROGA ──
  "PRORROGA":                                                   "prorroga",
  "Titular de autorizacion de estancia ordinaria sin":          "titular_estancia_ordinaria",
  "Titular de visado de estancia art 34":                       "titular_visado_estancia",
  "Titular de autorizacion estancia por estudios movi":         "titular_estancia_estudios_movilidad",
  "Familiar de titular de autorizacion de estancia po":         "familiar_titular_estancia_prorroga",
  "Familiar de titular de autorizacion de estancia en":         "familiar_titular_estancia_especial",
  "Titular de autorizacion de estancia en regimen esp":         "titular_estancia_regimen_especial",
  "Titular de autorizacion de estancia por movilidad":          "titular_estancia_movilidad",
  "Titular de autorizacion de estancia por estudios s":         "titular_estancia_estudios_superiores",
  "Titular de autorizacion de estancia por estudios n":         "titular_estancia_estudios_no_superiores",
  "Menor desplazado para tratamiento medico art 1262":          "menor_tratamiento_medico",
  "Menor desplazado para escolarizacion razones excep":         "menor_escolarizacion_excepcional",
  "Titular de autorizacion de estancia en base a inst":         "titular_estancia_instrucciones",
  "Titular de autorizacion de estancia Convenios Inte":         "titular_estancia_convenios",
  "Titular de visado de estancia Convenios internacio":         "titular_visado_convenios",
  "Otros-1":                                                    "otros_prorroga",
};

export const EX_00_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {
  // No aparece en EX-00
};

export const EX_00_CONSENTIMIENTO_CHECKBOX =
  "CONSIENTO que las comunicaciones y notifcaciones s";

export const EX_00_DATE_FIELDS = {
  fechaNacimiento: { dd: "Fecha de nacimientoz", mm: "Texto-1", yyyy: "Textfield-4" },
} as const;
