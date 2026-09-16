import { unstable_cache } from "next/cache";
import type {
  ChapterReciterResource,
  RecitationResource,
  TafsirResource,
  TranslationResource,
} from "@quranjs/api";

import { getQuranClient, isQuranConfigured, logQuranError } from "./client";
import { QuranApiError } from "./errors";
import type { ReaderResources, ResourceOption } from "./types";

function resourceName(resource: {
  name?: string;
  reciterName?: string;
  translatedName?: { name: string };
  authorName?: string;
}): string {
  return resource.name ?? resource.reciterName ?? resource.translatedName?.name ?? resource.authorName ?? "Resource";
}

function translationOption(resource: TranslationResource): ResourceOption | null {
  return resource.id
    ? {
        id: resource.id,
        name: resourceName(resource),
        authorName: resource.authorName,
        languageName: resource.languageName,
      }
    : null;
}

function tafsirOption(resource: TafsirResource): ResourceOption | null {
  return resource.id
    ? {
        id: resource.id,
        name: resourceName(resource),
        authorName: resource.authorName,
        languageName: resource.languageName,
      }
    : null;
}

function reciterOption(resource: ChapterReciterResource | RecitationResource): ResourceOption | null {
  return resource.id
    ? {
        id: resource.id,
        name: resourceName(resource),
        languageName: "languageName" in resource ? (resource as { languageName?: string }).languageName : undefined,
      }
    : null;
}

async function fetchResources(): Promise<ReaderResources> {
  if (!isQuranConfigured) return { translations: [], tafsirs: [], reciters: [] };
  try {
    const client = getQuranClient();
    const [translations, tafsirs, reciters] = await Promise.all([
      client.content.v4.resources.translations.list(),
      client.content.v4.resources.tafsirs.list(),
      client.content.v4.resources.chapterReciters.list(),
    ]);

    return {
      translations: translations.map(translationOption).filter((item): item is ResourceOption => Boolean(item)),
      tafsirs: tafsirs.map(tafsirOption).filter((item): item is ResourceOption => Boolean(item)),
      reciters: reciters.map(reciterOption).filter((item): item is ResourceOption => Boolean(item)),
    };
  } catch (error) {
    logQuranError("resources", error);
    throw new QuranApiError(
      "We couldn't load the Quran resources right now. Please try again.",
      "resources",
    );
  }
}

export const getReaderResources = unstable_cache(fetchResources, ["quran-reader-resources-v3"], {
  revalidate: 86_400,
  tags: ["quran-reader-resources"],
});

export function getDefaultTranslationId(resources: ReaderResources): number | undefined {
  return resources.translations.find((resource) => resource.languageName?.toLowerCase() === "english")?.id
    ?? resources.translations[0]?.id;
}

export function getDefaultUrduTranslationId(resources: ReaderResources): number | undefined {
  return resources.translations.find((resource) => resource.languageName?.toLowerCase() === "urdu")?.id;
}

export function getDefaultTafsirId(resources: ReaderResources): number | undefined {
  return resources.tafsirs.find((resource) => resource.languageName?.toLowerCase() === "english")?.id
    ?? resources.tafsirs[0]?.id;
}

export function getDefaultReciterId(resources: ReaderResources): number | undefined {
  const preferredReciter = resources.reciters.find((reciter) => {
    const name = `${reciter.name} ${reciter.authorName ?? ""}`.toLowerCase();
    return name.includes("mishary") && /alafasy|alefasy|alafasi/.test(name);
  });

  return preferredReciter?.id ?? resources.reciters[0]?.id;
}
