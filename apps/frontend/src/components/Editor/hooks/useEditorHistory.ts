import { useState, useRef, useCallback, useEffect } from "react";
import type { Track, Overlay } from "../types";

export function useEditorHistory(
  tracks: Track[],
  overlays: Overlay[],
  setTracks: (tracks: Track[]) => void,
  setOverlays: (overlays: Overlay[]) => void
) {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const historyRef = useRef<{ tracks: Track[]; overlays: Overlay[] }[]>([]);
  const redoRef = useRef<{ tracks: Track[]; overlays: Overlay[] }[]>([]);
  const lastSnapshotRef = useRef<string>("");
  const lastStateRef = useRef<{ tracks: Track[]; overlays: Overlay[] }>({ tracks: [], overlays: [] });
  const isHistoryRestoreRef = useRef(false);

  const snapshotState = useCallback(
    (nextTracks: Track[], nextOverlays: Overlay[]) => JSON.stringify({ nextTracks, nextOverlays }),
    []
  );

  useEffect(() => {
    const nextSnapshot = snapshotState(tracks, overlays);
    if (!lastSnapshotRef.current) {
      lastSnapshotRef.current = nextSnapshot;
      return;
    }
    if (nextSnapshot === lastSnapshotRef.current) return;

    if (!isHistoryRestoreRef.current) {
      historyRef.current.push({
        tracks: JSON.parse(JSON.stringify(lastStateRef.current.tracks)),
        overlays: JSON.parse(JSON.stringify(lastStateRef.current.overlays)),
      });
      if (historyRef.current.length > 100) historyRef.current.shift();
      redoRef.current = [];
    }
    isHistoryRestoreRef.current = false;
    lastSnapshotRef.current = nextSnapshot;
    lastStateRef.current = {
      tracks: JSON.parse(JSON.stringify(tracks)),
      overlays: JSON.parse(JSON.stringify(overlays)),
    };
    setCanUndo(historyRef.current.length > 0);
    setCanRedo(redoRef.current.length > 0);
  }, [tracks, overlays, snapshotState]);

  const handleUndo = useCallback(() => {
    const prev = historyRef.current.pop();
    if (!prev) return;

    redoRef.current.push({
      tracks: JSON.parse(JSON.stringify(tracks)),
      overlays: JSON.parse(JSON.stringify(overlays)),
    });

    isHistoryRestoreRef.current = true;
    setTracks(prev.tracks);
    setOverlays(prev.overlays);
    setCanUndo(historyRef.current.length > 0);
    setCanRedo(redoRef.current.length > 0);
  }, [tracks, overlays, setTracks, setOverlays]);

  const handleRedo = useCallback(() => {
    const next = redoRef.current.pop();
    if (!next) return;

    historyRef.current.push({
      tracks: JSON.parse(JSON.stringify(tracks)),
      overlays: JSON.parse(JSON.stringify(overlays)),
    });

    isHistoryRestoreRef.current = true;
    setTracks(next.tracks);
    setOverlays(next.overlays);
    setCanUndo(historyRef.current.length > 0);
    setCanRedo(redoRef.current.length > 0);
  }, [tracks, overlays, setTracks, setOverlays]);

  const resetHistory = useCallback((initialTracks: Track[], initialOverlays: Overlay[]) => {
    historyRef.current = [];
    redoRef.current = [];
    lastSnapshotRef.current = snapshotState(initialTracks, initialOverlays);
    lastStateRef.current = {
      tracks: JSON.parse(JSON.stringify(initialTracks)),
      overlays: JSON.parse(JSON.stringify(initialOverlays)),
    };
    setCanUndo(false);
    setCanRedo(false);
  }, [snapshotState]);

  return { canUndo, canRedo, handleUndo, handleRedo, resetHistory };
}
