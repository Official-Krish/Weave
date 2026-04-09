import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { JITSI_BASE_URL } from "../lib/config";

type ConnectionState = "idle" | "loading-lib" | "connecting" | "connected" | "failed";

type JitsiTrack = any;
type JitsiConference = any;
type JitsiConnection = any;

declare global {
  interface Window {
    JitsiMeetJS?: any;
  }
}

type ParticipantState = {
  id: string;
  displayName: string;
  tracks: JitsiTrack[];
};

export function useMeetingRoom({
  meetingId,
  displayName,
}: {
  meetingId: string;
  displayName: string;
}) {
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [error, setError] = useState<string | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeLayout, setActiveLayout] = useState<"grid" | "focus">("grid");
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  const connectionRef = useRef<JitsiConnection | null>(null);
  const conferenceRef = useRef<JitsiConference | null>(null);
  const localAudioTrackRef = useRef<JitsiTrack | null>(null);
  const localVideoTrackRef = useRef<JitsiTrack | null>(null);
  const localScreenTrackRef = useRef<JitsiTrack | null>(null);

  const [localVideoTrack, setLocalVideoTrack] = useState<JitsiTrack | null>(null);
  const [participantsMap, setParticipantsMap] = useState<Record<string, ParticipantState>>({});

  const parsedBase = useMemo(() => {
    try {
      return new URL(JITSI_BASE_URL);
    } catch {
      return new URL("http://localhost");
    }
  }, []);

  const fetchJitsiConnectionConfig = useCallback(async () => {
    const fallbackDomain = parsedBase.hostname;
    const fallbackMuc = `conference.${fallbackDomain}`;
    const fallbackBosh = `${parsedBase.protocol}//${parsedBase.host}/http-bind`;
    const fallbackWebsocket = `${parsedBase.protocol === "https:" ? "wss" : "ws"}://${parsedBase.host}/xmpp-websocket`;

    try {
      const response = await fetch(`${JITSI_BASE_URL}/config.js`, { cache: "no-store" });
      const configText = await response.text();

      const extract = (pattern: RegExp) => configText.match(pattern)?.[1]?.trim();

      const domain = extract(/config\.hosts\.domain\s*=\s*'([^']+)'/) || fallbackDomain;
      const muc = extract(/config\.hosts\.muc\s*=\s*'([^']+)'/) || fallbackMuc;
      const bosh = extract(/config\.bosh\s*=\s*'([^']+)'/) || fallbackBosh;
      const websocket = extract(/config\.websocket\s*=\s*'([^']+)'/) || fallbackWebsocket;

      return {
        domain,
        muc,
        bosh,
        websocket,
      };
    } catch {
      return {
        domain: fallbackDomain,
        muc: fallbackMuc,
        bosh: fallbackBosh,
        websocket: fallbackWebsocket,
      };
    }
  }, [parsedBase.host, parsedBase.hostname, parsedBase.protocol]);

  const removeRemoteTrackById = useCallback((participantId: string, trackId: string) => {
    setParticipantsMap((prev) => {
      const participant = prev[participantId];
      if (!participant) {
        return prev;
      }
      const nextTracks = participant.tracks.filter((track) => track.getId?.() !== trackId);
      return {
        ...prev,
        [participantId]: {
          ...participant,
          tracks: nextTracks,
        },
      };
    });
  }, []);

  const addRemoteTrack = useCallback((participantId: string, track: JitsiTrack) => {
    setParticipantsMap((prev) => {
      const current =
        prev[participantId] ||
        ({
          id: participantId,
          displayName: participantId,
          tracks: [],
        } as ParticipantState);

      const alreadyExists = current.tracks.some((item) => item.getId?.() === track.getId?.());
      if (alreadyExists) {
        return prev;
      }

      return {
        ...prev,
        [participantId]: {
          ...current,
          tracks: [...current.tracks, track],
        },
      };
    });
  }, []);

  const updateParticipantName = useCallback((participantId: string, nextName: string) => {
    setParticipantsMap((prev) => {
      const current =
        prev[participantId] ||
        ({
          id: participantId,
          displayName: nextName || participantId,
          tracks: [],
        } as ParticipantState);

      return {
        ...prev,
        [participantId]: {
          ...current,
          displayName: nextName || current.displayName || participantId,
        },
      };
    });
  }, []);

  const clearRoomState = useCallback(() => {
    setParticipantsMap({});
    setLocalVideoTrack(null);
    setIsScreenSharing(false);
    setIsMuted(false);
    setIsVideoOff(false);
    setSelectedParticipantId(null);
  }, []);

  const disposeTrack = (track: JitsiTrack | null) => {
    if (!track) {
      return;
    }
    try {
      track.dispose?.();
    } catch {
      // best effort
    }
  };

  const leaveRoom = useCallback(() => {
    try {
      const conference = conferenceRef.current;
      if (conference) {
        conference.leave?.();
      }
    } catch {
      // best effort
    }

    disposeTrack(localScreenTrackRef.current);
    disposeTrack(localVideoTrackRef.current);
    disposeTrack(localAudioTrackRef.current);

    localScreenTrackRef.current = null;
    localVideoTrackRef.current = null;
    localAudioTrackRef.current = null;

    try {
      connectionRef.current?.disconnect?.();
    } catch {
      // best effort
    }

    conferenceRef.current = null;
    connectionRef.current = null;
    clearRoomState();
    setConnectionState("idle");
  }, [clearRoomState]);

  const toggleAudio = useCallback(async () => {
    const track = localAudioTrackRef.current;
    if (!track) {
      return;
    }

    if (isMuted) {
      await track.unmute?.();
      setIsMuted(false);
    } else {
      await track.mute?.();
      setIsMuted(true);
    }
  }, [isMuted]);

  const toggleVideo = useCallback(async () => {
    const track = localVideoTrackRef.current;
    if (!track) {
      return;
    }

    if (isVideoOff) {
      await track.unmute?.();
      setIsVideoOff(false);
    } else {
      await track.mute?.();
      setIsVideoOff(true);
    }
  }, [isVideoOff]);

  const toggleScreenShare = useCallback(async () => {
    const JitsiMeetJS = window.JitsiMeetJS;
    const conference = conferenceRef.current;

    if (!JitsiMeetJS || !conference) {
      return;
    }

    if (localScreenTrackRef.current) {
      try {
        conference.removeTrack?.(localScreenTrackRef.current);
      } catch {
        // no-op
      }
      disposeTrack(localScreenTrackRef.current);
      localScreenTrackRef.current = null;
      setIsScreenSharing(false);
      return;
    }

    try {
      const tracks = await JitsiMeetJS.createLocalTracks({ devices: ["desktop"] });
      const screenTrack = tracks?.[0];
      if (!screenTrack) {
        return;
      }
      localScreenTrackRef.current = screenTrack;
      conference.addTrack?.(screenTrack);
      setIsScreenSharing(true);
    } catch {
      setError("Could not start screen sharing.");
    }
  }, []);

  useEffect(() => {
    if (!meetingId) {
      return;
    }

    let cancelled = false;
    const scriptId = "weave-lib-jitsi";

    const init = async () => {
      setConnectionState("loading-lib");
      setError(null);

      try {
        if (!window.JitsiMeetJS) {
          await new Promise<void>((resolve, reject) => {
            const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
            if (existing) {
              existing.addEventListener("load", () => resolve(), { once: true });
              existing.addEventListener("error", () => reject(new Error("load error")), { once: true });
              return;
            }

            const script = document.createElement("script");
            script.id = scriptId;
            script.async = true;
            script.src = `${JITSI_BASE_URL}/libs/lib-jitsi-meet.min.js`;
            script.addEventListener("load", () => resolve(), { once: true });
            script.addEventListener("error", () => reject(new Error("load error")), { once: true });
            document.body.appendChild(script);
          });
        }

        if (cancelled || !window.JitsiMeetJS) {
          return;
        }

        const JitsiMeetJS = window.JitsiMeetJS;
        JitsiMeetJS.init({ disableAudioLevels: true });
        JitsiMeetJS.setLogLevel?.(JitsiMeetJS.logLevels?.ERROR ?? "error");

        setConnectionState("connecting");

        const runtimeConfig = await fetchJitsiConnectionConfig();
        const connection = new JitsiMeetJS.JitsiConnection(null, null, {
          hosts: {
            domain: runtimeConfig.domain,
            muc: runtimeConfig.muc,
          },
          serviceUrl: runtimeConfig.websocket,
          bosh: runtimeConfig.bosh,
          clientNode: "http://jitsi.org/jitsimeet",
        });

        connectionRef.current = connection;

        connection.addEventListener(
          JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
          async () => {
            if (cancelled || !connectionRef.current) {
              return;
            }

            const conference = connectionRef.current.initJitsiConference(meetingId, {
              openBridgeChannel: true,
            });
            conferenceRef.current = conference;

            conference.on(JitsiMeetJS.events.conference.USER_JOINED, (participantId: string, user: any) => {
              updateParticipantName(participantId, user?.getDisplayName?.() || participantId);
            });

            conference.on(JitsiMeetJS.events.conference.USER_LEFT, (participantId: string) => {
              setParticipantsMap((prev) => {
                const next = { ...prev };
                delete next[participantId];
                return next;
              });
            });

            conference.on(JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED, (participantId: string, name: string) => {
              updateParticipantName(participantId, name);
            });

            conference.on(JitsiMeetJS.events.conference.TRACK_ADDED, (track: JitsiTrack) => {
              if (!track || track.isLocal?.()) {
                return;
              }
              const participantId = track.getParticipantId?.();
              if (participantId) {
                addRemoteTrack(participantId, track);
              }
            });

            conference.on(JitsiMeetJS.events.conference.TRACK_REMOVED, (track: JitsiTrack) => {
              if (!track || track.isLocal?.()) {
                return;
              }
              const participantId = track.getParticipantId?.();
              const trackId = track.getId?.();
              if (participantId && trackId) {
                removeRemoteTrackById(participantId, trackId);
              }
            });

            conference.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, () => {
              setConnectionState("connected");
            });

            conference.on(JitsiMeetJS.events.conference.CONFERENCE_LEFT, () => {
              setConnectionState("idle");
            });

            const localTracks = await JitsiMeetJS.createLocalTracks({ devices: ["audio", "video"] });
            localTracks.forEach((track: JitsiTrack) => {
              conference.addTrack(track);
              if (track.getType?.() === "audio") {
                localAudioTrackRef.current = track;
              }
              if (track.getType?.() === "video") {
                localVideoTrackRef.current = track;
                setLocalVideoTrack(track);
              }
            });

            conference.setDisplayName?.(displayName || "Guest");
            conference.join();
          }
        );

        connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, () => {
          setConnectionState("failed");
          setError(
            "Could not connect to Jitsi XMPP. If using localhost, open https://localhost:8443 once to trust the local certificate, then retry."
          );
        });

        connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, () => {
          setConnectionState("idle");
        });

        connection.connect();
      } catch {
        if (!cancelled) {
          setConnectionState("failed");
          setError("Could not initialize custom Jitsi meeting.");
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      leaveRoom();
    };
  }, [
    addRemoteTrack,
    displayName,
    leaveRoom,
    meetingId,
    parsedBase.host,
    parsedBase.hostname,
    parsedBase.protocol,
    fetchJitsiConnectionConfig,
    removeRemoteTrackById,
    updateParticipantName,
  ]);

  const participants = useMemo(() => Object.values(participantsMap), [participantsMap]);

  return {
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
  };
}
