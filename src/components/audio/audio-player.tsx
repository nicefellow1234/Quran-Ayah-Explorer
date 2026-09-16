"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";

import type { AudioSegment, ResourceOption } from "@/lib/quran/types";

type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "error";
type AudioPlayerContextValue = {
  currentVerse: string | null;
  status: PlayerStatus;
  queue: string[];
  reciterId?: number;
  currentTime: number;
  duration: number;
  audioSegments: AudioSegment[];
  autoPlayAll: boolean;
  setQueue: (queue: string[]) => void;
  setAutoPlayAll: (enabled: boolean) => void;
  playVerse: (verseKey: string, reciterId?: number) => Promise<void>;
  changeReciter: (reciterId: number) => Promise<void>;
  toggle: () => void;
  seek: (time: number) => void;
  next: () => void;
  previous: () => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestIdRef = useRef(0);
  const requestControllerRef = useRef<AbortController | null>(null);
  const playVerseRef = useRef<(verseKey: string, reciterId?: number) => Promise<void>>(async () => undefined);
  const queueRef = useRef<string[]>([]);
  const currentVerseRef = useRef<string | null>(null);
  const autoPlayAllRef = useRef(false);
  const [currentVerse, setCurrentVerse] = useState<string | null>(null);
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [queue, setQueueState] = useState<string[]>([]);
  const [reciterId, setReciterId] = useState<number>();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioSegments, setAudioSegments] = useState<AudioSegment[]>([]);
  const [autoPlayAll, setAutoPlayAllState] = useState(false);

  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { currentVerseRef.current = currentVerse; }, [currentVerse]);
  useEffect(() => { autoPlayAllRef.current = autoPlayAll; }, [autoPlayAll]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    const handleEnded = () => {
      const current = currentVerseRef.current;
      const currentIndex = current ? queueRef.current.indexOf(current) : -1;
      const nextVerse = currentIndex >= 0 ? queueRef.current[currentIndex + 1] : undefined;
      if (autoPlayAllRef.current && nextVerse) {
        void playVerseRef.current(nextVerse);
        return;
      }
      setStatus("paused");
    };
    const handleError = () => setStatus("error");
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleDurationChange);
    audio.addEventListener("durationchange", handleDurationChange);
    audioRef.current = audio;
    return () => {
      requestControllerRef.current?.abort();
      requestIdRef.current += 1;
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleDurationChange);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  const playVerse = useCallback(async (verseKey: string, nextReciterId?: number) => {
    const chosenReciter = nextReciterId ?? reciterId;
    if (!chosenReciter) {
      setStatus("error");
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    requestControllerRef.current?.abort();
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    audio.pause();
    audio.currentTime = 0;
    audio.removeAttribute("src");
    audio.load();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    setStatus("loading");
    setCurrentVerse(verseKey);
    setReciterId(chosenReciter);
    setCurrentTime(0);
    setDuration(0);
    setAudioSegments([]);
    try {
      const response = await fetch(`/api/audio?verseKey=${encodeURIComponent(verseKey)}&recitationId=${chosenReciter}`, { signal: controller.signal });
      if (!response.ok) throw new Error("Audio request failed");
      const data = await response.json() as { audioUrl: string; segments?: AudioSegment[] };
      if (requestId !== requestIdRef.current) return;
      audio.src = data.audioUrl;
      setAudioSegments(data.segments ?? []);
      await audio.play();
      if (requestId !== requestIdRef.current) return;
      setStatus("playing");
    } catch {
      if (controller.signal.aborted) return;
      setStatus("error");
    }
  }, [reciterId]);

  const changeReciter = useCallback(async (nextReciterId: number) => {
    setReciterId(nextReciterId);
    const verse = currentVerseRef.current;
    if (verse) await playVerse(verse, nextReciterId);
  }, [playVerse]);

  useEffect(() => { playVerseRef.current = playVerse; }, [playVerse]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentVerse) return;
    if (status === "playing") {
      audio.pause();
      setStatus("paused");
    } else {
      void audio.play().then(() => setStatus("playing")).catch(() => setStatus("error"));
    }
  }, [currentVerse, status]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(time)) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const move = useCallback((delta: number) => {
    const index = currentVerse ? queue.indexOf(currentVerse) : -1;
    const nextIndex = index + delta;
    if (nextIndex >= 0 && nextIndex < queue.length) void playVerse(queue[nextIndex]);
  }, [currentVerse, queue, playVerse]);

  const setQueue = useCallback((nextQueue: string[]) => {
    setQueueState((previous) => previous.join("|") === nextQueue.join("|") ? previous : nextQueue);
  }, []);

  const setAutoPlayAll = useCallback((enabled: boolean) => {
    setAutoPlayAllState(enabled);
  }, []);

  const value = useMemo<AudioPlayerContextValue>(() => ({
    currentVerse,
    status,
    queue,
    reciterId,
    currentTime,
    duration,
    audioSegments,
    autoPlayAll,
    setQueue,
    setAutoPlayAll,
    playVerse,
    changeReciter,
    toggle,
    seek,
    next: () => move(1),
    previous: () => move(-1),
  }), [currentVerse, status, queue, reciterId, currentTime, duration, audioSegments, autoPlayAll, setQueue, setAutoPlayAll, playVerse, changeReciter, toggle, seek, move]);

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) throw new Error("useAudioPlayer must be used inside AudioPlayerProvider");
  return context;
}

