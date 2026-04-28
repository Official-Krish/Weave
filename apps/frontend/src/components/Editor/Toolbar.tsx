import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Download, Plus, Type, Scissors, Undo2, Redo2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { formatTime } from "./helpers";

interface ToolbarProps {
  onExport: () => void;
  isPlaying: boolean;
  currentTime: number;
  durationMs: number;
  onSeek: (timeMs: number) => void;
  saving: boolean;
  tracks: any[];
  onAddClip: () => void;
  onAddOverlay: (overlay: any) => void;
  onPlayPause: () => void;
  onSplitModeToggle: () => void;
  splitMode: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  timelineZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export function Toolbar({
  onExport,
  isPlaying,
  currentTime,
  durationMs,
  onSeek,
  saving,
  tracks,
  onAddClip,
  onAddOverlay,
  onPlayPause,
  onSplitModeToggle,
  splitMode,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  timelineZoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: ToolbarProps) {
  const handleSliderChange = (value: number[]) => {
    onSeek(value[0]);
  };

  const handleAddTextOverlay = () => {
    onAddOverlay({
      type: "TEXT",
      content: { text: "New Text" },
      timelineStartMs: currentTime,
      durationMs: 5000,
      transform: { x: 100, y: 100 },
      style: {},
    });
  };

  return (
    <div className="rounded-2xl border border-[#f5a623]/10 bg-[#0a0a08]/60 p-5 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#fff5de]">Controls</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-8 w-8 border-[#f5a623]/20 bg-[#f5a623]/5 text-[#f5a623] hover:bg-[#f5a623]/10 disabled:opacity-40"
              title="Undo (Ctrl/Cmd + Z)"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-8 w-8 border-[#f5a623]/20 bg-[#f5a623]/5 text-[#f5a623] hover:bg-[#f5a623]/10 disabled:opacity-40"
              title="Redo (Ctrl/Cmd + Y)"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>
          {/* Track count */}
          <span className="text-xs text-[#8d7850]">Tracks: {tracks.length}</span>
          {/* Saving indicator */}
          {saving && <span className="text-xs text-[#f5a623] animate-pulse ml-2">Saving...</span>}
          <Button
            onClick={onExport}
            className="h-9 bg-[#f5a623]/10 text-[#f5a623] hover:bg-[#f5a623]/20 hover:text-[#f5a623]"
            size="sm"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Play/Pause + Time */}
      <div className="mt-4 flex items-center gap-4">
        <Button
          variant="default"
          size="icon"
          onClick={onPlayPause}
          className="h-11 w-11 rounded-full bg-[#f5a623] text-[#0a0a08] hover:bg-[#f5a623]/90"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>

        <div className="flex-1 space-y-2">
          <Slider
            value={[currentTime]}
            min={0}
            max={durationMs || 1}
            step={100}
            onValueChange={handleSliderChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs font-mono text-[#8d7850]">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(durationMs)}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-5 flex gap-2 pt-4 border-t border-[#f5a623]/10">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddClip}
          className="flex-1 border-[#f5a623]/20 bg-[#f5a623]/5 text-[#f5a623] hover:bg-[#f5a623]/10 hover:border-[#f5a623]/30"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Clip
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddTextOverlay}
          className="flex-1 border-[#f5a623]/20 bg-[#f5a623]/5 text-[#f5a623] hover:bg-[#f5a623]/10 hover:border-[#f5a623]/30"
        >
          <Type className="mr-2 h-4 w-4" />
          Text
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSplitModeToggle}
          className={`flex-1 border-[#f5a623]/20 text-[#f5a623] hover:bg-[#f5a623]/10 hover:border-[#f5a623]/30 ${splitMode ? "bg-[#f5a623]/20" : "bg-[#f5a623]/5"}`}
        >
          <Scissors className="mr-2 h-4 w-4" />
          {splitMode ? "Click Clip" : "Split"}
        </Button>
      </div>

      {/* Zoom controls */}
      <div className="mt-4 flex items-center gap-2 pt-4 border-t border-[#f5a623]/5">
        <span className="text-xs text-[#8d7850]">Zoom:</span>
        <Button
          variant="outline"
          size="icon"
          onClick={onZoomOut}
          className="h-8 w-8 border-[#f5a623]/20 bg-[#f5a623]/5 text-[#f5a623] hover:bg-[#f5a623]/10"
          title="Zoom Out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <span className="w-14 text-center text-xs font-mono text-[#bfa873]">{timelineZoom.toFixed(1)}x</span>
        <Button
          variant="outline"
          size="icon"
          onClick={onZoomIn}
          className="h-8 w-8 border-[#f5a623]/20 bg-[#f5a623]/5 text-[#f5a623] hover:bg-[#f5a623]/10"
          title="Zoom In"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomReset}
          className="ml-auto border-[#f5a623]/20 bg-[#f5a623]/5 text-[#f5a623] hover:bg-[#f5a623]/10 hover:border-[#f5a623]/30"
          title="Reset Zoom to 1x"
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-4 rounded-lg border border-[#f5a623]/5 bg-[#0a0a08]/30 p-2.5">
        <p className="text-[10px] text-[#8d7850]">
          <span className="font-medium text-[#bfa873]">Shortcuts:</span> Space (Play/Pause) · Arrow keys (Seek) · S (Split)
        </p>
      </div>
    </div>
  );
}
