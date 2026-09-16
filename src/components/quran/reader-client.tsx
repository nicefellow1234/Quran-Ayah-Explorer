"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ResourceOption, VerseViewModel } from "@/lib/quran/types";

import { AudioDock, useAudioPlayer } from "../audio/audio-player";
import { VerseCard } from "./verse-card";

export function ReaderClient({
  chapterId,
  totalVerses,
  translationIds,
  queueVerseKeys,
  verses,
  tafsirs,
  reciters,
  defaultTafsirId,
  defaultReciterId,
  readingMode = false,
}: {
  chapterId: number;
  totalVerses: number;
  translationIds: number[];
  queueVerseKeys: string[];
  verses: VerseViewModel[];
  tafsirs: ResourceOption[];
  reciters: ResourceOption[];
  defaultTafsirId?: number;
  defaultReciterId?: number;
  readingMode?: boolean;
}) {
  const [loadedVerses, setLoadedVerses] = useState(verses);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const pageRef = useRef(1);
  const translationKey = translationIds.join(",");
  const audioQueue = useMemo(() => queueVerseKeys, [queueVerseKeys]);
  const { setQueue, currentVerse, autoPlayAll } = useAudioPlayer();
  const lastScrolledVerseRef = useRef<string | null>(null);
  const hasMore = loadedVerses.length < totalVerses;

  useEffect(() => { setQueue(audioQueue); }, [setQueue, audioQueue]);

  const loadNextPage = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setIsLoading(true);
    setHasError(false);
    const nextPage = pageRef.current + 1;
    try {
      const response = await fetch(`/api/verses?chapterId=${chapterId}&page=${nextPage}&translationIds=${encodeURIComponent(translationKey)}`);
      if (!response.ok) throw new Error("Ayah request failed");
      const data = await response.json() as { verses: VerseViewModel[] };
      setLoadedVerses((current) => {
        const known = new Set(current.map((verse) => verse.verseKey));
        return [...current, ...data.verses.filter((verse) => !known.has(verse.verseKey))];
      });
      pageRef.current = nextPage;
    } catch {
      setHasError(true);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [chapterId, hasMore, translationKey]);

  useEffect(() => {
    if (!autoPlayAll) {
      lastScrolledVerseRef.current = null;
      return;
    }
    if (!currentVerse || !currentVerse.startsWith(`${chapterId}:`) || lastScrolledVerseRef.current === currentVerse) return;

    const elementId = `ayah-${currentVerse.replace(":", "-")}`;
    const verseElement = document.getElementById(elementId);
    if (!verseElement) {
      if (hasMore && !loadingRef.current) void loadNextPage();
      return;
    }

    lastScrolledVerseRef.current = currentVerse;
    window.requestAnimationFrame(() => {
      verseElement.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [autoPlayAll, chapterId, currentVerse, hasMore, loadedVerses, loadNextPage]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) void loadNextPage();
    }, { rootMargin: "900px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadNextPage]);

  return (
    <>
      <div className="verse-list">
        {loadedVerses.map((verse) => (
          <VerseCard key={verse.id} verse={verse} tafsirs={tafsirs} defaultTafsirId={defaultTafsirId} defaultReciterId={defaultReciterId} readingMode={readingMode} />
        ))}
        {hasMore || isLoading || hasError ? (
          <div ref={sentinelRef} className="verse-list-loader" aria-live="polite">
            {isLoading ? <span>Loading more ayahs…</span> : null}
            {hasError ? <button type="button" className="button button-quiet" onClick={() => void loadNextPage()}>Try again</button> : null}
          </div>
        ) : null}
      </div>
      <AudioDock reciters={reciters} defaultReciterId={defaultReciterId} />
    </>
  );
}
