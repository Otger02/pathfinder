// ── SOS Mode — Keywords, Detection, Emergency Resources, Rights, Police Screen ──
// Shared between API route (server) and chat page (client).
// No Node.js APIs — Edge Runtime compatible.

export type Lang = "es" | "en" | "ar" | "fr" | "ca";

export interface I18nText {
  es: string;
  en: string;
  ar: string;
  fr: string;
  ca?: string;
}

// ── 1. Keywords ─────────────────────────────────────────────────────

interface SosCategory {
  id: string;
  keywords: Record<Lang, string[]>;
}

const SOS_CATEGORIES: SosCategory[] = [
  {
    id: "detention",
    keywords: {
      es: [
        "detenido", "detenida", "me han detenido", "comisaría", "comisaria",
        "calabozo", "cie", "centro de internamiento", "deportar", "deportación",
        "deportacion", "retenido", "retenida", "me retienen", "orden de expulsión",
        "orden de expulsion", "redada", "me piden papeles", "me paró la policía",
        "me paro la policia", "me pararon",
        "vienen a buscarme", "me vienen a buscar", "me buscan",
        "viniendo a buscar", "me estan buscando", "me están buscando",
        "vienen a por mi", "vienen a por mí", "me van a llevar",
        "están en la puerta", "estan en la puerta", "tocan la puerta",
        "llaman a la puerta", "me van a detener", "me van a deportar",
        "me han pillado", "la policía viene", "la policia viene",
        "viene la policía", "viene la policia",
      ],
      en: [
        "detained", "arrested", "police station", "deportation", "deport",
        "detention center", "immigration raid", "police stopped me", "held by police",
        "coming for me", "they are coming", "at my door", "knocking on my door",
        "police coming", "going to arrest me", "going to deport me",
      ],
      ar: [
        "معتقل", "اعتقلوني", "مركز الشرطة", "ترحيل", "يرحلوني",
        "مركز احتجاز", "موقوف", "الشرطة أوقفتني", "مسجون",
        "يبحثون عني", "قادمون", "على الباب", "سيعتقلوني",
      ],
      fr: [
        "détenu", "detenu", "arrêté", "arrete", "commissariat",
        "garde à vue", "garde a vue", "expulsion", "déportation",
        "centre de rétention", "centre de retention", "contrôle police",
        "viennent me chercher", "à ma porte", "a ma porte",
        "police arrive", "vont m'arrêter", "vont m'arreter",
      ],
      ca: [
        "detingut", "detinguda", "m'han detingut", "comissaria",
        "calabós", "cie", "centre d'internament", "deportar", "deportació",
        "retingut", "retinguda", "ordre d'expulsió",
        "rua", "em demanen papers", "m'ha parat la policia",
        "venen a buscar-me", "em busquen",
        "venen a per mi", "em portaran",
        "són a la porta", "truquen a la porta",
        "em detindran", "em deportaran",
        "ve la policia", "la policia ve",
      ],
    },
  },
  {
    id: "violence",
    keywords: {
      es: [
        "me pegan", "me pega", "maltrato", "violencia", "abuso", "agresión",
        "agresion", "me amenaza", "amenaza", "me obligan", "me fuerzan",
        "tengo miedo", "violación", "violacion", "me viola", "me golpea",
        "violencia de género", "violencia de genero",
      ],
      en: [
        "beating me", "hitting me", "abuse", "assault", "threatening",
        "forced", "rape", "afraid", "scared", "hurting me",
      ],
      ar: [
        "يضربني", "ضرب", "عنف", "إساءة", "تهديد", "يهددني",
        "يجبرني", "خائف", "خائفة", "اغتصاب",
      ],
      fr: [
        "me frappe", "frappe", "maltraitance", "abus", "agression",
        "menace", "me menace", "viol", "j'ai peur", "me force",
      ],
      ca: [
        "em pega", "em peguen", "maltractament", "violència", "abús", "agressió",
        "m'amenaça", "amenaça", "m'obliguen", "em forcen",
        "tinc por", "violació", "em viola", "em colpeja",
        "violència de gènere",
      ],
    },
  },
  {
    id: "trafficking",
    keywords: {
      es: [
        "trata", "me explotan", "explotación", "explotacion", "trabajo forzado",
        "no me dejan salir", "me quitaron el pasaporte", "me retienen el pasaporte",
        "esclavitud", "prostitución", "prostitucion", "proxeneta",
        "me obligan a trabajar", "no me pagan",
      ],
      en: [
        "trafficking", "exploited", "exploitation", "forced labor",
        "took my passport", "won't let me leave", "slavery",
        "forced prostitution", "don't pay me", "forced to work",
      ],
      ar: [
        "اتجار", "يستغلوني", "استغلال", "عمل قسري",
        "أخذوا جوازي", "لا يسمحون لي بالخروج", "عبودية",
      ],
      fr: [
        "traite", "exploite", "exploitation", "travail forcé", "travail force",
        "passeport confisqué", "passeport confisque", "esclavage",
        "ne me laissent pas sortir", "proxénétisme",
      ],
      ca: [
        "tracta", "tràfic", "m'exploten", "explotació", "treball forçat",
        "no em deixen sortir", "em van prendre el passaport", "em retenen el passaport",
        "esclavitud", "prostitució", "proxeneta",
        "m'obliguen a treballar", "no em paguen",
      ],
    },
  },
  {
    id: "homelessness",
    keywords: {
      es: [
        "duermo en la calle", "sin techo", "no tengo donde dormir",
        "no tengo casa", "estoy en la calle", "sin hogar",
        "no tengo donde ir",
      ],
      en: [
        "homeless", "on the street", "nowhere to sleep",
        "sleeping outside", "no place to stay",
      ],
      ar: [
        "بلا مأوى", "في الشارع", "ليس لدي مكان",
        "أنام في الشارع", "بدون سكن",
      ],
      fr: [
        "sans abri", "dans la rue", "sans toit",
        "dors dehors", "pas de logement", "je dors dans la rue", "sdf",
      ],
      ca: [
        "dormo al carrer", "sense sostre", "no tinc on dormir",
        "no tinc casa", "estic al carrer", "sense llar",
        "no tinc on anar",
      ],
    },
  },
  {
    id: "distress",
    keywords: {
      es: [
        "socorro", "emergencia", "peligro", "me van a matar",
        "necesito ayuda urgente", "estoy desesperado", "estoy desesperada",
        "quiero morir", "suicidio",
        "me persiguen", "me siguen", "estoy escondido", "estoy escondida",
        "no se que hacer", "no sé qué hacer", "ayuda por favor",
        "me van a hacer daño", "estoy atrapado", "estoy atrapada",
      ],
      en: [
        "help me", "emergency", "danger", "going to kill me",
        "need urgent help", "desperate", "want to die", "suicide", "sos",
        "chasing me", "following me", "hiding", "trapped",
        "don't know what to do", "please help", "going to hurt me",
      ],
      ar: [
        "ساعدوني", "طوارئ", "خطر", "سيقتلوني", "يائس", "يائسة", "انتحار",
        "يلاحقوني", "يتبعوني", "مختبئ", "محاصر", "أرجوكم ساعدوني",
      ],
      fr: [
        "au secours", "urgence", "danger", "vont me tuer",
        "aide urgente", "désespéré", "desespere", "suicide", "sos",
        "me poursuivent", "me suivent", "caché", "piégé",
        "aidez-moi", "je ne sais pas quoi faire",
      ],
      ca: [
        "socors", "ajuda", "emergència", "perill", "em mataran",
        "necessito ajuda urgent", "estic desesperat", "estic desesperada",
        "vull morir", "suïcidi",
        "em persegueixen", "em segueixen", "estic amagat", "estic amagada",
        "no sé què fer", "ajuda si us plau",
        "em faran mal", "estic atrapat", "estic atrapada",
      ],
    },
  },
];

