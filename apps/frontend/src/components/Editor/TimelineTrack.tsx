import { useState } from "react";
import type { Track, Clip } from "./types";
import { Video, AudioWaveform, Type, Trash2, Eye, EyeOff, Volume2, VolumeX } from "lucide-react";

interface TimelineTrackProps {
  track: Track;
  index: number;
  durationMs: number;
  currentTime: number;
  zoom: number;
  onAddClip: (trackIndex: number, clip: Clip) => void;
  onUpdateClip: (trackIndex: number, clipId: string, updates: Partial<Clip>) => void;
  onDeleteClip: (trackIndex: number, clipId: string) => void;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

function getTrackIcon(type: Track["type"]) {
  switch (type) {
    case "VIDEO": return <Video className="h-3.5 w-3.5" />;
    case "AUDIO": return <AudioWaveform className="h-3.5 w-3.5" />;
    case "TEXT": return <Type className="h-3.5 w-3.5" />;
  }
}

function getTrackColors(type: Track["type"]) {
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


export function TimelineTrack({
  track,
  index,
  durationMs,
  currentTime,
  zoom,
  onAddClip,
  onDeleteClip,
  onClick,
}: TimelineTrackProps) {
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [localZoom, setLocalZoom] = useState(zoom);
  const colors = getTrackColors(track.type);

  const handleClipClick = (e: React.MouseEvent, clipId: string) => {
    e.stopPropagation();
    setSelectedClip(clipId);
  };

  const handleDeleteClip = (e: React.MouseEvent, clipId: string) => {
    e.stopPropagation();
    onDeleteClip(index, clipId);
  };

  // Zoom logic
  const handleZoomIn = () => {
    setLocalZoom((z) => Math.min(z + 0.25, 4));
  };

  const handleZoomOut = () => {
    setLocalZoom((z) => Math.max(z - 0.25, 0.25));
  };

  const activeClip = track.clips.find(
  (clip) =>
    currentTime >= clip.timelineStartMs &&
    currentTime < clip.timelineStartMs + clip.durationMs
  );


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
            className="rounded p-1 text-[#8d7850] transition-colors hover:bg-[#f5a623]/10 hover:text-[#f5a623]"
          >
            {track.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
          <button
            title={track.muted ? "Unmute" : "Mute"}
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
            onChange={() => {}}
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

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 ml-2">
          <span className="text-xs text-[#8d7850]">Zoom:</span>
          <button
            className="rounded bg-[#f5a623]/10 px-2 text-xs text-[#f5a623] hover:bg-[#f5a623]/20"
            onClick={handleZoomOut}
            title="Zoom Out"
            disabled={localZoom <= 0.25}
          >-
          </button>
          <span className="text-xs text-[#f5a623]">{localZoom.toFixed(2)}x</span>
          <button
            className="rounded bg-[#f5a623]/10 px-2 text-xs text-[#f5a623] hover:bg-[#f5a623]/20"
            onClick={handleZoomIn}
            title="Zoom In"
            disabled={localZoom >= 4}
          >+
          </button>
        </div>
      </div>

      {/* Track Lane */}
      <div
        className={`relative h-14 overflow-hidden rounded-xl border-2 ${colors.border} ${colors.bg} transition-all duration-200 hover:border-opacity-60 hover:bg-opacity-20 cursor-pointer`}
        onClick={onClick}
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
              onMouseDown={(e) => e.stopPropagation()}
              draggable
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
                left: `${leftPercent}%`,
                width: `${Math.max(widthPercent, 0.5)}%`,
                minWidth: "4px",
              }}
            >
              <div className="flex h-full items-center px-1.5">
                <span className="truncate text-[10px] font-medium text-[#fff5de]/90">
                  Clip {track.clips.indexOf(clip) + 1}
                </span>
              </div>
              {clip.transitionOut === "fade" && (
                <div className="absolute right-0 w-3 h-full bg-gradient-to-r from-transparent to-black/60" />
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
