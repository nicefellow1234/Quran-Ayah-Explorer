"use client";

import { useMemo, useState } from "react";
import type { ChapterSummary } from "@/lib/quran/types";

import { ChapterCard } from "./chapter-card";

export function ChapterDirectory({ chapters }: { chapters: ChapterSummary[] }) {
  const [query, setQuery] = useState("");
  const filteredChapters = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return chapters;
    return chapters.filter((chapter) =>
      [chapter.id, chapter.transliteratedName, chapter.nameSimple, chapter.translatedName]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [chapters, query]);

  return (
    <section className="directory-section" aria-labelledby="surah-directory-title">
      <div className="section-heading directory-heading">
        <div>
          <p className="eyebrow">The complete Quran</p>
          <h2 id="surah-directory-title">Browse all Surahs</h2>
        </div>
        <label className="directory-search">
          <span className="sr-only">Filter Surahs</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter by name or number" />
        </label>
      </div>
      {chapters.length > 0 && chapters.length < 114 ? <p className="access-notice">Quran.Foundation returned {chapters.length} Surahs for the current API environment. Full access will show all 114 Surahs here.</p> : null}
      {filteredChapters.length > 0 ? (
        <div className="chapter-grid">
          {filteredChapters.map((chapter) => <ChapterCard key={chapter.id} chapter={chapter} />)}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No Surahs match your search.</h3>
          <p>Try a number, transliterated name, or English name.</p>
        </div>
      )}
    </section>
  );
}
