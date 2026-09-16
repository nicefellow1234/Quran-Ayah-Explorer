"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, X } from "lucide-react";

import type { ResourceOption } from "@/lib/quran/types";

import { TafsirResourcePicker } from "./tafsir-resource-picker";

type TafsirLanguage = {
  key: string;
  lang: string;
  direction: "ltr" | "rtl";
};

function getTafsirLanguage(languageName?: string): TafsirLanguage {
  const language = languageName?.trim().toLowerCase() ?? "";
  if (language === "arabic") return { key: "arabic", lang: "ar", direction: "rtl" };
  if (language === "urdu") return { key: "urdu", lang: "ur", direction: "rtl" };
  if (language === "bengali") return { key: "bengali", lang: "bn", direction: "ltr" };
  if (language === "russian") return { key: "russian", lang: "ru", direction: "ltr" };
  if (language === "swahili") return { key: "swahili", lang: "sw", direction: "ltr" };
  if (language === "kurdish") return { key: "kurdish", lang: "ku", direction: "rtl" };
  return { key: "english", lang: "en", direction: "ltr" };
}

export function TafsirPanel({
  verseKey,
  resources,
  defaultResourceId,
  onClose,
}: {
  verseKey: string;
  resources: ResourceOption[];
  defaultResourceId?: number;
  onClose: () => void;
}) {
  const [resourceId, setResourceId] = useState(defaultResourceId ?? resources[0]?.id);
  const [state, setState] = useState<{ status: "loading" | "ready" | "error"; text?: string; name?: string }>({ status: resourceId ? "loading" : "ready" });
  const selectedResource = resources.find((resource) => resource.id === resourceId);
  const selectedResourceName = selectedResource?.name;

  useEffect(() => {
    if (!resourceId) return;
    let cancelled = false;
    const loadingTimer = window.setTimeout(() => setState({ status: "loading" }), 0);
    fetch(`/api/tafsir?verseKey=${encodeURIComponent(verseKey)}&resourceId=${resourceId}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Tafsir request failed");
        return response.json() as Promise<{ text: string | null; resourceName: string }>;
      })
      .then((data) => { if (!cancelled) setState({ status: "ready", text: data.text ?? "", name: selectedResourceName ?? data.resourceName }); })
      .catch(() => { if (!cancelled) setState({ status: "error" }); });
    return () => { cancelled = true; window.clearTimeout(loadingTimer); };
  }, [resourceId, verseKey, resources, selectedResourceName]);

  const language = getTafsirLanguage(selectedResource?.languageName);

  return (
    <div className="dialog-backdrop tafsir-backdrop" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <section className="tafsir-panel" role="dialog" aria-modal="true" aria-labelledby="tafsir-title">
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">Reflection · {verseKey}</p>
            <h2 id="tafsir-title">Tafsir</h2>
            {state.name ? <p className="tafsir-resource-name">{state.name}</p> : null}
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close tafsir">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {resources.length > 1 ? (
          <div className="field-label"><span>Resource</span><TafsirResourcePicker idPrefix={`tafsir-${verseKey.replace(":", "-")}`} resources={resources} value={resourceId} onChange={setResourceId} /></div>
        ) : null}
        <div className={`tafsir-content tafsir-${language.key}`} lang={language.lang} dir={language.direction}>
          {state.status === "loading" ? <p className="loading-inline"><LoaderCircle className="spin" size={18} aria-hidden="true" /> Loading tafsir…</p> : null}
          {state.status === "error" ? <p className="error-copy">We couldn’t load this tafsir right now. Please try again.</p> : null}
          {state.status === "ready" && state.text ? <div className="tafsir-rich-text" dangerouslySetInnerHTML={{ __html: state.text }} /> : null}
          {state.status === "ready" && !state.text ? <p className="empty-copy">Tafsir is not available for this ayah with the selected resource.</p> : null}
        </div>
      </section>
    </div>
  );
}
