"use client";

import { BookOpenText, Info, Pause, Play } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import type { ChapterSummary } from "@/lib/quran/types";

import { useAudioPlayer } from "../audio/audio-player";

export type ReadingView = "both" | "arabic" | "translation";

export function ReadingModeHeader({
  chapter,
  view,
  defaultReciterId,
}: {
  chapter: ChapterSummary;
  view: Exclude<ReadingView, "both">;
  defaultReciterId?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const audio = useAudioPlayer();
  const [showInfo, setShowInfo] = useState(false);
  const name = chapter.transliteratedName || chapter.nameSimple;
  const isCurrentChapter = audio.currentVerse?.startsWith(`${chapter.id}:`);
  const isPlayingCurrentChapter = isCurrentChapter && audio.status === "playing";

  function setView(nextView: Exclude<ReadingView, "both">) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", "reading");
    if (nextView === "translation") params.set("view", "translation");
    else params.delete("view");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
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
          <button type="button" className="reading-mode-action" onClick={listen}>
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
          <button type="button" role="tab" className={view === "translation" ? "is-active" : ""} aria-selected={view === "translation"} onClick={() => setView("translation")}>
            Translation
          </button>
        </div>
      </div>
      {showInfo ? <div className="reading-mode-info"><strong>{chapter.revelationPlace}</strong><span>{chapter.versesCount} ayahs · word highlighting follows the recitation timing.</span></div> : null}
    </section>
  );
}
