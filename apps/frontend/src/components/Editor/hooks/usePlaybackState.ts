import { useCallback, useRef } from "react";
import type { Track, Asset, Clip } from "../types";
import { getOrderedClips, mapTimelineToSourceTime } from "../helpers";

export function usePlaybackState(
  tracks: Track[],
  assetsById: Record<string, Asset>,
  activeAssetId: string | null,
  setActiveAssetId: (id: string | null) => void,
  setSourceUrl: (url: string) => void,
  setTimelineTime: (time: number) => void,
  setVideoTime: (time: number) => void,
  setIsPlaying: (playing: boolean | ((prev: boolean) => boolean)) => void
) {
  const lastClipIdRef = useRef<string | null>(null);
  const isSeekingRef = useRef(false);
  const seekTargetRef = useRef<number | null>(null);

  const findClipAtTimelineTime = useCallback((timeMs: number): Clip | null => {
    for (const track of tracks) {
      for (const clip of track.clips) {
        const start = clip.timelineStartMs;
        const end = start + clip.durationMs;
        if (timeMs >= start && timeMs < end) return clip;
      }
    }
    return null;
  }, [tracks]);

  const handleSeek = useCallback((timeMs: number) => {
    isSeekingRef.current = true;
    setTimelineTime(timeMs);
    const clip = findClipAtTimelineTime(timeMs);
    if (clip) {
      const offset = timeMs - clip.timelineStartMs;
      const mapped = clip.sourceStartMs + offset;
      seekTargetRef.current = mapped;
      setVideoTime(mapped);
      const clipAsset = assetsById[clip.sourceAssetId];
      if (clipAsset?.url && clipAsset.id !== activeAssetId) {
        setActiveAssetId(clipAsset.id);
        setSourceUrl(clipAsset.url);
      }
      return;
    }
    const mapped = mapTimelineToSourceTime(tracks, timeMs);
    seekTargetRef.current = mapped;
    setVideoTime(mapped);
  }, [tracks, findClipAtTimelineTime, assetsById, activeAssetId, setTimelineTime, setVideoTime, setActiveAssetId, setSourceUrl]);

  const handleTimeUpdate = useCallback((videoTimeMs: number) => {
    if (isSeekingRef.current) {
      if (seekTargetRef.current !== null && Math.abs(videoTimeMs - seekTargetRef.current) < 100) {
        isSeekingRef.current = false;
        seekTargetRef.current = null;
      }
      return;
    }
    setVideoTime(videoTimeMs);

    const currentClip = tracks
      .flatMap((t) => t.clips)
      .find((clip) =>
        clip.sourceAssetId === activeAssetId &&
        videoTimeMs >= clip.sourceStartMs &&
        videoTimeMs < clip.sourceStartMs + clip.durationMs
      );

    if (currentClip) {
      const timeline = currentClip.timelineStartMs + (videoTimeMs - currentClip.sourceStartMs);
      setTimelineTime(timeline);
    } else {
      const mappedTimelineTime = mapTimelineToSourceTime(tracks, videoTimeMs);
      setTimelineTime(mappedTimelineTime);
    }

    if (!currentClip) return;

    const clipId = currentClip.id ?? currentClip.sourceAssetId;

    if (lastClipIdRef.current !== clipId) {
      lastClipIdRef.current = clipId;
    }

    const clipEnd = currentClip.sourceStartMs + currentClip.durationMs;
    const TRANSITION_BUFFER = 50;

    if (
      videoTimeMs >= clipEnd - TRANSITION_BUFFER &&
      lastClipIdRef.current === clipId
    ) {
      const clips = getOrderedClips(tracks);
      const currentIndex = clips.findIndex(
        (c) => (c.id ?? c.sourceAssetId) === (currentClip.id ?? currentClip.sourceAssetId)
      );
      const nextClip = clips[currentIndex + 1];

      lastClipIdRef.current = null;
      if (nextClip) {
        const nextAsset = assetsById[nextClip.sourceAssetId];
        if (nextAsset?.url) {
          setActiveAssetId(nextAsset.id);
          setSourceUrl(nextAsset.url);
        }
        setVideoTime(nextClip.sourceStartMs);
        setTimelineTime(nextClip.timelineStartMs);
      } else {
        setIsPlaying(false);
      }
    }
  }, [tracks, activeAssetId, assetsById, setVideoTime, setTimelineTime, setActiveAssetId, setSourceUrl, setIsPlaying]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, [setIsPlaying]);

  const handlePlayStateChange = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, [setIsPlaying]);

  return {
    handleSeek,
    handleTimeUpdate,
    handlePlayPause,
    handlePlayStateChange,
    findClipAtTimelineTime,
  };
}
