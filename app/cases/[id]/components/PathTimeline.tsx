import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";

export default function PathTimeline({
  path,
  resultLabel,
  lang,
}: {
  path: string[];
  resultLabel: string;
  lang: Lang;
}) {
  if (path.length === 0) return null;

  return (
    <section>
      <div className="div-label mb-2">{t(labels.pathTitle, lang)}</div>
      <div className="card flat">
        <ol className="timeline" style={{ paddingInlineStart: 22, margin: 0 }}>
          {path.map((step, i) => (
            <li key={i} className="tl-item done">
              <span className="text-sm" style={{ color: "var(--ink)" }}>
                {step}
              </span>
            </li>
          ))}
          <li className="tl-item now">
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--primary-2)" }}
            >
              → {resultLabel}
            </span>
          </li>
        </ol>
      </div>
    </section>
  );
}
