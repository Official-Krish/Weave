import { ArrowLeft, PhoneOff } from "lucide-react";
import { Link } from "react-router-dom";
import type { MeetingConnectionState } from "../../types/meeting";

type MeetingHeaderProps = {
  meetingId: string;
  displayName: string;
  connectionState: MeetingConnectionState;
  isHost: boolean;
  ending: boolean;
  isEndingPending: boolean;
  onExit: () => void;
};

export function MeetingHeader({
  meetingId,
  displayName,
  connectionState,
  isHost,
  ending,
  isEndingPending,
  onExit,
}: MeetingHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-border/80 bg-card/82 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Live Meeting
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Room {meetingId}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Joined as {displayName}
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs text-muted-foreground">
          {connectionState === "connected"
            ? "Connected"
            : connectionState === "connecting" || connectionState === "loading-lib"
              ? "Connecting"
              : connectionState === "failed"
                ? "Connection failed"
                : "Idle"}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/meetings"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-sm font-medium text-white transition hover:brightness-105 disabled:opacity-70"
          disabled={ending || isEndingPending}
        >
          <PhoneOff className="h-4 w-4" />
          {isHost ? "End meeting" : "Leave meeting"}
        </button>
      </div>
    </div>
  );
}
