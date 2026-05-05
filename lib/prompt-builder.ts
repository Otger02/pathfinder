/**
 * Modular system prompt builder for the chat API.
 *
 * Produces conditional prompt sections depending on:
 * - mode (info vs collection)
 * - sub-phase (conversa, resum, document, enviament)
 * - language
 * - collected / missing fields
 *
 * Inspired by Ventanilla Única's INSTRUCCION_* pattern.
 */

import type { PersonalDataField } from "./types/personal-data";
import type { ChatSubPhase } from "./types/chat-flow";
import { getDocsForAuth, getMissingDocs } from "./doc-config";

// ── Language map for prompt generation ──────────────────────────────

const LANG_NAMES: Record<string, string> = {
  es: "español",
  en: "English",
  ar: "العربية",
  fr: "français",
};

const FIELD_LABELS_ES: Partial<Record<PersonalDataField, string>> = {
  nombre: "nombre",
  primerApellido: "primer apellido",
  segundoApellido: "segundo apellido",
  fechaNacimiento: "fecha de nacimiento",
  lugarNacimiento: "lugar de nacimiento",
  paisNacimiento: "país de nacimiento",
  nacionalidad: "nacionalidad",
  sexo: "sexo",
  nombrePadre: "nombre del padre",
  nombreMadre: "nombre de la madre",
  estadoCivil: "estado civil",
  tipoDocumento: "tipo de documento de identidad",
  numeroDocumento: "número de documento",
  nie: "NIE",
  domicilio: "dirección en España",
  numeroDomicilio: "número domicilio",
  pisoDomicilio: "piso",
  localidad: "localidad / ciudad",
  provincia: "provincia",
  codigoPostal: "código postal",
  telefono: "teléfono",
  email: "email",
  hijosEscolarizacion: "hijos en edad de escolarización",
  representanteLegal: "nombre del representante legal",
  representanteDniNiePas: "DNI/NIE/pasaporte del representante legal",
  representanteTitulo: "título del representante legal",
  repPresentacionNombre: "nombre representante presentación",
  repPresentacionDniNiePas: "DNI/NIE/pasaporte representante presentación",
  repPresentacionDomicilio: "domicilio representante presentación",
  repPresentacionNumero: "número domicilio rep. presentación",
  repPresentacionPiso: "piso rep. presentación",
  repPresentacionLocalidad: "localidad rep. presentación",
  repPresentacionProvincia: "provincia rep. presentación",
  repPresentacionCodigoPostal: "código postal rep. presentación",
  repPresentacionTelefono: "teléfono rep. presentación",
  repPresentacionEmail: "email rep. presentación",
  repPresentacionRepLegal: "rep. legal del rep. presentación",
  repPresentacionRepDniNiePas: "DNI/NIE/pasaporte rep. legal del rep. presentación",
  repPresentacionRepTitulo: "título rep. legal del rep. presentación",
  notifNombre: "nombre a efectos de notificaciones",
  notifDniNiePas: "DNI/NIE/pasaporte notificaciones",
  notifDomicilio: "domicilio notificaciones",
  notifNumero: "número domicilio notificaciones",
  notifPiso: "piso notificaciones",
  notifLocalidad: "localidad notificaciones",
  notifProvincia: "provincia notificaciones",
  notifCodigoPostal: "código postal notificaciones",
  notifTelefono: "teléfono notificaciones",
  notifEmail: "email notificaciones",
  consentimientoDehu: "consentimiento DEHú",
};

// ── Base prompt ─────────────────────────────────────────────────────

const BASE_PROMPT = `Ets un assistent legal humanitari de Pathfinder (Fundació Tierra Digna).
Regles:
- Informes, no assessores. Mai donis consell legal vinculant.
- Sempre cita la font legal (llei, article, fitxer font) quan la tinguis.
- Al final de cada resposta afegeix: "⚠️ Aquesta informació és orientativa. Consulta amb un professional legal per al teu cas concret."
- Si no tens informació suficient, digues-ho clarament.`;

// ── PII protection ──────────────────────────────────────────────────

const INSTRUCCIO_NO_PII = `

INSTRUCCIÓ PROTECCIÓ DADES:
- Mai repeteixis números de passaport, NIE, o números de document complets al text de la resposta.
- Mai repeteixis dates de naixement completes.
- Pots confirmar que has rebut la informació sense repetir-la (ex: "Gràcies, he apuntat el teu nom").
- Usa l'eina collect_personal_data per extreure les dades, mai les escriguis al text.
- IMPORTANT: SEMPRE que l'usuari et doni qualsevol dada personal (nom, nacionalitat, document, adreça, etc.), HAS DE cridar l'eina collect_personal_data. Si no la crides, les dades es perdran. Crida-la a cada missatge on l'usuari doni informació nova.`;

