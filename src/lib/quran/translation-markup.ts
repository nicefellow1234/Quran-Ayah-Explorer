import sanitizeHtml from "sanitize-html";

const allowedTranslationTags = ["br", "em", "i", "b", "strong", "sup", "sub"];

export function sanitizeTranslationMarkup(value: string) {
  const normalizedFootnotes = value.replace(/<sup\b[^>]*>([\s\S]*?)<\/sup>/gi, "<sup>$1</sup>");

  return sanitizeHtml(normalizedFootnotes, {
    allowedTags: allowedTranslationTags,
    allowedAttributes: {},
  });
}
