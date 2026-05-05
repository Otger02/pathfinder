import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import type { Resource } from "../lib/case-helpers";

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
  resources: Resource[];
  lang: Lang;
}) {
  return (
    <section>
      <div className="div-label mb-2">{t(labels.resourcesTitle, lang)}</div>
      <div className="card flat overflow-hidden" style={{ padding: 0 }}>
        {resources.map((r, i) => (
          <a
            key={i}
            href={`tel:${r.phone}`}
            className="row"
            aria-label={`${r.name}: ${formatPhone(r.phone)}`}
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
            </div>
            <span
              className="text-sm font-mono"
              style={{ color: "var(--primary-2)" }}
            >
              {formatPhone(r.phone)}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
