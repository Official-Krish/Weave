import {
  BadgeCheck,
  Mic,
  MicOff,
  MonitorUp,
  User,
  Video,
  VideoOff,
} from "lucide-react";
import { useEffect, useRef } from "react";

type VideoTrackLike = {
  attach?: (element: HTMLVideoElement) => void;
  detach?: (element: HTMLVideoElement) => void;
};

export function TrackTile({
  title,
  subtitle,
  track,
  onClick,
  isMuted,
  isVideoOff,
  isScreenSharing,
  isLocal,
  className,
}: {
  title: string;
  subtitle?: string;
  track: VideoTrackLike | null;
  onClick?: () => void;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isScreenSharing?: boolean;
  isLocal?: boolean;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!track || isVideoOff || !videoElement) {
      return;
    }

    try {
      track.attach?.(videoElement);
    } catch {
      // no-op
    }

    return () => {
      try {
        track.detach?.(videoElement);
      } catch {
        // no-op
      }
    };
  }, [isVideoOff, track]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative h-full w-full overflow-hidden rounded-[26px] border text-left transition",
        isLocal
          ? "border-sky-400/70 bg-[#081018] shadow-[0_0_0_1px_rgba(56,189,248,0.28),0_24px_80px_rgba(8,20,34,0.45)]"
          : "border-[#f5a623]/14 bg-[#0b0806] hover:border-[#f5a623]/30",
        className ?? "",
      ].join(" ")}
    >
      {track && !isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full min-h-45 w-full object-cover"
        />
      ) : (
        <div
          className={[
            "flex min-h-45 w-full items-center justify-center",
            isLocal
              ? "bg-[radial-gradient(circle_at_50%_22%,rgba(56,189,248,0.22),transparent_35%),linear-gradient(180deg,#0f1d2c_0%,#0a1420_100%)] text-[#c5eaff]"
              : "bg-[#110d08] text-[#cfb07a]",
          ].join(" ")}
        >
          <div
            className={[
              "flex h-18 w-18 items-center justify-center rounded-full border backdrop-blur-sm",
              isLocal
                ? "border-sky-300/28 bg-sky-400/12"
                : "border-[#f5a623]/16 bg-[#2a1c0e]",
            ].join(" ")}
          >
            <User className="h-8 w-8" />
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/82 via-black/18 to-transparent" />
      <div
        className={[
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          isLocal
            ? "bg-[radial-gradient(circle_at_75%_12%,rgba(56,189,248,0.24),transparent_34%)]"
            : "bg-[radial-gradient(circle_at_70%_10%,rgba(245,166,35,0.18),transparent_38%)]",
        ].join(" ")}
      />

      <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
        {isLocal ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-sky-300/35 bg-sky-400/16 px-3 py-1 text-[11px] font-semibold text-sky-100 backdrop-blur-sm">
            <BadgeCheck className="h-3.5 w-3.5" />
            You
          </span>
        ) : null}
        {isScreenSharing ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#f5a623]/28 bg-[#261707]/72 px-3 py-1 text-[11px] font-medium text-[#ffe0a8] backdrop-blur-sm">
            <MonitorUp className="h-3.5 w-3.5" />
            Sharing screen
          </span>
        ) : null}
      </div>

      <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
        <div className="flex items-end justify-between gap-3 rounded-2xl border border-white/8 bg-black/28 px-3.5 py-3 backdrop-blur-sm">
          <div className="min-w-0">
            <p
              className={[
                "truncate font-semibold",
                isLocal ? "text-base text-white" : "text-sm text-[#fff3dc]",
              ].join(" ")}
            >
              {title}
            </p>
            {subtitle ? (
              <p
                className={[
                  "mt-0.5 truncate",
                  isLocal
                    ? "text-[13px] text-sky-100/82"
                    : "text-xs text-[#e4c995]/80",
                ].join(" ")}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-black/28 text-[#f6dfb4]/85">
              {isMuted ? (
                <MicOff className="h-3.5 w-3.5 text-red-300" />
              ) : (
                <Mic className="h-3.5 w-3.5" />
              )}
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-black/28 text-[#f6dfb4]/85">
              {isVideoOff ? (
                <VideoOff className="h-3.5 w-3.5 text-red-300" />
              ) : (
                <Video className="h-3.5 w-3.5" />
              )}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
