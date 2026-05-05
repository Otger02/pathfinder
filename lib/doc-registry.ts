/**
 * doc-registry.ts
 *
 * Single source of truth for all document definitions.
 * Slugs are shared across all auth types and sessions — if a user has
 * `empadronament_2_anys` in one authorization process, it carries forward.
 */

export type DocWhoObtains = "applicant" | "employer" | "training_entity" | "authority";

export interface DocDefinition {
  slug: string;
  nameEs: string;
  nameCa: string;
  descriptionEs: string;
  descriptionCa: string;
  validity?: string;
  whoObtains: DocWhoObtains;
  note?: string;
}

export const DOC_REGISTRY: Record<string, DocDefinition> = {
  // ── Personal identity ────────────────────────────────────────────────────
  passaport_vigent: {
    slug: "passaport_vigent",
    nameEs: "Pasaporte en vigor",
    nameCa: "Passaport en vigor",
    descriptionEs: "Pasaporte completo con todas las páginas (incluyendo páginas en blanco). Debe estar vigente o haber expirado hace menos de un año.",
    descriptionCa: "Passaport complet amb totes les pàgines (incloses les pàgines en blanc). Ha d'estar vigent o haver expirat fa menys d'un any.",
    validity: "Vigente o caducado hace menos de 1 año",
    whoObtains: "applicant",
  },

  foto_carnet: {
    slug: "foto_carnet",
    nameEs: "Fotografía tamaño carné",
    nameCa: "Fotografia mida carnet",
    descriptionEs: "Una fotografía reciente tamaño carné (32×26mm), fondo blanco, en color.",
    descriptionCa: "Una fotografia recent mida carnet (32×26mm), fons blanc, en color.",
    validity: "Reciente",
    whoObtains: "applicant",
  },

  model_790: {
    slug: "model_790",
    nameEs: "Modelo 790, código 052 (tasa abonada)",
    nameCa: "Model 790, codi 052 (taxa abonada)",
    descriptionEs: "Resguardo de pago de la tasa de residencia (Modelo 790, código 052). Se abona antes de presentar la solicitud.",
    descriptionCa: "Resguard de pagament de la taxa de residència (Model 790, codi 052). S'abona abans de presentar la sol·licitud.",
    whoObtains: "applicant",
    note: "Importe variable según tipo de autorización. Consultar la web de la Agencia Tributaria.",
  },

  // ── Empadronamiento ──────────────────────────────────────────────────────
  empadronament_2_anys: {
    slug: "empadronament_2_anys",
    nameEs: "Certificado de empadronamiento (2 años continuados)",
    nameCa: "Certificat d'empadronament (2 anys continuats)",
    descriptionEs: "Certificado histórico del padrón municipal que acredita residencia continua en España durante al menos 2 años. Se obtiene en el ayuntamiento.",
    descriptionCa: "Certificat històric del padró municipal que acredita residència contínua a Espanya durant almenys 2 anys. S'obté a l'ajuntament.",
    validity: "Màxim 3 mesos d'antiguitat",
    whoObtains: "applicant",
  },

  empadronament_3_anys: {
    slug: "empadronament_3_anys",
    nameEs: "Certificado de empadronamiento (3 años continuados)",
    nameCa: "Certificat d'empadronament (3 anys continuats)",
    descriptionEs: "Certificado histórico del padrón municipal que acredita residencia continua en España durante al menos 3 años. Se obtiene en el ayuntamiento.",
    descriptionCa: "Certificat històric del padró municipal que acredita residència contínua a Espanya durant almenys 3 anys. S'obté a l'ajuntament.",
    validity: "Màxim 3 mesos d'antiguitat",
    whoObtains: "applicant",
  },

  // ── Antecedents penals ──────────────────────────────────────────────────
  antecedents_penals_espanya: {
    slug: "antecedents_penals_espanya",
    nameEs: "Certificado de antecedentes penales en España",
    nameCa: "Certificat d'antecedents penals a Espanya",
    descriptionEs: "Certificado de antecedentes penales expedido por el Registro Central de Penados (Ministerio de Justicia). Solicitable online en la sede del Ministerio.",
    descriptionCa: "Certificat d'antecedents penals expedit pel Registre Central de Penats (Ministeri de Justícia). Sol·licitable online a la seu del Ministeri.",
    validity: "Màxim 3 mesos d'antiguitat",
    whoObtains: "applicant",
  },

  antecedents_penals_origen: {
    slug: "antecedents_penals_origen",
    nameEs: "Certificado de antecedentes penales del país de origen",
    nameCa: "Certificat d'antecedents penals del país d'origen",
    descriptionEs: "Certificado de antecedentes penales del país o países donde el solicitante ha residido los últimos 5 años, expedido por las autoridades de ese país. Debe estar apostillado y traducido al español.",
    descriptionCa: "Certificat d'antecedents penals del país o països on el sol·licitant ha residit els últims 5 anys, expedit per les autoritats d'aquell país. Ha d'estar apostillat i traduït al castellà.",
    validity: "Màxim 3 mesos d'antiguitat",
    whoObtains: "applicant",
    note: "Debe apostillarse conforme al Convenio de La Haya y traducirse por traductor jurado al español.",
  },

  // ── Treball / Empleador ─────────────────────────────────────────────────
  contracte_treball: {
    slug: "contracte_treball",
    nameEs: "Contrato de trabajo",
    nameCa: "Contracte de treball",
    descriptionEs: "Contrato de trabajo firmado por el empleador y el trabajador. Debe indicar tipo de jornada, salario y duración.",
    descriptionCa: "Contracte de treball signat per l'empleador i el treballador. Ha d'indicar tipus de jornada, salari i durada.",
    whoObtains: "employer",
  },

  vida_laboral_empleador: {
    slug: "vida_laboral_empleador",
    nameEs: "Informe de vida laboral de la empresa (TC2 / certificado TGSS)",
    nameCa: "Informe de vida laboral de l'empresa (TC2 / certificat TGSS)",
    descriptionEs: "Certificado de la Tesorería General de la Seguridad Social que acredita que la empresa está al corriente de pago y tiene capacidad para contratar.",
    descriptionCa: "Certificat de la Tresoreria General de la Seguretat Social que acredita que l'empresa està al corrent de pagament i té capacitat per contractar.",
    validity: "Màxim 3 mesos d'antiguitat",
    whoObtains: "employer",
  },

  // ── Arraigo social ──────────────────────────────────────────────────────
  informe_arraigo_social: {
    slug: "informe_arraigo_social",
    nameEs: "Informe de arraigo social (emitido por CCAA o ayuntamiento)",
    nameCa: "Informe d'arrelament social (emès per la CCAA o l'ajuntament)",
    descriptionEs: "Informe de integración social elaborado por los servicios sociales de la Comunidad Autónoma o el ayuntamiento, que acredita la integración del solicitante.",
    descriptionCa: "Informe d'integració social elaborat pels serveis socials de la Comunitat Autònoma o l'ajuntament, que acredita la integració del sol·licitant.",
    validity: "Màxim 3 mesos d'antiguitat",
    whoObtains: "authority",
    note: "El plazo para obtenerlo puede ser de varias semanas. Solicitarlo con antelación.",
  },

  // ── Arraigo socioformatiu ───────────────────────────────────────────────
  matricula_curs: {
    slug: "matricula_curs",
    nameEs: "Matrícula o carta de admisión al curso de formación",
    nameCa: "Matrícula o carta d'admissió al curs de formació",
    descriptionEs: "Documento acreditativo de la matrícula o admisión en un curso de formación laboral, profesional o educativa reconocido.",
    descriptionCa: "Document acreditatiu de la matrícula o admissió en un curs de formació laboral, professional o educativa reconegut.",
    whoObtains: "training_entity",
  },

  // ── Arraigo familiar ────────────────────────────────────────────────────
  documentacio_vincle_familiar: {
    slug: "documentacio_vincle_familiar",
    nameEs: "Documentación acreditativa del vínculo familiar",
    nameCa: "Documentació acreditativa del vincle familiar",
    descriptionEs: "Documentos que acreditan el parentesco con el familiar residente en España (libro de familia, partida de nacimiento, sentencia de adopción, etc.). Deben estar apostillados y traducidos.",
    descriptionCa: "Documents que acrediten el parentiu amb el familiar resident a Espanya (llibre de família, partida de naixement, sentència d'adopció, etc.). Han d'estar apostillats i traduïts.",
    whoObtains: "applicant",
    note: "Apostillar conforme al Convenio de La Haya y traducir por traductor jurado si no están en español.",
  },

  // ── Arraigo segunda oportunidad ─────────────────────────────────────────
  resolucio_denegacio: {
    slug: "resolucio_denegacio",
    nameEs: "Resolución de denegación de la autorización anterior",
    nameCa: "Resolució de denegació de l'autorització anterior",
    descriptionEs: "Resolución administrativa que deniega la solicitud de autorización previa que motivó la segunda oportunidad. Incluir la resolución original y, si procede, la resolución de la vía de recurso.",
    descriptionCa: "Resolució administrativa que denega la sol·licitud d'autorització prèvia que va motivar la segona oportunitat. Incloure la resolució original i, si escau, la resolució de la via de recurs.",
    whoObtains: "applicant",
  },
};
