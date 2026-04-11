import { useMutation } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { AudioTrackSink } from "../components/Meeting/AudioTrackSink";
import { MeetingAlerts } from "../components/Meeting/MeetingAlerts";
import { MeetingChatSidebar } from "../components/Meeting/MeetingChatSidebar";
import { MeetingControls } from "../components/Meeting/MeetingControls";
import { MeetingInfo } from "../components/Meeting/MeetingInfo";
import { RecordingIndicator } from "../components/Meeting/RecordingIndicator";
import { MeetingStage } from "../components/Meeting/MeetingStage";
import { ParticipantsSidebar } from "../components/Meeting/ParticipantsSidebar";
import { useMeetingRealtime } from "../hooks/useMeetingRealtime";
import { useMeetingRecording } from "../hooks/useMeetingRecording";
import { useMeetingRoom } from "../hooks/useMeetingRoom";
import { http } from "../https";
import type { FocusedTiles, MeetingConnectionState, MeetingParticipantState, MeetingTile, RemoteAudioTrackItem } from "../types/meeting";

export function LiveMeetingPage() {
  const { meetingId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [ending, setEnding] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const endingRef = useRef(false);

  const displayName = searchParams.get("name") || "Guest";
  const isHost = searchParams.get("role") === "host";
  const roomName = useMemo(() => meetingId.trim(), [meetingId]);

  useEffect(() => {
    endingRef.current = ending;
  }, [ending]);

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

  const allTiles = useMemo<MeetingTile[]>(() => {
    const remoteTiles = participants.flatMap((participant) => {
      const cameraTrack =
        participant.tracks.find((track) => track.getType?.() === "video" && track.getVideoType?.() !== "desktop") ||
        null;
      const screenTrack =
        participant.tracks.find((track) => track.getType?.() === "video" && track.getVideoType?.() === "desktop") ||
        null;

      const participantName = participant.displayName || participant.id;
      const audioTrack = participant.tracks.find((track) => track.getType?.() === "audio") || null;
      const isParticipantMuted = Boolean(audioTrack?.isMuted?.());
      const isParticipantVideoOff = !cameraTrack || Boolean(cameraTrack?.isMuted?.());

      const tiles = [
        {
          id: participant.id,
          title: participantName,
          subtitle: "Remote participant",
          track: cameraTrack,
          participantId: participant.id,
          isMuted: isParticipantMuted,
          isVideoOff: isParticipantVideoOff,
          isScreenSharing: Boolean(screenTrack),
        },
      ];

      if (screenTrack) {
        tiles.push({
          id: `${participant.id}-screen`,
          title: `${participantName} screen`,
          subtitle: "Screen share",
          track: screenTrack,
          participantId: participant.id,
          isMuted: isParticipantMuted,
          isVideoOff: false,
          isScreenSharing: true,
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
        participantId: "local",
        isMuted,
        isVideoOff,
        isScreenSharing,
      },
    ];

    if (localScreenTrack) {
      tiles.push({
        id: "local-screen",
        title: `${displayName} screen`,
        subtitle: "Your screen share",
        track: localScreenTrack,
        participantId: "local",
        isMuted,
        isVideoOff: false,
        isScreenSharing: true,
      });
    }

    return [
      ...tiles,
      ...remoteTiles,
    ];
  }, [displayName, localScreenTrack, localVideoTrack, participants]);

  const remoteAudioTracks = useMemo<RemoteAudioTrackItem[]>(
    () =>
      participants
        .map((participant) => ({
          id: participant.id,
          track: participant.tracks.find((track) => track.getType?.() === "audio") || null,
        }))
        .filter((item) => item.track),
    [participants]
  );

  const participantList = useMemo<MeetingParticipantState[]>(
    () => {
      const remoteParticipants = participants.map((participant) => {
        const audioTrack = participant.tracks.find((track) => track.getType?.() === "audio") || null;
        const cameraTrack =
          participant.tracks.find((track) => track.getType?.() === "video" && track.getVideoType?.() !== "desktop") || null;
        const screenTrack =
          participant.tracks.find((track) => track.getType?.() === "video" && track.getVideoType?.() === "desktop") || null;

        return {
          id: participant.id,
          name: participant.displayName || participant.id,
          isMuted: Boolean(audioTrack?.isMuted?.()),
          isVideoOff: !cameraTrack || Boolean(cameraTrack?.isMuted?.()),
          isScreenSharing: Boolean(screenTrack),
        };
      });

      return [
        {
          id: "local",
          name: displayName,
          isMuted,
          isVideoOff,
          isScreenSharing,
          isLocal: true,
        },
        ...remoteParticipants,
      ];
    },
    [displayName, isMuted, isScreenSharing, isVideoOff, participants]
  );

  const focusedTiles = useMemo<FocusedTiles | null>(() => {
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

  const {
    isUploadingChunks,
    recordingError,
    startRecordingMutation,
    stopRecordingMutation,
    isRecordingBusy,
    recordingButtonLabel,
    stopLocalChunkRecorder,
    hasActiveRecorder,
  } = useMeetingRecording({
    meetingId,
    roomName,
    localParticipantId,
    connectionState,
    isRecording,
    setIsRecording,
  });

  const {
    connectionStatus: realtimeConnectionStatus,
    chatMessages,
    typingNames,
    unreadCount,
    sendChatMessage,
    setTyping,
    sendMeetingEnded,
    sendRecordingState,
  } = useMeetingRealtime({
    roomId: roomName,
    displayName,
    participantId: localParticipantId,
    isHost,
    onRemoteRecordingState: setIsRecording,
    onParticipantJoined: (participant) => {
      toast.success(`${participant.displayName} joined the meeting`);
    },
    onParticipantLeft: (participant) => {
      toast(`${participant.displayName} left the meeting`);
    },
    onMeetingEnded: ({ displayName: endedBy }) => {
      if (isHost) {
        return;
      }

      if (endingRef.current) {
        return;
      }

      toast.error(`Meeting ended by ${endedBy}`);
      void handleRemoteMeetingEnded();
    },
    isChatOpen,
  });

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

    if (!isHost && hasActiveRecorder()) {
      await stopLocalChunkRecorder();
    }

    leaveRoom();

    navigate("/meetings");
  };

  const handleRemoteMeetingEnded = async () => {
    setEnding(true);

    if (hasActiveRecorder()) {
      await stopLocalChunkRecorder();
    }

    leaveRoom();
    navigate("/meetings");
  };

  const handleEndForAll = async () => {
    if (!isHost || !meetingId || ending) {
      return;
    }

    setEnding(true);

    if (isRecording) {
      try {
        await stopRecordingMutation.mutateAsync();
      } catch {
        // best effort
      }
    }

    sendMeetingEnded();
    leaveRoom();
    toast.success("Meeting ended for all participants");
    await endMeetingMutation.mutateAsync();
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
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="relative h-[calc(100vh-3rem)] overflow-hidden rounded-2xl border border-[#253a48] bg-[#050c12]"
    >
      <RecordingIndicator isRecording={isRecording} />

      <MeetingInfo meetingId={meetingId} participantCount={participantList.length} />

      <div className="absolute left-1/2 top-4 z-30 -translate-x-1/2">
        <Link
          to="/meetings"
          className="inline-flex rounded-full border border-[#2d414f] bg-black/40 px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-[#9cb3c1] transition hover:text-white"
        >
          Back
        </Link>
      </div>

      <div className="absolute inset-0">
        <MeetingStage
          connectionState={connectionState as MeetingConnectionState}
          focusedTiles={focusedTiles}
          allTiles={allTiles}
          onSelectFocusTile={(tileId) => {
            setActiveLayout("focus");
            setSelectedParticipantId(tileId);
          }}
        />
      </div>

      <div className="absolute left-4 right-4 top-16 z-30">
        <MeetingAlerts error={error} recordingError={recordingError} />
      </div>

      {remoteAudioTracks.map((item) => (
        <AudioTrackSink key={`audio-${item.id}`} track={item.track} />
      ))}

      <MeetingControls
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        isSidebarOpen={isSidebarOpen}
        isChatOpen={isChatOpen}
        activeLayout={activeLayout}
        isHost={isHost}
        isUploadingChunks={isUploadingChunks}
        isRecordingBusy={isRecordingBusy}
        canToggleRecording={connectionState === "connected"}
        unreadMessages={unreadCount}
        recordingButtonLabel={recordingButtonLabel}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onToggleSidebar={() => {
          setIsChatOpen(false);
          setIsSidebarOpen((value) => !value);
        }}
        onToggleChat={() => {
          setIsSidebarOpen(false);
          setIsChatOpen((value) => !value);
        }}
        onToggleLayout={() => {
          if (activeLayout === "focus") {
            setActiveLayout("grid");
            setSelectedParticipantId(null);
            return;
          }

          setActiveLayout("focus");
          setSelectedParticipantId(allTiles[0]?.id ?? null);
        }}
        onToggleRecording={() => {
          if (!isHost) {
            return;
          }

          if (isRecording) {
            stopRecordingMutation.mutate(undefined, {
              onSuccess: () => {
                sendRecordingState(false);
              },
            });
            return;
          }

          startRecordingMutation.mutate(undefined, {
            onSuccess: () => {
              sendRecordingState(true);
            },
          });
        }}
        onEndForAll={handleEndForAll}
        onLeaveCall={handleExit}
      />

      <ParticipantsSidebar
        participants={participantList}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <MeetingChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        typingNames={typingNames}
        onSendMessage={sendChatMessage}
        onTyping={setTyping}
      />

      <div className="absolute left-4 top-4 z-30 rounded-full border border-[#2f4452] bg-[#0a141c]/90 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[#8fa8b8]">
        Realtime: {realtimeConnectionStatus}
      </div>

      {ending || endMeetingMutation.isPending ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-xl border border-[#2b3d49] bg-[#0a1218] px-5 py-3 text-sm text-[#dce7ee]">
            Ending meeting...
          </div>
        </div>
      ) : null}
    </motion.section>
  );
}
