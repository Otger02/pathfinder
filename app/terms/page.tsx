import Link from "next/link";
import type { Lang } from "@/lib/i18n";

/**
 * Public terms of use. Static, no auth, no data access.
 *
 * Plain-language by design — the audience may have low literacy or be
 * reading in a second language. Lawyer review pending (tracked alongside
 * docs/dpia.md); this copy is the operational baseline, not final legal
 * text.
 */

interface Section {
  h: string;
  p: string[];
}

const CONTENT: Record<Lang, { title: string; updated: string; back: string; dossier: string; sections: Section[] }> = {
  ca: {
    title: "Termes i condicions d'ús",
    updated: "Última actualització: juny 2026",
    back: "← Tornar",
    dossier: "Descarregar el dossier institucional (PDF)",
    sections: [
      {
        h: "1. Qui ofereix el servei",
        p: [
          "Pathfinder és un servei gratuït de la Fundació Tierra Digna, desenvolupat amb el suport de Vloggin SAS, adreçat a persones migrants a Espanya i a les entitats que les acompanyen.",
        ],
      },
      {
        h: "2. Què és (i què no és) Pathfinder",
        p: [
          "Pathfinder t'orienta sobre tràmits d'estrangeria i t'ajuda a preparar documents, amb l'assistència d'un sistema d'intel·ligència artificial.",
          "Pathfinder NO és un despatx d'advocats, NO ofereix assessorament jurídic i usar-lo NO crea cap relació advocat-client. Per a decisions importants o casos complexos, acudeix a un professional col·legiat o a una entitat especialitzada (CEAR, Càritas, el teu sindicat, la mateixa Fundació).",
        ],
      },
      {
        h: "3. Límits de la informació",
        p: [
          "Treballem perquè la informació sigui correcta i estigui al dia, però la normativa canvia i la IA pot equivocar-se. La informació pot contenir errors o quedar desactualitzada.",
          "Revisa SEMPRE els documents generats abans de presentar-los oficialment. Tu ets responsable de la informació que declares a l'administració.",
        ],
      },
      {
        h: "4. Responsabilitat",
        p: [
          "La Fundació no es fa responsable de les decisions administratives sobre els teus tràmits ni dels danys derivats d'informació incorrecta o desactualitzada, sense perjudici dels drets que la llei et reconeix com a usuari.",
        ],
      },
      {
        h: "5. Ús acceptable",
        p: [
          "No pots usar Pathfinder per a finalitats fraudulentes, per introduir dades d'altres persones sense el seu consentiment, per a usos comercials no autoritzats, ni per intentar danyar o sobrecarregar el servei.",
        ],
      },
      {
        h: "6. Dades personals",
        p: [
          "El tractament de les teves dades es regeix per la nostra política de privacitat, que pots consultar a la pàgina de privacitat. Resum: consentiment explícit, finalitat única (els teus documents), eliminació automàtica a les 24 h per a sessions anònimes, i cap cessió a tercers.",
        ],
      },
      {
        h: "7. Canvis i llei aplicable",
        p: [
          "Podem actualitzar aquests termes; la data de dalt indica la versió vigent. S'aplica la legislació espanyola i els conflictes se sotmetran als jutjats i tribunals competents segons la normativa de consumidors.",
        ],
      },
    ],
  },
  es: {
    title: "Términos y condiciones de uso",
    updated: "Última actualización: junio 2026",
    back: "← Volver",
    dossier: "Descargar el dossier institucional (PDF)",
    sections: [
      {
        h: "1. Quién ofrece el servicio",
        p: [
          "Pathfinder es un servicio gratuito de la Fundació Tierra Digna, desarrollado con el apoyo de Vloggin SAS, dirigido a personas migrantes en España y a las entidades que las acompañan.",
        ],
      },
      {
        h: "2. Qué es (y qué no es) Pathfinder",
        p: [
          "Pathfinder te orienta sobre trámites de extranjería y te ayuda a preparar documentos, con la asistencia de un sistema de inteligencia artificial.",
          "Pathfinder NO es un despacho de abogados, NO ofrece asesoramiento jurídico y usarlo NO crea ninguna relación abogado-cliente. Para decisiones importantes o casos complejos, acude a un profesional colegiado o a una entidad especializada (CEAR, Cáritas, tu sindicato, la propia Fundación).",
        ],
      },
      {
        h: "3. Límites de la información",
        p: [
          "Trabajamos para que la información sea correcta y esté al día, pero la normativa cambia y la IA puede equivocarse. La información puede contener errores o quedar desactualizada.",
          "Revisa SIEMPRE los documentos generados antes de presentarlos oficialmente. Tú eres responsable de la información que declaras ante la administración.",
        ],
      },
      {
        h: "4. Responsabilidad",
        p: [
          "La Fundación no se hace responsable de las decisiones administrativas sobre tus trámites ni de los daños derivados de información incorrecta o desactualizada, sin perjuicio de los derechos que la ley te reconoce como usuario.",
        ],
      },
      {
        h: "5. Uso aceptable",
        p: [
          "No puedes usar Pathfinder con fines fraudulentos, para introducir datos de otras personas sin su consentimiento, para usos comerciales no autorizados, ni para intentar dañar o sobrecargar el servicio.",
        ],
      },
      {
        h: "6. Datos personales",
        p: [
          "El tratamiento de tus datos se rige por nuestra política de privacidad, que puedes consultar en la página de privacidad. Resumen: consentimiento explícito, finalidad única (tus documentos), eliminación automática a las 24 h para sesiones anónimas, y ninguna cesión a terceros.",
        ],
      },
      {
        h: "7. Cambios y ley aplicable",
        p: [
          "Podemos actualizar estos términos; la fecha de arriba indica la versión vigente. Se aplica la legislación española y los conflictos se someterán a los juzgados y tribunales competentes según la normativa de consumidores.",
        ],
      },
    ],
  },
  en: {
    title: "Terms and conditions of use",
    updated: "Last updated: June 2026",
    back: "← Back",
    dossier: "Download the institutional dossier (PDF)",
    sections: [
      {
        h: "1. Who provides the service",
        p: [
          "Pathfinder is a free service by Fundació Tierra Digna, developed with the support of Vloggin SAS, for migrants in Spain and the organizations that support them.",
        ],
      },
      {
        h: "2. What Pathfinder is (and is not)",
        p: [
          "Pathfinder guides you through immigration procedures and helps you prepare documents, assisted by an artificial-intelligence system.",
          "Pathfinder is NOT a law firm, does NOT provide legal advice, and using it does NOT create a lawyer-client relationship. For important decisions or complex cases, contact a licensed professional or a specialist organization (CEAR, Cáritas, your union, the Foundation itself).",
        ],
      },
      {
        h: "3. Limits of the information",
        p: [
          "We work to keep information accurate and current, but regulations change and AI can make mistakes. Information may contain errors or become outdated.",
          "ALWAYS review generated documents before submitting them officially. You are responsible for the information you declare to the administration.",
        ],
      },
      {
        h: "4. Liability",
        p: [
          "The Foundation is not responsible for administrative decisions on your applications or for damages arising from incorrect or outdated information, without prejudice to your statutory rights as a user.",
        ],
      },
      {
        h: "5. Acceptable use",
        p: [
          "You may not use Pathfinder for fraudulent purposes, to enter other people's data without their consent, for unauthorized commercial uses, or to attempt to damage or overload the service.",
        ],
      },
      {
        h: "6. Personal data",
        p: [
          "Your data is processed under our privacy policy (see the privacy page). In short: explicit consent, single purpose (your documents), automatic deletion after 24h for anonymous sessions, and no sharing with third parties.",
        ],
      },
      {
        h: "7. Changes and applicable law",
        p: [
          "We may update these terms; the date above indicates the current version. Spanish law applies; disputes go to the competent courts under consumer regulations.",
        ],
      },
    ],
  },
  fr: {
    title: "Conditions d'utilisation",
    updated: "Dernière mise à jour : juin 2026",
    back: "← Retour",
    dossier: "Télécharger le dossier institutionnel (PDF)",
    sections: [
      {
        h: "1. Qui fournit le service",
        p: [
          "Pathfinder est un service gratuit de la Fundació Tierra Digna, développé avec le soutien de Vloggin SAS, destiné aux personnes migrantes en Espagne et aux organisations qui les accompagnent.",
        ],
      },
      {
        h: "2. Ce qu'est (et n'est pas) Pathfinder",
        p: [
          "Pathfinder t'oriente sur les démarches d'immigration et t'aide à préparer des documents, avec l'assistance d'un système d'intelligence artificielle.",
          "Pathfinder n'est PAS un cabinet d'avocats, n'offre PAS de conseil juridique et son utilisation ne crée AUCUNE relation avocat-client. Pour les décisions importantes ou les cas complexes, adresse-toi à un professionnel agréé ou à une organisation spécialisée.",
        ],
      },
      {
        h: "3. Limites de l'information",
        p: [
          "Nous travaillons pour que l'information soit correcte et à jour, mais la réglementation change et l'IA peut se tromper. L'information peut contenir des erreurs ou devenir obsolète.",
          "Vérifie TOUJOURS les documents générés avant de les présenter officiellement. Tu es responsable des informations que tu déclares à l'administration.",
        ],
      },
      {
        h: "4. Responsabilité",
        p: [
          "La Fondation n'est pas responsable des décisions administratives sur tes démarches ni des dommages dérivés d'informations incorrectes ou obsolètes, sans préjudice de tes droits légaux en tant qu'utilisateur.",
        ],
      },
      {
        h: "5. Usage acceptable",
        p: [
          "Tu ne peux pas utiliser Pathfinder à des fins frauduleuses, pour saisir les données d'autres personnes sans leur consentement, pour des usages commerciaux non autorisés, ni pour tenter d'endommager ou de surcharger le service.",
        ],
      },
      {
        h: "6. Données personnelles",
        p: [
          "Le traitement de tes données est régi par notre politique de confidentialité (voir la page dédiée). En résumé : consentement explicite, finalité unique (tes documents), suppression automatique après 24 h pour les sessions anonymes, aucune cession à des tiers.",
        ],
      },
      {
        h: "7. Modifications et loi applicable",
        p: [
          "Nous pouvons mettre à jour ces conditions ; la date ci-dessus indique la version en vigueur. La législation espagnole s'applique ; les litiges relèvent des tribunaux compétents selon la réglementation des consommateurs.",
        ],
      },
    ],
  },
  ar: {
    title: "شروط وأحكام الاستخدام",
    updated: "آخر تحديث: يونيو 2026",
    back: "→ رجوع",
    dossier: "تحميل الملف التعريفي المؤسسي (PDF)",
    sections: [
      {
        h: "1. من يقدم الخدمة",
        p: [
          "Pathfinder خدمة مجانية من مؤسسة Tierra Digna، طُوّرت بدعم من Vloggin SAS، موجهة للمهاجرين في إسبانيا والمنظمات التي ترافقهم.",
        ],
      },
      {
        h: "2. ما هو Pathfinder (وما ليس هو)",
        p: [
          "يرشدك Pathfinder في إجراءات الهجرة ويساعدك على تحضير المستندات، بمساعدة نظام ذكاء اصطناعي.",
          "Pathfinder ليس مكتب محاماة، ولا يقدم استشارة قانونية، واستخدامه لا ينشئ أي علاقة محامٍ-موكل. للقرارات المهمة أو الحالات المعقدة، تواصل مع محترف مرخص أو منظمة متخصصة.",
        ],
      },
      {
        h: "3. حدود المعلومات",
        p: [
          "نعمل على أن تكون المعلومات صحيحة ومحدّثة، لكن الأنظمة تتغير والذكاء الاصطناعي قد يخطئ. قد تحتوي المعلومات على أخطاء أو تصبح قديمة.",
          "راجع دائماً المستندات المُنشأة قبل تقديمها رسمياً. أنت مسؤول عن المعلومات التي تصرّح بها للإدارة.",
        ],
      },
      {
        h: "4. المسؤولية",
        p: [
          "المؤسسة غير مسؤولة عن القرارات الإدارية بشأن إجراءاتك ولا عن الأضرار الناتجة عن معلومات غير صحيحة أو قديمة، دون المساس بحقوقك القانونية كمستخدم.",
        ],
      },
      {
        h: "5. الاستخدام المقبول",
        p: [
          "لا يجوز استخدام Pathfinder لأغراض احتيالية، أو لإدخال بيانات أشخاص آخرين دون موافقتهم، أو لاستخدامات تجارية غير مصرح بها، أو لمحاولة إلحاق الضرر بالخدمة.",
        ],
      },
      {
        h: "6. البيانات الشخصية",
        p: [
          "تُعالج بياناتك وفق سياسة الخصوصية (انظر صفحة الخصوصية). باختصار: موافقة صريحة، غرض وحيد (مستنداتك)، حذف تلقائي بعد 24 ساعة للجلسات المجهولة، وعدم مشاركة البيانات مع أطراف ثالثة.",
        ],
      },
      {
        h: "7. التعديلات والقانون المطبق",
        p: [
          "قد نحدّث هذه الشروط؛ التاريخ أعلاه يشير إلى النسخة السارية. يُطبق القانون الإسباني، وتُحال النزاعات إلى المحاكم المختصة وفق أنظمة حماية المستهلك.",
        ],
      },
    ],
  },
};

