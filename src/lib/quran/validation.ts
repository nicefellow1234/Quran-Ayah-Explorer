import { QuranApiError } from "./errors";

export function parseChapterId(value: string | number): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1 || id > 114) {
    throw new QuranApiError("That Surah could not be found.", "validation", 404);
  }
  return id;
}

export function parseVerseKey(value: string): { chapter: number; verse: number } {
  let decodedValue: string;
  try {
    decodedValue = decodeURIComponent(value).trim();
  } catch {
    throw new QuranApiError("Use a verse reference like 2:255.", "validation", 404);
  }
  const match = decodedValue.match(/^(\d{1,3}):(\d{1,3})$/);
  if (!match) {
    throw new QuranApiError("Use a verse reference like 2:255.", "validation", 404);
  }

  const chapter = parseChapterId(match[1]);
  const verse = Number(match[2]);
  if (!Number.isInteger(verse) || verse < 1 || verse > 286) {
    throw new QuranApiError("That ayah could not be found.", "validation", 404);
  }

  return { chapter, verse };
}

export function parseOptionalResourceId(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

export function parseOptionalResourceIds(value: string | string[] | undefined): number[] {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values
    .map((item) => parseOptionalResourceId(item))
    .filter((item, index, parsed): item is number => typeof item === "number" && parsed.indexOf(item) === index);
}

export function parseJumpInput(value: string):
  | { kind: "chapter"; chapter: number }
  | { kind: "verse"; chapter: number; verse: number }
  | { kind: "invalid" } {
  const input = value.trim();
  if (/^\d+$/.test(input)) {
    const chapter = Number(input);
    return chapter >= 1 && chapter <= 114
      ? { kind: "chapter", chapter }
      : { kind: "invalid" };
  }

  const match = input.match(/^(\d{1,3}):(\d{1,3})$/);
  if (!match) return { kind: "invalid" };
  const chapter = Number(match[1]);
  const verse = Number(match[2]);
  return chapter >= 1 && chapter <= 114 && verse >= 1 && verse <= 286
    ? { kind: "verse", chapter, verse }
    : { kind: "invalid" };
}
