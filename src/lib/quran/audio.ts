import type { ChapterId, VerseKey } from "@quranjs/api";

import { getQuranClient, isQuranConfigured, logQuranError } from "./client";
import { QuranApiError } from "./errors";
import { parseChapterId, parseVerseKey } from "./validation";

export async function getVerseAudio(verseKey: string, recitationId: number) {
  const { chapter, verse } = parseVerseKey(verseKey);
  if (!isQuranConfigured) {
    throw new QuranApiError("Quran Foundation is not configured yet.", "audio");
  }

  try {
    const response = await getQuranClient().content.v4.audio.verseRecitation.byKey(
      `${chapter}:${verse}` as VerseKey,
      String(recitationId),
    );
    const audio = response.audioFiles[0];
    if (!audio?.audioUrl) {
      throw new QuranApiError("Audio is unavailable for this recitation.", "audio", 404);
    }
    return { verseKey: `${chapter}:${verse}`, audioUrl: audio.audioUrl };
  } catch (error) {
    logQuranError(`audio.verse:${chapter}:${verse}`, error);
    if (error instanceof QuranApiError) throw error;
    throw new QuranApiError("Audio is unavailable for this recitation.", "audio", 404);
  }
}

export async function getChapterAudio(chapterId: string | number, reciterId: number) {
  const id = parseChapterId(chapterId);
  if (!isQuranConfigured) {
    throw new QuranApiError("Quran Foundation is not configured yet.", "audio");
  }

  try {
    const audio = await getQuranClient().content.v4.audio.chapterRecitation.get(
      String(reciterId),
      String(id) as ChapterId,
    );
    return audio.audioUrl ?? null;
  } catch (error) {
    logQuranError(`audio.chapter:${id}`, error);
    throw new QuranApiError("Audio is unavailable for this Surah.", "audio", 404);
  }
}
