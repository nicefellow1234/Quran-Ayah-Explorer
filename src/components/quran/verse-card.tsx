"use client";

import { useState } from "react";
import { Check, Copy, Link as LinkIcon, MessageCircle, Play } from "lucide-react";

import type { ResourceOption, VerseViewModel } from "@/lib/quran/types";
import { getActiveAudioWordRange } from "@/lib/quran/audio-segments";
import { sanitizeTranslationMarkup } from "@/lib/quran/translation-markup";

import { useAudioPlayer } from "../audio/audio-player";
import { TafsirPanel } from "./tafsir-panel";

export function VerseCard({
  verse,
  tafsirs,
  defaultTafsirId,
  defaultReciterId,
  readingMode = false,
}: {
  verse: VerseViewModel;
  tafsirs: ResourceOption[];
  defaultTafsirId?: number;
  defaultReciterId?: number;
  readingMode?: boolean;
}) {
  const audio = useAudioPlayer();
  const [tafsirOpen, setTafsirOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const arabicWords = verse.arabic.trim().split(/\s+/).filter(Boolean);
  const activeWordRange = audio.currentVerse === verse.verseKey
    ? getActiveAudioWordRange(audio.audioSegments, audio.currentTime)
    : null;

  async function copyVerse() {
    const translations = verse.translations.map((translation) => `${translation.resourceName}:\n${translation.text}`);
    const text = [verse.arabic, ...translations, `Quran ${verse.verseKey}`].filter(Boolean).join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  async function shareVerse() {
    const url = `${window.location.origin}/ayah/${verse.verseKey}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Quran ${verse.verseKey}`, text: verse.translations[0]?.text ?? verse.arabic, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="verse-card" id={`ayah-${verse.verseKey.replace(":", "-")}`}>
      <div className="verse-topline">
        <span className="verse-key">{verse.verseKey}</span>
        <div className="verse-actions" aria-label={`Actions for ayah ${verse.verseKey}`}>
          <button type="button" className="icon-button" onClick={() => void audio.playVerse(verse.verseKey, audio.reciterId ?? defaultReciterId)} aria-label={`Play ayah ${verse.verseKey}`}>
            <Play size={16} fill="currentColor" aria-hidden="true" />
          </button>
          {!readingMode ? (
            <button type="button" className="icon-button" onClick={() => setTafsirOpen(true)} aria-label={`Open tafsir for ayah ${verse.verseKey}`}>
              <MessageCircle size={16} aria-hidden="true" />
            </button>
          ) : null}
          <button type="button" className="icon-button" onClick={() => void copyVerse()} aria-label={`Copy ayah ${verse.verseKey}`}>
            {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          </button>
          <button type="button" className="icon-button" onClick={() => void shareVerse()} aria-label={`Share ayah ${verse.verseKey}`}>
            <LinkIcon size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      <p className="arabic-text" lang="ar" dir="rtl" translate="no">
        {arabicWords.map((word, index) => {
          const isActive = Boolean(activeWordRange && index >= activeWordRange.from && index < activeWordRange.to);
          return <span className={`arabic-word${isActive ? " is-reciting" : ""}`} data-word-index={index} key={`${verse.verseKey}-${index}`}>{index ? " " : null}{word}</span>;
        })}
      </p>
      {!readingMode && verse.translations.length ? (
        <div className="translations-list">
          {verse.translations.map((translation) => {
            const isUrdu = translation.languageName?.toLowerCase() === "urdu";
            const isFatahJalandhari = /fatah|jalandhari/i.test(translation.resourceName);
            const translationLabel = isUrdu
              ? `اردو · ${isFatahJalandhari ? "فتح محمد جالندھری" : "اردو ترجمہ"}`
              : `${translation.languageName ?? "Translation"} · ${translation.resourceName}`;
            return (
              <section className={`translation-block${isUrdu ? " urdu-translation-block" : ""}`} key={translation.id} lang={isUrdu ? "ur" : translation.languageName} dir={isUrdu ? "rtl" : "ltr"}>
                <p className={`translation-label${isUrdu ? " urdu-translation-label" : ""}`} lang={isUrdu ? "ur" : undefined} dir={isUrdu ? "rtl" : undefined}>{translationLabel}</p>
                <p className={`translation-text${isUrdu ? " urdu-text" : ""}`} dir={isUrdu ? "rtl" : "ltr"} dangerouslySetInnerHTML={{ __html: sanitizeTranslationMarkup(translation.text) }} />
              </section>
            );
          })}
        </div>
      ) : !readingMode ? <p className="empty-copy">Translation is unavailable for this ayah.</p> : null}
      {copied ? <span className="toast" role="status">Ayah copied</span> : null}
      {!readingMode && tafsirOpen ? <TafsirPanel verseKey={verse.verseKey} resources={tafsirs} defaultResourceId={defaultTafsirId} onClose={() => setTafsirOpen(false)} /> : null}
    </article>
  );
}
