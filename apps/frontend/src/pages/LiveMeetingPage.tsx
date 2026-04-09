import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  LayoutGrid,
  LoaderCircle,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Sidebar,
  User,
  Video,
  VideoOff,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMeetingRoom } from "../hooks/useMeetingRoom";
import { http } from "../https";

function TrackTile({
  title,
  subtitle,
  track,
  onClick,
}: {
  title: string;
  subtitle?: string;
  track: any | null;
  onClick?: () => void;
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
      className="relative w-full overflow-hidden rounded-2xl border border-border/70 bg-secondary/30 text-left"
    >
      {track ? (
        <video ref={videoRef} autoPlay playsInline muted className="h-full min-h-45 w-full object-cover" />
      ) : (
        <div className="flex min-h-45 w-full items-center justify-center bg-secondary/40 text-muted-foreground">
          <User className="h-8 w-8" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/65 to-transparent px-3 py-2">
        <p className="text-sm font-medium text-white">{title}</p>
        {subtitle ? <p className="text-xs text-white/80">{subtitle}</p> : null}
      </div>
    </button>
  );
}

export function LiveMeetingPage() {
  const { meetingId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [ending, setEnding] = useState(false);

  const displayName = searchParams.get("name") || "Guest";
  const isHost = searchParams.get("role") === "host";
  const roomName = useMemo(() => meetingId.trim(), [meetingId]);

  const {
    connectionState,
    error,
    localVideoTrack,
    participants,
    isMuted,
    isVideoOff,
    isScreenSharing,
    isRecording,
    setIsRecording,
    isSidebarOpen,
    setIsSidebarOpen,
    activeLayout,
    setActiveLayout,
    selectedParticipantId,
    setSelectedParticipantId,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    leaveRoom,
  } = useMeetingRoom({
    meetingId: roomName,
    displayName,
  });

  const allTiles = useMemo(() => {
    const remoteTiles = participants.map((participant) => {
      const mainTrack =
        participant.tracks.find((track) => track.getType?.() === "video" && track.getVideoType?.() !== "desktop") ||
        null;

      return {
        id: participant.id,
        title: participant.displayName || participant.id,
        subtitle: "Remote participant",
        track: mainTrack,
      };
    });

    return [
      {
        id: "local",
        title: displayName,
        subtitle: "You",
        track: localVideoTrack,
      },
      ...remoteTiles,
    ];
  }, [displayName, localVideoTrack, participants]);

  const focusedTiles = useMemo(() => {
    if (activeLayout !== "focus" || !selectedParticipantId) {
      return null;
    }

    const selected = allTiles.find((tile) => tile.id === selectedParticipantId);
    if (!selected) {
      return null;
    }

    return {
      selected,
      others: allTiles.filter((tile) => tile.id !== selectedParticipantId),
    };
  }, [activeLayout, allTiles, selectedParticipantId]);

  const endMeetingMutation = useMutation({
    mutationFn: async () => {
      await http.post(`/meeting/end/${meetingId}`);
    },
    onSettled: () => {
      navigate("/recordings");
    },
  });

  const handleExit = async () => {
    if (!meetingId || ending) {
      return;
    }

    setEnding(true);
    leaveRoom();

    if (isHost) {
      await endMeetingMutation.mutateAsync();
      return;
    }

    navigate("/meetings");
  };

  if (!roomName) {
    return (
      <section className="rounded-[2rem] border border-border/80 bg-card/82 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <h1 className="text-2xl font-semibold text-foreground">
          Missing meeting room
        </h1>
        <p className="mt-3 text-muted-foreground">
          We could not find a meeting ID for this live room.
        </p>
        <Link
          to="/meetings"
          className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
        >
          Back to meetings
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-5">
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
            onClick={handleExit}
            className="inline-flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-sm font-medium text-white transition hover:brightness-105 disabled:opacity-70"
            disabled={ending || endMeetingMutation.isPending}
          >
            <PhoneOff className="h-4 w-4" />
            {isHost ? "End meeting" : "Leave meeting"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_290px]">
        <div className="rounded-[2rem] border border-border/80 bg-card/90 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.14)]">
          {connectionState === "connecting" || connectionState === "loading-lib" ? (
            <div className="flex h-[62vh] items-center justify-center text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Connecting custom room...
              </span>
            </div>
          ) : focusedTiles ? (
            <div className="grid gap-3">
              <TrackTile
                title={focusedTiles.selected.title}
                subtitle={focusedTiles.selected.subtitle}
                track={focusedTiles.selected.track}
              />
              <div className="grid gap-3 md:grid-cols-3">
                {focusedTiles.others.map((tile) => (
                  <TrackTile
                    key={tile.id}
                    title={tile.title}
                    subtitle={tile.subtitle}
                    track={tile.track}
                    onClick={() => setSelectedParticipantId(tile.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {allTiles.map((tile) => (
                <TrackTile
                  key={tile.id}
                  title={tile.title}
                  subtitle={tile.subtitle}
                  track={tile.track}
                  onClick={() => {
                    setActiveLayout("focus");
                    setSelectedParticipantId(tile.id);
                  }}
                />
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleAudio}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-secondary"
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <button
              type="button"
              onClick={toggleVideo}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-secondary"
            >
              {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              {isVideoOff ? "Start video" : "Stop video"}
            </button>
            <button
              type="button"
              onClick={toggleScreenShare}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-secondary"
            >
              <MonitorUp className="h-4 w-4" />
              {isScreenSharing ? "Stop share" : "Share screen"}
            </button>
            <button
              type="button"
              onClick={() => setIsSidebarOpen((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-secondary"
            >
              <Sidebar className="h-4 w-4" />
              {isSidebarOpen ? "Hide list" : "Show list"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeLayout === "focus") {
                  setActiveLayout("grid");
                  setSelectedParticipantId(null);
                } else {
                  setActiveLayout("focus");
                  setSelectedParticipantId(allTiles[0]?.id ?? null);
                }
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-secondary"
            >
              <LayoutGrid className="h-4 w-4" />
              {activeLayout === "focus" ? "Grid layout" : "Focus layout"}
            </button>
            {isHost ? (
              <button
                type="button"
                onClick={() => setIsRecording((value) => !value)}
                className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-600 hover:bg-red-500/20 dark:text-red-300"
              >
                {isRecording ? "Stop recording" : "Start recording"}
              </button>
            ) : null}
          </div>
        </div>

        {isSidebarOpen ? (
          <aside className="rounded-[2rem] border border-border/80 bg-card/90 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">Participants</h2>
            <ul className="mt-4 space-y-2">
              <li className="rounded-xl border border-border bg-secondary/35 px-3 py-2 text-sm text-foreground">
                {displayName} (you)
              </li>
              {participants.map((participant) => (
                <li
                  key={participant.id}
                  className="rounded-xl border border-border bg-secondary/35 px-3 py-2 text-sm text-foreground"
                >
                  {participant.displayName || participant.id}
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
