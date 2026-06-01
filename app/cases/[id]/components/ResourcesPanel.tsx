import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";

interface ResourceItem {
  id?: string;
  name: string;
  phone: string;
  description: string;
  city?: string | null;
  address?: string | null;
  email?: string | null;
  website?: string | null;
  type?: string | null;
  freeOfCharge?: boolean | null;
  appointmentRequired?: boolean | null;
}

function formatPhone(phone: string): string {
  // +34 915 980 535 → groups of 3
  if (phone.startsWith("+34") && phone.length === 12) {
    return `+34 ${phone.slice(3, 6)} ${phone.slice(6, 9)} ${phone.slice(9, 12)}`;
  }
  return phone;
}

export default function ResourcesPanel({
  resources,
  lang,
}: {
  resources: ResourceItem[];
  lang: Lang;
}) {
  if (!resources || resources.length === 0) return null;

  return (
    <section>
      <div className="div-label mb-2">{t(labels.resourcesTitle, lang)}</div>
      <div className="card flat overflow-hidden" style={{ padding: 0 }}>
        {resources.map((r, i) => (
          <div
            key={r.id || i}
            className="row"
            style={{
              alignItems: "flex-start",
              cursor: "default",
              borderTop: i > 0 ? "1px solid var(--line)" : "none",
            }}
          >
            <span
              className="row-icon"
              aria-hidden="true"
              style={{ background: "var(--gold-soft)", color: "var(--gold)" }}
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
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                />
              </svg>
            </span>
            <div className="row-body">
              <div className="row-title">{r.name}</div>
              <div className="row-meta">{r.description}</div>
              {(r.city || r.address) && (
                <div className="text-xs mt-1" style={{ color: "var(--ink-3)" }}>
                  {[r.city, r.address].filter(Boolean).join(" · ")}
                </div>
              )}
              {(r.phone || r.email || r.website) && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                  {r.phone && (
                    <a
                      href={`tel:${r.phone.replace(/\s/g, "")}`}
                      className="text-xs underline"
                      style={{ color: "var(--primary-2)" }}
                    >
                      {formatPhone(r.phone)}
                    </a>
                  )}
                  {r.email && (
                    <a
                      href={`mailto:${r.email}`}
                      className="text-xs underline"
                      style={{ color: "var(--primary-2)" }}
                    >
                      {r.email}
                    </a>
                  )}
                  {r.website && (
                    <a
                      href={r.website}
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
            <div className="text-right text-xs" style={{ color: "var(--ink-3)" }}>
              {r.freeOfCharge === true ? <div>Gratis</div> : null}
              {r.appointmentRequired === true ? <div>Cita prèvia</div> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
