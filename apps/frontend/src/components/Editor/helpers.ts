import type { Track } from "./types";

export function mapTimelineToSourceTime(
  tracks: Track[],
  timeMs: number
): number {
  for (const track of tracks) {
    for (const clip of track.clips) {
      const start = clip.timelineStartMs;
      const end = start + clip.durationMs;

      if (timeMs >= start && timeMs < end) {
        const offset = timeMs - start;
        return clip.sourceStartMs + offset;
      }
    }
  }

  return timeMs; 
}

export function mapSourceToTimelineTime(
  tracks: Track[],
  videoTimeMs: number
): number {
  for (const track of tracks) {
    for (const clip of track.clips) {
      const sourceStart = clip.sourceStartMs;
      const sourceEnd = sourceStart + clip.durationMs;

      if (videoTimeMs >= sourceStart && videoTimeMs < sourceEnd) {
        const offset = videoTimeMs - sourceStart;
        return clip.timelineStartMs + offset;
      }
    }
  }
  return videoTimeMs;
}

export function findClipByVideoTime(tracks: Track[], videoTime: number) {
  for (const track of tracks) {
    for (const clip of track.clips) {
      const start = clip.sourceStartMs;
      const end = start + clip.durationMs;

      if (videoTime >= start && videoTime < end) {
        return clip;
      }
    }
  }
  return null;
}

export function getOrderedClips(tracks: Track[]) {
  return tracks
    .flatMap(t => t.clips)
    .sort((a, b) => a.timelineStartMs - b.timelineStartMs);
}

export function getTrackColors(type: Track["type"]) {
  switch (type) {
    case "VIDEO":
      return {
        bg: "bg-[#3b82f6]/15",
        border: "border-[#3b82f6]/40",
        clip: "bg-[#3b82f6]/25 border-[#3b82f6]/50",
        clipSelected: "bg-[#3b82f6]/40 border-[#3b82f6]",
        label: "bg-[#3b82f6]/10 text-[#60a5fa]",
      };
    case "AUDIO":
      return {
        bg: "bg-[#22c55e]/15",
        border: "border-[#22c55e]/40",
        clip: "bg-[#22c55e]/25 border-[#22c55e]/50",
        clipSelected: "bg-[#22c55e]/40 border-[#22c55e]",
        label: "bg-[#22c55e]/10 text-[#4ade80]",
      };
    case "TEXT":
      return {
        bg: "bg-[#a855f7]/15",
        border: "border-[#a855f7]/40",
        clip: "bg-[#a855f7]/25 border-[#a855f7]/50",
        clipSelected: "bg-[#a855f7]/40 border-[#a855f7]",
        label: "bg-[#a855f7]/10 text-[#c084fc]",
      };
  }
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
}