// ── 2. Detection ────────────────────────────────────────────────────

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip Latin diacritics
    .replace(/[\u064B-\u065F\u0670]/g, ""); // strip Arabic tashkeel
}

export interface SosResult {
  detected: boolean;
  categories: string[];
  matchedTerms: string[];
}

export function detectSos(text: string): SosResult {
  const normalized = normalize(text);
  const categories: string[] = [];
  const matchedTerms: string[] = [];

  for (const cat of SOS_CATEGORIES) {
    let found = false;
    // Check ALL languages, not just the active one
    for (const lang of ["es", "en", "ar", "fr"] as Lang[]) {
      for (const kw of cat.keywords[lang]) {
        if (normalized.includes(normalize(kw))) {
          if (!found) {
            categories.push(cat.id);
            found = true;
          }
          matchedTerms.push(kw);
          break; // one match per language per category is enough
        }
      }
    }
  }

  return { detected: categories.length > 0, categories, matchedTerms };
}

// ── 3. Emergency Resources ──────────────────────────────────────────

export interface EmergencyResource {
  nom: I18nText;
  telefon: string;
  descripcio: I18nText;
  disponibilitat: string;
  categories: string[];
}

export const EMERGENCY_RESOURCES: EmergencyResource[] = [
  {
    nom: {
      es: "Emergencias",
      en: "Emergencies",
      ar: "الطوارئ",
      fr: "Urgences",
    },
    telefon: "112",
    descripcio: {
      es: "Número de emergencias general — policía, ambulancia, bomberos",
      en: "General emergency number — police, ambulance, fire",
      ar: "رقم الطوارئ العام — شرطة، إسعاف، إطفاء",
      fr: "Numéro d'urgences général — police, ambulance, pompiers",
    },
    disponibilitat: "24h",
    categories: ["detention", "violence", "trafficking", "distress"],
  },
  {
    nom: {
      es: "Policía Nacional — Brigada contra la Trata",
      en: "National Police — Anti-Trafficking Unit",
      ar: "الشرطة الوطنية — وحدة مكافحة الاتجار",
      fr: "Police Nationale — Brigade contre la traite",
    },
    telefon: "900105090",
    descripcio: {
      es: "Línea gratuita y confidencial para víctimas de trata",
      en: "Free and confidential line for trafficking victims",
      ar: "خط مجاني وسري لضحايا الاتجار",
      fr: "Ligne gratuite et confidentielle pour victimes de traite",
    },
    disponibilitat: "24h",
    categories: ["trafficking"],
  },
  {
    nom: {
      es: "ACCEM — Atención a víctimas",
      en: "ACCEM — Victim support",
      ar: "ACCEM — دعم الضحايا",
      fr: "ACCEM — Aide aux victimes",
    },
    telefon: "900202010",
    descripcio: {
      es: "Atención especializada a víctimas de trata y refugiados",
      en: "Specialized support for trafficking victims and refugees",
      ar: "دعم متخصص لضحايا الاتجار واللاجئين",
      fr: "Aide spécialisée aux victimes de traite et réfugiés",
    },
    disponibilitat: "24h",
    categories: ["trafficking", "violence"],
  },
  {
    nom: {
      es: "016 — Violencia de género",
      en: "016 — Gender-based violence",
      ar: "016 — العنف القائم على النوع",
      fr: "016 — Violences de genre",
    },
    telefon: "016",
    descripcio: {
      es: "Atención a víctimas de violencia de género. No deja rastro en la factura.",
      en: "Helpline for gender violence victims. Leaves no trace on phone bill.",
      ar: "خط مساعدة ضحايا العنف. لا يترك أثراً في فاتورة الهاتف.",
      fr: "Aide aux victimes de violences de genre. Ne laisse pas de trace sur la facture.",
    },
    disponibilitat: "24h",
    categories: ["violence"],
  },
  {
    nom: {
      es: "Cruz Roja — Personas sin hogar",
      en: "Red Cross — Homeless support",
      ar: "الصليب الأحمر — دعم المشردين",
      fr: "Croix-Rouge — Sans-abri",
    },
    telefon: "900221122",
    descripcio: {
      es: "Acogida y orientación para personas sin hogar",
      en: "Shelter and guidance for homeless people",
      ar: "إيواء وتوجيه للأشخاص بلا مأوى",
      fr: "Accueil et orientation pour sans-abri",
    },
    disponibilitat: "L-V 9-21h",
    categories: ["homelessness"],
  },
  {
    nom: {
      es: "Teléfono de la Esperanza",
      en: "Hope Helpline",
      ar: "خط الأمل",
      fr: "Téléphone de l'Espoir",
    },
    telefon: "717003717",
    descripcio: {
      es: "Crisis emocional y prevención del suicidio",
      en: "Emotional crisis and suicide prevention",
      ar: "أزمات نفسية والوقاية من الانتحار",
      fr: "Crise émotionnelle et prévention du suicide",
    },
    disponibilitat: "24h",
    categories: ["distress"],
  },
];

