"use client";

import { useEffect, useState } from "react";
import { Settings2, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ResourceOption } from "@/lib/quran/types";

const TRANSLATION_STORAGE_KEY = "ayah-explorer.translation";

export function SettingsDialog({
  translations,
  selectedTranslationId,
}: {
  translations: ResourceOption[];
  selectedTranslationId?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [translationId, setTranslationId] = useState(selectedTranslationId ?? translations[0]?.id);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(TRANSLATION_STORAGE_KEY));
    if (stored && translations.some((translation) => translation.id === stored)) {
      const timer = window.setTimeout(() => {
        setTranslationId(stored);
        if (!searchParams.get("translation")) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("translation", String(stored));
          router.replace(`${pathname}?${params.toString()}`);
        }
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [pathname, router, searchParams, translations]);

  function changeTranslation(value: string) {
    const nextId = Number(value);
    setTranslationId(nextId);
    window.localStorage.setItem(TRANSLATION_STORAGE_KEY, String(nextId));
    const params = new URLSearchParams(searchParams.toString());
    params.set("translation", String(nextId));
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <>
      <button className="button button-quiet" type="button" onClick={() => setOpen(true)} aria-label="Open reading settings">
        <Settings2 size={17} aria-hidden="true" />
        <span className="hide-on-small">Settings</span>
      </button>
      {open ? (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && setOpen(false)}>
          <section className="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title">
            <div className="dialog-heading">
              <div>
                <p className="eyebrow">Personalize your reading</p>
                <h2 id="settings-title">Reading settings</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label="Close settings">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <label className="field-label" htmlFor="translation-select">Translation</label>
            <select id="translation-select" className="select-field" value={translationId} onChange={(event) => changeTranslation(event.target.value)}>
              {translations.map((translation) => (
                <option value={translation.id} key={translation.id}>
                  {translation.name}{translation.authorName ? ` · ${translation.authorName}` : ""}
                </option>
              ))}
            </select>
            <p className="field-help">Your choice is saved on this device and reflected in the URL for easy sharing.</p>
          </section>
        </div>
      ) : null}
    </>
  );
}
