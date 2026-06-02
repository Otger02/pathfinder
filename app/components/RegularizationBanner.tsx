"use client";

import type { Lang } from "@/lib/i18n";

/**
 * Time-limited banner advertising the 2026 Spanish extraordinary
 * regularization (RD 316/2026 DA 20a / 21a). Window:
 *   2026-04-16 → 2026-06-30 (inclusive)
 *
 * After the deadline the banner returns null and stops rendering.
 * Server-rendered: each request computes "days remaining" at render time.
 *
 * Translations are inlined here to avoid bloating lib/i18n.ts with
 * single-use strings; the banner is a temporary measure and will be
 * removed once the window closes.
 */

const DEADLINE = new Date("2026-06-30T23:59:59+02:00");

const COPY: Record<
  Lang,
  { title: string; body: string; cta: string }
> = {
  ca: {
    title: "Regularització extraordinària 2026",
    body: "Termini fins el 30 de juny. Si vas arribar a Espanya abans de l'1 de gener de 2026 i portes 5 mesos seguits aquí, comprova si pots regularitzar la teva situació amb el formulari EX-31 o EX-32.",
    cta: "Comença ara →",
  },
  es: {
    title: "Regularización extraordinaria 2026",
    body: "Plazo hasta el 30 de junio. Si llegaste a España antes del 1 de enero de 2026 y llevas 5 meses seguidos aquí, comprueba si puedes regularizar tu situación con el formulario EX-31 o EX-32.",
    cta: "Empieza ahora →",
  },
  en: {
    title: "Spain — extraordinary regularization 2026",
    body: "Deadline June 30. If you arrived in Spain before January 1, 2026 and have lived here continuously for 5 months, check whether you can regularize your status with form EX-31 or EX-32.",
    cta: "Start now →",
  },
  fr: {
    title: "Régularisation extraordinaire 2026 (Espagne)",
    body: "Date limite : 30 juin. Si tu es arrivé en Espagne avant le 1er janvier 2026 et que tu y vis sans interruption depuis 5 mois, vérifie si tu peux régulariser ta situation avec le formulaire EX-31 ou EX-32.",
    cta: "Commencer maintenant →",
  },
  ar: {
    title: "التسوية الاستثنائية 2026 (إسبانيا)",
    body: "الموعد النهائي 30 يونيو. إذا وصلت إلى إسبانيا قبل 1 يناير 2026 وعشت هنا 5 أشهر متواصلة، تحقق مما إذا كان بإمكانك تسوية وضعك بنموذج EX-31 أو EX-32.",
    cta: "ابدأ الآن ←",
  },
};

export default function RegularizationBanner({
  lang,
  href = "/chat",
}: {
  lang: Lang;
  href?: string;
}) {
  const now = new Date();
  if (now > DEADLINE) return null;

  // Days remaining (rounded up). Negative-guard already above.
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.max(
    1,
    Math.ceil((DEADLINE.getTime() - now.getTime()) / msPerDay)
  );

  const copy = COPY[lang] ?? COPY.es;

  return (
    <a
      href={`${href}?lang=${lang}`}
      role="region"
      aria-label={copy.title}
      style={{
        display: "block",
        background: "linear-gradient(90deg, var(--gold, #d97706) 0%, var(--gold-2, #b45309) 100%)",
        color: "#fff",
        textDecoration: "none",
        padding: "12px 16px",
        borderRadius: 10,
        margin: "8px 0 16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.10)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          aria-hidden="true"
          style={{
            fontSize: 22,
            lineHeight: 1,
            background: "rgba(255,255,255,0.18)",
            borderRadius: 6,
            padding: "4px 8px",
            fontWeight: 700,
          }}
        >
          {daysLeft}d
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>
            {copy.title}
          </div>
          <div style={{ fontSize: 13, marginTop: 3, opacity: 0.95, lineHeight: 1.35 }}>
            {copy.body}
          </div>
        </div>
        <span
          aria-hidden="true"
          style={{
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: "nowrap" as const,
            background: "rgba(255,255,255,0.18)",
            padding: "6px 10px",
            borderRadius: 6,
          }}
        >
          {copy.cta}
        </span>
      </div>
    </a>
  );
}
