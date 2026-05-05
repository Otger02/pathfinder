/**
 * Helpers shared by the CaseDetail components.
 */

import type { Lang } from "@/lib/i18n";

export type SituacioLegal =
  | "sense_autoritzacio"
  | "amb_autoritzacio"
  | "ue"
  | "asil"
  | null;

/** Human-readable labels for personal data fields, per language. */
const FIELD_LABEL_MAP: Record<string, Record<Lang, string>> = {
  nombre: { ca: "Nom", es: "Nombre", en: "First name", fr: "Prénom", ar: "الاسم" },
  primerApellido: { ca: "Primer cognom", es: "Primer apellido", en: "First surname", fr: "Premier nom", ar: "اللقب الأول" },
  segundoApellido: { ca: "Segon cognom", es: "Segundo apellido", en: "Second surname", fr: "Deuxième nom", ar: "اللقب الثاني" },
  fechaNacimiento: { ca: "Data de naixement", es: "Fecha de nacimiento", en: "Date of birth", fr: "Date de naissance", ar: "تاريخ الميلاد" },
  lugarNacimiento: { ca: "Lloc de naixement", es: "Lugar de nacimiento", en: "Place of birth", fr: "Lieu de naissance", ar: "مكان الميلاد" },
  paisNacimiento: { ca: "País de naixement", es: "País de nacimiento", en: "Country of birth", fr: "Pays de naissance", ar: "بلد الميلاد" },
  nacionalidad: { ca: "Nacionalitat", es: "Nacionalidad", en: "Nationality", fr: "Nationalité", ar: "الجنسية" },
  sexo: { ca: "Sexe", es: "Sexo", en: "Sex", fr: "Sexe", ar: "الجنس" },
  estadoCivil: { ca: "Estat civil", es: "Estado civil", en: "Civil status", fr: "État civil", ar: "الحالة الاجتماعية" },
  tipoDocumento: { ca: "Tipus de document", es: "Tipo de documento", en: "Document type", fr: "Type de document", ar: "نوع الوثيقة" },
  numeroDocumento: { ca: "Núm. document", es: "Núm. documento", en: "Document number", fr: "Numéro de document", ar: "رقم الوثيقة" },
  nie: { ca: "NIE", es: "NIE", en: "NIE", fr: "NIE", ar: "NIE" },
  nombrePadre: { ca: "Nom del pare", es: "Nombre del padre", en: "Father's name", fr: "Nom du père", ar: "اسم الأب" },
  nombreMadre: { ca: "Nom de la mare", es: "Nombre de la madre", en: "Mother's name", fr: "Nom de la mère", ar: "اسم الأم" },
  domicilio: { ca: "Adreça", es: "Dirección", en: "Address", fr: "Adresse", ar: "العنوان" },
  numeroDomicilio: { ca: "Número", es: "Número", en: "Number", fr: "Numéro", ar: "رقم" },
  pisoDomicilio: { ca: "Pis", es: "Piso", en: "Floor", fr: "Étage", ar: "الطابق" },
  localidad: { ca: "Localitat", es: "Localidad", en: "City", fr: "Ville", ar: "المدينة" },
  provincia: { ca: "Província", es: "Provincia", en: "Province", fr: "Province", ar: "المقاطعة" },
  codigoPostal: { ca: "Codi postal", es: "Código postal", en: "Postal code", fr: "Code postal", ar: "الرمز البريدي" },
  telefono: { ca: "Telèfon", es: "Teléfono", en: "Phone", fr: "Téléphone", ar: "الهاتف" },
  email: { ca: "Email", es: "Email", en: "Email", fr: "Email", ar: "البريد الإلكتروني" },
  empleador_nombre: { ca: "Empresa", es: "Empresa", en: "Employer", fr: "Employeur", ar: "صاحب العمل" },
  empleador_nifNie: { ca: "NIF empresa", es: "NIF empresa", en: "Employer NIF", fr: "NIF employeur", ar: "ضريبة صاحب العمل" },
  empleador_actividad: { ca: "Sector empresa", es: "Sector empresa", en: "Employer sector", fr: "Secteur employeur", ar: "قطاع صاحب العمل" },
};

