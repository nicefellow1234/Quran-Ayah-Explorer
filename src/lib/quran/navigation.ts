export function getAdjacentVerseKeys(
  chapter: number,
  verse: number,
  chapterVerseCount: number,
): { previous: string | null; next: string | null } {
  const previous = verse > 1
    ? `${chapter}:${verse - 1}`
    : chapter > 1
      ? `${chapter - 1}:1`
      : null;
  const next = verse < chapterVerseCount
    ? `${chapter}:${verse + 1}`
    : chapter < 114
      ? `${chapter + 1}:1`
      : null;
  return { previous, next };
}
