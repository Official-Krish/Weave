import { useCallback } from "react";
import type { Track, Clip } from "../types";
import { splitClipAtTime } from "../helpers";

export function useTrackOperations(
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>,
  setSplitMode: React.Dispatch<React.SetStateAction<boolean>>
) {
  const handleUpdateClip = useCallback((trackIndex: number, clipId: string, updates: Partial<Clip>) => {
    setTracks((prev) =>
      prev.map((track, i) => {
        if (i !== trackIndex) return track;
        return {
          ...track,
          clips: track.clips.map((c) =>
            c.id === clipId ? { ...c, ...updates } : c
          ),
        };
      })
    );
  }, [setTracks]);

  const handleDeleteClip = useCallback((trackIndex: number, clipId: string) => {
    setTracks((prev) =>
      prev.map((track, i) => {
        if (i !== trackIndex) return track;
        return { ...track, clips: track.clips.filter((c) => c.id !== clipId) };
      })
    );
  }, [setTracks]);

  const handleUpdateTrack = useCallback((trackIndex: number, updates: Partial<Track>) => {
    setTracks((prev) =>
      prev.map((track, i) => (i === trackIndex ? { ...track, ...updates } : track))
    );
  }, [setTracks]);

  const handleSplitClip = useCallback((trackIndex: number, clipId: string, splitAtMs: number) => {
    setTracks((prevTracks) =>
      prevTracks.map((track, i) => {
        if (i !== trackIndex) return track;
        const updated: Clip[] = [];
        for (const clip of track.clips) {
          const id = clip.id ?? clip.sourceAssetId;
          if (id !== clipId) {
            updated.push(clip);
            continue;
          }
          const split = splitClipAtTime({ ...clip, id }, splitAtMs, 500);
          if (!split) {
            updated.push(clip);
            continue;
          }
          updated.push(split[0], split[1]);
        }
        return { ...track, clips: updated };
      })
    );
    setSplitMode(false);
  }, [setTracks, setSplitMode]);

  return {
    handleUpdateClip,
    handleDeleteClip,
    handleUpdateTrack,
    handleSplitClip,
  };
}
