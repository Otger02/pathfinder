/**
 * Email draft generator for immigration applications.
 *
 * Generates a formal letter + mailto: URL for the user to send
 * to their province's Subdelegación del Gobierno / Oficina de Extranjería.
 */

import type { Lang } from "@/lib/sos";
import type { EmailDraftCardData } from "@/lib/types/chat-flow";
import { getSubdelegacion } from "./subdelegacion-map";

export interface DraftOptions {
  personalData: Record<string, string>;
  authSlug: string;
  authName: string;
  provincia: string;
  lang: Lang;
}

function maskDoc(value: string): string {
  if (!value || value.length <= 4) return value || "****";
  return "****" + value.slice(-4);
}

function buildFullName(data: Record<string, string>): string {
  return [data.nombre, data.primerApellido, data.segundoApellido]
    .filter(Boolean)
    .join(" ");
}

// ── Templates per language ──────────────────────────────────────────

const TEMPLATES: Record<Lang, (p: {
  fullName: string;
  docRef: string;
  authName: string;
  subdelegacionName: string;
  provincia: string;
  localidad: string;
}) => { subject: string; body: string }> = {
  es: ({ fullName, docRef, authName, subdelegacionName, provincia, localidad }) => ({
    subject: `Solicitud de ${authName}`,
    body: `Estimado/a señor/a,

Me dirijo a la ${subdelegacionName} para solicitar información y/o iniciar los trámites relativos a la siguiente autorización:

TIPO DE AUTORIZACIÓN: ${authName}

DATOS DEL SOLICITANTE:
- Nombre completo: ${fullName}
- Documento de referencia: ${docRef}
- Domicilio: ${localidad}, ${provincia}

Por medio de la presente, solicito que se me indique la documentación necesaria para la tramitación de dicha autorización, así como el procedimiento a seguir para la presentación de la solicitud.

Quedo a la espera de su respuesta y me pongo a su disposición para cualquier aclaración o documentación adicional que pudieran requerir.

Atentamente,
${fullName}

---
Documento generado con Pathfinder (Fundació Tierra Digna).
Este es un borrador orientativo. Revise el contenido antes de enviarlo.`,
  }),
  en: ({ fullName, docRef, authName, subdelegacionName, provincia, localidad }) => ({
    subject: `Application for ${authName}`,
    body: `Dear Sir/Madam,

I am writing to the ${subdelegacionName} to request information and/or initiate the procedures for the following authorization:

AUTHORIZATION TYPE: ${authName}

APPLICANT DETAILS:
- Full name: ${fullName}
- Reference document: ${docRef}
- Address: ${localidad}, ${provincia}

I hereby request that you inform me of the documentation required for processing this authorization, as well as the procedure for submitting the application.

I look forward to your response and remain at your disposal for any clarification or additional documentation you may require.

Sincerely,
${fullName}

---
Document generated with Pathfinder (Fundació Tierra Digna).
This is a draft for guidance purposes. Review the content before sending.`,
  }),
  ar: ({ fullName, docRef, authName, subdelegacionName, provincia, localidad }) => ({
    subject: `طلب ${authName}`,
    body: `السيد/السيدة المحترم/ة،

أتوجه إلى ${subdelegacionName} لطلب معلومات و/أو بدء إجراءات التصريح التالي:

نوع التصريح: ${authName}

بيانات مقدم الطلب:
- الاسم الكامل: ${fullName}
- وثيقة المرجع: ${docRef}
- العنوان: ${localidad}، ${provincia}

أطلب بموجب هذا إبلاغي بالوثائق المطلوبة لمعالجة هذا التصريح، وكذلك الإجراء المتبع لتقديم الطلب.

في انتظار ردكم، وأنا تحت تصرفكم لأي توضيح أو وثائق إضافية قد تحتاجونها.

مع خالص التحية،
${fullName}

---
وثيقة تم إنشاؤها بواسطة Pathfinder (مؤسسة تييرا ديغنا).
هذه مسودة إرشادية. راجع المحتوى قبل الإرسال.`,
  }),
  fr: ({ fullName, docRef, authName, subdelegacionName, provincia, localidad }) => ({
    subject: `Demande de ${authName}`,
    body: `Monsieur/Madame,

Je m'adresse à la ${subdelegacionName} afin de demander des informations et/ou d'entamer les démarches relatives à l'autorisation suivante :

TYPE D'AUTORISATION : ${authName}

COORDONNÉES DU DEMANDEUR :
- Nom complet : ${fullName}
- Document de référence : ${docRef}
- Adresse : ${localidad}, ${provincia}

Par la présente, je sollicite que vous m'indiquiez les documents nécessaires au traitement de ladite autorisation, ainsi que la procédure à suivre pour le dépôt de la demande.

Dans l'attente de votre réponse, je reste à votre disposition pour tout éclaircissement ou document complémentaire.

Cordialement,
${fullName}

---
Document généré avec Pathfinder (Fundació Tierra Digna).
Ceci est un brouillon indicatif. Vérifiez le contenu avant de l'envoyer.`,
  }),
  ca: ({ fullName, docRef, authName, subdelegacionName, provincia, localidad }) => ({
    subject: `Sol·licitud de ${authName}`,
    body: `Senyor/a,

Em dirigeixo a la ${subdelegacionName} per sol·licitar informació i/o iniciar els tràmits relatius a la següent autorització:

TIPUS D'AUTORITZACIÓ: ${authName}

DADES DEL SOL·LICITANT:
- Nom complet: ${fullName}
- Document de referència: ${docRef}
- Domicili: ${localidad}, ${provincia}

Per la present, sol·licito que se m'indiqui la documentació necessària per a la tramitació d'aquesta autorització, així com el procediment a seguir per a la presentació de la sol·licitud.

Resto a l'espera de la seva resposta i em poso a la seva disposició per a qualsevol aclariment o documentació addicional que puguin requerir.

Atentament,
${fullName}

---
Document generat amb Pathfinder (Fundació Tierra Digna).
Aquest és un esborrany orientatiu. Reviseu el contingut abans d'enviar-lo.`,
  }),
};

// ── Main generator ──────────────────────────────────────────────────

export function generateEmailDraft(options: DraftOptions): EmailDraftCardData {
  const { personalData, authName, provincia, lang } = options;

  const subdelegacion = getSubdelegacion(provincia);
  const fullName = buildFullName(personalData);
  const docRef = maskDoc(personalData.numeroDocumento || personalData.nie || "");
  const localidad = personalData.localidad || "";

  const template = TEMPLATES[lang] || TEMPLATES.es;
  const { subject, body } = template({
    fullName,
    docRef,
    authName,
    subdelegacionName: subdelegacion.name,
    provincia,
    localidad,
  });

  // Build mailto URL — limit total URL to 2000 chars for client compatibility.
  // Non-ASCII chars (Arabic, accented) expand heavily under encodeURIComponent,
  // so we shrink the body until the encoded URL fits.
  let truncatedBody = body;
  const buildUrl = (b: string) =>
    `mailto:${subdelegacion.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(b)}`;

  let mailtoUrl = buildUrl(truncatedBody);
  while (mailtoUrl.length > 2000 && truncatedBody.length > 100) {
    truncatedBody = truncatedBody.slice(0, Math.floor(truncatedBody.length * 0.8)) + "...";
    mailtoUrl = buildUrl(truncatedBody);
  }

  return {
    to: subdelegacion.email,
    toName: subdelegacion.name,
    subject,
    body,
    mailtoUrl,
  };
}
