import { describe, expect, it } from "vitest";

import { getActiveAudioWordRange } from "./audio-segments";

describe("audio word segments", () => {
  const segments = [[0, 1, 0, 420], [1, 3, 420, 980], [3, 4, 980, 1_400]] as [number, number, number, number][];

  it("finds the word range at the current playback time", () => {
    expect(getActiveAudioWordRange(segments, 0.2)).toEqual({ from: 0, to: 1 });
    expect(getActiveAudioWordRange(segments, 0.6)).toEqual({ from: 1, to: 3 });
  });

  it("moves to the next segment at a segment boundary", () => {
    expect(getActiveAudioWordRange(segments, 0.42)).toEqual({ from: 1, to: 3 });
  });

  it("returns no range outside timed audio", () => {
    expect(getActiveAudioWordRange(segments, 1.5)).toBeNull();
  });
});
