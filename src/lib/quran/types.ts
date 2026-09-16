export type ChapterSummary = {
  id: number;
  nameArabic: string;
  nameSimple: string;
  transliteratedName: string;
  translatedName: string;
  versesCount: number;
  revelationPlace: string;
  bismillahPre: boolean;
};

export type VerseViewModel = {
  id: number;
  verseKey: string;
  verseNumber: number;
  arabic: string;
  translations: VerseTranslation[];
};

/** [first word offset, exclusive last word offset, start time in ms, end time in ms] */
export type AudioSegment = [number, number, number, number];

export type VerseTranslation = {
  id: number;
  text: string;
  resourceName: string;
  languageName?: string;
};

export type ResourceOption = {
  id: number;
  name: string;
  authorName?: string;
  languageName?: string;
};

export type ReaderResources = {
  translations: ResourceOption[];
  tafsirs: ResourceOption[];
  reciters: ResourceOption[];
};
