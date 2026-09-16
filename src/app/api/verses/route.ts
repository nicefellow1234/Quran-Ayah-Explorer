import { NextRequest, NextResponse } from "next/server";

import { getChapterVersesPage, VERSES_PAGE_SIZE } from "@/lib/quran/verses";
import { QuranApiError } from "@/lib/quran/errors";
import { parseChapterId, parseOptionalResourceId } from "@/lib/quran/validation";

export async function GET(request: NextRequest) {
  const chapterValue = request.nextUrl.searchParams.get("chapterId") ?? "";
  const pageValue = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const chapterId = parseOptionalResourceId(chapterValue);

  if (!chapterId || !Number.isInteger(pageValue) || pageValue < 1 || pageValue > 100) {
    return NextResponse.json({ message: "A valid chapter and page are required." }, { status: 400 });
  }

  try {
    const translationIds = (request.nextUrl.searchParams.get("translationIds") ?? "")
      .split(",")
      .map((value) => parseOptionalResourceId(value))
      .filter((value, index, values): value is number => typeof value === "number" && values.indexOf(value) === index);
    const verses = await getChapterVersesPage(parseChapterId(chapterId), translationIds, pageValue);
    return NextResponse.json({ verses, page: pageValue, pageSize: VERSES_PAGE_SIZE }, { headers: { "Cache-Control": "private, max-age=3600" } });
  } catch (error) {
    const status = error instanceof QuranApiError && error.status === 404 ? 404 : 502;
    return NextResponse.json({ message: error instanceof Error ? error.message : "Ayahs unavailable." }, { status });
  }
}
