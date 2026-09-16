import { unstable_cache } from "next/cache";
import type { ChapterId, Verse, VerseKey } from "@quranjs/api";

import { getQuranClient, isQuranConfigured, logQuranError } from "./client";
import { QuranApiError } from "./errors";
import { parseChapterId, parseVerseKey } from "./validation";
import type { VerseTranslation, VerseViewModel } from "./types";

function normalizeVerse(verse: Verse, translationIds?: number[]): VerseViewModel {
  const translations = (verse.translations ?? [])
    .filter((translation): translation is typeof translation & { resourceId: number; text: string } => Boolean(translation.resourceId && translation.text))
    .map<VerseTranslation>((translation) => ({
      id: translation.resourceId,
      text: translation.text,
      resourceName: translation.resourceName ?? "Translation",
      languageName: translation.languageName,
    }));

  if (translationIds?.length) {
    const requestedOrder = new Map(translationIds.map((id, index) => [id, index]));
    translations.sort((left, right) => {
      return (requestedOrder.get(left.id) ?? Number.MAX_SAFE_INTEGER)
        - (requestedOrder.get(right.id) ?? Number.MAX_SAFE_INTEGER);
    });
  }

  return {
    id: verse.id,
    verseKey: String(verse.verseKey),
    verseNumber: verse.verseNumber,
    arabic: verse.textIndopak ?? verse.textUthmani ?? verse.textUthmaniSimple ?? verse.textImlaei ?? "",
    translations,
  };
}

const verseContentFields = {
  chapterId: true,
  textIndopak: true,
  textUthmani: true,
  textUthmaniSimple: true,
  textImlaei: true,
};

const translationFields = {
  resourceName: true,
  languageName: true,
  verseKey: true,
};

export const VERSES_PAGE_SIZE = 10;

async function fetchChapterVersesPage(chapterId: number, translationIds: number[] | undefined, page: number): Promise<VerseViewModel[]> {
  if (!isQuranConfigured) return [];
  try {
    const verses = await getQuranClient().content.v4.verses.byChapter(String(chapterId) as ChapterId, {
      page,
      perPage: VERSES_PAGE_SIZE,
      ...(translationIds?.length ? { translations: translationIds } : {}),
      fields: verseContentFields,
      translationFields,
    });
    return verses.map((verse) => normalizeVerse(verse, translationIds));
  } catch (error) {
    logQuranError(`verses.byChapter:${chapterId}:page:${page}`, error);
    throw new QuranApiError(
      "We couldn't load the ayahs for this Surah right now. Please try again.",
      "verses.byChapter",
    );
  }
}

export async function getChapterVerses(chapterId: string | number, translationIds?: number[]) {
  return getChapterVersesPage(chapterId, translationIds, 1);
}

export async function getChapterVersesPage(chapterId: string | number, translationIds: number[] | undefined, page: number) {
  const id = parseChapterId(chapterId);
  const cacheTranslationKey = translationIds?.length ? translationIds.join(",") : "default";
  const normalizedPage = Number.isInteger(page) && page > 0 ? page : 1;
  return unstable_cache(
    () => fetchChapterVersesPage(id, translationIds, normalizedPage),
    ["quran-verses-v4", String(id), cacheTranslationKey, String(normalizedPage)],
    { revalidate: 86_400 },
  )();
}

export async function getVerse(verseKey: string, translationIds?: number[]): Promise<VerseViewModel> {
  const { chapter, verse } = parseVerseKey(verseKey);
  const normalizedKey = `${chapter}:${verse}`;
  if (!isQuranConfigured) {
    throw new QuranApiError("Quran Foundation is not configured yet.", "verse");
  }

  try {
    const rawVerse = await getQuranClient().content.v4.verses.byKey(normalizedKey as VerseKey, {
      ...(translationIds?.length ? { translations: translationIds } : {}),
      fields: verseContentFields,
      translationFields,
    });
    return normalizeVerse(rawVerse, translationIds);
  } catch (error) {
    logQuranError(`verses.byKey:${normalizedKey}`, error);
    if (error instanceof QuranApiError && error.status === 404) throw error;
    if (error instanceof Error && /\b404\b/.test(error.message)) {
      throw new QuranApiError("That ayah could not be found.", "verses.byKey", 404);
    }
    throw new QuranApiError(
      "We couldn't load this ayah right now. Please try again.",
      "verses.byKey",
    );
  }
}

export async function getVerseTafsir(verseKey: string, tafsirId: number) {
  const { chapter, verse } = parseVerseKey(verseKey);
  if (!isQuranConfigured) {
    throw new QuranApiError("Quran Foundation is not configured yet.", "tafsir");
  }
  try {
    const response = await getQuranClient().content.v4.verses.byKey(`${chapter}:${verse}` as VerseKey, {
      tafsirs: [tafsirId],
    });
    const tafsir = response.tafsirs?.find((item) => item.resourceId === tafsirId) ?? response.tafsirs?.[0];
    return {
      verseKey: `${chapter}:${verse}`,
      resourceId: tafsir?.resourceId ?? tafsirId,
      resourceName: tafsir?.resourceName ?? "Tafsir",
      text: tafsir?.text ?? null,
    };
  } catch (error) {
    logQuranError(`verses.tafsir:${chapter}:${verse}`, error);
    throw new QuranApiError(
      "We couldn't load this tafsir right now. Please try again.",
      "verses.tafsir",
    );
  }
}
