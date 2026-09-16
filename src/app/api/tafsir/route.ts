import { NextRequest, NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";

import { getVerseTafsir } from "@/lib/quran/verses";
import { QuranApiError } from "@/lib/quran/errors";
import { parseOptionalResourceId, parseVerseKey } from "@/lib/quran/validation";

const arabicLetterPattern = /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/g;
const arabicRunPattern = /([\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff](?:[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff\u064b-\u065f\u0670\u200c\u200d\u200f\u0660-\u0669\u06f0-\u06f9\s،؛؟…«»“”‘’'"()\[\]{}:;.!?\-–—]*[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff])?)?/g;

function countArabicLetters(value: string) {
  return value.match(arabicLetterPattern)?.length ?? 0;
}

function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ");
}

function decorateArabicTafsirHtml(html: string) {
  const withArabicBlocks = html.replace(/<(p|h2|h3|h4|blockquote)([^>]*)>([\s\S]*?)<\/\1>/gi, (full, tag: string, attributes: string, inner: string) => {
    const plainText = stripTags(inner);
    const arabicCount = countArabicLetters(plainText);
    const latinCount = (plainText.match(/[A-Za-z]/g) ?? []).length;
    if (arabicCount < 6 || arabicCount < latinCount) return full;
    const cleanAttributes = attributes.replace(/\s(?:dir|lang|class)=(?:"[^"]*"|'[^']*')/gi, "");
    return `<${tag}${cleanAttributes} class="tafsir-arabic-block" lang="ar" dir="rtl">${inner}</${tag}>`;
  });

  return withArabicBlocks.replace(/(<[^>]+>)|([^<]+)/g, (full, tag: string | undefined, text: string | undefined) => {
    if (tag || !text || countArabicLetters(text) < 2) return full;
    return text.replace(arabicRunPattern, '<span class="tafsir-arabic-inline" lang="ar" dir="rtl">$1</span>');
  });
}

function formatTafsirHtml(text: string) {
  const safeText = sanitizeHtml(text, {
    allowedTags: ["p", "br", "em", "strong", "i", "b", "u", "s", "ul", "ol", "li", "blockquote", "h2", "h3", "h4", "hr", "sup", "sub", "a"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https"],
  });

  const formatted = /<(?:(?:p|br|h[2-4]|ul|ol|blockquote|hr)\b)/i.test(safeText)
    ? safeText
    : (safeText.split(/\r?\n\s*\r?\n/).map((paragraph) => paragraph.trim()).filter(Boolean).length
      ? safeText.split(/\r?\n\s*\r?\n/).map((paragraph) => paragraph.trim()).filter(Boolean).map((paragraph) => `<p>${paragraph.replace(/\r?\n/g, "<br />")}</p>`).join("")
      : `<p>${safeText.trim()}</p>`);
  return decorateArabicTafsirHtml(formatted);
}

export async function GET(request: NextRequest) {
  const verseKey = request.nextUrl.searchParams.get("verseKey") ?? "";
  const resourceId = parseOptionalResourceId(request.nextUrl.searchParams.get("resourceId") ?? undefined);
  if (!resourceId) return NextResponse.json({ message: "A tafsir resource is required." }, { status: 400 });
  try {
    parseVerseKey(verseKey);
    const result = await getVerseTafsir(verseKey, resourceId);
    const safeText = result.text ? formatTafsirHtml(result.text) : null;
    return NextResponse.json({ ...result, text: safeText }, { headers: { "Cache-Control": "private, max-age=3600" } });
  } catch (error) {
    const status = error instanceof QuranApiError && error.status === 404 ? 404 : 502;
    return NextResponse.json({ message: error instanceof Error ? error.message : "Tafsir unavailable." }, { status });
  }
}