// ── 4. Legal Rights ─────────────────────────────────────────────────

export interface LegalRight {
  title: I18nText;
  body: I18nText;
  law: string;
}

export const LEGAL_RIGHTS: LegalRight[] = [
  {
    title: {
      es: "Derecho a abogado",
      en: "Right to a lawyer",
      ar: "الحق في محامٍ",
      fr: "Droit à un avocat",
    },
    body: {
      es: "Tienes derecho a asistencia jurídica gratuita en cualquier procedimiento, incluyendo si estás detenido/a.",
      en: "You have the right to free legal aid in any procedure, including if you are detained.",
      ar: "لديك الحق في المساعدة القانونية المجانية في أي إجراء، بما في ذلك إذا كنت محتجزًا.",
      fr: "Tu as droit à l'assistance juridique gratuite dans toute procédure, y compris si tu es détenu(e).",
    },
    law: "Art. 22 LO 4/2000",
  },
  {
    title: {
      es: "Derecho a intérprete",
      en: "Right to an interpreter",
      ar: "الحق في مترجم",
      fr: "Droit à un interprète",
    },
    body: {
      es: "Tienes derecho a un intérprete gratuito si no entiendes el idioma.",
      en: "You have the right to a free interpreter if you don't understand the language.",
      ar: "لديك الحق في مترجم مجاني إذا لم تفهم اللغة.",
      fr: "Tu as droit à un interprète gratuit si tu ne comprends pas la langue.",
    },
    law: "Art. 22 LO 4/2000",
  },
  {
    title: {
      es: "Derecho a asistencia sanitaria",
      en: "Right to healthcare",
      ar: "الحق في الرعاية الصحية",
      fr: "Droit à l'assistance médicale",
    },
    body: {
      es: "Tienes derecho a asistencia sanitaria de urgencia siempre, y a la sanidad completa si estás empadronado/a.",
      en: "You always have the right to emergency healthcare, and full healthcare if registered (empadronado).",
      ar: "لديك دائمًا الحق في الرعاية الصحية الطارئة، والرعاية الكاملة إذا كنت مسجلاً.",
      fr: "Tu as toujours droit aux soins d'urgence, et à la santé complète si tu es inscrit(e).",
    },
    law: "Art. 12 LO 4/2000",
  },
  {
    title: {
      es: "No pueden entrar en tu casa sin orden judicial",
      en: "They cannot enter your home without a court order",
      ar: "لا يمكنهم دخول منزلك بدون أمر قضائي",
      fr: "Ils ne peuvent pas entrer chez toi sans ordre judiciaire",
    },
    body: {
      es: "La policía necesita una orden judicial para entrar en tu domicilio.",
      en: "Police need a court order to enter your home.",
      ar: "تحتاج الشرطة إلى أمر قضائي لدخول منزلك.",
      fr: "La police a besoin d'un ordre judiciaire pour entrer chez toi.",
    },
    law: "Art. 18.2 Constitución Española",
  },
  {
    title: {
      es: "Derecho a no declarar",
      en: "Right to remain silent",
      ar: "الحق في الصمت",
      fr: "Droit de garder le silence",
    },
    body: {
      es: "No estás obligado/a a contestar preguntas. Puedes guardar silencio hasta que llegue tu abogado.",
      en: "You are not obligated to answer questions. You may remain silent until your lawyer arrives.",
      ar: "لست ملزمًا بالإجابة على الأسئلة. لديك الحق في الصمت حتى وصول محاميك.",
      fr: "Tu n'es pas obligé(e) de répondre aux questions. Tu peux garder le silence jusqu'à l'arrivée de ton avocat.",
    },
    law: "Art. 17.3 Constitución Española",
  },
  {
    title: {
      es: "Detención máxima 72 horas",
      en: "Maximum detention 72 hours",
      ar: "الاحتجاز الأقصى 72 ساعة",
      fr: "Détention maximale 72 heures",
    },
    body: {
      es: "Si te detienen, no pueden tenerte más de 72 horas sin pasar ante un juez.",
      en: "If detained, they cannot hold you for more than 72 hours without bringing you before a judge.",
      ar: "إذا تم احتجازك، لا يمكنهم الاحتفاظ بك أكثر من 72 ساعة دون عرضك على قاضٍ.",
      fr: "Si tu es détenu(e), ils ne peuvent pas te garder plus de 72 heures sans te présenter à un juge.",
    },
    law: "Art. 17.2 Constitución Española",
  },
];

