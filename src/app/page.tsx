import type { Metadata } from "next";
import Link from "next/link";

import { SetupCard } from "@/components/feedback/setup-card";
import { SiteHeader } from "@/components/layout/site-header";
import { JumpForm } from "@/components/navigation/jump-form";
import { ExplorerPicker } from "@/components/navigation/explorer-picker";
import { ChapterDirectory } from "@/components/quran/chapter-directory";
import { getChapters } from "@/lib/quran/chapters";
import { isQuranConfigured } from "@/lib/quran/client";

export const metadata: Metadata = { title: "Ayah Explorer — Explore the Quran" };

export default async function Home() {
  const chapters = await getChapters();
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero shell">
          <div className="hero-copy">
            <p className="eyebrow">Ayah Explorer · Quran study space</p>
            <h1>Explore the Quran.</h1>
            <p className="hero-subtitle">Read, listen and reflect with Arabic, translation, tafsir, and recitation — all in one calm place.</p>
            {isQuranConfigured && chapters.length > 0 ? <ExplorerPicker chapters={chapters} /> : <><JumpForm /><p className="hero-hint">Jump to a Surah number or a verse like <span>2:255</span>.</p></>}
            {isQuranConfigured && chapters.length > 0 ? <div className="hero-highlights" aria-label="Quran features">
              <span><strong>{chapters.length}</strong><small>Surahs</small></span>
              <span><strong>2</strong><small>Translations</small></span>
              <span><strong>▶</strong><small>Continuous tilawat</small></span>
              <span><strong>∞</strong><small>Reflections</small></span>
            </div> : null}
            {isQuranConfigured && chapters.length > 0 ? <p className="hero-tilawat-hint"><span aria-hidden="true">▶</span> Play an ayah, then turn on <strong>Auto-play all</strong> to continue through the Surah.</p> : null}
          </div>
        </section>
        <section className="shell home-content">{!isQuranConfigured ? <SetupCard /> : <ChapterDirectory chapters={chapters} />}</section>
      </main>
      <footer className="site-footer shell"><span>Powered by Quran.Foundation</span><span>Made for quiet, focused reading. <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></span></footer>
    </>
  );
}
