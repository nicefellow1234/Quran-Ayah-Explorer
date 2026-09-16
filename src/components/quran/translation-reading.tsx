import type { VerseViewModel } from "@/lib/quran/types";

import { sanitizeTranslationMarkup } from "@/lib/quran/translation-markup";

function isRightToLeft(languageName?: string) {
  const language = languageName?.trim().toLowerCase();
  return language === "arabic" || language === "urdu" || language === "persian" || language === "pashto";
}

export function TranslationReading({
  verses,
  translationId,
}: {
  verses: VerseViewModel[];
  translationId?: number;
}) {
  const firstTranslation = verses.flatMap((verse) => verse.translations)[0];
  const selectedLanguage = verses
    .flatMap((verse) => verse.translations)
    .find((translation) => translation.id === translationId)?.languageName
    ?? firstTranslation?.languageName;
  const isRtl = isRightToLeft(selectedLanguage);

  return (
    <section className={`reading-translation${isRtl ? " reading-translation-rtl" : ""}`} lang={isRtl ? "ur" : "en"} dir={isRtl ? "rtl" : "ltr"} aria-label="Translation reading">
      {verses.length > 0 ? (
        <p className="reading-translation-text">
          {verses.map((verse, index) => {
            const translation = verse.translations.find((item) => item.id === translationId) ?? verse.translations[0];
            if (!translation) return null;

            return (
              <span className="reading-translation-ayah" id={`ayah-${verse.verseKey.replace(":", "-")}`} key={verse.verseKey}>
                {index > 0 ? " " : null}
                <strong>{verse.verseNumber}.</strong>{" "}
                <span dangerouslySetInnerHTML={{ __html: sanitizeTranslationMarkup(translation.text) }} />
              </span>
            );
          })}
        </p>
      ) : <p className="empty-copy">Translation is unavailable for this ayah.</p>}
    </section>
  );
}
