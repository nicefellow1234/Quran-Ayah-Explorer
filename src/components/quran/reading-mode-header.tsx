"use client";

import { BookOpenText, Check, ChevronDown, Info, Pause, Play, Settings2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import type { ChapterSummary, ResourceOption } from "@/lib/quran/types";

import { useAudioPlayer } from "../audio/audio-player";

export type ReadingView = "both" | "arabic" | "translation";

export function ReadingModeHeader({
  chapter,
  view,
  defaultReciterId,
  translations,
  selectedTranslationIds,
  selectedTranslationId,
}: {
  chapter: ChapterSummary;
  view: Exclude<ReadingView, "both">;
  defaultReciterId?: number;
  translations: ResourceOption[];
  selectedTranslationIds: number[];
  selectedTranslationId?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const audio = useAudioPlayer();
  const [showInfo, setShowInfo] = useState(false);
  const [translationMenuOpen, setTranslationMenuOpen] = useState(false);
  const translationPickerRef = useRef<HTMLDivElement | null>(null);
  const name = chapter.transliteratedName || chapter.nameSimple;
  const isCurrentChapter = audio.currentVerse?.startsWith(`${chapter.id}:`);
  const isPlayingCurrentChapter = isCurrentChapter && audio.status === "playing";
  const selectedTranslations = useMemo(() => selectedTranslationIds
    .map((id) => translations.find((translation) => translation.id === id))
    .filter((translation): translation is ResourceOption => Boolean(translation)), [selectedTranslationIds, translations]);
  const selectedTranslation = translations.find((translation) => translation.id === selectedTranslationId)
    ?? selectedTranslations[0];

  useEffect(() => {
    if (!translationMenuOpen) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      if (translationPickerRef.current && !translationPickerRef.current.contains(event.target as Node)) {
        setTranslationMenuOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setTranslationMenuOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [translationMenuOpen]);

  function setView(nextView: Exclude<ReadingView, "both">) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", "reading");
    if (nextView === "translation") params.set("view", "translation");
    else {
      params.delete("view");
      params.delete("translationView");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function setTranslation(resourceId: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", "reading");
    params.set("view", "translation");
    params.set("translationView", String(resourceId));
    setTranslationMenuOpen(false);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function openReadingSettings() {
    setTranslationMenuOpen(false);
    document.querySelector<HTMLButtonElement>('[aria-label="Open reading settings"]')?.click();
  }

  function listen() {
    if (isCurrentChapter) {
      audio.toggle();
      return;
    }
    void audio.playVerse(`${chapter.id}:1`, audio.reciterId ?? defaultReciterId);
  }

  return (
    <section className="reading-mode-header" aria-label={`${name} reading controls`}>
      <div className="reading-mode-heading">
        <span
          className="chapter-icon reading-mode-chapter-icon"
          aria-label={`${name} in Arabic`}
          data-chapter-icon={String(chapter.id).padStart(3, "0")}
          role="img"
          translate="no"
        />
        <div className="reading-mode-heading-copy">
          <strong>{chapter.id}. Surah {name}</strong>
          <span>{chapter.translatedName}</span>
        </div>
      </div>
      <p className="reading-mode-description">Read and listen to {name} with translation, tafsir, audio recitation, word-by-word meaning, and transliteration.</p>
      <div className="reading-mode-actions">
        <div className="reading-mode-utility">
          <button type="button" className="reading-mode-action" onClick={listen} title="Play this Surah; enable Auto-play all in the audio dock for continuous tilawat">
            {isPlayingCurrentChapter ? <Pause size={12} fill="currentColor" aria-hidden="true" /> : <Play size={12} fill="currentColor" aria-hidden="true" />}
            <span>{isPlayingCurrentChapter ? "Pause" : "Listen"}</span>
          </button>
          <button type="button" className="reading-mode-action" onClick={() => setShowInfo((visible) => !visible)} aria-expanded={showInfo}>
            <Info size={12} aria-hidden="true" />
            <span>Info</span>
          </button>
        </div>
        <div className="reading-mode-tabs" role="tablist" aria-label="Reading content">
          <button type="button" role="tab" className={view === "arabic" ? "is-active" : ""} aria-selected={view === "arabic"} onClick={() => setView("arabic")}>
            <BookOpenText size={12} aria-hidden="true" /> Arabic
          </button>
          {view === "translation" ? (
            <div className="reading-translation-picker" ref={translationPickerRef}>
              <button type="button" role="tab" className="reading-translation-trigger is-active" aria-selected="true" aria-expanded={translationMenuOpen} onClick={() => setTranslationMenuOpen((open) => !open)}>
                <span>Translation: {selectedTranslation?.name ?? "Select translation"}</span>
                <ChevronDown size={12} aria-hidden="true" />
              </button>
              {translationMenuOpen ? (
                <div className="reading-translation-menu" role="menu" aria-label="My translations">
                  <p className="reading-translation-menu-title">My Translations:</p>
                  <div className="reading-translation-options">
                    {selectedTranslations.length > 0 ? selectedTranslations.map((translation) => (
                      <button
                        type="button"
                        role="menuitemradio"
                        aria-checked={translation.id === selectedTranslation?.id}
                        className={`reading-translation-option${translation.id === selectedTranslation?.id ? " is-selected" : ""}`}
                        key={translation.id}
                        onClick={() => setTranslation(translation.id)}
                      >
                        <span className="reading-translation-option-copy">
                          <strong>{translation.name}</strong>
                          <small>{translation.languageName ?? "Translation"}{translation.authorName ? ` · ${translation.authorName}` : ""}</small>
                        </span>
                        {translation.id === selectedTranslation?.id ? <Check size={14} aria-hidden="true" /> : null}
                      </button>
                    )) : <span className="reading-translation-empty">No translations selected.</span>}
                  </div>
                  <button type="button" className="reading-translation-settings" onClick={openReadingSettings}>
                    <Settings2 size={14} aria-hidden="true" /> Select Translations
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <button type="button" role="tab" className="reading-mode-tab" aria-selected="false" onClick={() => setView("translation")}>
              Translation
            </button>
          )}
        </div>
      </div>
      {showInfo ? <div className="reading-mode-info"><strong>{chapter.revelationPlace}</strong><span>{chapter.versesCount} ayahs · word highlighting follows the recitation timing.</span><span className="reading-mode-info-tip">Enable Auto-play all in the audio dock to continue through every ayah. It starts off by default.</span></div> : null}
    </section>
  );
}
