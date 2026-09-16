import { unstable_cache } from "next/cache";
import type { Chapter } from "@quranjs/api";

import { getQuranClient, isQuranConfigured, logQuranError } from "./client";
import { QuranApiError } from "./errors";
import { parseChapterId } from "./validation";
import type { ChapterSummary } from "./types";

function normalizeChapter(chapter: Chapter): ChapterSummary {
  return {
    id: chapter.id,
    nameArabic: chapter.nameArabic,
    nameSimple: chapter.nameSimple,
    transliteratedName: chapter.transliteratedName,
    translatedName: chapter.translatedName?.name ?? "",
    versesCount: chapter.versesCount,
    revelationPlace: chapter.revelationPlace,
    bismillahPre: chapter.bismillahPre,
  };
}

async function fetchChapters(): Promise<ChapterSummary[]> {
  if (!isQuranConfigured) return [];
  try {
    const chapters = await getQuranClient().content.v4.chapters.list();
    return chapters.map(normalizeChapter);
  } catch (error) {
    logQuranError("chapters.list", error);
    throw new QuranApiError(
      "We couldn't load the Surah directory right now. Please try again.",
      "chapters.list",
    );
  }
}

export const getChapters = unstable_cache(fetchChapters, ["quran-chapters-v4"], {
  revalidate: 86_400,
  tags: ["quran-chapters"],
});

export async function getChapter(chapterId: string | number): Promise<ChapterSummary> {
  const id = parseChapterId(chapterId);
  if (!isQuranConfigured) {
    throw new QuranApiError("Quran Foundation is not configured yet.", "chapter");
  }

  try {
    // The chapter list is the canonical directory response and is already cached.
    // Reusing it avoids an unnecessary per-route metadata request and works across
    // pre-live environments where the single-chapter helper can intermittently 404.
    const chapters = await getChapters();
    const chapter = chapters.find((item) => item.id === id);
    if (!chapter) {
      throw new QuranApiError("That Surah could not be found.", "chapters.get", 404);
    }
    return chapter;
  } catch (error) {
    logQuranError(`chapters.get:${id}`, error);
    if (error instanceof QuranApiError && error.status === 404) throw error;
    if (error instanceof Error && /\b404\b/.test(error.message)) {
      throw new QuranApiError("That Surah is not available from the current Quran.Foundation environment.", "chapters.get", 404);
    }
    throw new QuranApiError(
      "We couldn't load this Surah right now. Please try again.",
      "chapters.get",
    );
  }
}
