/**
 * useTransitions Hook
 * Manages transition state and operations for the editor
 */

import { useState, useCallback } from "react";
import type { Track, Clip, ClipTransition } from "../types";
import type { TransitionType } from "../transitions/types";
import { DEFAULT_TRANSITION_DURATION } from "../transitions/types";

interface UseTransitionsReturn {
  // Selected transition for editing
  selectedTransitionId: string | null;
  selectedTransitionLocation: { trackIndex: number; clipId: string; position: "start" | "end" } | null;

  // Actions
  setSelectedTransition: (trackIndex: number, clipId: string, position: "start" | "end") => void;
  clearSelectedTransition: () => void;

  // Transition operations
  addTransition: (
    trackIndex: number,
    clipId: string,
    position: "start" | "end",
    type: TransitionType
  ) => void;
  updateTransition: (
    trackIndex: number,
    clipId: string,
    position: "start" | "end",
    updates: Partial<ClipTransition>
  ) => void;
  removeTransition: (
    trackIndex: number,
    clipId: string,
    position: "start" | "end"
  ) => void;

  // Batch operations for undo/redo
  getTransitionState: () => { tracks: Track[] };
}

export function useTransitions(
  tracks: Track[],
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>
): UseTransitionsReturn {
  const [selectedTransitionLocation, setSelectedTransitionLocation] = useState<{
    trackIndex: number;
    clipId: string;
    position: "start" | "end";
  } | null>(null);

  const selectedTransitionId = selectedTransitionLocation
    ? `${selectedTransitionLocation.trackIndex}-${selectedTransitionLocation.clipId}-${selectedTransitionLocation.position}`
    : null;

  const setSelectedTransition = useCallback(
    (trackIndex: number, clipId: string, position: "start" | "end") => {
      setSelectedTransitionLocation({ trackIndex, clipId, position });
    },
    []
  );

  const clearSelectedTransition = useCallback(() => {
    setSelectedTransitionLocation(null);
  }, []);

  const addTransition = useCallback(
    (
      trackIndex: number,
      clipId: string,
      position: "start" | "end",
      type: TransitionType
    ) => {
      setTracks((prevTracks) =>
        prevTracks.map((track, idx) => {
          if (idx !== trackIndex) return track;

          return {
            ...track,
            clips: track.clips.map((clip) => {
              const id = clip.id ?? clip.sourceAssetId;
              if (id !== clipId) return clip;

              const transition: ClipTransition = {
                type,
                durationMs: DEFAULT_TRANSITION_DURATION,
                easing: "ease-in-out",
              };

              return {
                ...clip,
                [position === "start" ? "transitionStart" : "transitionEnd"]: transition,
              };
            }),
          };
        })
      );
    },
    [setTracks]
  );

  const updateTransition = useCallback(
    (
      trackIndex: number,
      clipId: string,
      position: "start" | "end",
      updates: Partial<ClipTransition>
    ) => {
      setTracks((prevTracks) =>
        prevTracks.map((track, idx) => {
          if (idx !== trackIndex) return track;

          return {
            ...track,
            clips: track.clips.map((clip) => {
              const id = clip.id ?? clip.sourceAssetId;
              if (id !== clipId) return clip;

              const currentTransition =
                position === "start" ? clip.transitionStart : clip.transitionEnd;

              if (!currentTransition) return clip;

              return {
                ...clip,
                [position === "start" ? "transitionStart" : "transitionEnd"]: {
                  ...currentTransition,
                  ...updates,
                },
              };
            }),
          };
        })
      );
    },
    [setTracks]
  );

  const removeTransition = useCallback(
    (trackIndex: number, clipId: string, position: "start" | "end") => {
      setTracks((prevTracks) =>
        prevTracks.map((track, idx) => {
          if (idx !== trackIndex) return track;

          return {
            ...track,
            clips: track.clips.map((clip) => {
              const id = clip.id ?? clip.sourceAssetId;
              if (id !== clipId) return clip;

              return {
                ...clip,
                [position === "start" ? "transitionStart" : "transitionEnd"]: undefined,
              };
            }),
          };
        })
      );
    },
    [setTracks]
  );

  const getTransitionState = useCallback(() => {
    return { tracks };
  }, [tracks]);

  return {
    selectedTransitionId,
    selectedTransitionLocation,
    setSelectedTransition,
    clearSelectedTransition,
    addTransition,
    updateTransition,
    removeTransition,
    getTransitionState,
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Helper functions
// ──────────────────────────────────────────────────────────────────────────

/**
 * Get the effective duration of a clip including transitions
 */
export function getClipEffectiveDuration(clip: Clip): number {
  const startTransitionDuration = clip.transitionStart?.durationMs || 0;
  const endTransitionDuration = clip.transitionEnd?.durationMs || 0;
  return clip.durationMs + startTransitionDuration + endTransitionDuration;
}

/**
 * Check if a clip has a transition at a given position
 */
export function hasTransition(clip: Clip, position: "start" | "end"): boolean {
  return position === "start" ? !!clip.transitionStart : !!clip.transitionEnd;
}

/**
 * Get transition type for a clip at a given position
 */
export function getTransitionType(
  clip: Clip,
  position: "start" | "end"
): TransitionType | undefined {
  const transition = position === "start" ? clip.transitionStart : clip.transitionEnd;
  return transition?.type;
}

/**
 * Validate that transitions don't overlap with clip duration
 */
export function validateTransitions(clip: Clip): { valid: boolean; error?: string } {
  const startDuration = clip.transitionStart?.durationMs || 0;
  const endDuration = clip.transitionEnd?.durationMs || 0;

  if (startDuration + endDuration > clip.durationMs) {
    return {
      valid: false,
      error: "Combined transition durations exceed clip duration",
    };
  }

  if (startDuration > clip.durationMs / 2) {
    return {
      valid: false,
      error: "Start transition duration exceeds half the clip duration",
    };
  }

  if (endDuration > clip.durationMs / 2) {
    return {
      valid: false,
      error: "End transition duration exceeds half the clip duration",
    };
  }

  return { valid: true };
}
