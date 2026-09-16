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
import { getChapterVerses } from "@/lib/quran/verses";
import { parseChapterId, parseOptionalResourceIds } from "@/lib/quran/validation";

type PageProps = { params: Promise<{ chapterId: string }>; searchParams: Promise<{ translation?: string | string[]; mode?: string; view?: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { chapterId } = await params;
  if (!isQuranConfigured) return { title: `Surah ${chapterId}` };
  try {
    const chapter = await getChapter(chapterId);
    return { title: `Surah ${chapter.transliteratedName} (${chapter.id})`, description: `${chapter.translatedName} — ${chapter.versesCount} ayahs.` };
  } catch { return { title: "Surah not found" }; }
}

export default async function SurahPage({ params, searchParams }: PageProps) {
  const { chapterId } = await params;
  let id: number;
  try { id = parseChapterId(chapterId); } catch (error) { if (error instanceof QuranApiError && error.status === 404) notFound(); throw error; }
  if (!isQuranConfigured) return <><SiteHeader /><main className="shell narrow-content"><SetupCard compact /></main></>;

  let chapter;
  let resources;
  try {
    [chapter, resources] = await Promise.all([getChapter(id), getReaderResources()]);
  } catch (error) {
    if (error instanceof QuranApiError && error.status === 404) notFound();
    throw error;
  }
  const requestedParams = await searchParams;
  const readingMode = requestedParams.mode === "reading";
  const readingView = requestedParams.view === "translation" ? "translation" : "arabic";
  const requestedTranslationIds = parseOptionalResourceIds(requestedParams.translation)
    .filter((translationId) => resources.translations.some((item) => item.id === translationId));
  const translationIds = requestedTranslationIds.length ? requestedTranslationIds : getDefaultTranslationIds(resources);
  const contentTranslationIds = translationIds;
  const verses = await getChapterVerses(id, contentTranslationIds);
  const previousChapter = id > 1 ? id - 1 : null;
  const nextChapter = id < 114 ? id + 1 : null;

  return (
    <>
      <SiteHeader translations={resources.translations} selectedTranslationIds={translationIds} showReaderMode />
      <main className={`shell reader-page${readingMode ? " reading-mode" : ""}`}>
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">All Surahs</Link><span>/</span><span>Surah {chapter.id}</span></nav>
        {readingMode ? <ReadingModeHeader chapter={chapter} view={readingView} defaultReciterId={getDefaultReciterId(resources)} /> : <header className="reader-header">
          <div><p className="eyebrow">Surah {String(chapter.id).padStart(3, "0")} · {chapter.revelationPlace}</p><h1>{chapter.transliteratedName || chapter.nameSimple}</h1><p className="reader-subtitle">{chapter.translatedName} · {chapter.versesCount} ayahs</p></div>
          <span
            className="chapter-icon reader-surah-icon"
            aria-label={`${chapter.transliteratedName || chapter.nameSimple} in Arabic`}
            data-chapter-icon={String(chapter.id).padStart(3, "0")}
            role="img"
            translate="no"
          />
        </header>}
        {chapter.bismillahPre ? <div className={`bismillah-divider${readingMode ? " reading-bismillah" : ""}`} aria-label="Opening of the Surah">
          {readingMode ? <><span className="bismillah-arabic" lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</span><small>In the Name of Allah—the Most Compassionate, Most Merciful</small></> : <span />}
        </div> : null}
        <ReaderClient key={`surah-${id}-${contentTranslationIds.join(",")}-${readingMode ? "reading" : "verse"}`} chapterId={id} totalVerses={chapter.versesCount} translationIds={contentTranslationIds} queueVerseKeys={Array.from({ length: chapter.versesCount }, (_, index) => `${id}:${index + 1}`)} verses={verses} tafsirs={resources.tafsirs} reciters={resources.reciters} defaultTafsirId={getDefaultTafsirId(resources)} defaultReciterId={getDefaultReciterId(resources)} readingMode={readingMode} readingView={readingMode ? readingView : "both"} />
        <nav className="reader-navigation" aria-label="Surah navigation">
          {previousChapter ? <Link href={`/surah/${previousChapter}`} className="button button-quiet"><ArrowLeft size={16} aria-hidden="true" /> Previous Surah</Link> : <span />}
          {nextChapter ? <Link href={`/surah/${nextChapter}`} className="button button-quiet">Next Surah <ArrowRight size={16} aria-hidden="true" /></Link> : <span />}
        </nav>
      </main>
    </>
  );
}