// ── Tree-node context block (multilingual) ─────────────────────────

interface TreeContextStrings {
  title: string;
  intro: string;
  labelSituation: string;
  labelDetail: string;
  labelPath: string;
  labelAuth: string;
  instruction: string;
}

const TREE_CONTEXT_STRINGS: Record<string, TreeContextStrings> = {
  es: {
    title: "CONTEXTO DE LA CONSULTA",
    intro: "El usuario ha navegado el árbol de decisiones y ha llegado a:",
    labelSituation: "Situación identificada",
    labelDetail: "Detalle legal",
    labelPath: "Camino recorrido",
    labelAuth: "Autorizaciones aplicables",
    instruction:
      "Responde SIEMPRE basándote en este contexto específico. Si el usuario pregunta \"¿qué hago ahora?\" o similar, da una respuesta CONCRETA a su caso, no genérica. Si el usuario pregunta sobre tiempos, plazos, requisitos o pasos concretos, extráelos del Detalle legal de arriba antes que de los documentos de referencia.",
  },
  ca: {
    title: "CONTEXT DE LA CONSULTA",
    intro: "L'usuari ha navegat l'arbre de decisions i ha arribat a:",
    labelSituation: "Situació identificada",
    labelDetail: "Detall legal",
    labelPath: "Camí recorregut",
    labelAuth: "Autoritzacions aplicables",
    instruction:
      "Respon SEMPRE basant-te en aquest context específic. Si l'usuari pregunta \"què he de fer ara?\" o similar, dona una resposta CONCRETA al seu cas, no genèrica. Si l'usuari pregunta sobre temps, terminis, requisits o passos concrets, extreu-los del Detall legal de dalt abans que dels documents de referència.",
  },
  en: {
    title: "QUERY CONTEXT",
    intro: "The user has navigated the decision tree and reached:",
    labelSituation: "Identified situation",
    labelDetail: "Legal detail",
    labelPath: "Path taken",
    labelAuth: "Applicable authorizations",
    instruction:
      "ALWAYS respond based on this specific context. If the user asks \"what do I do now?\" or similar, give a CONCRETE answer for their case, not a generic one. If the user asks about times, deadlines, requirements, or concrete steps, extract them from the Legal detail above rather than from the reference documents.",
  },
  ar: {
    title: "سياق الاستفسار",
    intro: "تنقل المستخدم في شجرة القرارات ووصل إلى:",
    labelSituation: "الحالة المحددة",
    labelDetail: "التفصيل القانوني",
    labelPath: "المسار المتبع",
    labelAuth: "التصاريح المطبقة",
    instruction:
      "أجب دائماً بناءً على هذا السياق المحدد. إذا سأل المستخدم \"ماذا أفعل الآن؟\" أو ما شابه، أعطِ إجابة ملموسة لحالته، وليس إجابة عامة. إذا سأل المستخدم عن الأوقات أو المواعيد النهائية أو المتطلبات أو الخطوات المحددة، استخرجها من التفصيل القانوني أعلاه قبل الوثائق المرجعية.",
  },
  fr: {
    title: "CONTEXTE DE LA REQUÊTE",
    intro: "L'utilisateur a navigué dans l'arbre de décisions et est arrivé à :",
    labelSituation: "Situation identifiée",
    labelDetail: "Détail juridique",
    labelPath: "Chemin parcouru",
    labelAuth: "Autorisations applicables",
    instruction:
      "Réponds TOUJOURS en te basant sur ce contexte spécifique. Si l'utilisateur demande \"que dois-je faire maintenant ?\" ou similaire, donne une réponse CONCRÈTE à son cas, pas générique. Si l'utilisateur demande des délais, des exigences ou des étapes concrètes, extrais-les du Détail juridique ci-dessus plutôt que des documents de référence.",
  },
};

function buildTreeContextBlock(
  idioma: string,
  nodeText: string | undefined,
  nodeNote: string | undefined,
  path: string[] | undefined,
  authSlugs: string[]
): string | null {
  if (!nodeText && !nodeNote) return null;
  const s = TREE_CONTEXT_STRINGS[idioma] || TREE_CONTEXT_STRINGS.es;
  const lines: string[] = [`${s.title}:`, s.intro];
  if (nodeText) lines.push(`- ${s.labelSituation}: ${nodeText}`);
  if (nodeNote) lines.push(`- ${s.labelDetail}: ${nodeNote}`);
  if (path && path.length > 0) {
    lines.push(`- ${s.labelPath}: ${path.join(" → ")}`);
  }
  if (authSlugs.length > 0) {
    lines.push(`- ${s.labelAuth}: ${authSlugs.join(", ")}`);
  }
  lines.push("", s.instruction);
  return lines.join("\n");
}

