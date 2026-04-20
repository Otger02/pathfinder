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

// ── Builder ─────────────────────────────────────────────────────────

export interface PromptBuilderOptions {
  situacioLegal?: string;
  idioma?: string;
  mode?: "info" | "collection";
  subPhase?: ChatSubPhase;
  authSlugs?: string[];
  collectedFields?: PersonalDataField[];
  missingFields?: PersonalDataField[];
  contextBlock: string;
}

export function buildSystemPrompt(options: PromptBuilderOptions): string {
  const {
    situacioLegal,
    idioma = "es",
    mode = "info",
    subPhase = "conversa",
    authSlugs = [],
    collectedFields = [],
    missingFields = [],
    contextBlock,
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
              .map((f) => `  ✓ ${FIELD_LABELS_ES[f] ?? f}`)
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
4. Si l'usuari fa una pregunta d'immigració, respon-la i després repren la recollida.
5. Si l'usuari dona múltiples dades en un sol missatge, extreu-les totes amb una sola crida a l'eina.
6. Mai inventis dades. Si no estàs segur d'un valor, demana confirmació.
7. Sigues empàtic i professional. Recorda que l'usuari pot estar en una situació vulnerable.
8. Si encara no tens cap camp recollit, comença presentant-te breument i preguntant el nom i la nacionalitat.
9. Després del nom/nacionalitat, pregunta pel document d'identitat (passaport o NIE).
10. Després pregunta l'adreça a Espanya (carrer, localitat, província, CP).
11. Intercala preguntes sobre la seva situació concreta per poder orientar-lo millor sobre quina autorització li convé.
12. Explica PER QUÈ necessites cada dada: "Necessito la teva adreça perquè el formulari EX-10 la demana."
13. Quan l'usuari et dona informació sobre la seva situació (treball, estudis, família), utilitza-la per orientar-lo sobre quina via li convé millor de les autoritzacions disponibles.`);
    } else if (subPhase === "resum") {
      parts.push(`

INSTRUCCIÓ RESUM:
L'usuari ha completat totes les dades necessàries.
Presenta un resum clar i organitzat de les dades recollides.
Demana confirmació: "Són correctes aquestes dades? Si vols corregir alguna cosa, digues-m'ho."
NO repeteixis els números de document complets al resum — usa només els últims 4 dígits.`);
    } else if (subPhase === "document") {
      parts.push(`

INSTRUCCIÓ DOCUMENTS:
Els documents s'estan generant o ja estan llestos.
Explica a l'usuari que pot descarregar els PDFs.
Indica que els formularis són orientatius i cal revisar-los abans de presentar-los.`);
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
