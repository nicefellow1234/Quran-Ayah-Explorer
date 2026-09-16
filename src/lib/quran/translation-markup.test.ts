import { describe, expect, it } from "vitest";

import { sanitizeTranslationMarkup } from "./translation-markup";

describe("sanitizeTranslationMarkup", () => {
  it("turns Quran Foundation footnote markup into safe superscripts", () => {
    const result = sanitizeTranslationMarkup("In the name of Allāh,<sup foot_note=254011>1</sup> the Merciful.");

    expect(result).toBe("In the name of Allāh,<sup>1</sup> the Merciful.");
  });

  it("removes unsafe tags and attributes", () => {
    const result = sanitizeTranslationMarkup("Text <script>alert(1)</script><a href='https://example.com'>link</a>");

    expect(result).toBe("Text link");
  });
});
