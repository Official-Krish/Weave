import { useMutation, useQuery } from "@tanstack/react-query";
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
import type { RecordingStatusResponse } from "../types/api";

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

function AudioTrackSink({ track }: { track: any }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!track || !audioRef.current) {
      return;
    }

    try {
      track.attach(audioRef.current);
      const maybePromise = audioRef.current.play?.();
      if (maybePromise && typeof maybePromise.catch === "function") {
        maybePromise.catch(() => {
          // Autoplay can be blocked until the browser considers this tab user-activated.
        });
      }
    } catch {
      // no-op
    }

    return () => {
      try {
        track.detach(audioRef.current);
      } catch {
        // no-op
      }
    };
  }, [track]);

  return <audio ref={audioRef} autoPlay playsInline className="hidden" />;
}

export function LiveMeetingPage() {
  const CHUNK_DURATION_MS = 5000;

  const { meetingId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [ending, setEnding] = useState(false);
  const [isUploadingChunks, setIsUploadingChunks] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const recorderStartingRef = useRef(false);
  const sequenceRef = useRef(0);
  const uploadChainRef = useRef<Promise<void>>(Promise.resolve());

  const displayName = searchParams.get("name") || "Guest";
  const isHost = searchParams.get("role") === "host";
  const roomName = useMemo(() => meetingId.trim(), [meetingId]);

  const {
    connectionState,
    error,
    localVideoTrack,
    localScreenTrack,
    participants,
    isMuted,
    isVideoOff,
    isScreenSharing,
    isRecording,
    setIsRecording,
    localParticipantId,
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
    const remoteTiles = participants.flatMap((participant) => {
      const cameraTrack =
        participant.tracks.find((track) => track.getType?.() === "video" && track.getVideoType?.() !== "desktop") ||
        null;
      const screenTrack =
        participant.tracks.find((track) => track.getType?.() === "video" && track.getVideoType?.() === "desktop") ||
        null;

      const participantName = participant.displayName || participant.id;
      const tiles = [
        {
          id: participant.id,
          title: participantName,
          subtitle: "Remote participant",
          track: cameraTrack,
        },
      ];

      if (screenTrack) {
        tiles.push({
          id: `${participant.id}-screen`,
          title: `${participantName} screen`,
          subtitle: "Screen share",
          track: screenTrack,
        });
      }

      return tiles;
    });

    const tiles = [
      {
        id: "local",
        title: displayName,
        subtitle: "You",
        track: localVideoTrack,
      },
    ];

    if (localScreenTrack) {
      tiles.push({
        id: "local-screen",
        title: `${displayName} screen`,
        subtitle: "Your screen share",
        track: localScreenTrack,
      });
    }

    return [
      ...tiles,
      ...remoteTiles,
    ];
  }, [displayName, localScreenTrack, localVideoTrack, participants]);

  const remoteAudioTracks = useMemo(
    () =>
      participants
        .map((participant) => ({
          id: participant.id,
          track: participant.tracks.find((track) => track.getType?.() === "audio") || null,
        }))
        .filter((item) => item.track),
    [participants]
  );

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

  const recordingStatusQuery = useQuery<RecordingStatusResponse>({
    queryKey: ["recording-status", meetingId],
    enabled: Boolean(meetingId),
    queryFn: async () => {
      const { data } = await http.get(`/meeting/recording/status/${meetingId}`);
      return data;
    },
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (!recordingStatusQuery.data) {
      return;
    }

    const serverState = recordingStatusQuery.data.recordingState;
    setIsRecording(serverState === "RECORDING");
  }, [recordingStatusQuery.data, setIsRecording]);

  const enqueueChunkUpload = (chunk: Blob) => {
    const meetingKey = roomName;

    if (!meetingKey) {
      return;
    }

    const nextSequence = sequenceRef.current++;
    const startedAt = new Date().toISOString();

    uploadChainRef.current = uploadChainRef.current.then(async () => {
      const formData = new FormData();
      formData.append("video", chunk, `chunk-${nextSequence}.webm`);
      formData.append("meetingId", meetingKey);
      if (localParticipantId) {
        formData.append("participantId", localParticipantId);
      }
      formData.append("sequenceNumber", String(nextSequence));
      formData.append("startedAt", startedAt);
      formData.append("durationMs", String(CHUNK_DURATION_MS));
      formData.append("mimeType", chunk.type || "video/webm");

      await http.post("/upload-chunk", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    });
  };

  const getSupportedMimeType = () => {
    const types = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return "video/webm";
  };

  const cleanupRecorder = () => {
    try {
      mediaRecorderRef.current?.stop();
    } catch {
      // best effort
    }
    mediaRecorderRef.current = null;

    if (recordingStreamRef.current) {
      recordingStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // best effort
        }
      });
      recordingStreamRef.current = null;
    }
  };

  const startLocalChunkRecorder = async (includeAudio: boolean) => {
    if (mediaRecorderRef.current || recorderStartingRef.current) {
      return;
    }

    recorderStartingRef.current = true;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Media capture is not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: includeAudio,
      });

      recordingStreamRef.current = stream;

      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, {
          mimeType: getSupportedMimeType(),
        });
      } catch {
        recorder = new MediaRecorder(stream);
      }

      recorder.ondataavailable = (event) => {
        if (!event.data || event.data.size === 0) {
          return;
        }
        setIsUploadingChunks(true);
        enqueueChunkUpload(event.data);
      };

      recorder.onerror = () => {
        setRecordingError("Chunk recorder failed while capturing meeting.");
      };

      recorder.onstop = async () => {
        await uploadChainRef.current;
        setIsUploadingChunks(false);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(CHUNK_DURATION_MS);
    } finally {
      recorderStartingRef.current = false;
    }
  };

  const stopLocalChunkRecorder = async () => {
    cleanupRecorder();
    await uploadChainRef.current;
    setIsUploadingChunks(false);
  };

  const startRecordingMutation = useMutation({
    mutationFn: async () => {
      await http.post(`/meeting/recording/start/${meetingId}`);
      sequenceRef.current = 0;
      uploadChainRef.current = Promise.resolve();
      await startLocalChunkRecorder(true);
    },
    onSuccess: () => {
      setRecordingError(null);
      setIsRecording(true);
      recordingStatusQuery.refetch();
    },
    onError: () => {
      cleanupRecorder();
      setRecordingError("Could not start recording. Check permissions and try again.");
      setIsRecording(false);
    },
  });

  const stopRecordingMutation = useMutation({
    mutationFn: async () => {
      await stopLocalChunkRecorder();
      await http.post(`/meeting/recording/stop/${meetingId}`);
    },
    onSuccess: () => {
      setIsRecording(false);
      recordingStatusQuery.refetch();
    },
    onError: () => {
      setRecordingError("Could not stop recording cleanly.");
    },
  });

  useEffect(() => {
    return () => {
      cleanupRecorder();
    };
  }, []);

  useEffect(() => {
    const serverState = recordingStatusQuery.data?.recordingState;
    if (!serverState || connectionState !== "connected") {
      return;
    }

    const shouldRecord = serverState === "RECORDING";

    if (shouldRecord) {
      startLocalChunkRecorder(isHost).catch(() => {
        setRecordingError(
          isHost
            ? "Could not start local recording. Please allow camera and microphone permission."
            : "Could not start local recording. Please allow camera permission."
        );
      });
      return;
    }

    if (mediaRecorderRef.current) {
      void stopLocalChunkRecorder();
    }
  }, [connectionState, localParticipantId, recordingStatusQuery.data?.recordingState]);

  const isRecordingBusy = startRecordingMutation.isPending || stopRecordingMutation.isPending;
  const recordingButtonLabel = stopRecordingMutation.isPending
    ? "Stopping..."
    : startRecordingMutation.isPending
      ? "Starting..."
      : isRecording
        ? "Stop recording"
        : "Start recording";

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

    if (isRecording && isHost) {
      try {
        await stopRecordingMutation.mutateAsync();
      } catch {
        // best effort
      }
    }

    if (!isHost && mediaRecorderRef.current) {
      await stopLocalChunkRecorder();
    }

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

      {recordingError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {recordingError}
        </div>
      ) : null}

      {remoteAudioTracks.map((item) => (
        <AudioTrackSink key={`audio-${item.id}`} track={item.track} />
      ))}

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
                onClick={() => {
                  if (isRecording) {
                    stopRecordingMutation.mutate();
                    return;
                  }
                  startRecordingMutation.mutate();
                }}
                disabled={isRecordingBusy || connectionState !== "connected"}
                className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-600 hover:bg-red-500/20 dark:text-red-300"
              >
                {recordingButtonLabel}
              </button>
            ) : null}

            {isHost && isUploadingChunks ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                Uploading chunks...
              </span>
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
