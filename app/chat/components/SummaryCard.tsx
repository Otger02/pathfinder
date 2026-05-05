import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import type { PersonalDataField } from "@/lib/types/personal-data";

const SECTIONS: Array<{
  key: string;
  labelKey: keyof typeof labels;
  fields: PersonalDataField[];
}> = [
  {
    key: "identity",
    labelKey: "sectionIdentity",
    fields: ["nombre", "primerApellido", "segundoApellido", "fechaNacimiento", "lugarNacimiento", "paisNacimiento", "nacionalidad", "sexo", "nombrePadre", "nombreMadre", "estadoCivil"],
  },
  {
    key: "documents",
    labelKey: "sectionDocuments",
    fields: ["tipoDocumento", "numeroDocumento", "nie"],
  },
  {
    key: "address",
    labelKey: "sectionAddress",
    fields: ["domicilio", "localidad", "provincia", "codigoPostal"],
  },
  {
    key: "contact",
    labelKey: "sectionContact",
    fields: ["telefono", "email"],
  },
  {
    key: "representative",
    labelKey: "sectionRepresentative",
    fields: ["representanteLegal", "representanteDniNiePas"],
  },
];

const FIELD_LABEL_MAP: Partial<Record<PersonalDataField, keyof typeof labels>> = {
  nombre: "fieldNombre",
  primerApellido: "fieldPrimerApellido",
  segundoApellido: "fieldSegundoApellido",
  fechaNacimiento: "fieldFechaNacimiento",
  lugarNacimiento: "fieldLugarNacimiento",
  paisNacimiento: "fieldPaisNacimiento",
  nacionalidad: "fieldNacionalidad",
  sexo: "fieldSexo",
  nombrePadre: "fieldNombrePadre",
  nombreMadre: "fieldNombreMadre",
  estadoCivil: "fieldEstadoCivil",
  tipoDocumento: "fieldTipoDocumento",
  numeroDocumento: "fieldNumeroDocumento",
  nie: "fieldNie",
  domicilio: "fieldDomicilio",
  localidad: "fieldLocalidad",
  provincia: "fieldProvincia",
  codigoPostal: "fieldCodigoPostal",
  telefono: "fieldTelefono",
  email: "fieldEmail",
  representanteLegal: "fieldRepresentante",
  representanteDniNiePas: "fieldRepresentanteNie",
};

const PII_FIELDS: PersonalDataField[] = ["numeroDocumento", "nie", "representanteDniNiePas"];

function maskValue(field: PersonalDataField, value: string): string {
  if (PII_FIELDS.includes(field) && value.length > 4) {
    return "****" + value.slice(-4);
  }
  return value;
}

export default function SummaryCard({
  data,
  lang,
  onConfirm,
  onCorrect,
  confirmed,
}: {
  data: Record<string, string>;
  authSlugs: string[];
  lang: Lang;
  onConfirm: () => void;
  onCorrect: () => void;
  confirmed?: boolean;
}) {
  return (
    <div className="flex justify-start mb-3">
      <div className="card accent bubble-card max-w-[85%]">
        <h3 className="text-lg font-bold text-text mb-3">
          {t(labels.summaryTitle, lang)}
        </h3>

        {SECTIONS.map((section) => {
          const filledFields = section.fields.filter(
            (f) => data[f] && data[f].trim() !== ""
          );
          if (filledFields.length === 0) return null;

          return (
            <div key={section.key} className="mb-3">
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
                {t(labels[section.labelKey], lang)}
              </h4>
              <div className="space-y-1">
                {filledFields.map((field) => (
                  <div key={field} className="flex justify-between text-sm">
                    <span className="text-text-muted">
                      {FIELD_LABEL_MAP[field]
                        ? t(labels[FIELD_LABEL_MAP[field]], lang)
                        : field}
                    </span>
                    <span className="font-medium text-text ltr:text-right rtl:text-left">
                      {maskValue(field, String(data[field] ?? ""))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {confirmed ? (
          <div className="flex items-center gap-2 text-sm text-primary font-medium mt-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t(labels.dataConfirmed, lang)}
          </div>
        ) : (
          <div className="flex gap-3 mt-3">
            <button onClick={onCorrect} className="btn btn-quiet btn-pill flex-1">
              {t(labels.correctData, lang)}
            </button>
            <button onClick={onConfirm} className="btn btn-pill flex-1">
              {t(labels.confirmData, lang)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
