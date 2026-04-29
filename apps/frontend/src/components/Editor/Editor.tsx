import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import type { Track, Overlay, Asset } from "./types";
import { Timeline } from "./Timeline";
import { Toolbar } from "./Toolbar";
import { ExportDialog } from "./ExportDialog";
import { Loader2, Film } from "lucide-react";
import { CanvasPlayer, useCanvasVideo } from "./CanvasPlayer";
import { OverlayLayer } from "./OverlayLayer";
import { ProjectStats } from "./ProjectStats";
import { useEditorHistory } from "./hooks/useEditorHistory";
import { useMediaExtraction } from "./hooks/useMediaExtraction";
import { useEditorShortcuts } from "./hooks/useEditorShortcuts";
import { useEditorProject } from "./hooks/useEditorProject";
import { useOverlayOperations } from "./hooks/useOverlayOperations";
import { useTrackOperations } from "./hooks/useTrackOperations";
import { usePlaybackState } from "./hooks/usePlaybackState";
import { useMediaUpload } from "./hooks/useMediaUpload";
import { useExport } from "./hooks/useExport";

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

  const [tracks, setTracks] = useState<Track[]>([]);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [durationMs, setDurationMs] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [sourceUrl, setSourceUrl] = useState<string>("");
  const [assetsById, setAssetsById] = useState<Record<string, Asset>>({});
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);

  const [splitMode, setSplitMode] = useState(false);
  const [timelineTime, setTimelineTime] = useState(0);
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [videoTime, setVideoTime] = useState<number>(0);

  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [editingOverlayId, setEditingOverlayId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const [transitionOpacity, setTransitionOpacity] = useState(1);
  const [containerSize, setContainerSize] = useState({ width: 1280, height: 720 });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timeUpdateRef = useRef<((t: number) => void) | null>(null);
  const playStateChangeRef = useRef<((p: boolean) => void) | null>(null);

  const { canUndo, canRedo, handleUndo, handleRedo, resetHistory } = useEditorHistory(
    tracks, overlays, setTracks, setOverlays
  );

  const { thumbnailsByAsset, waveformData, extractThumbnailsForAsset } = useMediaExtraction(
    assetsById, sourceUrl, durationMs
  );

  const { project, loading, saving } = useEditorProject(
    meetingId, tracks, overlays, durationMs, setTracks, setOverlays, setDurationMs, setAssetsById, setSourceUrl, setActiveAssetId, resetHistory, extractThumbnailsForAsset
  );

  const { exportJob, showExportDialog, setShowExportDialog, handleExport } = useExport(project);

  const { handleDeleteOverlay, handleUpdateOverlay, handleAddOverlay } = useOverlayOperations(setOverlays);

  const { handleUpdateClip, handleDeleteClip, handleUpdateTrack, handleSplitClip } = useTrackOperations(setTracks, setSplitMode);

  const { handleSeek, handleTimeUpdate, handlePlayPause, handlePlayStateChange } = usePlaybackState(
    tracks, assetsById, activeAssetId, setActiveAssetId, setSourceUrl, setTimelineTime, setVideoTime, setTransitionOpacity, setIsPlaying
  );

  const { handleClipFilePicked } = useMediaUpload(
    project, tracks, setTracks, setAssetsById, setDurationMs, sourceUrl, setSourceUrl, setActiveAssetId, extractThumbnailsForAsset
  );

  useEditorShortcuts(
    overlays,
    selectedOverlayId,
    editingOverlayId,
    handleDeleteOverlay,
    handleUpdateOverlay,
    handleAddOverlay,
    handleUndo,
    handleRedo,
    setTimelineZoom
  );

  const stageWidth = project?.width || 1280;
  const stageHeight = project?.height || 720;

  const {
    videoRef,
    canvasRef,
    state: canvasState,
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

  timeUpdateRef.current = handleTimeUpdate;
  playStateChangeRef.current = handlePlayStateChange;

  const handleStartTextEdit = useCallback((overlay: Overlay) => {
    setEditingOverlayId(overlay.id!);
    setEditText(overlay.content.text);
    setIsPlaying(false);
  }, []);

  const handleCommitTextEdit = useCallback(() => {
    if (editingOverlayId) {
      handleUpdateOverlay(editingOverlayId, {
        content: { text: editText },
      });
    }
    setEditingOverlayId(null);
    setEditText("");
  }, [editingOverlayId, editText, handleUpdateOverlay]);

  const handleAddClip = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSplitAtPlayhead = useCallback(() => {
    const currentMs = timelineTime;
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

    if (foundTrackIndex < 0) return;
    setIsPlaying(false);
    handleSplitClip(foundTrackIndex, foundClipId, currentMs);
  }, [timelineTime, tracks, handleSplitClip]);

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
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2" ref={containerRef}>
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

                  <OverlayLayer
                    overlays={overlays}
                    timelineTime={timelineTime}
                    containerSize={containerSize}
                    stageWidth={stageWidth}
                    stageHeight={stageHeight}
                    selectedOverlayId={selectedOverlayId}
                    setSelectedOverlayId={setSelectedOverlayId}
                    editingOverlayId={editingOverlayId}
                    setEditingOverlayId={setEditingOverlayId}
                    editText={editText}
                    setEditText={setEditText}
                    handleUpdateOverlay={handleUpdateOverlay}
                    handleDeleteOverlay={handleDeleteOverlay}
                    handleStartTextEdit={handleStartTextEdit}
                    handleCommitTextEdit={handleCommitTextEdit}
                  />
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
          </div>

          <div>
            <Toolbar
              onExport={handleExport}
              isPlaying={isPlaying}
              currentTime={timelineTime}
              durationMs={durationMs}
              onSeek={handleSeek}
              saving={saving}
              tracks={tracks}
              onAddClip={handleAddClip}
              onAddOverlay={handleAddOverlay}
              onPlayPause={handlePlayPause}
              onSplitModeToggle={() => setSplitMode((prev) => !prev)}
              onSplitAtPlayhead={handleSplitAtPlayhead}
              splitMode={splitMode}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
              canvasTransform={canvasTransform}
            />

            <ProjectStats tracks={tracks} overlays={overlays} durationMs={durationMs} />
          </div>
        </div>

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
          timelineZoom={timelineZoom}
          onZoomIn={() => setTimelineZoom((prev) => Math.min(8, +(prev + 0.25).toFixed(2)))}
          onZoomOut={() => setTimelineZoom((prev) => Math.max(0.5, +(prev - 0.25).toFixed(2)))}
          onZoomReset={() => setTimelineZoom(1)}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,audio/*"
          className="hidden"
          onChange={handleClipFilePicked}
        />

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
