"use client";

import type { VerseViewModel } from "@/lib/quran/types";
import { getActiveAudioWordRange } from "@/lib/quran/audio-segments";

import { useAudioPlayer } from "../audio/audio-player";
import { AyahNumber } from "./ayah-number";

export function MushafReading({ verses, defaultReciterId }: { verses: VerseViewModel[]; defaultReciterId?: number }) {
  const audio = useAudioPlayer();

  return (
    <div className="mushaf-page" aria-label="Arabic Quran reading">
      <p className="arabic-text mushaf-text" lang="ar" dir="rtl" translate="no">
        {verses.map((verse, verseIndex) => {
          const words = verse.arabic.trim().split(/\s+/).filter(Boolean);
          const activeWordRange = audio.currentVerse === verse.verseKey
            ? getActiveAudioWordRange(audio.audioSegments, audio.currentTime)
            : null;

          return (
            <span className="mushaf-ayah" id={`ayah-${verse.verseKey.replace(":", "-")}`} key={verse.id}>
              {verseIndex ? " " : null}
              {words.map((word, wordIndex) => {
                const isActive = Boolean(activeWordRange && wordIndex >= activeWordRange.from && wordIndex < activeWordRange.to);
                return <span className={`arabic-word${isActive ? " is-reciting" : ""}`} data-word-index={wordIndex} key={`${verse.verseKey}-${wordIndex}`}>{wordIndex ? " " : null}{word}</span>;
              })}
              {" "}
              <AyahNumber
                verseNumber={verse.verseNumber}
                verseKey={verse.verseKey}
                onPlay={() => void audio.playVerse(verse.verseKey, audio.reciterId ?? defaultReciterId)}
              />
            </span>
          );
        })}
      </p>
    </div>
  );
}
