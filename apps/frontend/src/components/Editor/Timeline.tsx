import { useMemo, useRef } from "react";
import type { Track, Overlay, Clip } from "./types";
import { TimelineTrack } from "./TimelineTrack";
import { TimelineRuler } from "./TimelineRuler";
import { Plus, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { OverlayTrack } from "./OverlayTrack";
import { Button } from "../ui/button";

interface TimelineProps {
  tracks: Track[];
  overlays: Overlay[];
  durationMs: number;
  currentTime: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onAddClip: (trackIndex: number) => void;
  onUpdateClip: (trackIndex: number, clipId: string, updates: Partial<Clip>) => void;
  onDeleteClip: (trackIndex: number, clipId: string) => void;
  onUpdateTrack: (trackIndex: number, updates: Partial<Track>) => void;
  onAddOverlay: (overlay: Overlay) => void;
  onUpdateOverlay: (overlayId: string, updates: Partial<Overlay>) => void;
  onDeleteOverlay: (overlayId: string) => void;
  onDurationChange: (durationMs: number) => void;
  onSeek: (timeMs: number) => void;
  onSplitClip: (trackIndex: number, clipId: string, timelineMs: number) => void;
  splitMode: boolean;
  thumbnailsByAsset: Record<string, string[]>;
  waveformData: number[];
  assetsById: Record<string, any>;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  timelineZoom: number;
}

export function Timeline({
  tracks,
  durationMs,
  currentTime,
  zoom,
  onZoomChange,
  onAddClip,
  onUpdateTrack,
  onUpdateClip,
  onDeleteClip,
  onDurationChange,
  onSeek,
  onSplitClip,
  splitMode,
  onAddOverlay,
  onUpdateOverlay,
  onDeleteOverlay,
  overlays,
  thumbnailsByAsset,
  waveformData,
  assetsById,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  timelineZoom
}: TimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentWidthPct = useMemo(() => Math.max(100, zoom * 100), [zoom]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Zoom on Ctrl/Cmd + scroll
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      onZoomChange(Math.max(0.5, Math.min(8, +(zoom + delta).toFixed(2))));
      return;
    }

    // Horizontal scroll on normal scroll (no modifier)
    if (scrollRef.current) {
      e.preventDefault();
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (durationMs === 0) return;
    const lane = e.currentTarget;
    const rect = lane.getBoundingClientRect();
    const scrollContainer = scrollRef.current;
    const scrollLeft = scrollContainer?.scrollLeft ?? 0;
    const totalWidth = lane.scrollWidth || rect.width;
    const clickX = e.clientX - rect.left + scrollLeft;
    const clickTimeMs = (clickX / totalWidth) * durationMs;
    onSeek(Math.max(0, Math.min(clickTimeMs, durationMs)));
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#f5a623]/10 bg-[#0a0a08]/60 shadow-lg backdrop-blur-sm">
      {/* Timeline Header */}
      <div className="flex items-center justify-between border-b border-[#f5a623]/10 bg-[#0a0a08]/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[#fff5de]">Timeline</h3>
          <span className="rounded-full border border-[#f5a623]/15 bg-[#f5a623]/8 px-2 py-0.5 text-[10px] font-medium text-[#f5a623]">
            {tracks.length} track{tracks.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#8d7850]">
            Duration: <span className="font-mono font-medium text-[#bfa873]">{(durationMs / 1000).toFixed(1)}s</span>
          </label>
          <span className="ml-2 text-[11px] text-[#8d7850]">Zoom: {zoom.toFixed(2)}x (Ctrl/Cmd + wheel)</span>
        </div>
        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8d7850]">Zoom:</span>
          <Button
            variant="outline"
            size="icon"
            onClick={onZoomOut}
            className="h-8 w-8 border-[#f5a623]/20 bg-[#f5a623]/5 text-[#f5a623] hover:bg-[#f5a623]/10 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="w-14 text-center text-xs font-mono text-[#bfa873]">{timelineZoom.toFixed(1)}x</span>
          <Button
            variant="outline"
            size="icon"
            onClick={onZoomIn}
            className="h-8 w-8 border-[#f5a623]/20 bg-[#f5a623]/5 text-[#f5a623] hover:bg-[#f5a623]/10 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onZoomReset}
            className="ml-auto border-[#f5a623]/20 bg-[#f5a623]/5 text-[#f5a623] hover:bg-[#f5a623]/10 hover:border-[#f5a623]/30 cursor-pointer"
            title="Reset Zoom to 1x"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
        <button
          onClick={() => onAddOverlay({
            id: crypto.randomUUID(),
            type: "TEXT",
            timelineStartMs: currentTime,       // starts at playhead
            durationMs: 3000,                   // default 3 seconds
            zIndex: overlays.length,
            content: { text: "New Text" },
            transform: { x: 100, y: 100 },
            style: { fontSize: 24 },
          })}
          className="rounded bg-[#a855f7]/10 px-2 py-1 text-xs text-[#c084fc] hover:bg-[#a855f7]/20"
        >
          + Text Overlay
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div
          ref={scrollRef}
          className="overflow-x-auto overflow-y-hidden rounded-lg border border-[#f5a623]/10 bg-[#060605]/40"
          onWheel={handleWheel}
        >
          <div style={{ width: `${contentWidthPct}%`, minWidth: "100%" }} className="space-y-4 p-3">
            {/* Timeline Ruler */}
            <TimelineRuler
              durationMs={durationMs}
              currentTime={currentTime}
              zoom={zoom}
              onSeek={onSeek}
              tracks={tracks}
            />

            {/* Tracks */}
            <div className="space-y-2.5">
              {tracks.map((track, index) => (
                <TimelineTrack
                  key={track.id}
                  track={track}
                  index={index}
                  durationMs={durationMs}
                  currentTime={currentTime}
                  zoom={zoom}
                  onAddClip={onAddClip}
                  onUpdateTrack={onUpdateTrack}
                  onUpdateClip={onUpdateClip}
                  onDeleteClip={onDeleteClip}
                  onClick={handleTimelineClick}
                  onSplitClip={onSplitClip}
                  splitMode={splitMode}
                  thumbnailsByAsset={thumbnailsByAsset}
                  waveformData={waveformData}
                  assetsById={assetsById}
                />
              ))}

              <OverlayTrack
                overlays={overlays}
                durationMs={durationMs}
                currentTime={currentTime}
                onUpdateOverlay={onUpdateOverlay}
                onDeleteOverlay={onDeleteOverlay}
              />

              {tracks.length === 0 && (
                <div
                  onClick={handleTimelineClick}
                  className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[#f5a623]/20 bg-[#f5a623]/5 py-12 transition-colors hover:border-[#f5a623]/30 hover:bg-[#f5a623]/8"
                >
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5a623]/10">
                      <Plus className="h-5 w-5 text-[#f5a623]" />
                    </div>
                    <p className="text-sm font-medium text-[#bfa873]">Click to add your first track</p>
                    <p className="text-xs text-[#8d7850]">Or use the "Add Track" button above</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2 text-[11px] text-[#8d7850]">
          Scroll horizontally to navigate timeline.
        </div>
      </div>
    </div>
  );
}
