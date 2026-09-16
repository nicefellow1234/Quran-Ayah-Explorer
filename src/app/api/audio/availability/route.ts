import { NextRequest, NextResponse } from "next/server";

import { getAvailableVerseRecitationIds } from "@/lib/quran/audio";
import { QuranApiError } from "@/lib/quran/errors";
import { parseOptionalResourceId, parseVerseKey } from "@/lib/quran/validation";

export async function GET(request: NextRequest) {
  const verseKey = request.nextUrl.searchParams.get("verseKey") ?? "";
  const recitationIds = (request.nextUrl.searchParams.get("recitationIds") ?? "")
    .split(",")
    .map((value) => parseOptionalResourceId(value))
    .filter((value, index, values): value is number => typeof value === "number" && values.indexOf(value) === index)
    .slice(0, 100);

  if (!recitationIds.length) {
    return NextResponse.json({ message: "At least one recitation is required." }, { status: 400 });
  }

  try {
    parseVerseKey(verseKey);
    const availableRecitationIds = await getAvailableVerseRecitationIds(verseKey, recitationIds);
    return NextResponse.json(
      { availableRecitationIds },
      { headers: { "Cache-Control": "private, max-age=3600" } },
    );
  } catch (error) {
    const status = error instanceof QuranApiError && error.status === 404 ? 404 : 502;
    return NextResponse.json({ message: error instanceof Error ? error.message : "Audio availability unavailable." }, { status });
  }
}
