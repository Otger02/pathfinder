/**
 * Loose-string → ISO code mappings.
 *
 * The slot-filling system stores `nacionalidad` and `provincia` as free
 * text in the user's language (often Spanish or Catalan). To filter
 * the resource layer tables (which use ISO codes) we need to normalize
 * those strings to ISO 3166-1 alpha-2 (countries) or 3166-2 (subdivisions).
 *
 * Coverage is pragmatic: the top ~40 nationalities of immigrants in Spain
 * (2025 INE statistics) and the 52 Spanish provinces + CCAAs. Anything
 * not in the map returns null and the caller skips the geo-filter.
 *
 * Matching is case-insensitive, accent-insensitive, and tolerant of
 * minor variants (singular/feminine endings — "marroquí" / "marroquina"
 * / "Marruecos" all map to MA).
 */

const stripAccents = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "");
const normalize = (s: string) =>
  stripAccents(s.trim().toLowerCase()).replace(/\s+/g, " ");

// ── Country aliases → ISO 3166-1 alpha-2 ────────────────────────────

const COUNTRY_ALIASES: Record<string, string> = {
  // Marroc
  marruecos: "MA", marroqui: "MA", marroquina: "MA", marroc: "MA",
  morocco: "MA", maroc: "MA",
  // Senegal
  senegal: "SN", senegales: "SN", senegalesa: "SN", senegalais: "SN",
  // Mali
  mali: "ML", malien: "ML", maliense: "ML",
  // Guinea (Conakry)
  guinea: "GN", "guinea conakry": "GN", guineano: "GN", guineana: "GN",
  // Nigèria
  nigeria: "NG", nigeriano: "NG", nigeriana: "NG",
  // Algèria
  argelia: "DZ", argelino: "DZ", argelina: "DZ",
  algeria: "DZ", algerien: "DZ",
  // Romania
  rumania: "RO", rumano: "RO", rumana: "RO",
  romania: "RO", roumanie: "RO",
  // Bulgaria
  bulgaria: "BG", bulgaro: "BG", bulgara: "BG",
  // Colombia
  colombia: "CO", colombiano: "CO", colombiana: "CO",
  // Veneçuela
  venezuela: "VE", venezolano: "VE", venezolana: "VE",
  // Equador
  ecuador: "EC", ecuatoriano: "EC", ecuatoriana: "EC",
  // Perú
  peru: "PE", peruano: "PE", peruana: "PE",
  // Bolívia
  bolivia: "BO", boliviano: "BO", boliviana: "BO",
  // Argentina
  argentina: "AR", argentino: "AR",
  // Brasil
  brasil: "BR", brasileno: "BR", brasilena: "BR", brazil: "BR",
  // Cuba
  cuba: "CU", cubano: "CU", cubana: "CU",
  // R. Dominicana
  "republica dominicana": "DO", dominicano: "DO", dominicana: "DO",
  "dominican republic": "DO",
  // Honduras
  honduras: "HN", hondureno: "HN", hondurena: "HN",
  // Nicaragua
  nicaragua: "NI", nicaraguense: "NI",
  // Paraguai
  paraguay: "PY", paraguayo: "PY", paraguaya: "PY",
  // Xina
  china: "CN", chino: "CN", china_country: "CN",
  // Pakistan
  pakistan: "PK", pakistani: "PK", paquistani: "PK",
  // Bangladesh
  bangladesh: "BD", bengali: "BD",
  // Índia
  india: "IN", indio: "IN", indu: "IN", hindu: "IN",
  // Filipines
  filipinas: "PH", filipino: "PH", filipina: "PH", philippines: "PH",
  // Ucraïna
  ucrania: "UA", ucraniano: "UA", ucraniana: "UA", ukraine: "UA",
  // Rússia
  rusia: "RU", ruso: "RU", rusa: "RU", russia: "RU",
  // Geòrgia
  georgia: "GE", georgiano: "GE", georgiana: "GE",
  // Sudan
  sudan: "SD", sudanes: "SD", sudanesa: "SD",
};

export function isoForNationality(input: string | undefined | null): string | null {
  if (!input || typeof input !== "string") return null;
  const key = normalize(input);
  if (key in COUNTRY_ALIASES) return COUNTRY_ALIASES[key];
  // Try last word — handles "República de Senegal" → senegal, etc.
  const last = key.split(" ").pop();
  if (last && last in COUNTRY_ALIASES) return COUNTRY_ALIASES[last];
  return null;
}

// ── Spanish provinces → ISO 3166-2:ES ───────────────────────────────

const PROVINCE_ALIASES: Record<string, string> = {
  "a coruna": "ES-C", "la coruna": "ES-C", coruna: "ES-C",
  alava: "ES-VI", araba: "ES-VI",
  albacete: "ES-AB",
  alicante: "ES-A", alacant: "ES-A",
  almeria: "ES-AL",
  asturias: "ES-O", oviedo: "ES-O",
  avila: "ES-AV",
  badajoz: "ES-BA",
  barcelona: "ES-B", bcn: "ES-B",
  bizkaia: "ES-BI", vizcaya: "ES-BI", bilbao: "ES-BI",
  burgos: "ES-BU",
  caceres: "ES-CC",
  cadiz: "ES-CA",
  cantabria: "ES-S", santander: "ES-S",
  castellon: "ES-CS", castello: "ES-CS",
  ceuta: "ES-CE",
  "ciudad real": "ES-CR",
  cordoba: "ES-CO",
  cuenca: "ES-CU",
  gipuzkoa: "ES-SS", guipuzcoa: "ES-SS", "san sebastian": "ES-SS",
  girona: "ES-GI", gerona: "ES-GI",
  granada: "ES-GR",
  guadalajara: "ES-GU",
  huelva: "ES-H",
  huesca: "ES-HU",
  "illes balears": "ES-PM", "islas baleares": "ES-PM", baleares: "ES-PM",
  mallorca: "ES-PM", palma: "ES-PM",
  jaen: "ES-J",
  "la rioja": "ES-LO", rioja: "ES-LO", logrono: "ES-LO",
  "las palmas": "ES-GC", palmas: "ES-GC",
  leon: "ES-LE",
  lleida: "ES-L", lerida: "ES-L",
  lugo: "ES-LU",
  madrid: "ES-M",
  malaga: "ES-MA",
  melilla: "ES-ML",
  murcia: "ES-MU",
  navarra: "ES-NA", nafarroa: "ES-NA", pamplona: "ES-NA",
  ourense: "ES-OR", orense: "ES-OR",
  palencia: "ES-P",
  pontevedra: "ES-PO",
  salamanca: "ES-SA",
  "santa cruz de tenerife": "ES-TF", tenerife: "ES-TF",
  segovia: "ES-SG",
  sevilla: "ES-SE",
  soria: "ES-SO",
  tarragona: "ES-T",
  teruel: "ES-TE",
  toledo: "ES-TO",
  valencia: "ES-V", valencia_es: "ES-V",
  valladolid: "ES-VA",
  zamora: "ES-ZA",
  zaragoza: "ES-Z",
};

export function isoForProvince(input: string | undefined | null): string | null {
  if (!input || typeof input !== "string") return null;
  const key = normalize(input);
  return PROVINCE_ALIASES[key] ?? null;
}
