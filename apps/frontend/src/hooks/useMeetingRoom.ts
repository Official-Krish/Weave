import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Room, RoomEvent, Track, VideoPresets } from "livekit-client";
import type {
  LocalParticipant,
  RemoteParticipant,
  TrackPublication,
} from "livekit-client";
import { http } from "../https";
import type { LivekitTokenResponse } from "@repo/types/api";

type ConnectionState = "idle" | "connecting" | "connected" | "failed";

export type RoomTrackKind = "video" | "audio";

export type RoomTrackSource = "camera" | "screen" | "microphone";

export type RoomTrack = {
  id: string;
  kind: RoomTrackKind;
  source: RoomTrackSource;
  mediaStreamTrack: MediaStreamTrack | null;
  attach: (element: HTMLMediaElement) => void;
  detach: (element?: HTMLMediaElement) => void;
};

type ParticipantState = {
  id: string;
  displayName: string;
  tracks: RoomTrack[];
};

function wrapPublication(publication: TrackPublication): RoomTrack | null {
  const track = publication.track;
  if (!track) {
    return null;
  }

  const kind: RoomTrackKind =
    publication.kind === Track.Kind.Video ? "video" : "audio";

  let source: RoomTrackSource;
  if (
    publication.source === Track.Source.ScreenShare ||
    publication.source === Track.Source.ScreenShareAudio
  ) {
    source = "screen";
  } else if (kind === "audio") {
    source = "microphone";
  } else {
    source = "camera";
  }

  return {
    id: publication.trackSid,
    kind,
    source,
    mediaStreamTrack: track.mediaStreamTrack ?? null,
    attach: (element: HTMLMediaElement) => {
      track.attach(element);
    },
    detach: (element?: HTMLMediaElement) => {
      if (element) {
        track.detach(element);
      } else {
        track.detach();
      }
    },
  };
}

