"use client";

import { useEffect, useMemo, useState, type DragEvent } from "react";
import { ArrowDown, ArrowUp, GripVertical, Settings2, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ResourceOption } from "@/lib/quran/types";

import { TranslationPicker } from "./translation-picker";

const TRANSLATION_STORAGE_KEY = "ayah-explorer.translations";
const LEGACY_TRANSLATION_STORAGE_KEY = "ayah-explorer.translation";

function normalizeTranslationIds(ids: number[], translations: ResourceOption[]) {
  const availableIds = new Set(translations.map((translation) => translation.id));
  return ids.filter((id, index) => id > 0 && availableIds.has(id) && ids.indexOf(id) === index);
}

function replaceTranslationParams(pathname: string, searchParams: URLSearchParams, ids: number[]) {
  const params = new URLSearchParams(searchParams.toString());
  params.delete("translation");
  ids.forEach((id) => params.append("translation", String(id)));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function SettingsDialog({
  translations,
  selectedTranslationIds,
}: {
  translations: ResourceOption[];
  selectedTranslationIds?: number[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [translationIds, setTranslationIds] = useState(() => normalizeTranslationIds(selectedTranslationIds ?? [], translations));
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const selectedTranslations = useMemo(() => translationIds
    .map((id) => translations.find((translation) => translation.id === id))
    .filter((translation): translation is ResourceOption => Boolean(translation)), [translationIds, translations]);

  useEffect(() => {
    const requestedIds = normalizeTranslationIds(searchParams.getAll("translation").map(Number), translations);
    if (requestedIds.length > 0) {
      const timer = window.setTimeout(() => setTranslationIds(requestedIds), 0);
      return () => window.clearTimeout(timer);
    }

    let storedIds: number[] = [];
    try {
      const stored = window.localStorage.getItem(TRANSLATION_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : null;
      if (Array.isArray(parsed)) storedIds = parsed.map(Number).filter(Number.isInteger);
      if (!storedIds.length) {
        const legacyId = Number(window.localStorage.getItem(LEGACY_TRANSLATION_STORAGE_KEY));
        if (Number.isInteger(legacyId) && legacyId > 0) storedIds = [legacyId];
      }
    } catch {
      storedIds = [];
    }

    const nextIds = normalizeTranslationIds(storedIds, translations);
    if (!nextIds.length) return;
    const timer = window.setTimeout(() => {
      setTranslationIds(nextIds);
      window.localStorage.setItem(TRANSLATION_STORAGE_KEY, JSON.stringify(nextIds));
      router.replace(replaceTranslationParams(pathname, new URLSearchParams(searchParams.toString()), nextIds));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname, router, searchParams, translations]);

  function commit(nextIds: number[]) {
    const normalized = normalizeTranslationIds(nextIds, translations);
    if (!normalized.length) {
      setNotice("Keep at least one translation selected.");
      return;
    }
    setTranslationIds(normalized);
    setNotice("");
    window.localStorage.setItem(TRANSLATION_STORAGE_KEY, JSON.stringify(normalized));
    window.localStorage.removeItem(LEGACY_TRANSLATION_STORAGE_KEY);
    router.replace(replaceTranslationParams(pathname, new URLSearchParams(searchParams.toString()), normalized));
  }

  function addTranslation(resourceId: number) {
    commit([...translationIds, resourceId]);
  }

  function removeTranslation(resourceId: number) {
    commit(translationIds.filter((id) => id !== resourceId));
  }

  function moveTranslation(resourceId: number, direction: -1 | 1) {
    const index = translationIds.indexOf(resourceId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= translationIds.length) return;
    const nextIds = [...translationIds];
    [nextIds[index], nextIds[nextIndex]] = [nextIds[nextIndex], nextIds[index]];
    commit(nextIds);
  }

  function handleDragStart(event: DragEvent<HTMLDivElement>, resourceId: number) {
    setDraggingId(resourceId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(resourceId));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>, targetId: number) {
    event.preventDefault();
    const sourceId = Number(event.dataTransfer.getData("text/plain"));
    const sourceIndex = translationIds.indexOf(sourceId);
    const targetIndex = translationIds.indexOf(targetId);
    setDraggingId(null);
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;
    const nextIds = [...translationIds];
    nextIds.splice(sourceIndex, 1);
    nextIds.splice(targetIndex, 0, sourceId);
    commit(nextIds);
  }

  function handleDragEnd() {
    setDraggingId(null);
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

            <div className="translation-settings-heading">
              <div><strong>Translations</strong><span>Shown in this order under each ayah</span></div>
              <b>{selectedTranslations.length} active</b>
            </div>
            <div className="translation-order-list" aria-label="Selected translations">
              {selectedTranslations.map((translation, index) => (
                <div
                  className={`translation-order-item${draggingId === translation.id ? " is-dragging" : ""}`}
                  key={translation.id}
                  draggable
                  onDragStart={(event) => handleDragStart(event, translation.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(event, translation.id)}
                  onDragEnd={handleDragEnd}
                >
                  <span className="translation-drag-handle" aria-hidden="true"><GripVertical size={17} /></span>
                  <span className="translation-order-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="translation-order-copy"><strong>{translation.name}</strong><small>{translation.languageName ?? "Language"}{translation.authorName ? ` · ${translation.authorName}` : ""}</small></span>
                  <span className="translation-order-actions">
                    <button type="button" className="translation-move-button" onClick={() => moveTranslation(translation.id, -1)} disabled={index === 0} aria-label={`Move ${translation.name} up`}><ArrowUp size={14} aria-hidden="true" /></button>
                    <button type="button" className="translation-move-button" onClick={() => moveTranslation(translation.id, 1)} disabled={index === selectedTranslations.length - 1} aria-label={`Move ${translation.name} down`}><ArrowDown size={14} aria-hidden="true" /></button>
                    <button type="button" className="translation-remove-button" onClick={() => removeTranslation(translation.id)} disabled={selectedTranslations.length === 1} aria-label={`Remove ${translation.name}`}><X size={14} aria-hidden="true" /></button>
                  </span>
                </div>
              ))}
            </div>
            <p className="translation-order-help">Drag a translation to reorder it, or use the arrow controls. English and Urdu are included by default.</p>

            <div className="translation-add-field">
              <span className="settings-field-label">Add a translation</span>
              <TranslationPicker resources={translations} selectedIds={translationIds} onAdd={addTranslation} />
            </div>
            {notice ? <p className="settings-status" role="status">{notice}</p> : null}
            <p className="field-help">Your order is saved on this device and reflected in the URL for easy sharing.</p>
          </section>
        </div>
      ) : null}
    </>
  );
}
