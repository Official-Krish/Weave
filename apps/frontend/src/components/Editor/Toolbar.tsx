import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Download, Plus, Type, Scissors } from "lucide-react";

interface ToolbarProps {
  onExport: () => void;
  isPlaying: boolean;
  currentTime: number;
  durationMs: number;
  onSeek: (timeMs: number) => void;
  saving: boolean;
  tracks: any[];
  onAddTrack: () => void;
  onAddOverlay: (overlay: any) => void;
  onPlayPause: () => void;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
}

export function Toolbar({
  onExport,
  isPlaying,
  currentTime,
  durationMs,
  onSeek,
  saving,
  tracks,
  onAddTrack,
  onAddOverlay,
  onPlayPause,
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
          onClick={onAddTrack}
          className="flex-1 border-[#f5a623]/20 bg-[#f5a623]/5 text-[#f5a623] hover:bg-[#f5a623]/10 hover:border-[#f5a623]/30"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Track
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
          className="flex-1 border-[#f5a623]/20 bg-[#f5a623]/5 text-[#f5a623] hover:bg-[#f5a623]/10 hover:border-[#f5a623]/30"
        >
          <Scissors className="mr-2 h-4 w-4" />
          Split
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
