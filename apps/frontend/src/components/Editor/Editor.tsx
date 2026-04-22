import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { editorApi } from "./api";
import type { EditorProject, Track, Overlay, Clip, ExportJob } from "./types";
import { Timeline } from "./Timeline";
import { Toolbar } from "./Toolbar";
import { ExportDialog } from "./ExportDialog";
import { Loader2, Film, Pencil, X } from "lucide-react";
import { VideoPlayer } from "../videojsPlayer";
import { Stage, Layer, Text, Transformer, Line } from "react-konva";
import type Konva from "konva";


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
`;

function mapTimelineToSourceTime(
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

function mapSourceToTimelineTime(
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

function findClipByVideoTime(tracks: Track[], videoTime: number) {
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

function getOrderedClips(tracks: Track[]) {
  return tracks
    .flatMap(t => t.clips)
    .sort((a, b) => a.timelineStartMs - b.timelineStartMs);
}

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
  const [timelineTime, setTimelineTime] = useState(0);
  const [videoTime, setVideoTime] = useState<number>(0);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const textRefs = useRef<Record<string, Konva.Text>>({});
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});
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

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Attach transformer to selected overlay
  useEffect(() => {
    if (!transformerRef.current || !selectedOverlayId) return;

    const node = textRefs.current[selectedOverlayId];
    if (node) {
      transformerRef.current.nodes([node]);
      transformerRef.current.getLayer()!.batchDraw();
    }
  }, [selectedOverlayId]);

  useEffect(() => {
    async function initProject() {
      if (!meetingId){
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

        const videoAsset = projectData.assets?.find((a) => a.assetType === "VIDEO");
        if (videoAsset?.url) {
          setSourceUrl(videoAsset.url);
        }

        if (!projectData.tracks?.length && projectData.assets?.length > 0) {
          const defaultTrack: Track = {
            id: crypto.randomUUID(),
            type: "VIDEO",
            order: 0,
            visible: true,
            muted: false,
            volume: 100,
            clips: [],
          };
          setTracks([defaultTrack]);
        }
      } catch (error) {
        console.error("Failed to initialize project:", error);
      } finally {
        setLoading(false);
      }
    }

    initProject();
  }, [meetingId]);

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


  // Keyboard shortcuts for overlay manipulation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!selectedOverlayId) return;

      const overlay = overlays.find(o => o.id === selectedOverlayId);
      if (!overlay) return;

      const moveStep = e.shiftKey ? 10 : 2;

      // DELETE
      if (e.key === "Delete" || e.key === "Backspace") {
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
    handleDeleteOverlay,
    handleUpdateOverlay,
    handleAddOverlay,
  ]);

  const getSnapPosition = (x: number, y: number): {
    x: number;
    y: number;
    guideX?: number;
    guideY?: number;
  } => {
    const SNAP_THRESHOLD = 10;

    let snappedX = x;
    let snappedY = y;
    let guideX: number | undefined;
    let guideY: number | undefined;

    // center snap
    if (Math.abs(x - stageWidth / 2) < SNAP_THRESHOLD) {
      snappedX = stageWidth / 2;
      guideX = stageWidth / 2;
    }

    if (Math.abs(y - stageHeight / 2) < SNAP_THRESHOLD) {
      snappedY = stageHeight / 2;
      guideY = stageHeight / 2;
    }

    return { x: snappedX, y: snappedY, guideX, guideY };
  }

  const handleAddClip = useCallback((trackIndex: number, clip: Clip) => {
    setTracks((prev) =>
      prev.map((track, i) => {
        if (i !== trackIndex) return track;

        const defaultAsset = project?.assets?.find(
          (a) => a.assetType === "VIDEO"
        );

        if (!defaultAsset) {
          console.error("No valid asset found for clip");
          return track;
        }

        const newClip: Clip = {
          ...clip,
          id: clip.id ?? crypto.randomUUID(),
          sourceAssetId: defaultAsset.id,
        };

        return {
          ...track,
          clips: [...track.clips, newClip],
        };
      })
    );
  }, [project]);

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

  const handleSeek = useCallback((timeMs: number) => {
    isSeekingRef.current = true;

    setTimelineTime(timeMs);
    const mapped = mapTimelineToSourceTime(tracks, timeMs);
    seekTargetRef.current = mapped;
    setVideoTime(mapped);
  }, [tracks]);

  const handleTimeUpdate = useCallback((videoTimeMs: number) => {
    if (isSeekingRef.current) {
      if (seekTargetRef.current !== null && Math.abs(videoTimeMs - seekTargetRef.current) < 100) {
        isSeekingRef.current = false;
        seekTargetRef.current = null;
      }
      return;
    }
    setVideoTime(videoTimeMs);

    const timeline = mapSourceToTimelineTime(tracks, videoTimeMs);
    setTimelineTime(timeline);

    const currentClip = findClipByVideoTime(tracks, videoTimeMs);
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
        setVideoTime(nextClip.sourceStartMs);
        setTimelineTime(nextClip.timelineStartMs);
      } else {
        setIsPlaying(false);
      }
    }
  }, [tracks]);

  const handlePlayStateChange = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);

  const handleStartTextEdit = (overlay: Overlay) => {
    setEditingOverlayId(overlay.id!);
    setEditText(overlay.content.text);
    setIsPlaying(false); // pause while editing
  };

  const handleCommitTextEdit = () => {
    if (editingOverlayId && editText.trim()) {
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
                <div className="relative w-full aspect-video bg-black rounded overflow-hidden">
                  <VideoPlayer
                    src={sourceUrl}
                    className="w-full h-full"
                    style={{ opacity: transitionOpacity }}

                    currentTime={videoTime}
                    onTimeUpdate={handleTimeUpdate}

                    isPlaying={isPlaying}
                    onPlayStateChange={handlePlayStateChange}
                  />

                  {/* Overlay Layer */}
                  <div ref={containerRef} className="absolute inset-0">
                    <Stage
                      width={containerSize.width}
                      height={containerSize.height}
                      scaleX={containerSize.width / stageWidth}
                      scaleY={containerSize.height / stageHeight}
                      className="w-full h-full"
                      onMouseDown={(e) => {
                        if (e.target === e.target.getStage()) {
                          setSelectedOverlayId(null);
                        }
                      }}
                    >
                      <Layer>
                        {overlays
                          .filter(
                            (o) =>
                              timelineTime >= o.timelineStartMs &&
                              timelineTime <= o.timelineStartMs + o.durationMs
                          )
                          .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
                          .map((overlay) => {
                            if (!overlay.id) return null;
                            return(
                              <Text
                                ref={(node) => {
                                  if (node) textRefs.current[overlay.id] = node;
                                  else delete textRefs.current[overlay.id!];
                                }}
                                key={overlay.id}
                                text={overlay.content.text}
                                x={overlay.transform.x}
                                y={overlay.transform.y}
                                onDblClick={() => handleStartTextEdit(overlay)}
                                fontSize={24}
                                fill="white"
                                draggable
                                stroke={selectedOverlayId === overlay.id ? "#f5a623" : undefined}
                                strokeWidth={selectedOverlayId === overlay.id ? 1 : 0}
                                onClick={() => {
                                  setSelectedOverlayId(overlay.id!);

                                  const node = textRefs.current[overlay.id!];
                                  if (node && transformerRef.current) {
                                    transformerRef.current.nodes([node]);
                                    transformerRef.current.getLayer()!.batchDraw();
                                  }
                                }}

                                onDragMove={(e) => {
                                  const { x, y } = e.target.position();

                                  const snapped = getSnapPosition(x, y);

                                  e.target.position({
                                    x: snapped.x,
                                    y: snapped.y,
                                  });

                                  setGuides({
                                    x: snapped.guideX,
                                    y: snapped.guideY,
                                  });
                                }}

                                onDragEnd={(e) => {
                                  const { x, y } = e.target.position();

                                  handleUpdateOverlay(overlay.id!, {
                                    transform: { x, y },
                                  });

                                  setGuides({});
                                }}

                                // RESIZE (via scale)
                                onTransformEnd={(e) => {
                                  const node = e.target;

                                  const scaleX = node.scaleX();
                                  const newFontSize = Math.max(12, (overlay.style?.fontSize || 24) * scaleX);

                                  node.scaleX(1);
                                  node.scaleY(1);

                                  handleUpdateOverlay(overlay.id!, {
                                    style: {
                                      ...overlay.style,
                                      fontSize: newFontSize,
                                    },
                                  });
                                }}
                              />
                            )
                          })}
                          {guides.x !== undefined && (
                            <Line
                              points={[guides.x, 0, guides.x, stageHeight]}
                              stroke="#f5a623"
                              strokeWidth={1}
                              dash={[4, 4]}
                            />
                          )}

                          {guides.y !== undefined && (
                            <Line
                              points={[0, guides.y, stageWidth, guides.y]}
                              stroke="#f5a623"
                              strokeWidth={1}
                              dash={[4, 4]}
                            />
                          )}
                          <Transformer
                            ref={transformerRef}
                            rotateEnabled={false}
                            enabledAnchors={["middle-left", "middle-right"]}
                          />
                      </Layer>
                    </Stage>
                    {editingOverlayId && (() => {
                      const overlay = overlays.find(o => o.id === editingOverlayId);
                      if (!overlay) return null;

                      const scaleX = containerSize.width / stageWidth;
                      const scaleY = containerSize.height / stageHeight;

                      return (
                        <input
                          autoFocus
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          onBlur={handleCommitTextEdit}
                          onKeyDown={e => {
                            if (e.key === "Enter") handleCommitTextEdit();
                            if (e.key === "Escape") setEditingOverlayId(null);
                          }}
                          style={{
                            position: "absolute",
                            left: overlay.transform.x * scaleX,
                            top: overlay.transform.y * scaleY,
                            fontSize: (overlay.style?.fontSize || 24) * scaleX,
                            color: "white",
                            background: "rgba(0,0,0,0.5)",
                            border: "1px solid #f5a623",
                            borderRadius: 4,
                            padding: "2px 6px",
                            outline: "none",
                            minWidth: 80,
                            zIndex: 50,
                          }}
                        />
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
              onAddTrack={() => {}}
              onAddOverlay={handleAddOverlay}
              onPlayPause={handlePlayPause}
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
          zoom={1}
          onAddClip={handleAddClip}
          onUpdateClip={handleUpdateClip}
          onDeleteClip={handleDeleteClip}
          onAddOverlay={handleAddOverlay}
          onUpdateOverlay={handleUpdateOverlay}
          onDeleteOverlay={handleDeleteOverlay}
          onDurationChange={setDurationMs}
          onSeek={handleSeek}
          currentTime={timelineTime}
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
