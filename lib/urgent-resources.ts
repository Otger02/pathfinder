/**
 * Urgent resources surfaced from the decision tree's SOS results.
 *
 * The SOS levels map (loosely) to escalation:
 *   sos1 — urgent action needed soon (e.g. close-to-expiry, irregular <90d)
 *   sos2 — critical, days away from severe consequences
 *   sos3 — immediate risk (detention, deportation, asylum at border)
 *
 * Until per-result resource mappings exist in catalogs.json, we surface a
 * sensible default set per level. The phone numbers are public general-info
 * lines for nationwide reach; they intentionally avoid local-only services.
 */

export interface UrgentResource {
  name: string;
  phone?: string;
  url?: string;
  description: string;
}

const COMMON: UrgentResource[] = [
  { name: "CEAR", phone: "+34915980535", description: "Comisión Española de Ayuda al Refugiado — assessoria jurídica gratuïta" },
  { name: "SJM", phone: "+34914459085", description: "Servicio Jesuita a Migrantes" },
];

const IMMEDIATE_RISK: UrgentResource[] = [
  { name: "Torn d'ofici (advocat gratuït)", phone: "112", description: "Demana advocat d'ofici en cas d'arrest, detenció o frontera" },
  { name: "ACNUR Espanya", phone: "+34915563549", description: "Alt Comissariat de l'ONU per als Refugiats" },
  ...COMMON,
];

const CRITICAL: UrgentResource[] = [
  { name: "CEAR", phone: "+34915980535", description: "Assessoria jurídica gratuïta — prioritzen casos urgents" },
  { name: "SAIER (Barcelona)", phone: "+34932564000", description: "Servei d'Atenció a Immigrants, Emigrants i Refugiats" },
  { name: "SJM", phone: "+34914459085", description: "Servicio Jesuita a Migrantes" },
];

const URGENT: UrgentResource[] = [
  ...COMMON,
  { name: "Cruz Roja", phone: "+34915354545", description: "Acollida i orientació" },
];

export function urgentResourcesForSosLevel(
  type: "sos1" | "sos2" | "sos3"
): UrgentResource[] {
  if (type === "sos3") return IMMEDIATE_RISK;
  if (type === "sos2") return CRITICAL;
  return URGENT;
}
