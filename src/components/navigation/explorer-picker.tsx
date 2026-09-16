"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, BookOpen, ChevronDown, Minus, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

import type { ChapterSummary } from "@/lib/quran/types";

export function ExplorerPicker({ chapters }: { chapters: ChapterSummary[] }) {
  const router = useRouter();
  const [chapterId, setChapterId] = useState(chapters[0]?.id ?? 1);
  const [verseNumber, setVerseNumber] = useState(1);
  const [surahQuery, setSurahQuery] = useState("");
  const [surahMenuOpen, setSurahMenuOpen] = useState(false);
  const [activeSurahIndex, setActiveSurahIndex] = useState(0);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const selectedChapter = useMemo(() => chapters.find((chapter) => chapter.id === chapterId) ?? chapters[0], [chapterId, chapters]);
  const filteredChapters = useMemo(() => {
    const normalized = surahQuery.trim().toLowerCase();
    if (!normalized) return chapters;
    return chapters.filter((chapter) =>
      [chapter.id, chapter.transliteratedName, chapter.nameSimple, chapter.translatedName]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [chapters, surahQuery]);

  useEffect(() => {
    function closeOnOutsidePointer(event: PointerEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setSurahMenuOpen(false);
        setSurahQuery("");
      }
    }
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, []);

  function changeChapter(nextChapterId: number) {
    const nextChapter = chapters.find((chapter) => chapter.id === nextChapterId);
    if (!nextChapter) return;
    setChapterId(nextChapterId);
    setVerseNumber(Math.min(verseNumber, nextChapter?.versesCount ?? 1));
    setSurahQuery("");
    setSurahMenuOpen(false);
    setActiveSurahIndex(0);
  }

  function handleSurahKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setSurahMenuOpen(false);
      setSurahQuery("");
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSurahMenuOpen(true);
      setActiveSurahIndex((index) => Math.min(index + 1, Math.max(filteredChapters.length - 1, 0)));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSurahMenuOpen(true);
      setActiveSurahIndex((index) => Math.max(index - 1, 0));
    }
    if (event.key === "Enter" && surahMenuOpen && filteredChapters[activeSurahIndex]) {
      event.preventDefault();
      changeChapter(filteredChapters[activeSurahIndex].id);
    }
  }

  function openAyah() {
    if (selectedChapter) router.push(`/ayah/${selectedChapter.id}:${verseNumber}`);
  }

  if (!selectedChapter) return null;

  return (
    <section className="explorer-picker" aria-labelledby="picker-title" ref={pickerRef}>
      <div className="picker-topline">
        <div className="picker-heading">
          <span className="picker-icon" aria-hidden="true"><SlidersHorizontal size={17} /></span>
          <div><p className="picker-kicker">Find your place</p><h2 id="picker-title">Choose a Surah and ayah.</h2></div>
        </div>
        <span className="picker-steps" aria-hidden="true"><b>01</b><span>/</span><span>02</span></span>
      </div>

      <div className="picker-fields">
        <div className="picker-field picker-surah">
          <span className="picker-label">Surah</span>
          <div className={`surah-combobox${surahMenuOpen ? " is-open" : ""}`}>
            <Search size={16} aria-hidden="true" className="surah-search-icon" />
            <input
              type="text"
              value={surahQuery}
              placeholder={`${selectedChapter.id}. ${selectedChapter.transliteratedName || selectedChapter.nameSimple}`}
              onChange={(event) => { setSurahQuery(event.target.value); setSurahMenuOpen(true); setActiveSurahIndex(0); }}
              onFocus={() => setSurahMenuOpen(true)}
              onKeyDown={handleSurahKeyDown}
              role="combobox"
              aria-label="Search and choose a Surah"
              aria-controls="surah-picker-list"
              aria-expanded={surahMenuOpen}
              aria-autocomplete="list"
              aria-activedescendant={surahMenuOpen && filteredChapters[activeSurahIndex] ? `surah-option-${filteredChapters[activeSurahIndex].id}` : undefined}
            />
            <button type="button" className="surah-menu-button" onClick={() => setSurahMenuOpen((open) => !open)} aria-label="Show Surah list" aria-expanded={surahMenuOpen}>
              <ChevronDown size={17} aria-hidden="true" />
            </button>
            {surahMenuOpen ? (
              <div className="surah-menu" id="surah-picker-list" role="listbox" aria-label="Surahs">
                <div className="surah-menu-meta"><span>{filteredChapters.length} {filteredChapters.length === 1 ? "Surah" : "Surahs"}</span><span>Search by name or number</span></div>
                {filteredChapters.length ? filteredChapters.map((chapter, index) => (
                  <button
                    type="button"
                    className={`surah-option${chapter.id === selectedChapter.id ? " is-selected" : ""}${index === activeSurahIndex ? " is-active" : ""}`}
                    id={`surah-option-${chapter.id}`}
                    key={chapter.id}
                    role="option"
                    aria-selected={chapter.id === selectedChapter.id}
                    onClick={() => changeChapter(chapter.id)}
                  >
                    <span className="surah-option-number">{String(chapter.id).padStart(2, "0")}</span>
                    <span className="chapter-icon surah-option-icon" aria-hidden="true" data-chapter-icon={String(chapter.id).padStart(3, "0")} translate="no" />
                    <span className="surah-option-copy"><strong>{chapter.transliteratedName || chapter.nameSimple}</strong><small>{chapter.translatedName} · {chapter.versesCount} ayahs</small></span>
                  </button>
                )) : <p className="surah-empty">No Surahs match “{surahQuery}”.</p>}
              </div>
            ) : null}
          </div>
        </div>

        <div className="picker-field picker-ayah">
          <div className="picker-field-head"><span className="picker-label">Ayah</span><span className="ayah-count"><b>{String(verseNumber).padStart(2, "0")}</b><small>of {selectedChapter.versesCount}</small></span></div>
          <div className="ayah-stepper">
            <button type="button" className="ayah-step-button" onClick={() => setVerseNumber((value) => Math.max(1, value - 1))} disabled={verseNumber <= 1} aria-label="Previous ayah"><Minus size={15} aria-hidden="true" /></button>
            <div className="ayah-current"><span>Ayah {verseNumber}</span><small>{selectedChapter.transliteratedName || selectedChapter.nameSimple}</small></div>
            <button type="button" className="ayah-step-button" onClick={() => setVerseNumber((value) => Math.min(selectedChapter.versesCount, value + 1))} disabled={verseNumber >= selectedChapter.versesCount} aria-label="Next ayah"><Plus size={15} aria-hidden="true" /></button>
          </div>
          <input className="ayah-range" type="range" min="1" max={selectedChapter.versesCount} value={verseNumber} onChange={(event) => setVerseNumber(Number(event.target.value))} aria-label={`Choose an ayah from 1 to ${selectedChapter.versesCount}`} />
          <div className="ayah-range-labels"><span>1</span><span>{selectedChapter.versesCount}</span></div>
        </div>
      </div>

      <div className="picker-preview">
        <span className="chapter-icon picker-preview-icon" aria-hidden="true" data-chapter-icon={String(selectedChapter.id).padStart(3, "0")} translate="no" />
        <span className="picker-preview-copy"><small>Selected destination</small><strong>{selectedChapter.transliteratedName || selectedChapter.nameSimple}</strong><span>{selectedChapter.translatedName} · {selectedChapter.revelationPlace}</span></span>
        <span className="picker-reference">{selectedChapter.id}:{verseNumber}</span>
      </div>

      <div className="picker-actions">
        <button type="button" className="button button-primary" onClick={openAyah}>Open ayah <b>{selectedChapter.id}:{verseNumber}</b> <ArrowRight size={16} aria-hidden="true" /></button>
        <button type="button" className="button button-quiet" onClick={() => router.push(`/surah/${selectedChapter.id}`)}><BookOpen size={16} aria-hidden="true" /> Read full Surah</button>
      </div>
      <p className="picker-hint"><span>Tip</span> Search “Baqarah” or drag the ayah slider to jump through the Surah.</p>
    </section>
  );
}
