import type { Track, Overlay } from "./types";

interface ProjectStatsProps {
  tracks: Track[];
  overlays: Overlay[];
  durationMs: number;
}

export function ProjectStats({ tracks, overlays, durationMs }: ProjectStatsProps) {
  return (
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
  );
}
