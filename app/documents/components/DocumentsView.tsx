"use client";

import { useMemo, useState } from "react";
import type { Lang } from "@/lib/i18n";
import {
  applyFilters,
  type DocumentGroupData,
  type SituationFilter,
  type DateFilter,
} from "../lib/build-document-list";
import Filters from "./Filters";
import DocumentGroup from "./DocumentGroup";
import EmptyState from "./EmptyState";

export default function DocumentsView({
  groups,
  lang,
}: {
  groups: DocumentGroupData[];
  lang: Lang;
}) {
  const [situation, setSituation] = useState<SituationFilter>("all");
  const [date, setDate] = useState<DateFilter>("all");

  const filtered = useMemo(
    () => applyFilters(groups, situation, date),
    [groups, situation, date]
  );

  const hasGroups = groups.length > 0;
  const hasFiltered = filtered.length > 0;

  if (!hasGroups) {
    return <EmptyState lang={lang} />;
  }

  return (
    <div className="space-y-5">
      <Filters
        situation={situation}
        date={date}
        onSituationChange={setSituation}
        onDateChange={setDate}
        lang={lang}
      />

      {hasFiltered ? (
        filtered.map((g) => (
          <DocumentGroup key={g.conversationId} group={g} lang={lang} />
        ))
      ) : (
        <EmptyState lang={lang} />
      )}
    </div>
  );
}
