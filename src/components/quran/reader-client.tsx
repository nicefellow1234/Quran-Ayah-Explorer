"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ResourceOption, VerseViewModel } from "@/lib/quran/types";

import { AudioDock, useAudioPlayer } from "../audio/audio-player";
import { MushafReading } from "./mushaf-reading";
import type { ReadingView } from "./reading-mode-header";
import { TranslationReading } from "./translation-reading";
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
  readingView = readingMode ? "arabic" : "both",
  readingTranslationId,
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
  readingView?: ReadingView;
  readingTranslationId?: number;
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
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const hasMore = !hasReachedEnd && loadedVerses.length < totalVerses;
  const hasMoreRef = useRef(hasMore);

  useEffect(() => { setQueue(audioQueue); }, [setQueue, audioQueue]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);

  const loadNextPage = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
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
      if (data.verses.length === 0) setHasReachedEnd(true);
      pageRef.current = nextPage;
    } catch {
      setHasError(true);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [chapterId, translationKey]);

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

    let frame: number | null = null;
    const requestNearBottomCheck = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        if (loadingRef.current || !hasMoreRef.current) return;
        if (node.getBoundingClientRect().top <= window.innerHeight + 900) void loadNextPage();
      });
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) requestNearBottomCheck();
    }, { rootMargin: "900px 0px" });
    observer.observe(node);
    window.addEventListener("scroll", requestNearBottomCheck, { passive: true });
    window.addEventListener("resize", requestNearBottomCheck);
    requestNearBottomCheck();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestNearBottomCheck);
      window.removeEventListener("resize", requestNearBottomCheck);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [hasMore, loadedVerses.length, loadNextPage]);

  return (
    <>
      <div className="verse-list">
        {readingView === "arabic" ? <MushafReading verses={loadedVerses} defaultReciterId={defaultReciterId} /> : readingView === "translation" ? <TranslationReading verses={loadedVerses} translationId={readingTranslationId} /> : loadedVerses.map((verse) => (
          <VerseCard key={verse.id} verse={verse} tafsirs={tafsirs} defaultTafsirId={defaultTafsirId} defaultReciterId={defaultReciterId} readingView={readingView} />
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