export default async function TermsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const lang = ((sp.lang as Lang) ?? "ca") as Lang;
  const c = CONTENT[lang] ?? CONTENT.ca;
  const rtl = lang === "ar";

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg)" }}
      dir={rtl ? "rtl" : "ltr"}
    >
      <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-10">
        <Link
          href={`/?lang=${lang}`}
          className="text-sm underline"
          style={{ color: "var(--primary-2)" }}
        >
          {c.back}
        </Link>

        <h1 className="h-display mt-4 mb-1">{c.title}</h1>
        <p className="text-xs mb-8" style={{ color: "var(--ink-3)" }}>
          {c.updated}
        </p>

        <div className="space-y-6">
          {c.sections.map((s, i) => (
            <section key={i}>
              <h2
                className="text-base font-semibold mb-2"
                style={{ color: "var(--ink)" }}
              >
                {s.h}
              </h2>
              {s.p.map((para, j) => (
                <p
                  key={j}
                  className="text-sm mb-2 leading-relaxed"
                  style={{ color: "var(--ink-2)" }}
                >
                  {para}
                </p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-10 pt-6 space-y-2" style={{ borderTop: "1px solid var(--line)" }}>
          <p className="text-sm">
            <Link
              href={`/privacy?lang=${lang}`}
              className="underline"
              style={{ color: "var(--primary-2)" }}
            >
              {lang === "ca" ? "Política de privacitat" : lang === "es" ? "Política de privacidad" : lang === "fr" ? "Politique de confidentialité" : lang === "ar" ? "سياسة الخصوصية" : "Privacy policy"}
            </Link>
          </p>
          <p className="text-sm">
            <a
              href="/pathfinder-dossier.pdf"
              className="underline"
              style={{ color: "var(--primary-2)" }}
            >
              {c.dossier}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
