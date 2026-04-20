"use client";

import { useState } from "react";
import type { Lang, I18nText } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import type { PersonalData, PersonalDataField } from "@/lib/types/personal-data";
import { EMPTY_PERSONAL_DATA, PROVINCIAS } from "@/lib/types/personal-data";
import { getFormsForAuth, getRequiredFields } from "@/lib/form-config";

// ── Field metadata ──────────────────────────────────────────────

interface FieldDef {
  key: PersonalDataField;
  label: keyof typeof labels;
  type: "text" | "date" | "select" | "email" | "tel";
  options?: { value: string; label: keyof typeof labels }[];
  section: "identity" | "documents" | "address" | "contact" | "representative";
}

const FIELDS: FieldDef[] = [
  // Identity
  { key: "nombre", label: "fieldNombre", type: "text", section: "identity" },
  { key: "primerApellido", label: "fieldPrimerApellido", type: "text", section: "identity" },
  { key: "segundoApellido", label: "fieldSegundoApellido", type: "text", section: "identity" },
  { key: "fechaNacimiento", label: "fieldFechaNacimiento", type: "date", section: "identity" },
  { key: "lugarNacimiento", label: "fieldLugarNacimiento", type: "text", section: "identity" },
  { key: "paisNacimiento", label: "fieldPaisNacimiento", type: "text", section: "identity" },
  { key: "nacionalidad", label: "fieldNacionalidad", type: "text", section: "identity" },
  {
    key: "sexo", label: "fieldSexo", type: "select", section: "identity",
    options: [
      { value: "H", label: "optionMale" },
      { value: "M", label: "optionFemale" },
    ],
  },
  { key: "nombrePadre", label: "fieldNombrePadre", type: "text", section: "identity" },
  { key: "nombreMadre", label: "fieldNombreMadre", type: "text", section: "identity" },
  {
    key: "estadoCivil", label: "fieldEstadoCivil", type: "select", section: "identity",
    options: [
      { value: "soltero", label: "optionSoltero" },
      { value: "casado", label: "optionCasado" },
      { value: "divorciado", label: "optionDivorciado" },
      { value: "viudo", label: "optionViudo" },
      { value: "pareja_hecho", label: "optionParejaHecho" },
    ],
  },
  // Documents
  {
    key: "tipoDocumento", label: "fieldTipoDocumento", type: "select", section: "documents",
    options: [
      { value: "pasaporte", label: "optionPasaporte" },
      { value: "nie", label: "optionNie" },
      { value: "otro", label: "optionOtro" },
    ],
  },
  { key: "numeroDocumento", label: "fieldNumeroDocumento", type: "text", section: "documents" },
  { key: "nie", label: "fieldNie", type: "text", section: "documents" },
  // Address
  { key: "domicilio", label: "fieldDomicilio", type: "text", section: "address" },
  { key: "localidad", label: "fieldLocalidad", type: "text", section: "address" },
  { key: "provincia", label: "fieldProvincia", type: "select", section: "address" },
  { key: "codigoPostal", label: "fieldCodigoPostal", type: "text", section: "address" },
  // Contact
  { key: "telefono", label: "fieldTelefono", type: "tel", section: "contact" },
  { key: "email", label: "fieldEmail", type: "email", section: "contact" },
  // Representative
  { key: "representanteLegal", label: "fieldRepresentante", type: "text", section: "representative" },
  { key: "representanteDniNiePas", label: "fieldRepresentanteNie", type: "text", section: "representative" },
];

const SECTIONS = [
  { id: "identity" as const, label: "sectionIdentity" as const },
  { id: "documents" as const, label: "sectionDocuments" as const },
  { id: "address" as const, label: "sectionAddress" as const },
  { id: "contact" as const, label: "sectionContact" as const },
  { id: "representative" as const, label: "sectionRepresentative" as const },
];

// ── Component ───────────────────────────────────────────────────

