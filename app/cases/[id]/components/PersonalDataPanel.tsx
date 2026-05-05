import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import {
  fieldLabel,
  formatValue,
  composeAddress,
} from "../lib/case-helpers";

const PRIORITY_KEYS = [
  "nombre",
  "primerApellido",
  "segundoApellido",
  "fechaNacimiento",
  "nacionalidad",
  "tipoDocumento",
  "numeroDocumento",
  "nie",
  "telefono",
  "email",
  "empleador_nombre",
  "empleador_nifNie",
];

const ADDRESS_KEYS = new Set([
  "domicilio",
  "numeroDomicilio",
  "pisoDomicilio",
  "localidad",
  "provincia",
  "codigoPostal",
]);

export default function PersonalDataPanel({
  conversationId,
  data,
  lang,
}: {
  conversationId: string;
  data: Record<string, unknown>;
  lang: Lang;
}) {
  // Pick non-empty fields in priority order
  const priorityRows = PRIORITY_KEYS
    .filter((k) => {
      const v = data[k];
      return v !== null && v !== undefined && String(v).trim() !== "";
    })
    .map((k) => ({
      key: k,
      label: fieldLabel(k, lang),
      value: formatValue(k, data[k]),
    }));

  const address = composeAddress(data);

  // Has anything to show?
  const empty = priorityRows.length === 0 && !address;

  return (
    <section>
      <div className="div-label mb-2">{t(labels.personalDataTitle, lang)}</div>
      <div className="card flat" style={{ padding: 0 }}>
        {empty ? (
          <div
            className="px-4 py-5 text-sm"
            style={{ color: "var(--ink-3)" }}
          >
            {t(labels.noDataYet, lang)}
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--line)" }}>
            {priorityRows.map((row) => (
              <div
                key={row.key}
                className="flex items-center gap-3 px-4 py-2.5"
                style={{ borderColor: "var(--line)" }}
              >
                <span
                  className="text-sm"
                  style={{ color: "var(--ink-3)", minWidth: 130 }}
                >
                  {row.label}
                </span>
                <span
                  className="text-sm flex-1"
                  style={{ color: "var(--ink)" }}
                >
                  {row.value}
                </span>
              </div>
            ))}
            {address && (
              <div
                className="flex items-start gap-3 px-4 py-2.5"
                style={{ borderColor: "var(--line)" }}
              >
                <span
                  className="text-sm"
                  style={{ color: "var(--ink-3)", minWidth: 130 }}
                >
                  {fieldLabel("domicilio", lang)}
                </span>
                <span
                  className="text-sm flex-1"
                  style={{ color: "var(--ink)" }}
                >
                  {address}
                </span>
              </div>
            )}
          </div>
        )}

        <div
          className="px-4 py-3 flex justify-end"
          style={{ borderTop: empty ? "none" : "1px solid var(--line)" }}
        >
          <Link
            href={`/chat?lang=${lang}&resume=${conversationId}`}
            className="btn btn-ghost btn-sm"
          >
            {t(labels.editData, lang)} →
          </Link>
        </div>
      </div>
    </section>
  );
}
