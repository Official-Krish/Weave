import { useEffect, useRef, useState, useCallback, type ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import { editorApi } from "./api";
import type { EditorProject, Track, Overlay, Clip, ExportJob, Asset } from "./types";
import { Timeline } from "./Timeline";
import { Toolbar } from "./Toolbar";
import { ExportDialog } from "./ExportDialog";
import { Loader2, Film, Pencil, X } from "lucide-react";
import { getOrderedClips, mapTimelineToSourceTime, splitClipAtTime } from "./helpers";
import { CanvasPlayer, useCanvasVideo } from "./CanvasPlayer";


const EDITOR_CSS = `
  @keyframes editor-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes editor-slide-up {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes editor-pulse-soft {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  @keyframes editor-slide-shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

export function Editor() {
  const { meetingId } = useParams();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<EditorProject | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [durationMs, setDurationMs] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [exportJob, setExportJob] = useState<ExportJob | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sourceUrl, setSourceUrl] = useState<string>("");
  const [assetsById, setAssetsById] = useState<Record<string, Asset>>({});
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
  const [splitMode, setSplitMode] = useState(false);
  const [timelineTime, setTimelineTime] = useState(0);
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [videoTime, setVideoTime] = useState<number>(0);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  // Overlay interaction state (HTML-based, positioned over canvas)
  const overlayEditContainerRef = useRef<HTMLDivElement | null>(null);
  const stageWidth = project?.width || 1280;
  const stageHeight = project?.height || 720;
  const [transitionOpacity, setTransitionOpacity] = useState(1);
  const lastClipIdRef = useRef<string | null>(null);
  const isSeekingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 1280, height: 720 });
  const seekTargetRef = useRef<number | null>(null);
  const [editingOverlayId, setEditingOverlayId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [thumbnailsByAsset, setThumbnailsByAsset] = useState<Record<string, string[]>>({});
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyRef = useRef<{ tracks: Track[]; overlays: Overlay[] }[]>([]);
  const redoRef = useRef<{ tracks: Track[]; overlays: Overlay[] }[]>([]);
  const lastSnapshotRef = useRef<string>("");
  const lastStateRef = useRef<{ tracks: Track[]; overlays: Overlay[] }>({ tracks: [], overlays: [] });
  const isHistoryRestoreRef = useRef(false);

  const snapshotState = useCallback(
    (nextTracks: Track[], nextOverlays: Overlay[]) => JSON.stringify({ nextTracks, nextOverlays }),
    []
  );

  // Refs to hold callbacks (avoids TDZ since handleTimeUpdate/handlePlayStateChange
  // are declared later in the component via useCallback)
  const timeUpdateRef = useRef<((t: number) => void) | null>(null);
  const playStateChangeRef = useRef<((p: boolean) => void) | null>(null);

  // ─── Canvas-based video rendering ──────────────────────────────────
  const {
    videoRef,
    canvasRef,
    state: canvasState,
    actions: canvasActions,
    transform: canvasTransform,
  } = useCanvasVideo(sourceUrl, {
    currentTime: videoTime,
    isPlaying,
    onTimeUpdate: (t) => timeUpdateRef.current?.(t),
    onPlayStateChange: (p) => playStateChangeRef.current?.(p),
    overlays,
    timelineTimeMs: timelineTime,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setContainerSize({
        width: rect.width,
        height: rect.height,
      });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);



  useEffect(() => {
    async function initProject() {
      if (!meetingId) {
        console.error("No meetingId provided in URL");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { projectId } = await editorApi.createProject(meetingId, "FINAL");
        const projectData = await editorApi.getProject(projectId);

        setProject(projectData);
        setTracks(projectData.tracks || []);
        setOverlays(projectData.overlays || []);
        setDurationMs(projectData.durationMs || 0);
        const assetsMap = Object.fromEntries((projectData.assets || []).map((a) => [a.id, a]));
        setAssetsById(assetsMap);
        historyRef.current = [];
        redoRef.current = [];
        lastSnapshotRef.current = snapshotState(projectData.tracks || [], projectData.overlays || []);
        lastStateRef.current = {
          tracks: JSON.parse(JSON.stringify(projectData.tracks || [])),
          overlays: JSON.parse(JSON.stringify(projectData.overlays || [])),
        };
        setCanUndo(false);
        setCanRedo(false);

        const videoAsset = projectData.assets?.find((a) => a.assetType === "VIDEO");
        if (videoAsset?.url) {
          setSourceUrl(videoAsset.url);
          setActiveAssetId(videoAsset.id);
        }

        // Check if any VIDEO track already has clips
        const existingVideoTrack = (projectData.tracks || []).find((t) => t.type === "VIDEO");
        const hasClips = (projectData.tracks || []).some(
          (t) => t.type === "VIDEO" && t.clips && t.clips.length > 0
        );

        // Build clips for the video track if none exist yet (first time opening editor)
        if (!hasClips && videoAsset?.url) {
          // If the asset doesn't have durationMs, probe the actual video element
          let assetDuration = videoAsset.durationMs || projectData.durationMs || 0;

          if (assetDuration <= 0) {
            try {
              assetDuration = await new Promise<number>((resolve) => {
                const probe = document.createElement("video");
                probe.preload = "metadata";
                probe.src = videoAsset.url;
                probe.onloadedmetadata = () => {
                  const dur = Math.round((probe.duration || 1) * 1000);
                  resolve(dur);
                };
                probe.onerror = () => resolve(60000); // fallback 60s
              });
            } catch {
              assetDuration = 60000;
            }
          }

          const newClip = {
            id: crypto.randomUUID(),
            sourceAssetId: videoAsset.id,
            sourceStartMs: 0,
            timelineStartMs: 0,
            durationMs: assetDuration,
            name: "Recording",
          };

          if (existingVideoTrack) {
            // Track exists but has no clips — add a clip to it
            const updatedTracks = (projectData.tracks || []).map((t) =>
              t.id === existingVideoTrack.id
                ? { ...t, clips: [newClip] }
                : t
            );
            setTracks(updatedTracks);
          } else {
            // No VIDEO track at all — create one
            const defaultTrack: Track = {
              id: crypto.randomUUID(),
              type: "VIDEO",
              order: 0,
              visible: true,
              muted: false,
              volume: 100,
              clips: [newClip],
            };
            setTracks([...(projectData.tracks || []), defaultTrack]);
          }

          if (assetDuration > 0) setDurationMs(assetDuration);

          // Trigger thumbnail extraction now that we know the duration
          void extractThumbnailsForAsset(videoAsset.id, videoAsset.url, assetDuration);
        } else if (videoAsset?.url) {
          // Tracks with clips already exist — just extract thumbnails
          void extractThumbnailsForAsset(
            videoAsset.id,
            videoAsset.url,
            videoAsset.durationMs || projectData.durationMs || 0
          );
        }
      } catch (error) {
        console.error("Failed to initialize project:", error);
      } finally {
        setLoading(false);
      }
    }

    initProject();
  }, [meetingId]);

  // Extract thumbnails per asset (so each clip/split shows its own frames)
  const extractThumbnailsForAsset = useCallback(async (assetId: string, url: string, assetDurationMs: number) => {
    try {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.preload = "auto";
      video.muted = true;
      video.src = url;

      await new Promise<void>((resolve, reject) => {
        const onLoaded = () => { video.removeEventListener("loadedmetadata", onLoaded); video.removeEventListener("error", onError); resolve(); };
        const onError = () => { video.removeEventListener("loadedmetadata", onLoaded); video.removeEventListener("error", onError); reject(new Error("failed to load video metadata")); };
        video.addEventListener("loadedmetadata", onLoaded);
        video.addEventListener("error", onError);
      });

      const durSec = (assetDurationMs > 0 ? assetDurationMs : video.duration * 1000) / 1000;
      const canvas = document.createElement("canvas");
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const count = Math.min(40, Math.max(10, Math.floor(durSec * 1000 / 1500)));
      const thumbs: string[] = [];
      for (let i = 0; i < count; i += 1) {
        const t = durSec * (i / Math.max(1, count - 1));
        await new Promise<void>((resolve) => {
          const onSeeked = () => { video.removeEventListener("seeked", onSeeked); resolve(); };
          video.addEventListener("seeked", onSeeked, { once: true });
          video.currentTime = Math.max(0, Math.min(t, durSec - 0.05));
        });
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        thumbs.push(canvas.toDataURL("image/jpeg", 0.62));
      }
      setThumbnailsByAsset((prev) => ({ ...prev, [assetId]: thumbs }));
    } catch (error) {
      console.warn(`Thumbnail extraction failed for asset ${assetId}`, error);
    }
  }, []);

  // Extract thumbnails & waveform when assets change
  useEffect(() => {
    if (Object.keys(assetsById).length === 0) return;
    let cancelled = false;

    // Extract thumbnails for each video asset that doesn't already have them
    for (const asset of Object.values(assetsById)) {
      if (asset.assetType === "VIDEO" && !thumbnailsByAsset[asset.id] && asset.url) {
        if (!cancelled) {
          void extractThumbnailsForAsset(asset.id, asset.url, asset.durationMs || durationMs);
        }
      }
    }

    // Extract waveform from the primary source
    if (sourceUrl && durationMs > 0 && waveformData.length === 0) {
      const extractWaveform = async () => {
        try {
          const response = await fetch(sourceUrl);
          const data = await response.arrayBuffer();
          const audioCtx = new AudioContext();
          const audioBuffer = await audioCtx.decodeAudioData(data.slice(0));
          const channelData = audioBuffer.getChannelData(0);
          const bins = 240;
          const blockSize = Math.max(1, Math.floor(channelData.length / bins));
          const points = Array.from({ length: bins }, (_, i) => {
            const start = i * blockSize;
            const end = Math.min(channelData.length, start + blockSize);
            let sum = 0;
            for (let j = start; j < end; j += 1) sum += Math.abs(channelData[j]);
            return sum / Math.max(1, end - start);
          });
          const max = Math.max(...points, 0.0001);
          if (!cancelled) setWaveformData(points.map((p) => p / max));
          void audioCtx.close();
        } catch (error) {
          console.warn("Waveform extraction failed", error);
          if (!cancelled) setWaveformData([]);
        }
      };
      void extractWaveform();
    }

    return () => { cancelled = true; };
  }, [assetsById, sourceUrl, durationMs, thumbnailsByAsset, waveformData.length, extractThumbnailsForAsset]);

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

  // Auto-save on changes
  useEffect(() => {
    if (!project || !tracks.length) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaving(true);
        await editorApi.saveProject(project.id, {
          tracks,
          overlays,
          durationMs,
          fps: project.fps ?? 60,
          width: project.width ?? 1920,
          height: project.height ?? 1080,
        });
      } catch (error) {
        console.error("Failed to save project:", error);
      } finally {
        setSaving(false);
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [project, tracks, overlays, durationMs]);

  const handleDeleteOverlay = useCallback((overlayId: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== overlayId));
  }, []);

  const handleUpdateOverlay = useCallback((overlayId: string, updates: Partial<Overlay>) => {
    setOverlays((prev) =>
      prev.map((o) => (o.id === overlayId ? { ...o, ...updates } : o))
    );
  }, []);

  const handleAddOverlay = useCallback((overlay: Overlay) => {
    setOverlays((prev) => [...prev, overlay]);
  }, []);

  const findClipAtTimelineTime = useCallback((timeMs: number) => {
    for (const track of tracks) {
      for (const clip of track.clips) {
        const start = clip.timelineStartMs;
        const end = start + clip.durationMs;
        if (timeMs >= start && timeMs < end) return clip;
      }
    }
    return null;
  }, [tracks]);


  // Keyboard shortcuts for overlay manipulation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isTypingTarget =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (isTypingTarget || editingOverlayId) return;
      if (!selectedOverlayId) return;

      const overlay = overlays.find(o => o.id === selectedOverlayId);
      if (!overlay) return;

      const moveStep = e.shiftKey ? 10 : 2;

      // DELETE
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        handleDeleteOverlay(selectedOverlayId);
        return;
      }

      // ARROW KEYS
      let dx = 0;
      let dy = 0;

      if (e.key === "ArrowUp") dy = -moveStep;
      if (e.key === "ArrowDown") dy = moveStep;
      if (e.key === "ArrowLeft") dx = -moveStep;
      if (e.key === "ArrowRight") dx = moveStep;

      if (dx !== 0 || dy !== 0) {
        e.preventDefault();

        handleUpdateOverlay(selectedOverlayId, {
          transform: {
            x: overlay.transform.x + dx,
            y: overlay.transform.y + dy,
          },
        });
      }

      // DUPLICATE (Ctrl+D)
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();

        handleAddOverlay({
          ...overlay,
          id: crypto.randomUUID(),
          transform: {
            x: overlay.transform.x + 20,
            y: overlay.transform.y + 20,
          },
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedOverlayId,
    overlays,
    editingOverlayId,
    handleDeleteOverlay,
    handleUpdateOverlay,
    handleAddOverlay,
  ]);

  useEffect(() => {
    const onZoomHotkeys = (e: KeyboardEvent) => {
      const isMeta = e.ctrlKey || e.metaKey;
      if (isMeta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if (isMeta && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
        return;
      }
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key !== "+" && e.key !== "=" && e.key !== "-" && e.key !== "_") return;
      e.preventDefault();
      setTimelineZoom((prev) => {
        if (e.key === "+" || e.key === "=") return Math.min(6, +(prev + 0.25).toFixed(2));
        return Math.max(0.5, +(prev - 0.25).toFixed(2));
      });
    };

    window.addEventListener("keydown", onZoomHotkeys);
    return () => window.removeEventListener("keydown", onZoomHotkeys);
  }, [handleRedo, handleUndo]);

  function handleUndo() {
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
  }

  function handleRedo() {
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
  }



  const handleAddClip = useCallback((_trackIndex?: number) => {
    fileInputRef.current?.click();
  }, []);

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
  }, []);

  const handleDeleteClip = useCallback((trackIndex: number, clipId: string) => {
    setTracks((prev) =>
      prev.map((track, i) => {
        if (i !== trackIndex) return track;
        return { ...track, clips: track.clips.filter((c) => c.id !== clipId) };
      })
    );
  }, []);

  const handleUpdateTrack = useCallback((trackIndex: number, updates: Partial<Track>) => {
    setTracks((prev) =>
      prev.map((track, i) => (i === trackIndex ? { ...track, ...updates } : track))
    );
  }, []);

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
  }, []);

  // Split at the current playhead position — finds the clip under the
  // playhead and splits it into two clips (left: start→playhead, right: playhead→end)
  const handleSplitAtPlayhead = useCallback(() => {
    const currentMs = timelineTime;

    // Find which track/clip the playhead is over
    let foundTrackIndex = -1;
    let foundClipId = "";

    for (let i = 0; i < tracks.length; i++) {
      for (const clip of tracks[i].clips) {
        const start = clip.timelineStartMs;
        const end = start + clip.durationMs;
        if (currentMs > start && currentMs < end) {
          foundTrackIndex = i;
          foundClipId = clip.id ?? clip.sourceAssetId;
          break;
        }
      }
      if (foundTrackIndex >= 0) break;
    }

    if (foundTrackIndex < 0) return; // No clip under playhead

    // Pause playback during split
    setIsPlaying(false);

    handleSplitClip(foundTrackIndex, foundClipId, currentMs);
  }, [timelineTime, tracks, handleSplitClip]);

  const handleExport = async () => {
    if (!project) return;
    try {
      const job = await editorApi.exportProject(project.id);
      setExportJob(job);
      setShowExportDialog(true);
    } catch (error) {
      console.error("Failed to start export:", error);
    }
  };

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleClipFilePicked = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = "";
    if (!file || !project) return;

    // Probe the file for duration
    const objectUrl = URL.createObjectURL(file);
    const metaVideo = document.createElement("video");
    metaVideo.preload = "metadata";
    metaVideo.src = objectUrl;

    const duration = await new Promise<number>((resolve) => {
      metaVideo.onloadedmetadata = () => resolve(Math.round((metaVideo.duration || 1) * 1000));
      metaVideo.onerror = () => resolve(5000);
    });

    const isAudio = file.type.startsWith("audio/");

    // Upload file to backend so it gets a real DB asset ID
    let assetId: string;
    let assetUrl: string;
    try {
      const uploaded = await editorApi.uploadAsset(project.id, file, duration);
      assetId = uploaded.id;
      // Use the backend URL for persistence, but keep objectUrl for playback
      assetUrl = uploaded.url;
    } catch (error) {
      console.error("Failed to upload asset to backend:", error);
      // Fallback: use a local-only asset (save will fail for this clip)
      assetId = crypto.randomUUID();
      assetUrl = objectUrl;
    }

    const newAsset: Asset = {
      id: assetId,
      assetType: isAudio ? "AUDIO" : "VIDEO",
      url: objectUrl, // Use blob URL for local playback
      durationMs: duration,
    };
    setAssetsById((prev) => ({ ...prev, [assetId]: newAsset }));

    // Extract thumbnails for the new video asset
    if (!isAudio) {
      void extractThumbnailsForAsset(assetId, objectUrl, duration);
    }

    const GAP_MS = 500; // Gap between clips

    setTracks((prev) => {
      const trackType = isAudio ? "AUDIO" : "VIDEO";
      const existingTrack = prev.find((t) => t.type === trackType);

      if (existingTrack) {
        // Find the end of the last clip in this track
        const lastClipEnd = existingTrack.clips.reduce(
          (max, c) => Math.max(max, c.timelineStartMs + c.durationMs),
          0
        );
        const newClipStart = lastClipEnd > 0 ? lastClipEnd + GAP_MS : 0;

        return prev.map((track) => {
          if (track.id !== existingTrack.id) return track;
          return {
            ...track,
            clips: [
              ...track.clips,
              {
                id: crypto.randomUUID(),
                sourceAssetId: assetId,
                sourceStartMs: 0,
                timelineStartMs: newClipStart,
                durationMs: duration,
                name: file.name,
              },
            ],
          };
        });
      }

      // No track of this type exists — create one
      const maxOrder = prev.length > 0 ? Math.max(...prev.map((t) => t.order)) : -1;
      const newTrack: Track = {
        id: crypto.randomUUID(),
        type: trackType,
        order: maxOrder + 1,
        visible: true,
        muted: false,
        volume: 100,
        clips: [
          {
            id: crypto.randomUUID(),
            sourceAssetId: assetId,
            sourceStartMs: 0,
            timelineStartMs: 0,
            durationMs: duration,
            name: file.name,
          },
        ],
      };
      return [...prev, newTrack];
    });

    // Extend timeline duration to fit the new clip
    // Note: We compute the new clip's end directly instead of iterating
    // tracks (which would read the stale pre-setTracks value from closure)
    setDurationMs((prev) => {
      // The new clip was placed at newClipStart (or 0 for new tracks)
      const existingTrack = tracks.find((t) => t.type === (isAudio ? "AUDIO" : "VIDEO"));
      const lastClipEnd = existingTrack
        ? existingTrack.clips.reduce((max, c) => Math.max(max, c.timelineStartMs + c.durationMs), 0)
        : 0;
      const newClipStart = lastClipEnd > 0 ? lastClipEnd + GAP_MS : 0;
      const newClipEnd = newClipStart + duration;
      return Math.max(prev, newClipEnd) + 2000; // 2s buffer for scrolling
    });

    // Set as source only if no source exists yet
    if (!sourceUrl) {
      setSourceUrl(objectUrl);
      setActiveAssetId(assetId);
    }
  }, [sourceUrl, tracks, extractThumbnailsForAsset, project]);

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
  }, [tracks, findClipAtTimelineTime, assetsById, activeAssetId]);

  const handleTimeUpdate = useCallback((videoTimeMs: number) => {
    if (isSeekingRef.current) {
      if (seekTargetRef.current !== null && Math.abs(videoTimeMs - seekTargetRef.current) < 100) {
        isSeekingRef.current = false;
        seekTargetRef.current = null;
      }
      return;
    }
    setVideoTime(videoTimeMs);

    // Find the current clip being played across ALL tracks
    const currentClip = tracks
      .flatMap((t) => t.clips)
      .find((clip) =>
        clip.sourceAssetId === activeAssetId &&
        videoTimeMs >= clip.sourceStartMs &&
        videoTimeMs < clip.sourceStartMs + clip.durationMs
      );

    // Always update timeline time - even if no clip found (for scrubbing outside clips)
    if (currentClip) {
      const timeline = currentClip.timelineStartMs + (videoTimeMs - currentClip.sourceStartMs);
      setTimelineTime(timeline);
    } else {
      // Map video time to timeline time even when between clips
      const mappedTimelineTime = mapTimelineToSourceTime(tracks, videoTimeMs);
      setTimelineTime(mappedTimelineTime);
    }

    if (!currentClip) return;

    const clipId = currentClip.id ?? currentClip.sourceAssetId;

    // reset guard when clip changes
    if (lastClipIdRef.current !== clipId) {
      lastClipIdRef.current = clipId;
    }

    const clipEnd = currentClip.sourceStartMs + currentClip.durationMs;
    const TRANSITION_BUFFER = 50;
    const TRANSITION_DURATION = 300;

    const remaining = clipEnd - videoTimeMs;

    if (currentClip.transitionOut === "fade" && remaining < TRANSITION_DURATION) {
      setTransitionOpacity(Math.max(0, remaining / TRANSITION_DURATION));
    } else {
      setTransitionOpacity(1);
    }

    // only trigger ONCE per clip
    if (
      videoTimeMs >= clipEnd - TRANSITION_BUFFER &&
      lastClipIdRef.current === clipId
    ) {
      const clips = getOrderedClips(tracks);
      const currentIndex = clips.findIndex(
        c => (c.id ?? c.sourceAssetId) === (currentClip.id ?? currentClip.sourceAssetId)
      );
      const nextClip = clips[currentIndex + 1];

      // prevent re-trigger
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
  }, [tracks, activeAssetId, assetsById]);

  const handlePlayStateChange = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);

  // Wire up the callback refs for the canvas hook
  timeUpdateRef.current = handleTimeUpdate;
  playStateChangeRef.current = handlePlayStateChange;

  const handleStartTextEdit = (overlay: Overlay) => {
    setEditingOverlayId(overlay.id!);
    setEditText(overlay.content.text);
    setIsPlaying(false); // pause while editing
  };

  const handleCommitTextEdit = () => {
    if (editingOverlayId) {
      handleUpdateOverlay(editingOverlayId, {
        content: { text: editText },
      });
    }
    setEditingOverlayId(null);
    setEditText("");
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#f5a623]" />
          <p className="text-sm text-[#bfa873]">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-[#f5a623]/10 bg-[#0a0a08]/40 p-8">
        <Film className="h-12 w-12 text-[#f5a623]/40" />
        <p className="text-[#bfa873]">No project found</p>
      </div>
    );
  }

  return (
    <>
      <style>{EDITOR_CSS}</style>
      <div className="editor-root space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f5a623]">
              Video Editor
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#fff5de] sm:text-3xl">
              Edit Your Recording
            </h1>
            <p className="mt-1 max-w-xl text-sm text-[#bfa873]">
              Trim clips, add text overlays, and export your final video.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {saving && (
              <span className="flex items-center gap-1.5 text-xs text-[#bfa873]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f5a623]/40"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#f5a623]"></span>
                </span>
                Saving...
              </span>
            )}
          </div>
        </div>

        {/* Main editor area */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Video Preview */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-[#f5a623]/15 bg-[#0a0a08] shadow-[0_0_0_1px_rgba(245,166,35,0.06),0_16px_48px_rgba(0,0,0,0.5)]">
              {sourceUrl ? (
                <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden" style={{ opacity: transitionOpacity }}>
                  <CanvasPlayer
                    canvasRef={canvasRef}
                    videoRef={videoRef}
                    isLoaded={canvasState.isLoaded}
                    onClickToggle={handlePlayPause}
                    onDoubleClickFullscreen={() => canvasRef.current?.requestFullscreen?.()}
                  />

                  {/* HTML Overlay Interaction Layer — positioned over the canvas */}
                  <div ref={overlayEditContainerRef} className="absolute inset-0 pointer-events-none z-30">
                    {/* Overlay position indicators (visible overlays as draggable chips) */}
                    {overlays
                      .filter(
                        (o) =>
                          timelineTime >= o.timelineStartMs &&
                          timelineTime <= o.timelineStartMs + o.durationMs
                      )
                      .map((overlay) => {
                        if (!overlay.id) return null;
                        const scaleX = containerSize.width / stageWidth;
                        const scaleY = containerSize.height / stageHeight;
                        const isSelected = selectedOverlayId === overlay.id;

                        return (
                          <div
                            key={overlay.id}
                            className={`absolute pointer-events-auto cursor-move select-none transition-all duration-100
                              ${isSelected
                                ? "ring-2 ring-[#f5a623] ring-offset-1 ring-offset-transparent rounded"
                                : "hover:ring-1 hover:ring-[#f5a623]/40 rounded"
                              }`}
                            style={{
                              left: overlay.transform.x * scaleX,
                              top: overlay.transform.y * scaleY,
                              fontSize: (overlay.style?.fontSize || 24) * scaleX,
                              fontFamily: overlay.style?.fontFamily || "Inter, system-ui, sans-serif",
                              fontWeight: overlay.style?.fontWeight || "normal",
                              fontStyle: overlay.style?.fontStyle || "normal",
                              color: "transparent", // Text rendered on canvas; this is just a hit area
                              minWidth: 40 * scaleX,
                              minHeight: 20 * scaleY,
                              padding: "2px 4px",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOverlayId(overlay.id!);
                            }}
                            onDoubleClick={() => handleStartTextEdit(overlay)}
                            onMouseDown={(e) => {
                              if (editingOverlayId) return;
                              e.stopPropagation();
                              const startX = e.clientX;
                              const startY = e.clientY;
                              const origX = overlay.transform.x;
                              const origY = overlay.transform.y;

                              const handleMove = (moveE: MouseEvent) => {
                                const dx = (moveE.clientX - startX) / scaleX;
                                const dy = (moveE.clientY - startY) / scaleY;
                                handleUpdateOverlay(overlay.id!, {
                                  transform: {
                                    ...overlay.transform,
                                    x: Math.max(0, origX + dx),
                                    y: Math.max(0, origY + dy),
                                  },
                                });
                              };

                              const handleUp = () => {
                                window.removeEventListener("mousemove", handleMove);
                                window.removeEventListener("mouseup", handleUp);
                              };

                              window.addEventListener("mousemove", handleMove);
                              window.addEventListener("mouseup", handleUp);
                            }}
                          >
                            {/* Invisible text for sizing the hit area */}
                            <span style={{ visibility: "hidden", whiteSpace: "pre" }}>
                              {overlay.content.text}
                            </span>
                          </div>
                        );
                      })}

                    {/* Inline text editing input */}
                    {editingOverlayId && (() => {
                      const overlay = overlays.find(o => o.id === editingOverlayId);
                      if (!overlay) return null;

                      const scaleX = containerSize.width / stageWidth;
                      const scaleY = containerSize.height / stageHeight;

                      return (
                        <input
                          autoFocus
                          className="pointer-events-auto"
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          onBlur={handleCommitTextEdit}
                          onKeyDown={e => {
                            e.stopPropagation();
                            if (e.key === "Enter") handleCommitTextEdit();
                            if (e.key === "Escape") setEditingOverlayId(null);
                          }}
                          style={{
                            position: "absolute",
                            left: overlay.transform.x * scaleX,
                            top: overlay.transform.y * scaleY,
                            fontSize: (overlay.style?.fontSize || 24) * scaleX,
                            fontFamily: overlay.style?.fontFamily || "Inter, system-ui, sans-serif",
                            color: overlay.style?.color || "#ffffff",
                            background: "rgba(0,0,0,0.7)",
                            border: "2px solid #f5a623",
                            borderRadius: 6,
                            padding: "4px 8px",
                            outline: "none",
                            minWidth: 100,
                            zIndex: 60,
                            backdropFilter: "blur(8px)",
                          }}
                        />
                      );
                    })()}

                    {/* Selected overlay style toolbar */}
                    {selectedOverlayId && !editingOverlayId && (() => {
                      const overlay = overlays.find(o => o.id === selectedOverlayId);
                      if (!overlay) return null;
                      const scaleX = containerSize.width / stageWidth;
                      const scaleY = containerSize.height / stageHeight;
                      const toolbarLeft = overlay.transform.x * scaleX;
                      const toolbarTop = Math.max(8, overlay.transform.y * scaleY - 48);

                      return (
                        <div
                          className="absolute z-50 pointer-events-auto flex items-center gap-2 rounded-lg border border-[#f5a623]/30 bg-black/80 px-3 py-1.5 text-xs text-[#fff5de] shadow-xl backdrop-blur-md"
                          style={{
                            left: Math.min(toolbarLeft, containerSize.width - 300),
                            top: toolbarTop,
                          }}
                        >
                          <button
                            className={`rounded px-2 py-0.5 font-bold transition-colors ${overlay.style?.fontWeight === "bold" ? "bg-[#f5a623]/30 text-[#f5a623]" : "bg-[#f5a623]/10 hover:bg-[#f5a623]/20"}`}
                            onClick={() =>
                              handleUpdateOverlay(overlay.id, {
                                style: {
                                  ...overlay.style,
                                  fontWeight: overlay.style?.fontWeight === "bold" ? "normal" : "bold",
                                },
                              })
                            }
                          >
                            B
                          </button>
                          <button
                            className={`rounded px-2 py-0.5 italic transition-colors ${overlay.style?.fontStyle === "italic" ? "bg-[#f5a623]/30 text-[#f5a623]" : "bg-[#f5a623]/10 hover:bg-[#f5a623]/20"}`}
                            onClick={() =>
                              handleUpdateOverlay(overlay.id, {
                                style: {
                                  ...overlay.style,
                                  fontStyle: overlay.style?.fontStyle === "italic" ? "normal" : "italic",
                                },
                              })
                            }
                          >
                            I
                          </button>
                          <div className="h-4 w-px bg-[#f5a623]/20" />
                          <input
                            type="color"
                            value={overlay.style?.color || "#ffffff"}
                            onChange={(e) =>
                              handleUpdateOverlay(overlay.id, {
                                style: { ...overlay.style, color: e.target.value },
                              })
                            }
                            className="h-6 w-7 rounded border border-[#f5a623]/20 bg-transparent p-0 cursor-pointer"
                            title="Text color"
                          />
                          <div className="h-4 w-px bg-[#f5a623]/20" />
                          <input
                            type="range"
                            min={12}
                            max={96}
                            value={overlay.style?.fontSize || 24}
                            onChange={(e) =>
                              handleUpdateOverlay(overlay.id, {
                                style: { ...overlay.style, fontSize: Number(e.target.value) },
                              })
                            }
                            className="w-20 accent-[#f5a623]"
                            title="Font size"
                          />
                          <span className="text-[10px] text-[#8d7850] w-6 text-center">{overlay.style?.fontSize || 24}</span>
                          <div className="h-4 w-px bg-[#f5a623]/20" />
                          <select
                            value={overlay.style?.textAlign || "left"}
                            onChange={(e) =>
                              handleUpdateOverlay(overlay.id, {
                                style: {
                                  ...overlay.style,
                                  textAlign: e.target.value as "left" | "center" | "right",
                                },
                              })
                            }
                            className="rounded border border-[#f5a623]/20 bg-black/60 px-1.5 py-0.5 text-[11px] cursor-pointer"
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </select>
                          <div className="h-4 w-px bg-[#f5a623]/20" />
                          <button
                            className="rounded px-1.5 py-0.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            onClick={() => handleDeleteOverlay(overlay.id!)}
                            title="Delete overlay"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <Film className="h-10 w-10 text-[#f5a623]/30" />
                    <p className="text-sm text-[#bfa873]">No video source available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Overlays preview */}
            {overlays.length > 0 && (
              <div className="mt-3 rounded-xl border border-[#f5a623]/10 bg-[#0a0a08]/40 p-3">
                <p className="text-xs font-medium text-[#bfa873]">Active Overlays</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {overlays.map((overlay) => (
                    <div
                      key={overlay.id}
                      className="group flex items-center gap-2 rounded-full border border-[#f5a623]/15 bg-[#f5a623]/8 px-2.5 py-1.5 pr-2 text-xs text-[#f5a623] transition-all hover:border-[#f5a623]/30 hover:bg-[#f5a623]/12"
                    >
                      <Pencil className="h-3 w-3" />
                      <span className="max-w-37.5 truncate">{overlay.content.text}</span>
                      <button
                        onClick={() => handleDeleteOverlay(overlay.id!)}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Controls Panel */}
          <div>
            <Toolbar
              onExport={handleExport}
              isPlaying={isPlaying}
              currentTime={timelineTime}
              durationMs={durationMs}
              onSeek={handleSeek}
              saving={saving}
              tracks={tracks}
              onAddClip={() => fileInputRef.current?.click()}
              onAddOverlay={handleAddOverlay}
              onPlayPause={handlePlayPause}
              onSplitModeToggle={() => setSplitMode((prev) => !prev)}
              onSplitAtPlayhead={handleSplitAtPlayhead}
              splitMode={splitMode}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
              timelineZoom={timelineZoom}
              onZoomIn={() => setTimelineZoom((prev) => Math.min(8, +(prev + 0.25).toFixed(2)))}
              onZoomOut={() => setTimelineZoom((prev) => Math.max(0.5, +(prev - 0.25).toFixed(2)))}
              onZoomReset={() => setTimelineZoom(1)}
              canvasTransform={canvasTransform}
            />

            {/* Quick stats */}
            <div className="mt-4 rounded-xl border border-[#f5a623]/10 bg-[#0a0a08]/40 p-4">
              <p className="text-xs font-medium text-[#bfa873]">Project Stats</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8d7850]">Tracks</span>
                  <span className="font-medium text-[#fff5de]">{tracks.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8d7850]">Clips</span>
                  <span className="font-medium text-[#fff5de]">
                    {tracks.reduce((sum, t) => sum + t.clips.length, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8d7850]">Overlays</span>
                  <span className="font-medium text-[#fff5de]">{overlays.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8d7850]">Duration</span>
                  <span className="font-medium text-[#fff5de]">
                    {Math.round(durationMs / 1000)}s
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <Timeline
          tracks={tracks}
          overlays={overlays}
          durationMs={durationMs}
          zoom={timelineZoom}
          onZoomChange={setTimelineZoom}
          onAddClip={handleAddClip}
          onUpdateTrack={handleUpdateTrack}
          onUpdateClip={handleUpdateClip}
          onDeleteClip={handleDeleteClip}
          onAddOverlay={handleAddOverlay}
          onUpdateOverlay={handleUpdateOverlay}
          onDeleteOverlay={handleDeleteOverlay}
          onDurationChange={setDurationMs}
          onSeek={handleSeek}
          onSplitClip={handleSplitClip}
          splitMode={splitMode}
          currentTime={timelineTime}
          thumbnailsByAsset={thumbnailsByAsset}
          waveformData={waveformData}
          assetsById={assetsById}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,audio/*"
          className="hidden"
          onChange={handleClipFilePicked}
        />

        {/* Export Dialog */}
        {showExportDialog && exportJob && (
          <ExportDialog
            job={exportJob}
            onClose={() => setShowExportDialog(false)}
          />
        )}
      </div>
    </>
  );
}