export function fieldLabel(key: string, lang: Lang): string {
  return FIELD_LABEL_MAP[key]?.[lang] ?? key;
}

/** Format a single field value for display. Handles short string fields. */
export function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return "";
  const v = String(value).trim();
  if (!v) return "";
  // Mask document numbers — keep only last 4 chars for display
  if (key === "numeroDocumento" || key === "nie") {
    if (v.length > 4) return "••••" + v.slice(-4);
  }
  // Date YYYY-MM-DD → DD/MM/YYYY
  if (key === "fechaNacimiento" && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const [y, m, d] = v.split("-");
    return `${d}/${m}/${y}`;
  }
  if (key === "tipoDocumento") {
    return v === "pasaporte" ? "Passaport" : v === "nie" ? "NIE" : v;
  }
  if (key === "sexo") {
    return v === "H" ? "H" : v === "M" ? "M" : v;
  }
  return v;
}

/** Pretty composite address for the panel. */
export function composeAddress(data: Record<string, unknown>): string | null {
  const parts: string[] = [];
  const street = data.domicilio as string | undefined;
  const num = data.numeroDomicilio as string | undefined;
  const piso = data.pisoDomicilio as string | undefined;
  const loc = data.localidad as string | undefined;
  const cp = data.codigoPostal as string | undefined;

  if (street) parts.push(num ? `${street} ${num}` : street);
  if (piso) parts.push(piso);
  if (loc) parts.push(cp ? `${cp} ${loc}` : loc);
  return parts.length ? parts.join(", ") : null;
}

// ── Resources by situation ────────────────────────────────────────

export interface Resource {
  name: string;
  phone: string;
  description: string;
}

const RESOURCES_BY_SITUATION: Record<string, Resource[]> = {
  sense_autoritzacio: [
    { name: "CEAR", phone: "+34915980535", description: "Comisión Española de Ayuda al Refugiado" },
    { name: "SJM", phone: "+34914459085", description: "Servicio Jesuita a Migrantes" },
    { name: "Cruz Roja", phone: "+34915354545", description: "Acogida y orientación" },
  ],
  asil: [
    { name: "ACNUR Espanya", phone: "+34915563549", description: "Alto Comissariat de l'ONU per als Refugiats" },
    { name: "OAR", phone: "+34915372170", description: "Oficina d'Asil i Refugi" },
    { name: "CEAR", phone: "+34915980535", description: "Comisión Española de Ayuda al Refugiado" },
  ],
  ue: [
    { name: "SAIER (Barcelona)", phone: "+34932564000", description: "Servei d'Atenció a Immigrants, Emigrants i Refugiats" },
    { name: "Oficina d'Extranjeria", phone: "+34902028505", description: "Cita prèvia: 060" },
  ],
  amb_autoritzacio: [
    { name: "Oficina d'Extranjeria", phone: "+34902028505", description: "Cita prèvia: 060" },
    { name: "CEAR", phone: "+34915980535", description: "Assessorament jurídic gratuït" },
  ],
};

export function resourcesForSituation(situation: SituacioLegal): Resource[] {
  if (!situation) return RESOURCES_BY_SITUATION.sense_autoritzacio;
  return (
    RESOURCES_BY_SITUATION[situation] ??
    RESOURCES_BY_SITUATION.sense_autoritzacio
  );
}

/** Infer situation from auth_slug (mirrors the b1/b2/b3/b4 split). */
export function situationFromAuthSlug(slug: string | null): SituacioLegal {
  if (!slug) return null;
  if (
    slug.startsWith("arraigo_") ||
    slug.startsWith("menor_") ||
    slug.startsWith("victima_") ||
    slug === "residencia_humanitaria"
  ) {
    return "sense_autoritzacio";
  }
  if (slug.startsWith("treball_") || slug.startsWith("renovacio_") || slug === "residencia_llarga_duracio_nacional") {
    return "amb_autoritzacio";
  }
  if (
    slug === "certificat_registre_ciutada_ue" ||
    slug === "targeta_familiar_ciutada_ue" ||
    slug === "residencia_familiar_espanyol"
  ) {
    return "ue";
  }
  if (slug.startsWith("asil")) return "asil";
  return null;
}