// ── Builder ─────────────────────────────────────────────────────────

export interface PromptBuilderOptions {
  situacioLegal?: string;
  idioma?: string;
  mode?: "info" | "collection";
  subPhase?: ChatSubPhase;
  authSlugs?: string[];
  collectedFields?: PersonalDataField[];
  collectedData?: Partial<Record<string, unknown>>;
  missingFields?: PersonalDataField[];
  contextBlock: string;
  treeNodeId?: string;
  treeNodeText?: string;
  treeNodeNote?: string;
  treePath?: string[];
}

export function buildSystemPrompt(options: PromptBuilderOptions): string {
  const {
    situacioLegal,
    idioma = "es",
    mode = "info",
    subPhase = "conversa",
    authSlugs = [],
    collectedFields = [],
    collectedData = {},
    missingFields = [],
    contextBlock,
    treeNodeText,
    treeNodeNote,
    treePath,
  } = options;

  const parts: string[] = [BASE_PROMPT];

  // Language instruction
  const langName = LANG_NAMES[idioma] || idioma;
  parts.push(`\nRespon SEMPRE en ${langName}.`);

  // Situation context
  if (situacioLegal) {
    parts.push(
      `\nL'usuari es troba en situació: ${situacioLegal}. Prioritza informació rellevant per a aquesta situació.`
    );
  }

  // Tree-node context block (multilingual) — placed BEFORE RAG so the
  // model treats the user's specific path as primary truth.
  const treeContext = buildTreeContextBlock(
    idioma,
    treeNodeText,
    treeNodeNote,
    treePath,
    authSlugs
  );
  if (treeContext) {
    parts.push(`\n\n${treeContext}`);
  }

  // RAG context block (always present)
  parts.push(`\n\n${contextBlock}`);

  // ── Collection mode sections ──────────────────────────────────

  if (mode === "collection") {
    parts.push(INSTRUCCIO_NO_PII);

    if (subPhase === "conversa") {
      const authList =
        authSlugs.length > 0
          ? `Autoritzacions: ${authSlugs.join(", ")}`
          : "Cap autorització seleccionada encara.";

      const collectedList =
        collectedFields.length > 0
          ? collectedFields
              .map((f) => {
                const val = collectedData[f];
                const label = FIELD_LABELS_ES[f] ?? f;
                return val ? `  ✓ ${label}: ${val}` : `  ✓ ${label}`;
              })
              .join("\n")
          : "  (cap camp recollit encara)";

      const missingList =
        missingFields.length > 0
          ? missingFields
              .map((f) => `  • ${FIELD_LABELS_ES[f] ?? f}`)
              .join("\n")
          : "  (tots els camps completats!)";

      parts.push(`

INSTRUCCIÓ RECOLLIDA DE DADES:
${authList}

Camps ja recollits:
${collectedList}

Camps pendents:
${missingList}

Regles de recollida:
1. SIGUES PROACTIU. No esperis que l'usuari pregunti — GUIA la conversa tu.
2. Pregunta per UN o DOS camps a la vegada, de forma natural i conversacional.
3. Usa l'eina collect_personal_data per extreure cada dada que l'usuari proporcioni. OBLIGATORI: crida l'eina a CADA missatge on l'usuari doni informació personal. Si no la crides, les dades NO es guarden.
4. ⚠️ CRÍTIC TEXT+TOOL: SEMPRE que cridis collect_personal_data, genera SIMULTÀNIAMENT text en la teva resposta que: (a) confirmi breument les dades rebudes, (b) demani el PROPER CAMP PENDENT. Si ÚNICAMENT retornes la crida a la eina sense text, l'usuari veurà la pantalla buida i no sabrà que continuar.
5. Si l'usuari fa una pregunta d'immigració, respon-la i després repren la recollida.
6. ⚠️ CRÍTIC EXTRACCIÓ: Si l'usuari dona múltiples dades en un sol missatge, HAS D'EXTREURE TOTES EN UNA SOLA CRIDA. MAI facis múltiples crides. MAI ignoris dades que l'usuari ja ha donat.
   EXEMPLE: si l'usuari diu "em dic Mamadou Diallo, sóc senegalès, passaport A12345678, treballo a Restaurant El Sol SL amb NIF B98765432, visc a Barcelona 08001", la teva crida HA D'INCLOURE:
   { "nombre": "Mamadou", "primerApellido": "Diallo", "nacionalidad": "Senegalesa", "tipoDocumento": "pasaporte", "numeroDocumento": "A12345678", "empleador_nombre": "Restaurant El Sol SL", "empleador_nifNie": "B98765432", "localidad": "Barcelona", "codigoPostal": "08001" }
7. Mai inventis dades. Si no estàs segur d'un valor, demana confirmació.
8. Sigues empàtic i professional. Recorda que l'usuari pot estar en una situació vulnerable.
9. Si encara no tens cap camp recollit, comença presentant-te breument i preguntant el nom i la nacionalitat.
10. Després del nom/nacionalitat, pregunta pel document d'identitat (passaport o NIE).
11. Després pregunta l'adreça a Espanya (carrer, localitat, província, CP).
12. Intercala preguntes sobre la seva situació concreta per poder orientar-lo millor sobre quina autorització li convé.
13. Explica PER QUÈ necessites cada dada: "Necessito la teva adreça perquè el formulari EX-10 la demana."
14. Quan l'usuari et dona informació sobre la seva situació (treball, estudis, família), utilitza-la per orientar-lo sobre quina via li convé millor de les autoritzacions disponibles.

⚠️ IMPORTANT: Els camps que apareixen a "Camps ja recollits" estan confirmats. NO els tornis a demanar. Passa directament a preguntar els "Camps pendents".`);
    } else if (subPhase === "resum") {
      parts.push(`

INSTRUCCIÓ RESUM:
L'usuari ha completat totes les dades necessàries.
Presenta un resum clar i organitzat de les dades recollides.
Demana confirmació: "Són correctes aquestes dades? Si vols corregir alguna cosa, digues-m'ho."
NO repeteixis els números de document complets al resum — usa només els últims 4 dígits.`);
    } else if (subPhase === "document") {
      const obtained = (collectedData.documents_obtained as string[] | undefined) ?? [];
      const allDocs = getDocsForAuth(authSlugs);
      const missingDocs = getMissingDocs(authSlugs, obtained);

      const checklistLines = allDocs.map((doc) => {
        const have = obtained.includes(doc.slug);
        return have
          ? `  ✅ ${doc.nameCa}`
          : `  ⬜ ${doc.nameCa}`;
      });

      const checklistBlock =
        allDocs.length > 0
          ? checklistLines.join("\n")
          : "  (cap document requerit per aquesta autorització)";

      const missingBlock =
        missingDocs.length > 0
          ? missingDocs
              .map((d) => `  • ${d.nameCa}${d.validity ? ` — ${d.validity}` : ""}${d.whoObtains === "employer" ? " (l'ha d'aportar l'empresa)" : d.whoObtains === "authority" ? " (emès per l'administració)" : ""}`)
              .join("\n")
          : "  ✅ Tots els documents confirmats!";

      parts.push(`

INSTRUCCIÓ DOCUMENTS NECESSARIS:
L'usuari ha completat les dades personals. Ara cal recollir la documentació física.

Llista de documents per a ${authSlugs.join(", ")}:
${checklistBlock}

Documents pendents:
${missingBlock}

Regles:
1. Explica breument cada document pendent i on aconseguir-lo.
2. Quan l'usuari confirmi que té un document, crida collect_personal_data amb documents_obtained actualitzat.
   IMPORTANT: inclou SEMPRE els slugs ja obtinguts més el nou (no perdi els anteriors).
   Exemple: si tenia ["passaport_vigent"] i ara confirma empadronament, envia ["passaport_vigent","empadronament_2_anys"].
3. Quan TOTS els documents estiguin confirmats, passa a l'explicació de com presentar la sol·licitud.
4. Pots recomanar que comencin pels documents que tarden més (antecedents penals estrangers, informe d'arrelament).
5. Usa l'eina collect_personal_data per actualitzar documents_obtained — mai perdis els slugs ja confirmats.`);
    } else if (subPhase === "enviament") {
      parts.push(`

INSTRUCCIÓ ENVIAMENT:
L'usuari té els documents preparats.
Ajuda'l amb el correu electrònic a la Subdelegació del Govern.
Explica que pot obrir el correu directament al seu client de correu.
Recorda que el correu és un esborrany que cal revisar.`);
    }
  }

  return parts.join("");
}
