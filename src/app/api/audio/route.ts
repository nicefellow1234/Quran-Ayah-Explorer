import { NextRequest, NextResponse } from "next/server";

import { getVerseAudio } from "@/lib/quran/audio";
import { QuranApiError } from "@/lib/quran/errors";
import { parseOptionalResourceId, parseVerseKey } from "@/lib/quran/validation";

export async function GET(request: NextRequest) {
  const verseKey = request.nextUrl.searchParams.get("verseKey") ?? "";
  const recitationId = parseOptionalResourceId(request.nextUrl.searchParams.get("recitationId") ?? undefined);
  if (!recitationId) return NextResponse.json({ message: "A recitation is required." }, { status: 400 });
  try {
    parseVerseKey(verseKey);
    const result = await getVerseAudio(verseKey, recitationId);
    return NextResponse.json(result, { headers: { "Cache-Control": "private, max-age=3600" } });
  } catch (error) {
    const status = error instanceof QuranApiError && error.status === 404 ? 404 : 502;
    return NextResponse.json({ message: error instanceof Error ? error.message : "Audio unavailable." }, { status });
  }
}
