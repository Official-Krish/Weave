import { Mic, MicOff, MonitorUp, User, Video, VideoOff } from "lucide-react";
import { useEffect, useRef } from "react";

export function TrackTile({
  title,
  subtitle,
  track,
  onClick,
  isMuted,
  isVideoOff,
  isScreenSharing,
  className,
}: {
  title: string;
  subtitle?: string;
  track: any | null;
  onClick?: () => void;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isScreenSharing?: boolean;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!track || !videoRef.current) {
      return;
    }

    try {
      track.attach(videoRef.current);
    } catch {
      // no-op
    }

    return () => {
      try {
        track.detach(videoRef.current);
      } catch {
        // no-op
      }
    };
  }, [track]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative h-full w-full overflow-hidden rounded-lg border border-[#27404c] bg-[#081018] text-left transition hover:border-[#3a5666]",
        className ?? "",
      ].join(" ")}
    >
      {track ? (
        <video ref={videoRef} autoPlay playsInline muted className="h-full min-h-45 w-full object-cover" />
      ) : (
        <div className="flex min-h-45 w-full items-center justify-center bg-[#09131b] text-[#93adbd]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#14303f]">
            <User className="h-7 w-7" />
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">{title}</p>
            {subtitle ? <p className="text-xs text-white/80">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-1.5 text-white/85">
            {isScreenSharing ? <MonitorUp className="h-3.5 w-3.5 text-blue-300" /> : null}
            {isMuted ? <MicOff className="h-3.5 w-3.5 text-red-300" /> : <Mic className="h-3.5 w-3.5" />}
            {isVideoOff ? <VideoOff className="h-3.5 w-3.5 text-red-300" /> : <Video className="h-3.5 w-3.5" />}
          </div>
        </div>
      </div>
    </button>
  );
}
