"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Lang } from "@/lib/i18n";

const LANGS: Lang[] = ["ca", "es", "en", "fr", "ar"];

export default function DashboardLangSelector({ lang }: { lang: Lang }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setLang(next: Lang) {
    const sp = new URLSearchParams(params.toString());
    sp.set("lang", next);
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="flex items-center gap-1">
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={l === lang}
          className={`btn btn-pill ${l === lang ? "" : "btn-ghost"}`}
          style={{
            padding: "6px 10px",
            fontSize: 12,
            minHeight: 32,
            textTransform: "uppercase",
          }}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
