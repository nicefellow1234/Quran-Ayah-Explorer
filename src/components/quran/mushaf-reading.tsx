"use client";

import { Fragment } from "react";

import type { VerseViewModel } from "@/lib/quran/types";
import { getActiveAudioWordRange } from "@/lib/quran/audio-segments";

import { useAudioPlayer } from "../audio/audio-player";
import { AyahNumber } from "./ayah-number";

export function MushafReading({ verses, defaultReciterId }: { verses: VerseViewModel[]; defaultReciterId?: number }) {
  const audio = useAudioPlayer();
  const isOpeningSurah = verses.length > 0 && verses.every((verse) => verse.verseKey.startsWith("1:"));

  return (
    <div className={`mushaf-page${isOpeningSurah ? " mushaf-page-opening" : ""}`} aria-label="Arabic Quran reading">
      <p className="arabic-text mushaf-text" lang="ar" dir="rtl" translate="no">
        {verses.map((verse, verseIndex) => {
          const words = verse.arabic.trim().split(/\s+/).filter(Boolean);
          const activeWordRange = audio.currentVerse === verse.verseKey
            ? getActiveAudioWordRange(audio.audioSegments, audio.currentTime)
            : null;
          // Some verses carry a separate trailing pause-mark token. Keep it with
          // the final word and medallion without changing audio word offsets.
          let endingIndex = words.length - 1;
          while (endingIndex > 0 && /^[\p{M}\p{Cf}\s\u06d6-\u06ed]+$/u.test(words[endingIndex])) endingIndex--;
          const renderWord = (word: string, wordIndex: number) => {
            const isActive = Boolean(activeWordRange && wordIndex >= activeWordRange.from && wordIndex < activeWordRange.to);
            return <span className={`arabic-word${isActive ? " is-reciting" : ""}`} data-word-index={wordIndex}>{word}</span>;
          };

          return (
            <span className="mushaf-ayah" id={`ayah-${verse.verseKey.replace(":", "-")}`} key={verse.id}>
              {verseIndex ? " " : null}
              {words.map((word, wordIndex) => {
                if (wordIndex > endingIndex) return null;
                return (
                  <Fragment key={`${verse.verseKey}-${wordIndex}`}>
                    {wordIndex ? " " : null}
                    {wordIndex === endingIndex ? (
                      <span className="mushaf-ayah-ending">
                        {words.slice(endingIndex).map((endingWord, offset) => (
                          <Fragment key={offset}>{offset ? " " : null}{renderWord(endingWord, endingIndex + offset)}</Fragment>
                        ))}{" "}
                        <AyahNumber
                          verseNumber={verse.verseNumber}
                          verseKey={verse.verseKey}
                          onPlay={() => void audio.playVerse(verse.verseKey, audio.reciterId ?? defaultReciterId)}
                        />
                      </span>
                    ) : renderWord(word, wordIndex)}
                  </Fragment>
                );
              })}
            </span>
          );
        })}
      </p>
    </div>
  );
}
