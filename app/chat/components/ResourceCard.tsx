import type { Lang } from "@/lib/i18n";
import type { EmergencyResource, I18nText } from "@/lib/sos";
import { t } from "@/lib/i18n";

export default function ResourceCard({
  resource,
  lang,
}: {
  resource: EmergencyResource;
  lang: Lang;
}) {
  return (
    <div className="mb-1">
      <a
        href={`tel:${resource.telefon}`}
        className="block w-full px-4 py-3.5 my-1.5 text-lg font-bold bg-success text-white rounded-lg text-center no-underline"
      >
        {"📞 "}
        {t(resource.nom as I18nText, lang)} — {resource.telefon}
      </a>
      <p className="mx-1 mb-2 text-sm text-text-muted">
        {t(resource.descripcio as I18nText, lang)} ({resource.disponibilitat})
      </p>
    </div>
  );
}
