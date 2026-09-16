import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { ChapterSummary } from "@/lib/quran/types";

export function ChapterCard({ chapter }: { chapter: ChapterSummary }) {
  return (
    <Link href={`/surah/${chapter.id}`} className="chapter-card">
      <span className="chapter-number">{String(chapter.id).padStart(2, "0")}</span>
      <span className="chapter-card-main">
        <span className="chapter-name">{chapter.transliteratedName || chapter.nameSimple}</span>
        <span className="chapter-translation">{chapter.translatedName}</span>
        <span className="chapter-meta">{chapter.versesCount} ayahs · {chapter.revelationPlace}</span>
      </span>
      <span
        className="chapter-icon"
        aria-hidden="true"
        data-chapter-icon={String(chapter.id).padStart(3, "0")}
        translate="no"
      />
      <ArrowUpRight size={17} aria-hidden="true" className="chapter-arrow" />
    </Link>
  );
}
