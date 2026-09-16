import { describe, expect, it } from "vitest";

import { getAdjacentVerseKeys } from "./navigation";
import { parseJumpInput, parseVerseKey } from "./validation";

describe("verse references", () => {
  it("parses a valid verse key", () => {
    expect(parseVerseKey("2:255")).toEqual({ chapter: 2, verse: 255 });
    expect(parseVerseKey("2%3A10")).toEqual({ chapter: 2, verse: 10 });
  });

  it.each(["115", "2:999", "abc", "2-"])("rejects invalid input %s", (value) => {
    expect(() => parseVerseKey(value)).toThrow();
  });

  it("supports direct jump navigation", () => {
    expect(parseJumpInput("2")).toEqual({ kind: "chapter", chapter: 2 });
    expect(parseJumpInput("36:1")).toEqual({ kind: "verse", chapter: 36, verse: 1 });
    expect(parseJumpInput("115")).toEqual({ kind: "invalid" });
  });
});

describe("ayah navigation", () => {
  it("handles the first ayah and the final ayah", () => {
    expect(getAdjacentVerseKeys(1, 1, 7)).toEqual({ previous: null, next: "1:2" });
    expect(getAdjacentVerseKeys(114, 6, 6)).toEqual({ previous: "114:5", next: null });
  });

  it("moves across Surah boundaries", () => {
    expect(getAdjacentVerseKeys(2, 1, 286).previous).toBe("1:1");
    expect(getAdjacentVerseKeys(2, 286, 286).next).toBe("3:1");
  });
});
