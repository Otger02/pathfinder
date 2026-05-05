"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import { createBrowserSupabase } from "@/lib/supabase-browser";

export default function UserMenu({
  email,
  lang,
}: {
  email: string;
  lang: Lang;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  async function handleLogout() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push(`/?lang=${lang}`);
    router.refresh();
  }

  // Pick first letter for avatar initial
  const initial = email.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="icon-btn outlined"
        style={{
          width: 38,
          height: 38,
          fontSize: 14,
          fontWeight: 600,
          color: "var(--primary-2)",
          background: "var(--primary-soft)",
          borderColor: "transparent",
        }}
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 mt-2 w-64 card"
          style={{
            zIndex: 20,
            padding: 8,
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div
            className="px-3 py-2 text-xs"
            style={{ color: "var(--ink-3)", borderBottom: "1px solid var(--line)" }}
          >
            {email}
          </div>

          <Link
            href={`/chat/history?lang=${lang}`}
            className="row"
            style={{ borderRadius: 12, padding: "10px 12px", margin: "4px 0" }}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <span className="row-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
            </span>
            <div className="row-body">
              <div className="row-title">{t(labels.savedProcesses, lang)}</div>
            </div>
          </Link>

          <Link
            href={`/documents?lang=${lang}`}
            className="row"
            style={{ borderRadius: 12, padding: "10px 12px", margin: "4px 0" }}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <span className="row-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5A3.375 3.375 0 0010.125 2.25H8.25m4.5 5.25h-9a.75.75 0 00-.75.75v12.75c0 .414.336.75.75.75h12.75a.75.75 0 00.75-.75V11.25z" />
              </svg>
            </span>
            <div className="row-body">
              <div className="row-title">{t(labels.myDocuments, lang)}</div>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            role="menuitem"
            className="row btn-ghost"
            style={{
              borderRadius: 12,
              padding: "10px 12px",
              margin: "4px 0",
              width: "100%",
              cursor: "pointer",
            }}
          >
            <span className="row-icon" aria-hidden="true" style={{ background: "var(--danger-soft)", color: "var(--danger)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </span>
            <div className="row-body" style={{ textAlign: "start" }}>
              <div className="row-title">{t(labels.logout, lang)}</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