export function useMeetingRoom({
  meetingId,
  displayName,
  selectedCameraId,
  selectedMicId,
  initialMuted = false,
  initialVideoOff = false,
  passcode,
  enabled = true,
}: {
  meetingId: string;
  displayName: string;
  selectedCameraId?: string;
  selectedMicId?: string;
  initialMuted?: boolean;
  initialVideoOff?: boolean;
  passcode?: string;
  enabled?: boolean;
}) {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("idle");
  const [error, setError] = useState<string | null>(null);

  const [isMuted, setIsMuted] = useState(initialMuted);
  const [isVideoOff, setIsVideoOff] = useState(initialVideoOff);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [localParticipantId, setLocalParticipantId] = useState<string | null>(
    null,
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeLayout, setActiveLayout] = useState<"grid" | "focus">("grid");
  const [selectedParticipantId, setSelectedParticipantId] = useState<
    string | null
  >(null);

  const roomRef = useRef<Room | null>(null);

  const [localAudioTrack, setLocalAudioTrack] = useState<RoomTrack | null>(
    null,
  );
  const [localVideoTrack, setLocalVideoTrack] = useState<RoomTrack | null>(
    null,
  );
  const [localScreenTrack, setLocalScreenTrack] = useState<RoomTrack | null>(
    null,
  );
  const [participantsMap, setParticipantsMap] = useState<
    Record<string, ParticipantState>
  >({});

  const clearRoomState = useCallback(() => {
    setParticipantsMap({});
    setLocalAudioTrack(null);
    setLocalVideoTrack(null);
    setLocalScreenTrack(null);
    setLocalParticipantId(null);
    setIsScreenSharing(false);
    setIsMuted(false);
    setIsVideoOff(false);
    setSelectedParticipantId(null);
  }, []);

  const syncLocalTracks = useCallback(() => {
    const room = roomRef.current;
    if (!room) {
      return;
    }
    const local: LocalParticipant = room.localParticipant;
    setLocalParticipantId(local.identity);

    let audio: RoomTrack | null = null;
    let video: RoomTrack | null = null;
    let screen: RoomTrack | null = null;

    local.trackPublications.forEach((publication) => {
      const wrapped = wrapPublication(publication);
      if (!wrapped) {
        return;
      }
      if (publication.source === Track.Source.Microphone) {
        audio = wrapped;
      } else if (publication.source === Track.Source.Camera) {
        video = wrapped;
      } else if (publication.source === Track.Source.ScreenShare) {
        screen = wrapped;
      }
    });

    setLocalAudioTrack(audio);
    setLocalVideoTrack(video);
    setLocalScreenTrack(screen);
    setIsMuted(!local.isMicrophoneEnabled);
    setIsVideoOff(!local.isCameraEnabled);
    setIsScreenSharing(local.isScreenShareEnabled);
  }, []);

  const syncRemoteParticipants = useCallback(() => {
    const room = roomRef.current;
    if (!room) {
      return;
    }

    const next: Record<string, ParticipantState> = {};
    room.remoteParticipants.forEach((participant: RemoteParticipant) => {
      const tracks: RoomTrack[] = [];
      participant.trackPublications.forEach((publication) => {
        if (!publication.isSubscribed) {
          return;
        }
        const wrapped = wrapPublication(publication);
        if (wrapped) {
          tracks.push(wrapped);
        }
      });
      next[participant.identity] = {
        id: participant.identity,
        displayName: participant.name || participant.identity,
        tracks,
      };
    });
    setParticipantsMap(next);
  }, []);

  const leaveRoom = useCallback(() => {
    try {
      roomRef.current?.disconnect();
    } catch {
      // best effort
    }
    roomRef.current = null;
    clearRoomState();
    setConnectionState("idle");
  }, [clearRoomState]);

  const toggleAudio = useCallback(async () => {
    const room = roomRef.current;
    if (!room) {
      return null;
    }

    const nextMuted = room.localParticipant.isMicrophoneEnabled;
    await room.localParticipant.setMicrophoneEnabled(!nextMuted);
    setIsMuted(nextMuted);
    syncLocalTracks();
    return nextMuted;
  }, [syncLocalTracks]);

  const toggleVideo = useCallback(async () => {
    const room = roomRef.current;
    if (!room) {
      return null;
    }

    const nextVideoOff = room.localParticipant.isCameraEnabled;
    await room.localParticipant.setCameraEnabled(!nextVideoOff);
    setIsVideoOff(nextVideoOff);
    syncLocalTracks();
    return nextVideoOff;
  }, [syncLocalTracks]);

  const toggleScreenShare = useCallback(async () => {
    const room = roomRef.current;
    if (!room) {
      return;
    }

    try {
      if (room.localParticipant.isScreenShareEnabled) {
        await room.localParticipant.setScreenShareEnabled(false);
      } else {
        await room.localParticipant.setScreenShareEnabled(true);
      }
      syncLocalTracks();
    } catch {
      setError("Could not start screen sharing.");
    }
  }, [syncLocalTracks]);

  useEffect(() => {
    if (!meetingId || !enabled) {
      return;
    }

    let cancelled = false;

    const init = async () => {
      setConnectionState("connecting");
      setError(null);

      try {
        const { data } = await http.post<LivekitTokenResponse>(
          `/meeting/${meetingId}/token`,
          {
            passcode: passcode || undefined,
          },
        );

        if (cancelled) {
          return;
        }

        // Server is the single source of truth for the LiveKit URL —
        // it arrives with the token so the client needs no SFU env of its own.
        const url = data.url;
        if (!url) {
          throw new Error("LiveKit URL is not configured on the server.");
        }

        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
        });
        roomRef.current = room;

        room
          .on(RoomEvent.ParticipantConnected, syncRemoteParticipants)
          .on(RoomEvent.ParticipantDisconnected, syncRemoteParticipants)
          .on(RoomEvent.TrackSubscribed, syncRemoteParticipants)
          .on(RoomEvent.TrackUnsubscribed, syncRemoteParticipants)
          .on(RoomEvent.TrackMuted, syncRemoteParticipants)
          .on(RoomEvent.TrackUnmuted, syncRemoteParticipants)
          .on(RoomEvent.LocalTrackPublished, syncLocalTracks)
          .on(RoomEvent.LocalTrackUnpublished, syncLocalTracks)
          .on(RoomEvent.TrackMuted, syncLocalTracks)
          .on(RoomEvent.TrackUnmuted, syncLocalTracks)
          .on(RoomEvent.Disconnected, () => {
            if (!cancelled) {
              setConnectionState("idle");
            }
          });

        await room.connect(url, data.token);

        if (cancelled) {
          room.disconnect();
          return;
        }

        try {
          await room.localParticipant.setName(displayName || "Guest");
        } catch {
          // best effort — token name claim already carries the user name
        }

        // Conference audio profile: EC/NS on, AGC off (mirrors
        // buildMeetingAudioConstraints "conference" with plain booleans,
        // which is what LiveKit's AudioCaptureOptions expects).
        await room.localParticipant.setMicrophoneEnabled(!initialMuted, {
          deviceId: selectedMicId || undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
          channelCount: 1,
          sampleRate: 48000,
        });

        if (cancelled) {
          room.disconnect();
          return;
        }

        await room.localParticipant.setCameraEnabled(!initialVideoOff, {
          deviceId: selectedCameraId || undefined,
          resolution: VideoPresets.h1080,
        });

        if (cancelled) {
          room.disconnect();
          return;
        }

        setLocalParticipantId(room.localParticipant.identity);
        syncLocalTracks();
        syncRemoteParticipants();
        setConnectionState("connected");
      } catch (err) {
        console.error("LiveKit initialization error:", err);
        if (!cancelled) {
          setConnectionState("failed");
          setError(
            `LiveKit error: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      try {
        roomRef.current?.disconnect();
      } catch {
        // best effort
      }
      roomRef.current = null;
    };
  }, [
    meetingId,
    enabled,
    displayName,
    passcode,
    selectedCameraId,
    selectedMicId,
    initialMuted,
    initialVideoOff,
    leaveRoom,
    syncLocalTracks,
    syncRemoteParticipants,
  ]);

  const participants = useMemo(
    () => Object.values(participantsMap),
    [participantsMap],
  );

  return {
    connectionState,
    error,
    localAudioTrack,
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
  };
}
