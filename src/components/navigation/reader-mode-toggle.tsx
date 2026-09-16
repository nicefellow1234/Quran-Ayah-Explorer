"use client";

import { BookOpenText, List } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ReaderModeToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const readingMode = searchParams.get("mode") === "reading";

  function setMode(nextMode: "verse" | "reading") {
    const params = new URLSearchParams(searchParams.toString());
    if (nextMode === "reading") params.set("mode", "reading");
    else {
      params.delete("mode");
      params.delete("view");
    }
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }

  return (
    <div className="reader-mode-toggle" aria-label="Reading mode">
      <button type="button" className={!readingMode ? "is-active" : ""} onClick={() => setMode("verse")} aria-pressed={!readingMode} aria-label="Verse by verse mode">
        <List size={14} aria-hidden="true" />
        <span>Verse by Verse</span>
      </button>
      <button type="button" className={readingMode ? "is-active" : ""} onClick={() => setMode("reading")} aria-pressed={readingMode} aria-label="Reading">
        <BookOpenText size={14} aria-hidden="true" />
        <span>Reading</span>
      </button>
    </div>
  );
}
