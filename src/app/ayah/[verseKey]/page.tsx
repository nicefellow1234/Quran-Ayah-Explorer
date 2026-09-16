import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";

import { SetupCard } from "@/components/feedback/setup-card";
import { SiteHeader } from "@/components/layout/site-header";
import { ReaderClient } from "@/components/quran/reader-client";
import { ReadingModeHeader } from "@/components/quran/reading-mode-header";
import { getChapter } from "@/lib/quran/chapters";
import { isQuranConfigured } from "@/lib/quran/client";
import { QuranApiError } from "@/lib/quran/errors";
import { getDefaultReciterId, getDefaultTafsirId, getDefaultTranslationIds, getReaderResources } from "@/lib/quran/resources";
import { getAdjacentVerseKeys } from "@/lib/quran/navigation";
import { getVerse } from "@/lib/quran/verses";
import { parseOptionalResourceIds, parseVerseKey } from "@/lib/quran/validation";

type PageProps = { params: Promise<{ verseKey: string }>; searchParams: Promise<{ translation?: string | string[]; mode?: string; view?: string; translationView?: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { verseKey } = await params;
  return { title: `Quran ${verseKey}`, description: `Read Quran ${verseKey} with translation and tafsir.` };
}

export default async function AyahPage({ params, searchParams }: PageProps) {
  const { verseKey } = await params;
  let parsed: { chapter: number; verse: number };
  try { parsed = parseVerseKey(verseKey); } catch (error) { if (error instanceof QuranApiError && error.status === 404) notFound(); throw error; }
  if (!isQuranConfigured) return <><SiteHeader /><main className="shell narrow-content"><SetupCard compact /></main></>;

  let chapter;
  let resources;
  try {
    [chapter, resources] = await Promise.all([getChapter(parsed.chapter), getReaderResources()]);
  } catch (error) {
    if (error instanceof QuranApiError && error.status === 404) notFound();
    throw error;
  }
  const requestedParams = await searchParams;
  const readingMode = requestedParams.mode === "reading";
  const readingView = requestedParams.view === "translation" ? "translation" : "arabic";
  const requestedTranslationIds = parseOptionalResourceIds(requestedParams.translation)
    .filter((id) => resources.translations.some((item) => item.id === id));
  const translationIds = requestedTranslationIds.length ? requestedTranslationIds : getDefaultTranslationIds(resources);
  const requestedReadingTranslationId = Number(requestedParams.translationView);
  const readingTranslationId = translationIds.includes(requestedReadingTranslationId) ? requestedReadingTranslationId : translationIds[0];
  const contentTranslationIds = translationIds;
  let verse;
  try {
    verse = await getVerse(`${parsed.chapter}:${parsed.verse}`, contentTranslationIds);
  } catch (error) {
    if (error instanceof QuranApiError && error.status === 404) notFound();
    throw error;
  }
  const { previous: previousKey, next: nextKey } = getAdjacentVerseKeys(parsed.chapter, parsed.verse, chapter.versesCount);

  return (
    <>
      <SiteHeader translations={resources.translations} selectedTranslationIds={translationIds} showReaderMode />
      <main className={`shell reader-page ayah-page${readingMode ? " reading-mode" : ""}`}>
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">All Surahs</Link><span>/</span><Link href={`/surah/${parsed.chapter}`}>Surah {parsed.chapter}</Link><span>/</span><span>Ayah {parsed.verse}</span></nav>
        {readingMode ? <ReadingModeHeader chapter={chapter} view={readingView} defaultReciterId={getDefaultReciterId(resources)} translations={resources.translations} selectedTranslationIds={translationIds} selectedTranslationId={readingTranslationId} /> : <header className="ayah-header reader-header">
          <div><p className="eyebrow">Surah {String(chapter.id).padStart(3, "0")} · {chapter.revelationPlace}</p><h1>{chapter.transliteratedName || chapter.nameSimple}</h1><p className="reader-subtitle">{chapter.translatedName} · {chapter.versesCount} ayahs</p></div>
          <span
            className="chapter-icon reader-surah-icon"
            aria-label={`${chapter.transliteratedName || chapter.nameSimple} in Arabic`}
            data-chapter-icon={String(chapter.id).padStart(3, "0")}
            role="img"
            translate="no"
          />
        </header>}
        <ReaderClient key={`ayah-${verse.verseKey}-${contentTranslationIds.join(",")}-${readingMode ? "reading" : "verse"}`} chapterId={parsed.chapter} totalVerses={1} translationIds={contentTranslationIds} queueVerseKeys={[verse.verseKey]} verses={[verse]} tafsirs={resources.tafsirs} reciters={resources.reciters} defaultTafsirId={getDefaultTafsirId(resources)} defaultReciterId={getDefaultReciterId(resources)} readingMode={readingMode} readingView={readingMode ? readingView : "both"} readingTranslationId={readingMode ? readingTranslationId : undefined} />
        <nav className="reader-navigation ayah-navigation" aria-label="Ayah navigation">
          {previousKey ? <Link href={`/ayah/${previousKey}`} className="button button-quiet"><ArrowLeft size={16} aria-hidden="true" /> Previous ayah</Link> : null}
          <Link href={`/surah/${parsed.chapter}`} className="button button-quiet">Complete Surah</Link>
          {nextKey ? <Link href={`/ayah/${nextKey}`} className="button button-quiet">Next ayah <ArrowRight size={16} aria-hidden="true" /></Link> : null}
        </nav>
      </main>
    </>
  );
}
