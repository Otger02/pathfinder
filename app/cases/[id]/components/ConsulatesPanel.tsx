import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";

interface Mission {
  id: string;
  type: "embassy" | "consulate_general" | "honorary_consulate";
  city: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  appointment_url: string | null;
  appointment_required: boolean | null;
  services: string[] | null;
  description: Record<string, string> | null;
}

interface Props {
  missions: Mission[];
  lang: Lang;
}

function pickDescription(
  desc: Record<string, string> | null | undefined,
  lang: Lang
): string {
  if (!desc) return "";
  return desc[lang] || desc.es || desc.en || "";
}

function typeLabel(type: Mission["type"], lang: Lang): string {
  const map: Record<Mission["type"], Record<Lang, string>> = {
    embassy: {
      ca: "Ambaixada",
      es: "Embajada",
      en: "Embassy",
      fr: "Ambassade",
      ar: "سفارة",
    },
    consulate_general: {
      ca: "Consolat general",
      es: "Consulado general",
      en: "Consulate General",
      fr: "Consulat général",
      ar: "قنصلية عامة",
    },
    honorary_consulate: {
      ca: "Consolat honorari",
      es: "Consulado honorario",
      en: "Honorary Consulate",
      fr: "Consulat honoraire",
      ar: "قنصلية فخرية",
    },
  };
  return map[type][lang] ?? map[type].es;
}

/**
 * Lists embassies and consulates of the user's nationality in Spain.
 *
 * Returns `null` (renders nothing) when no missions are found — by
 * design. We never want to show "no data" UI noise; the panel is only
 * useful when it has real data. If the diplomatic_missions table is
 * empty for this country, the case detail page simply doesn't surface
 * the section.
 */
export default function ConsulatesPanel({ missions, lang }: Props) {
  if (!missions || missions.length === 0) return null;

  return (
    <section aria-labelledby="consulates-title">
      <h2
        id="consulates-title"
        className="div-label mb-2"
      >
        {t(labels.consulatesTitle, lang)}
      </h2>

      <div className="card flat overflow-hidden" style={{ padding: 0 }}>
        {missions.map((m, i) => {
          const desc = pickDescription(m.description, lang);
          return (
            <div
              key={m.id}
              className="row"
              style={{
                borderTop: i > 0 ? "1px solid var(--line)" : "none",
                alignItems: "flex-start",
                cursor: "default",
              }}
            >
              <span
                className="row-icon"
                aria-hidden="true"
                style={{
                  background: "var(--primary-soft)",
                  color: "var(--primary)",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"
                  />
                </svg>
              </span>

              <div className="row-body" style={{ minWidth: 0 }}>
                <div className="row-title">
                  {typeLabel(m.type, lang)} — {m.city}
                </div>
                {m.address && (
                  <div
                    className="row-meta"
                    style={{ wordBreak: "break-word" }}
                  >
                    {m.address}
                  </div>
                )}
                {desc && (
                  <div
                    className="text-xs mt-1"
                    style={{ color: "var(--ink-3)" }}
                  >
                    {desc}
                  </div>
                )}
                {(m.phone || m.email || m.website || m.appointment_url) && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                    {m.phone && (
                      <a
                        href={`tel:${m.phone.replace(/\s/g, "")}`}
                        className="text-xs underline"
                        style={{ color: "var(--primary-2)" }}
                      >
                        {m.phone}
                      </a>
                    )}
                    {m.email && (
                      <a
                        href={`mailto:${m.email}`}
                        className="text-xs underline"
                        style={{ color: "var(--primary-2)" }}
                      >
                        {m.email}
                      </a>
                    )}
                    {m.appointment_url && (
                      <a
                        href={m.appointment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs underline"
                        style={{ color: "var(--primary-2)" }}
                      >
                        {t(labels.consulatesAppointment, lang)}
                      </a>
                    )}
                    {m.website && (
                      <a
                        href={m.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs underline"
                        style={{ color: "var(--primary-2)" }}
                      >
                        Web
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
