import type { Track } from "./types";

interface TimelineRulerProps {
  durationMs: number;
  currentTime: number;
  zoom: number;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  tracks: Track[];
}

export function TimelineRuler({
  durationMs,
  currentTime,
  onClick,
  tracks,
}: TimelineRulerProps) {
  const markers = [];
  const totalSeconds = durationMs / 1000;
  const markerInterval = totalSeconds > 60 ? 10 : totalSeconds > 10 ? 5 : 1;


  for (let i = 0; i <= totalSeconds; i += markerInterval) {
    const percent = (i / totalSeconds) * 100;
    const minutes = Math.floor(i / 60);
    const seconds = i % 60;
    const label = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    markers.push(
      <div
        key={i}
        className="absolute top-0 h-full flex flex-col items-center"
        style={{ left: `${percent}%` }}
      >
        <div className="h-2.5 w-px bg-[#f5a623]/30" />
        <span className="text-[9px] font-mono text-[#8d7850] mt-0.5">{label}</span>
      </div>
    );
  }

  return (
    <div
      className="relative h-9 overflow-hidden rounded-lg border border-[#f5a623]/15 bg-[#0a0a08]/40 cursor-pointer transition-colors hover:border-[#f5a623]/25"
      onClick={onClick}
    >
      {/* Playhead */}
      <div
        className="absolute top-0 bottom-0 w-px bg-[#f5a623] z-10 pointer-events-none shadow-[0_0_6px_rgba(245,166,35,0.5)]"
        style={{ left: `${(currentTime / durationMs) * 100}%` }}
      >
        <div className="absolute -top-0.5 -translate-x-1/2">
          <div className="h-0 w-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-[#f5a623]" />
        </div>
      </div>

      {/* Background grid lines */}
      <div className="absolute inset-0">
        {markers.map((marker, i) => (
          <div
            key={`grid-${i}`}
            className="absolute top-4 bottom-0 w-px bg-[#f5a623]/5"
            style={{ left: marker.props.style.left }}
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {tracks.flatMap(t => t.clips).map((clip) => (
          <div
            key={clip.id ?? clip.sourceAssetId}
            className="absolute top-0 bottom-0 w-px bg-[#f5a623]/30"
            style={{
              left: `${(clip.timelineStartMs / durationMs) * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Markers */}
      <div className="absolute inset-0">{markers}</div>
    </div>
  );
}