// ── 5. Police Screen ────────────────────────────────────────────────

export const POLICE_SCREEN = {
  title: {
    es: "AVISO LEGAL — POR FAVOR LEA",
    en: "LEGAL NOTICE — PLEASE READ",
    ar: "إشعار قانوني — يرجى القراءة",
    fr: "AVIS JURIDIQUE — VEUILLEZ LIRE",
  } as I18nText,
  body: {
    es: "Esta persona solicita:\n• Asistencia de abogado/a de oficio (Art. 22 LO 4/2000)\n• Intérprete si es necesario (Art. 22 LO 4/2000)\n• Ser informada de sus derechos en un idioma que comprenda\n• Contactar con su consulado si lo desea (Art. 36.1 Convenio de Viena)\n\nEsta persona puede ser víctima de trata o encontrarse en situación de vulnerabilidad. Según la normativa vigente, tiene derecho a un período de restablecimiento y reflexión (Art. 59 bis LO 4/2000).",
    en: "This person requests:\n• A court-appointed lawyer (Art. 22 LO 4/2000)\n• An interpreter if needed (Art. 22 LO 4/2000)\n• To be informed of their rights in a language they understand\n• To contact their consulate if desired (Art. 36.1 Vienna Convention)\n\nThis person may be a victim of trafficking or in a vulnerable situation. Under current regulations, they have the right to a recovery and reflection period (Art. 59 bis LO 4/2000).",
    ar: "هذا الشخص يطلب:\n• محامٍ معيّن من المحكمة (المادة 22 من القانون 4/2000)\n• مترجم إذا لزم الأمر (المادة 22 من القانون 4/2000)\n• إبلاغه بحقوقه بلغة يفهمها\n• الاتصال بقنصليته إذا رغب (المادة 36.1 اتفاقية فيينا)\n\nقد يكون هذا الشخص ضحية اتجار أو في وضع هش.",
    fr: "Cette personne demande :\n• Un avocat commis d'office (Art. 22 LO 4/2000)\n• Un interprète si nécessaire (Art. 22 LO 4/2000)\n• D'être informée de ses droits dans une langue qu'elle comprend\n• De contacter son consulat si souhaité (Art. 36.1 Convention de Vienne)\n\nCette personne peut être victime de traite ou en situation de vulnérabilité. Selon la réglementation, elle a droit à une période de rétablissement et réflexion (Art. 59 bis LO 4/2000).",
  } as I18nText,
};
