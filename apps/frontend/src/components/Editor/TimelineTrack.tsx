import { useState } from "react";
import type { Track, Clip } from "./types";
import { Trash2, Eye, EyeOff, Volume2, VolumeX, Video, AudioWaveform, Type } from "lucide-react";
import { getTrackColors } from "./helpers";

interface TimelineTrackProps {
  track: Track;
  index: number;
  durationMs: number;
  currentTime: number;
  zoom: number;
  onAddClip: (trackIndex: number, clip: Clip) => void;
  onUpdateTrack: (trackIndex: number, updates: Partial<Track>) => void;
  onUpdateClip: (trackIndex: number, clipId: string, updates: Partial<Clip>) => void;
  onDeleteClip: (trackIndex: number, clipId: string) => void;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  videoThumbnails: string[];
  waveformData: number[];
}

export function getTrackIcon(type: Track["type"]) {
  switch (type) {
    case "VIDEO": return <Video className="h-3.5 w-3.5" />;
    case "AUDIO": return <AudioWaveform className="h-3.5 w-3.5" />;
    case "TEXT": return <Type className="h-3.5 w-3.5" />;
  }
}



export function TimelineTrack({
  track,
  index,
  durationMs,
  currentTime,
  zoom,
  onAddClip,
  onUpdateTrack,
  onUpdateClip,
  onDeleteClip,
  onClick,
  videoThumbnails,
  waveformData,
}: TimelineTrackProps) {
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [draggingClip, setDraggingClip] = useState<{
    clipId: string;
    startX: number;
    startTimelineMs: number;
  } | null>(null);
  const colors = getTrackColors(track.type);

  const handleClipClick = (e: React.MouseEvent, clipId: string) => {
    e.stopPropagation();
    setSelectedClip(clipId);
  };

  const handleDeleteClip = (e: React.MouseEvent, clipId: string) => {
    e.stopPropagation();
    onDeleteClip(index, clipId);
  };

  const handleClipMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    clip: Clip
  ) => {
    e.stopPropagation();
    const clipId = clip.id ?? clip.sourceAssetId;
    setDraggingClip({
      clipId,
      startX: e.clientX,
      startTimelineMs: clip.timelineStartMs,
    });
  };

  const handleTrackMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingClip || durationMs <= 0) return;
    const lane = e.currentTarget;
    const laneWidth = lane.getBoundingClientRect().width;
    if (laneWidth <= 0) return;

    const clip = track.clips.find((c) => (c.id ?? c.sourceAssetId) === draggingClip.clipId);
    if (!clip) return;

    const deltaX = e.clientX - draggingClip.startX;
    const deltaMs = (deltaX / laneWidth) * durationMs;
    const nextStart = Math.max(0, Math.min(draggingClip.startTimelineMs + deltaMs, durationMs - clip.durationMs));

    onUpdateClip(index, draggingClip.clipId, {
      timelineStartMs: Math.round(nextStart),
    });
  };

  const handleTrackMouseUp = () => {
    if (draggingClip) setDraggingClip(null);
  };

  const activeClip = track.clips.find(
  (clip) =>
    currentTime >= clip.timelineStartMs &&
    currentTime < clip.timelineStartMs + clip.durationMs
  );

  const renderClipVisual = (clip: Clip, clipId: string, trackType: Track["type"]) => {
    if (trackType === "AUDIO") {
      if (!waveformData.length || durationMs <= 0) return null;
      const startIdx = Math.floor((clip.sourceStartMs / durationMs) * waveformData.length);
      const endIdx = Math.max(startIdx + 1, Math.floor(((clip.sourceStartMs + clip.durationMs) / durationMs) * waveformData.length));
      const slice = waveformData.slice(Math.max(0, startIdx), Math.min(waveformData.length, endIdx));
      if (!slice.length) return null;
      const bars = Array.from({ length: 28 }, (_, i) => {
        const idx = Math.floor((i / 28) * slice.length);
        const amp = slice[Math.min(slice.length - 1, idx)] ?? 0.1;
        const height = Math.max(12, Math.min(96, amp * 100));
        return (
          <div
            key={`${clipId}-bar-${i}`}
            className="w-1 rounded-sm bg-[#4ade80]/70"
            style={{ height: `${height}%` }}
          />
        );
      });
      return (
        <div className="absolute inset-0 flex items-end gap-0.5 px-1 py-1 opacity-80 pointer-events-none">
          {bars}
        </div>
      );
    }

    if (trackType === "VIDEO") {
      if (!videoThumbnails.length || durationMs <= 0) return null;
      const frames = Array.from({ length: 8 }, (_, i) => {
        const t = clip.sourceStartMs + (clip.durationMs * (i / 8));
        const idx = Math.max(0, Math.min(videoThumbnails.length - 1, Math.floor((t / durationMs) * videoThumbnails.length)));
        return videoThumbnails[idx];
      });
      return (
        <div className="absolute inset-0 grid grid-cols-8 gap-px p-px pointer-events-none">
          {frames.map((frame, i) => (
            <div
              key={`${clipId}-thumb-${i}`}
              className="rounded-[2px] border border-white/10 bg-cover bg-center"
              style={{ backgroundImage: `url("${frame}")` }}
            />
          ))}
        </div>
      );
    }

    return null;
  };


  return (
    <div className="group">
      {/* Track Header */}
      <div className="mb-1.5 flex items-center gap-2">
        <div className={`flex items-center gap-1.5 rounded-lg border border-[#f5a623]/10 bg-[#0a0a08]/60 px-2.5 py-1.5 ${colors.label}`}>
          {getTrackIcon(track.type)}
          <span className="text-xs font-medium">{track.type}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            title={track.visible ? "Hide track" : "Show track"}
            onClick={() => onUpdateTrack(index, { visible: !track.visible })}
            className="rounded p-1 text-[#8d7850] transition-colors hover:bg-[#f5a623]/10 hover:text-[#f5a623]"
          >
            {track.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
          <button
            title={track.muted ? "Unmute" : "Mute"}
            onClick={() => onUpdateTrack(index, { muted: !track.muted })}
            className="rounded p-1 text-[#8d7850] transition-colors hover:bg-[#f5a623]/10 hover:text-[#f5a623]"
          >
            {track.muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Volume slider */}
        <div className="flex items-center gap-1.5">
          <input
            type="range"
            min="0"
            max="100"
            value={track.volume}
            onChange={(e) => onUpdateTrack(index, { volume: Number(e.target.value) })}
            className="h-1 w-20 accent-[#f5a623]"
          />
          <span className="w-8 text-xs font-mono text-[#8d7850]">{track.volume}%</span>
        </div>

        {/* Add Clip Button */}
        <button
          className="ml-2 rounded bg-[#f5a623]/10 px-2 py-1 text-xs text-[#f5a623] hover:bg-[#f5a623]/20"
          title="Add Clip"
          onClick={() => {
            const lastClip = track.clips.at(-1);
            const timelineStartMs = lastClip 
              ? lastClip.timelineStartMs + lastClip.durationMs 
              : 0;
            onAddClip(index, {
            sourceAssetId: `clip-${Date.now()}`,
            sourceStartMs: 0,
            timelineStartMs: timelineStartMs,
            durationMs: 1000,
          })}}
        >
          + Clip
        </button>

        <span className="ml-2 text-[11px] text-[#8d7850]">Zoom {zoom.toFixed(2)}x</span>
      </div>

      {/* Track Lane */}
      <div
        className={`relative h-14 overflow-hidden rounded-xl border-2 ${colors.border} ${colors.bg} transition-all duration-200 hover:border-opacity-60 hover:bg-opacity-20 cursor-pointer`}
        onClick={onClick}
        onMouseMove={handleTrackMouseMove}
        onMouseUp={handleTrackMouseUp}
        onMouseLeave={handleTrackMouseUp}
      >
        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-px bg-[#f5a623] z-20 pointer-events-none shadow-[0_0_8px_rgba(245,166,35,0.6)]"
          style={{ left: `${durationMs > 0 && (currentTime / durationMs) * 100}%` }}
        >
          <div className="absolute -top-1 -translate-x-1/2">
            <div className="h-0 w-0 border-l-4 border-r-4 border-t-5 border-l-transparent border-r-transparent border-t-[#f5a623]" />
          </div>
        </div>

        {/* Clips */}
        {track.clips.map((clip) => {
          const leftPercent = (clip.timelineStartMs / durationMs) * 100;
          const widthPercent = (clip.durationMs / durationMs) * 100;
          const clipId = clip.id ?? clip.sourceAssetId;
          const isSelected = selectedClip === clipId;
          const isActive = activeClip ? 
            (activeClip.id ?? activeClip.sourceAssetId) === clipId : false;

          return (
            <div
              key={clip.id ?? clip.sourceAssetId}
              onMouseDown={(e) => handleClipMouseDown(e, clip)}
              onClick={(e) => handleClipClick(e, clipId)}
              className={`absolute top-1.5 bottom-1.5 overflow-hidden rounded-lg border transition-all duration-150 ${
                isActive
                ? "ring-2 ring-[#f5a623] shadow-[0_0_10px_rgba(245,166,35,0.6)]"
                : isSelected
                ? colors.clipSelected
                : colors.clip
              } 
              group/clip hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]`}
              style={{
                left: `calc(${leftPercent}% + 1px)`,
                width: `calc(${Math.max(widthPercent, 0.5)}% - 2px)`,
                minWidth: "4px",
              }}
            >
              {renderClipVisual(clip, clipId, track.type)}
              <div className="flex h-full items-center px-1.5">
                <span className="truncate text-[10px] font-medium text-[#fff5de]/90">
                  Clip {track.clips.indexOf(clip) + 1}
                </span>
              </div>
              {clip.transitionOut === "fade" && (
                <div className="absolute right-0 h-full w-3 bg-linear-to-r from-transparent to-black/60" />
              )}

              {/* Delete button */}
              <button
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded bg-[#ef4444]/20 p-0.5 text-[#f87171] opacity-0 transition-all group-hover/clip:opacity-100 hover:bg-[#ef4444]/40"
                onClick={(e) => handleDeleteClip(e, clip.id ?? clip.sourceAssetId)}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          );
        })}

        {/* Empty state */}
        {track.clips.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs text-[#8d7850]/60">Drop clips here</p>
          </div>
        )}
      </div>
    </div>
  );
}
