import type { AudioSegment } from "./types";

export function getActiveAudioWordRange(segments: AudioSegment[], currentTimeSeconds: number): { from: number; to: number } | null {
  if (!Number.isFinite(currentTimeSeconds) || currentTimeSeconds < 0) return null;
  const currentTimeMs = currentTimeSeconds * 1000;
  const activeSegment = segments.find(([, , startTime, endTime]) => currentTimeMs >= startTime && currentTimeMs < endTime);
  return activeSegment ? { from: activeSegment[0], to: activeSegment[1] } : null;
}
