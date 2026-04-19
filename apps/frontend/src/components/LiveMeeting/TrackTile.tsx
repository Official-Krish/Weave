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
  const showVideo = Boolean(track && !isVideoOff);

  useEffect(() => {
    if (!track || !videoRef.current || isVideoOff) {
      if (videoRef.current) {
        try {
          track?.detach?.(videoRef.current);
        } catch {
          // no-op
        }
        videoRef.current.srcObject = null;
      }
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
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isVideoOff, track]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative h-full w-full overflow-hidden rounded-xl border border-[#f5a623]/14 bg-[#0b0806] text-left transition hover:border-[#f5a623]/30",
        className ?? "",
      ].join(" ")}
    >
      {showVideo ? (
        <video ref={videoRef} autoPlay playsInline muted className="h-full min-h-45 w-full object-cover" />
      ) : (
        <div className="flex min-h-45 w-full items-center justify-center bg-[#090806] text-[#cfb07a]">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-18 w-18 items-center justify-center rounded-full border border-[#f5a623]/16 bg-[#2a1c0e]">
              <User className="h-8 w-8" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#fff3dc]">{title}</p>
              <p className="text-[11px] text-[#c8a870]/65">
                {isVideoOff ? "Camera is off" : "Waiting for video"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#fff3dc]">{title}</p>
            {subtitle ? <p className="text-xs text-[#e4c995]/80">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-1.5 text-[#f6dfb4]/85">
            {isScreenSharing ? <MonitorUp className="h-3.5 w-3.5 text-[#f5c050]" /> : null}
            {isMuted ? <MicOff className="h-3.5 w-3.5 text-red-300" /> : <Mic className="h-3.5 w-3.5" />}
            {isVideoOff ? <VideoOff className="h-3.5 w-3.5 text-red-300" /> : <Video className="h-3.5 w-3.5" />}
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_70%_10%,rgba(245,166,35,0.18),transparent_38%)]" />
    </button>
  );
}