export function AudioDock({ reciters, defaultReciterId }: { reciters: ResourceOption[]; defaultReciterId?: number }) {
  const player = useAudioPlayer();
  const activeReciterId = player.reciterId;
  const changeReciter = player.changeReciter;
  const hasInitializedReciter = useRef(false);
  const [selectedReciter, setSelectedReciter] = useState(defaultReciterId);
  const [availability, setAvailability] = useState<{
    key: string;
    status: "ready" | "error";
    reciterIds: number[];
  } | null>(null);
  const recitationIds = useMemo(() => reciters.map((reciter) => reciter.id).join(","), [reciters]);
  const availabilityKey = player.currentVerse ? `${player.currentVerse}|${recitationIds}` : "";

  useEffect(() => {
    if (hasInitializedReciter.current) return;
    hasInitializedReciter.current = true;
    const stored = Number(window.localStorage.getItem("ayah-explorer.reciter"));
    const valid = stored && reciters.some((reciter) => reciter.id === stored) ? stored : defaultReciterId;
    const timer = window.setTimeout(() => setSelectedReciter(valid), 0);
    if (valid && valid !== activeReciterId) void changeReciter(valid);
    return () => window.clearTimeout(timer);
  }, [defaultReciterId, reciters, activeReciterId, changeReciter]);

  useEffect(() => {
    if (selectedReciter) window.localStorage.setItem("ayah-explorer.reciter", String(selectedReciter));
  }, [selectedReciter]);

  useEffect(() => {
    if (!player.currentVerse || !recitationIds) return;

    const controller = new AbortController();
    void fetch(`/api/audio/availability?verseKey=${encodeURIComponent(player.currentVerse)}&recitationIds=${encodeURIComponent(recitationIds)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Audio availability request failed");
        return response.json() as Promise<{ availableRecitationIds: number[] }>;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        setAvailability({ key: availabilityKey, status: "ready", reciterIds: data.availableRecitationIds });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setAvailability({ key: availabilityKey, status: "error", reciterIds: [] });
        }
      });

    return () => controller.abort();
  }, [availabilityKey, player.currentVerse, recitationIds]);

  const availabilityStatus = availability?.key === availabilityKey ? availability.status : player.currentVerse ? "loading" : "idle";
  const availableReciterIds = useMemo(
    () => availability?.key === availabilityKey ? availability.reciterIds : [],
    [availability, availabilityKey],
  );

  const availableReciters = useMemo(
    () => reciters.filter((reciter) => availableReciterIds.includes(reciter.id)),
    [availableReciterIds, reciters],
  );

  useEffect(() => {
    if (availabilityStatus !== "ready" || !availableReciters.length || !player.currentVerse) return;
    if (player.reciterId && availableReciterIds.includes(player.reciterId)) return;
    const nextReciterId = availableReciters[0]?.id;
    if (!nextReciterId) return;
    void changeReciter(nextReciterId);
  }, [availabilityStatus, availableReciterIds, availableReciters, changeReciter, player.currentVerse, player.reciterId]);

  if (!player.currentVerse) return null;

  const formatTime = (value: number) => {
    if (!Number.isFinite(value) || value <= 0) return "0:00";
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  async function handleReciterChange(nextReciterId: number) {
    setSelectedReciter(nextReciterId);
    await player.changeReciter(nextReciterId);
  }

  const selectedReciterValue = availableReciters.some((reciter) => reciter.id === selectedReciter)
    ? selectedReciter
    : availableReciters[0]?.id ?? "";

  return (
    <aside className="audio-dock" aria-label="Audio player" aria-busy={player.status === "loading"}>
      <div className="audio-dock-info">
        <span className="audio-icon-badge"><Volume2 size={16} aria-hidden="true" /></span>
        <span><strong>{player.currentVerse}</strong><small>{player.status === "loading" ? "Preparing recitation…" : player.status === "error" ? "Audio unavailable" : "Ayah recitation"}</small></span>
      </div>
      <span className="audio-dock-divider" aria-hidden="true" />
      <div className="audio-controls">
        <button type="button" className="audio-skip-button" onClick={player.previous} aria-label="Play previous ayah"><SkipBack size={16} aria-hidden="true" /></button>
        <button type="button" className="audio-play-button" onClick={player.toggle} aria-label={player.status === "playing" ? "Pause recitation" : "Resume recitation"}>
          {player.status === "playing" ? <Pause size={18} fill="currentColor" aria-hidden="true" /> : <Play size={18} fill="currentColor" aria-hidden="true" />}
        </button>
        <button type="button" className="audio-skip-button" onClick={player.next} aria-label="Play next ayah"><SkipForward size={16} aria-hidden="true" /></button>
      </div>
      <div className="audio-seek-wrap">
        <input
          className="audio-seek"
          type="range"
          min="0"
          max={Math.max(player.duration, 0.1)}
          step="0.1"
          value={Math.min(player.currentTime, Math.max(player.duration, 0.1))}
          style={{ "--audio-progress": `${player.duration ? Math.min((player.currentTime / player.duration) * 100, 100) : 0}%` } as CSSProperties}
          onChange={(event) => player.seek(Number(event.target.value))}
          disabled={!player.duration}
          aria-label={`Seek ${player.currentVerse} recitation`}
        />
        <span className="audio-time" aria-live="off">{formatTime(player.currentTime)} / {formatTime(player.duration)}</span>
      </div>
      <label className="audio-reciter">
        <span className="sr-only">Reciter</span>
        <select value={selectedReciterValue} onChange={(event) => void handleReciterChange(Number(event.target.value))} aria-label="Choose reciter" disabled={availabilityStatus !== "ready" || !availableReciters.length}>
          {availabilityStatus === "loading" ? <option value="">Finding available reciters…</option> : null}
          {availabilityStatus === "error" ? <option value="">Reciters unavailable</option> : null}
          {availabilityStatus === "ready" && !availableReciters.length ? <option value="">No audio available</option> : null}
          {availableReciters.map((reciter) => <option key={reciter.id} value={reciter.id}>{reciter.name}</option>)}
        </select>
      </label>
      <label className="audio-autoplay" title="Play every ayah in this Surah continuously">
        <input type="checkbox" checked={player.autoPlayAll} onChange={(event) => player.setAutoPlayAll(event.target.checked)} />
        <span className="audio-autoplay-switch" aria-hidden="true" />
        <span className="audio-autoplay-copy"><strong>Auto-play all</strong><small>Continuous tilawat</small></span>
      </label>
    </aside>
  );
}