export default function FormPhase({
  lang,
  data,
  authSlugs,
  onDataChange,
  onGeneratePdf,
  onClear,
  onBack,
  pdfLoading,
}: {
  lang: Lang;
  data: PersonalData;
  authSlugs: string[];
  onDataChange: (field: PersonalDataField, value: string) => void;
  onGeneratePdf: () => void;
  onClear: () => void;
  onBack: () => void;
  pdfLoading: boolean;
}) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["identity", "documents"])
  );
  const requiredFields = getRequiredFields(authSlugs);
  const forms = authSlugs.flatMap(getFormsForAuth);
  const uniqueForms = [...new Map(forms.map((f) => [f.id, f])).values()];

  function toggleSection(id: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function renderField(field: FieldDef) {
    const isRequired = requiredFields.has(field.key);
    const raw = data[field.key];
    const value = typeof raw === "boolean" || raw === null ? String(raw ?? "") : raw;

    const fieldLabel = t(labels[field.label] as I18nText, lang);
    const badge = isRequired
      ? t(labels.required, lang)
      : t(labels.optional, lang);

    const inputClasses =
      "w-full px-3 py-2.5 text-base bg-white border border-border rounded-xl " +
      "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary " +
      "shadow-sm";

    // Provincia select with hardcoded options
    if (field.key === "provincia") {
      return (
        <div key={field.key} className="mb-3">
          <label className="block text-sm font-medium text-text mb-1">
            {fieldLabel}{" "}
            <span className={`text-xs ${isRequired ? "text-danger" : "text-text-muted"}`}>
              ({badge})
            </span>
          </label>
          <select
            value={value}
            onChange={(e) => onDataChange(field.key, e.target.value)}
            className={inputClasses}
          >
            <option value="">—</option>
            {PROVINCIAS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      );
    }

    if (field.type === "select" && field.options) {
      return (
        <div key={field.key} className="mb-3">
          <label className="block text-sm font-medium text-text mb-1">
            {fieldLabel}{" "}
            <span className={`text-xs ${isRequired ? "text-danger" : "text-text-muted"}`}>
              ({badge})
            </span>
          </label>
          <select
            value={value}
            onChange={(e) => onDataChange(field.key, e.target.value)}
            className={inputClasses}
          >
            <option value="">—</option>
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(labels[opt.label] as I18nText, lang)}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div key={field.key} className="mb-3">
        <label className="block text-sm font-medium text-text mb-1">
          {fieldLabel}{" "}
          <span className={`text-xs ${isRequired ? "text-danger" : "text-text-muted"}`}>
            ({badge})
          </span>
        </label>
        <input
          type={field.type}
          value={value}
          onChange={(e) => onDataChange(field.key, e.target.value)}
          className={inputClasses}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="text-sm text-primary hover:underline"
        >
          {t(labels.backToChat, lang)}
        </button>
        <button
          onClick={onClear}
          className="text-sm text-danger hover:underline"
        >
          {t(labels.clearAllData, lang)}
        </button>
      </div>

      {/* Forms needed */}
      {uniqueForms.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-xl text-sm">
          <span className="font-medium text-primary">
            {t(labels.formNeededFor, lang)}
          </span>{" "}
          {uniqueForms.map((f) => f.id).join(", ")}
        </div>
      )}

      {/* Sections */}
      {SECTIONS.map((section) => {
        const sectionFields = FIELDS.filter((f) => f.section === section.id);
        const isOpen = openSections.has(section.id);

        return (
          <div key={section.id} className="mb-3 border border-border-light rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-sm text-text">
                {t(labels[section.label] as I18nText, lang)}
              </span>
              <svg
                className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-4 py-3">
                {sectionFields.map(renderField)}
              </div>
            )}
          </div>
        );
      })}

      {/* Generate PDF */}
      <button
        onClick={onGeneratePdf}
        disabled={pdfLoading}
        className="w-full mt-4 px-5 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 shadow-sm text-base"
      >
        {pdfLoading
          ? t(labels.generating, lang)
          : t(labels.generateSummary, lang)}
      </button>

      {/* Disclaimer */}
      <p className="mt-3 text-xs text-text-muted text-center">
        {t(labels.pdfDisclaimer, lang)}
      </p>
    </div>
  );
}
