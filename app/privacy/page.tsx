import Link from "next/link";
import type { Lang } from "@/lib/i18n";

/**
 * Public privacy policy + legal notice. Static, no auth, no data access.
 *
 * Covers the minimum required by:
 *  - GDPR / LOPDGDD: controller, purpose, legal basis, retention, rights
 *  - EU AI Act art. 50: clear statement that this is an AI system
 *
 * Content is intentionally plain-language (the audience may have low
 * literacy / not be native speakers). Reviewed copy should be validated
 * by a lawyer before relying on it for compliance — see docs/dpia.md.
 */

interface Section {
  h: string;
  p: string[];
}

const CONTENT: Record<Lang, { title: string; updated: string; back: string; sections: Section[] }> = {
  ca: {
    title: "Privacitat i avís legal",
    updated: "Última actualització: juny 2026",
    back: "← Tornar",
    sections: [
      {
        h: "Qui som",
        p: [
          "Pathfinder és una eina d'orientació desenvolupada per la Fundació Tierra Digna, una organització sense ànim de lucre que acompanya persones migrants a Espanya.",
          "Responsable del tractament de dades: Fundació Tierra Digna. Pots contactar-nos per qualsevol qüestió de privacitat a través de la mateixa fundació.",
        ],
      },
      {
        h: "Això és un assistent d'intel·ligència artificial",
        p: [
          "Pathfinder funciona amb intel·ligència artificial. NO és un advocat ni un funcionari. T'orienta sobre tràmits d'estrangeria i t'ajuda a preparar documents, però no substitueix l'assessorament legal d'un professional col·legiat.",
          "Per a casos complexos o decisions importants, contacta amb una entitat especialitzada (CEAR, Càritas, el teu sindicat, o la Fundació Tierra Digna) o un advocat d'estrangeria.",
        ],
      },
      {
        h: "Quines dades recollim i per a què",
        p: [
          "Quan prepares documents, recollim les dades personals que tu ens dones (nom, document d'identitat, adreça, nacionalitat, etc.) amb l'única finalitat de generar els formularis oficials que necessites.",
          "Base legal: el teu consentiment, que demanem de manera explícita abans de recollir cap dada.",
          "No venem ni cedim les teves dades a tercers. No les utilitzem per a publicitat.",
        ],
      },
      {
        h: "Quant de temps guardem les dades",
        p: [
          "Les dades personals que recollim per generar documents s'eliminen automàticament al cap de 24 hores.",
          "Si tens un compte i guardes processos, les teves dades es mantenen mentre el compte estigui actiu. Pots demanar-ne l'eliminació en qualsevol moment.",
        ],
      },
      {
        h: "Els teus drets",
        p: [
          "Tens dret a accedir a les teves dades, rectificar-les, eliminar-les, i a retirar el consentiment en qualsevol moment.",
          "Per exercir aquests drets, contacta amb la Fundació Tierra Digna. També pots presentar una reclamació davant l'Agència Espanyola de Protecció de Dades (AEPD).",
        ],
      },
      {
        h: "Seguretat",
        p: [
          "Apliquem mesures tècniques per protegir les teves dades: xifratge en trànsit, control d'accés, i eliminació automàtica. Tot i així, cap sistema és 100% infal·lible.",
        ],
      },
    ],
  },
  es: {
    title: "Privacidad y aviso legal",
    updated: "Última actualización: junio 2026",
    back: "← Volver",
    sections: [
      {
        h: "Quiénes somos",
        p: [
          "Pathfinder es una herramienta de orientación desarrollada por la Fundació Tierra Digna, una organización sin ánimo de lucro que acompaña a personas migrantes en España.",
          "Responsable del tratamiento de datos: Fundació Tierra Digna. Puedes contactarnos para cualquier cuestión de privacidad a través de la propia fundación.",
        ],
      },
      {
        h: "Esto es un asistente de inteligencia artificial",
        p: [
          "Pathfinder funciona con inteligencia artificial. NO es un abogado ni un funcionario. Te orienta sobre trámites de extranjería y te ayuda a preparar documentos, pero no sustituye el asesoramiento legal de un profesional colegiado.",
          "Para casos complejos o decisiones importantes, contacta con una entidad especializada (CEAR, Cáritas, tu sindicato, o la Fundació Tierra Digna) o un abogado de extranjería.",
        ],
      },
      {
        h: "Qué datos recogemos y para qué",
        p: [
          "Cuando preparas documentos, recogemos los datos personales que tú nos das (nombre, documento de identidad, dirección, nacionalidad, etc.) con la única finalidad de generar los formularios oficiales que necesitas.",
          "Base legal: tu consentimiento, que pedimos de manera explícita antes de recoger ningún dato.",
          "No vendemos ni cedemos tus datos a terceros. No los usamos para publicidad.",
        ],
      },
      {
        h: "Cuánto tiempo guardamos los datos",
        p: [
          "Los datos personales que recogemos para generar documentos se eliminan automáticamente a las 24 horas.",
          "Si tienes una cuenta y guardas procesos, tus datos se mantienen mientras la cuenta esté activa. Puedes pedir su eliminación en cualquier momento.",
        ],
      },
      {
        h: "Tus derechos",
        p: [
          "Tienes derecho a acceder a tus datos, rectificarlos, eliminarlos, y a retirar el consentimiento en cualquier momento.",
          "Para ejercer estos derechos, contacta con la Fundació Tierra Digna. También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD).",
        ],
      },
      {
        h: "Seguridad",
        p: [
          "Aplicamos medidas técnicas para proteger tus datos: cifrado en tránsito, control de acceso, y eliminación automática. Aun así, ningún sistema es 100% infalible.",
        ],
      },
    ],
  },
  en: {
    title: "Privacy & legal notice",
    updated: "Last updated: June 2026",
    back: "← Back",
    sections: [
      {
        h: "Who we are",
        p: [
          "Pathfinder is a guidance tool built by Fundació Tierra Digna, a non-profit that supports migrants in Spain.",
          "Data controller: Fundació Tierra Digna. For any privacy matter, contact us through the foundation.",
        ],
      },
      {
        h: "This is an AI assistant",
        p: [
          "Pathfinder runs on artificial intelligence. It is NOT a lawyer or a government official. It guides you through immigration procedures and helps prepare documents, but it does not replace advice from a licensed professional.",
          "For complex cases or important decisions, contact a specialist organization (CEAR, Cáritas, your union, or Fundació Tierra Digna) or an immigration lawyer.",
        ],
      },
      {
        h: "What data we collect and why",
        p: [
          "When you prepare documents, we collect the personal data you give us (name, ID document, address, nationality, etc.) for the sole purpose of generating the official forms you need.",
          "Legal basis: your consent, which we ask for explicitly before collecting any data.",
          "We do not sell or share your data with third parties. We do not use it for advertising.",
        ],
      },
      {
        h: "How long we keep data",
        p: [
          "Personal data collected to generate documents is deleted automatically after 24 hours.",
          "If you have an account and save processes, your data is kept while the account is active. You can request deletion at any time.",
        ],
      },
      {
        h: "Your rights",
        p: [
          "You have the right to access, rectify, and delete your data, and to withdraw consent at any time.",
          "To exercise these rights, contact Fundació Tierra Digna. You may also file a complaint with the Spanish Data Protection Agency (AEPD).",
        ],
      },
      {
        h: "Security",
        p: [
          "We apply technical measures to protect your data: encryption in transit, access control, and automatic deletion. Even so, no system is 100% foolproof.",
        ],
      },
    ],
  },
  fr: {
    title: "Confidentialité et mentions légales",
    updated: "Dernière mise à jour : juin 2026",
    back: "← Retour",
    sections: [
      {
        h: "Qui sommes-nous",
        p: [
          "Pathfinder est un outil d'orientation développé par la Fundació Tierra Digna, une organisation à but non lucratif qui accompagne les personnes migrantes en Espagne.",
          "Responsable du traitement des données : Fundació Tierra Digna. Pour toute question de confidentialité, contacte-nous via la fondation.",
        ],
      },
      {
        h: "Ceci est un assistant d'intelligence artificielle",
        p: [
          "Pathfinder fonctionne avec l'intelligence artificielle. Ce n'est PAS un avocat ni un fonctionnaire. Il t'oriente sur les démarches d'immigration et t'aide à préparer des documents, mais ne remplace pas le conseil d'un professionnel agréé.",
          "Pour les cas complexes ou les décisions importantes, contacte une organisation spécialisée (CEAR, Cáritas, ton syndicat, ou la Fundació Tierra Digna) ou un avocat en droit des étrangers.",
        ],
      },
      {
        h: "Quelles données nous collectons et pourquoi",
        p: [
          "Quand tu prépares des documents, nous collectons les données personnelles que tu nous donnes (nom, pièce d'identité, adresse, nationalité, etc.) dans le seul but de générer les formulaires officiels dont tu as besoin.",
          "Base légale : ton consentement, que nous demandons explicitement avant toute collecte.",
          "Nous ne vendons ni ne partageons tes données avec des tiers. Nous ne les utilisons pas à des fins publicitaires.",
        ],
      },
      {
        h: "Combien de temps nous gardons les données",
        p: [
          "Les données personnelles collectées pour générer des documents sont supprimées automatiquement après 24 heures.",
          "Si tu as un compte et sauvegardes des dossiers, tes données sont conservées tant que le compte est actif. Tu peux demander leur suppression à tout moment.",
        ],
      },
      {
        h: "Tes droits",
        p: [
          "Tu as le droit d'accéder à tes données, de les rectifier, de les supprimer, et de retirer ton consentement à tout moment.",
          "Pour exercer ces droits, contacte la Fundació Tierra Digna. Tu peux aussi déposer une réclamation auprès de l'Agence espagnole de protection des données (AEPD).",
        ],
      },
      {
        h: "Sécurité",
        p: [
          "Nous appliquons des mesures techniques pour protéger tes données : chiffrement en transit, contrôle d'accès, et suppression automatique. Cependant, aucun système n'est infaillible à 100%.",
        ],
      },
    ],
  },
  ar: {
    title: "الخصوصية والإشعار القانوني",
    updated: "آخر تحديث: يونيو 2026",
    back: "→ رجوع",
    sections: [
      {
        h: "من نحن",
        p: [
          "Pathfinder أداة إرشادية طورتها مؤسسة Tierra Digna، وهي منظمة غير ربحية تساعد المهاجرين في إسبانيا.",
          "المسؤول عن معالجة البيانات: مؤسسة Tierra Digna. لأي مسألة تتعلق بالخصوصية، تواصل معنا عبر المؤسسة.",
        ],
      },
      {
        h: "هذا مساعد ذكاء اصطناعي",
        p: [
          "يعمل Pathfinder بالذكاء الاصطناعي. إنه ليس محامياً ولا موظفاً حكومياً. يرشدك في إجراءات الهجرة ويساعدك في تحضير المستندات، لكنه لا يحل محل استشارة محترف مرخص.",
          "للحالات المعقدة أو القرارات المهمة، تواصل مع منظمة متخصصة (CEAR، Cáritas، نقابتك، أو مؤسسة Tierra Digna) أو محامٍ متخصص في الهجرة.",
        ],
      },
      {
        h: "ما البيانات التي نجمعها ولماذا",
        p: [
          "عند تحضير المستندات، نجمع البيانات الشخصية التي تقدمها لنا (الاسم، وثيقة الهوية، العنوان، الجنسية، إلخ) لغرض وحيد هو إنشاء النماذج الرسمية التي تحتاجها.",
          "الأساس القانوني: موافقتك، التي نطلبها صراحةً قبل جمع أي بيانات.",
          "لا نبيع بياناتك أو نشاركها مع أطراف ثالثة. لا نستخدمها للإعلانات.",
        ],
      },
      {
        h: "كم من الوقت نحتفظ بالبيانات",
        p: [
          "تُحذف البيانات الشخصية المجمعة لإنشاء المستندات تلقائياً بعد 24 ساعة.",
          "إذا كان لديك حساب وتحفظ الإجراءات، تُحفظ بياناتك ما دام الحساب نشطاً. يمكنك طلب حذفها في أي وقت.",
        ],
      },
      {
        h: "حقوقك",
        p: [
          "لديك الحق في الوصول إلى بياناتك وتصحيحها وحذفها وسحب الموافقة في أي وقت.",
          "لممارسة هذه الحقوق، تواصل مع مؤسسة Tierra Digna. يمكنك أيضاً تقديم شكوى إلى الوكالة الإسبانية لحماية البيانات (AEPD).",
        ],
      },
      {
        h: "الأمان",
        p: [
          "نطبق تدابير تقنية لحماية بياناتك: التشفير أثناء النقل، والتحكم في الوصول، والحذف التلقائي. ومع ذلك، لا يوجد نظام آمن بنسبة 100%.",
        ],
      },
    ],
  },
};

export default async function PrivacyPage({
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
              href={`/terms?lang=${lang}`}
              className="underline"
              style={{ color: "var(--primary-2)" }}
            >
              {lang === "ca" ? "Termes i condicions d'ús" : lang === "es" ? "Términos y condiciones de uso" : lang === "fr" ? "Conditions d'utilisation" : lang === "ar" ? "شروط وأحكام الاستخدام" : "Terms and conditions"}
            </Link>
          </p>
          <p className="text-sm">
            <a
              href="/pathfinder-dossier.pdf"
              className="underline"
              style={{ color: "var(--primary-2)" }}
            >
              {lang === "ca" ? "Dossier institucional (PDF)" : lang === "es" ? "Dossier institucional (PDF)" : lang === "fr" ? "Dossier institutionnel (PDF)" : lang === "ar" ? "الملف التعريفي المؤسسي (PDF)" : "Institutional dossier (PDF)"}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
