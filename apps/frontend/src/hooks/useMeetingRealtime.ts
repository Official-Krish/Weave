import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WS_RELAYER_URL } from "../lib/config";
import {
  removeParticipantMediaState,
  setParticipantMediaState,
  type ParticipantMediaState,
  type ParticipantMediaStateMap,
} from "../lib/participantMediaState";

type UseMeetingRealtimeOptions = {
  roomId: string;
  displayName: string;
  participantId?: string | null;
  isHost?: boolean;
  enabled?: boolean;
  localMediaState?: ParticipantMediaState;
  onRemoteRecordingState?: (isRecording: boolean) => void;
  onParticipantJoined?: (participant: {
    participantId: string;
    displayName: string;
    isHost: boolean;
    isMuted: boolean;
    isVideoOff: boolean;
  }) => void;
  onParticipantLeft?: (participant: { participantId: string; displayName: string }) => void;
  onMeetingEnded?: (endedBy: { participantId: string; displayName: string }) => void;
  isChatOpen?: boolean;
};

type ConnectionStatus = "disconnected" | "connecting" | "connected";

export type RealtimeChatMessage = {
  id: string;
  text: string;
  senderName: string;
  senderId: string;
  timestamp: number;
  isOwn: boolean;
};

type IncomingMessage = {
  type?: string;
  id?: string;
  text?: string;
  timestamp?: number;
  sender?: {
    participantId?: string;
    displayName?: string;
  };
  participant?: {
    participantId?: string;
    displayName?: string;
    isHost?: boolean;
    isMuted?: boolean;
    isVideoOff?: boolean;
  };
  participants?: Array<{
    participantId?: string;
    displayName?: string;
    isHost?: boolean;
    isMuted?: boolean;
    isVideoOff?: boolean;
  }>;
  endedBy?: {
    participantId?: string;
    displayName?: string;
  };
  participantId?: string;
  displayName?: string;
  isTyping?: boolean;
  isRecording?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
};

const RECONNECT_DELAY_MS = 1500;

export function useMeetingRealtime({
  roomId,
  displayName,
  participantId,
  isHost = false,
  enabled = true,
  localMediaState,
  onRemoteRecordingState,
  onParticipantJoined,
  onParticipantLeft,
  onMeetingEnded,
  isChatOpen = false,
}: UseMeetingRealtimeOptions) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(true);
  const connectRef = useRef<() => void>(() => {});
  const typingTimeoutRef = useRef<number | null>(null);
  const isChatOpenRef = useRef(isChatOpen);
  const selfParticipantIdRef = useRef<string | null>(participantId ?? null);
  const localMediaStateRef = useRef<ParticipantMediaState>(
    localMediaState ?? { isMuted: false, isVideoOff: false }
  );
  const onParticipantJoinedRef = useRef(onParticipantJoined);
  const onParticipantLeftRef = useRef(onParticipantLeft);
  const onMeetingEndedRef = useRef(onMeetingEnded);
  const onRemoteRecordingStateRef = useRef(onRemoteRecordingState);

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [chatMessages, setChatMessages] = useState<RealtimeChatMessage[]>([]);
  const [typingParticipants, setTypingParticipants] = useState<Record<string, string>>({});
  const [participantMediaStates, setParticipantMediaStates] = useState<ParticipantMediaStateMap>({});
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
  }, [isChatOpen]);

  useEffect(() => {
    if (participantId) {
      selfParticipantIdRef.current = participantId;
    }
  }, [participantId]);

  useEffect(() => {
    if (localMediaState) {
      localMediaStateRef.current = localMediaState;
    }
  }, [localMediaState]);

  useEffect(() => {
    onParticipantJoinedRef.current = onParticipantJoined;
  }, [onParticipantJoined]);

  useEffect(() => {
    onParticipantLeftRef.current = onParticipantLeft;
  }, [onParticipantLeft]);

  useEffect(() => {
    onMeetingEndedRef.current = onMeetingEnded;
  }, [onMeetingEnded]);

  useEffect(() => {
    onRemoteRecordingStateRef.current = onRemoteRecordingState;
  }, [onRemoteRecordingState]);

  const safeSend = useCallback((payload: Record<string, unknown>) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(JSON.stringify(payload));
    return true;
  }, []);

  const connect = useCallback(() => {
    if (!enabled || !roomId) {
      return;
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus("connecting");
    const socket = new WebSocket(WS_RELAYER_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnectionStatus("connected");
      safeSend({
        type: "join-room",
        roomId,
        displayName,
        participantId: selfParticipantIdRef.current ?? undefined,
        isHost,
        isMuted: localMediaStateRef.current.isMuted,
        isVideoOff: localMediaStateRef.current.isVideoOff,
      });
      safeSend({ type: "get-recording-state", roomId });
    };

    socket.onmessage = (event) => {
      let payload: IncomingMessage = {};

      try {
        payload = JSON.parse(event.data as string) as IncomingMessage;
      } catch {
        return;
      }

      if (payload.type === "recording-state" && typeof payload.isRecording === "boolean") {
        onRemoteRecordingStateRef.current?.(payload.isRecording);
      }

      if (payload.type === "joined-room" && payload.participantId) {
        selfParticipantIdRef.current = payload.participantId;
      }

      if (payload.type === "participant-joined" && payload.participant?.participantId && payload.participant.displayName) {
        if (payload.participant.participantId !== selfParticipantIdRef.current) {
          onParticipantJoinedRef.current?.({
            participantId: payload.participant.participantId,
            displayName: payload.participant.displayName,
            isHost: Boolean(payload.participant.isHost),
            isMuted: Boolean(payload.participant.isMuted),
            isVideoOff: Boolean(payload.participant.isVideoOff),
          });
        }

        setParticipantMediaStates((current) =>
          setParticipantMediaState(current, payload.participant!.participantId!, {
            isMuted: Boolean(payload.participant!.isMuted),
            isVideoOff: Boolean(payload.participant!.isVideoOff),
          })
        );
      }

      if (payload.type === "participant-left" && payload.participantId && payload.displayName) {
        setParticipantMediaStates((current) => removeParticipantMediaState(current, payload.participantId as string));

        if (payload.participantId !== selfParticipantIdRef.current) {
          onParticipantLeftRef.current?.({
            participantId: payload.participantId,
            displayName: payload.displayName,
          });
        }
      }

      if (payload.type === "meeting-ended" && payload.endedBy?.participantId && payload.endedBy.displayName) {
        onMeetingEndedRef.current?.({
          participantId: payload.endedBy.participantId,
          displayName: payload.endedBy.displayName,
        });
      }

      if (payload.type === "participant-list" && Array.isArray(payload.participants)) {
        setParticipantMediaStates(() => {
          const next: ParticipantMediaStateMap = {};
          for (const participant of payload.participants ?? []) {
            if (!participant.participantId) {
              continue;
            }
            next[participant.participantId] = {
              isMuted: Boolean(participant.isMuted),
              isVideoOff: Boolean(participant.isVideoOff),
            };
          }
          return next;
        });
      }

      if (
        payload.type === "participant-media-state" &&
        payload.participantId &&
        typeof payload.isMuted === "boolean" &&
        typeof payload.isVideoOff === "boolean"
      ) {
        setParticipantMediaStates((current) =>
          setParticipantMediaState(current, payload.participantId as string, {
            isMuted: payload.isMuted as boolean,
            isVideoOff: payload.isVideoOff as boolean,
          })
        );
      }

      if (payload.type === "chat-message" && payload.text && payload.sender?.participantId) {
        const isOwn =
          (selfParticipantIdRef.current && payload.sender.participantId === selfParticipantIdRef.current) || false;
        const message: RealtimeChatMessage = {
          id: payload.id || crypto.randomUUID(),
          text: payload.text,
          senderId: payload.sender.participantId,
          senderName: payload.sender.displayName || "Guest",
          timestamp: payload.timestamp || Date.now(),
          isOwn,
        };

        setChatMessages((current) => [...current, message]);
        setTypingParticipants((current) => {
          const next = { ...current };
          delete next[message.senderId];
          return next;
        });

        if (!isChatOpenRef.current && !isOwn) {
          setUnreadCount((count) => count + 1);
        }
      }

      if (payload.type === "typing-state" && payload.participantId && payload.displayName) {
        setTypingParticipants((current) => {
          const next = { ...current };
          if (payload.isTyping) {
            next[payload.participantId as string] = payload.displayName as string;
          } else {
            delete next[payload.participantId as string];
          }
          return next;
        });
      }
    };

    socket.onclose = () => {
      setConnectionStatus("disconnected");
      socketRef.current = null;

      if (!shouldReconnectRef.current) {
        return;
      }

      reconnectTimerRef.current = window.setTimeout(() => {
        connectRef.current();
      }, RECONNECT_DELAY_MS);
    };

    socket.onerror = () => {
      setConnectionStatus("disconnected");
    };
  }, [
    displayName,
    enabled,
    isHost,
    roomId,
    safeSend,
  ]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    shouldReconnectRef.current = true;
    connect();

    return () => {
      shouldReconnectRef.current = false;

      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
      }

      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }

      safeSend({ type: "leave-room", roomId });
      socketRef.current?.close();
      socketRef.current = null;
      setTypingParticipants({});
    };
  }, [connect, roomId, safeSend]);

  useEffect(() => {
    if (isChatOpen) {
      setUnreadCount(0);
    }
  }, [isChatOpen]);

  const sendChatMessage = useCallback(
    (text: string) => {
      const normalized = text.trim();
      if (!normalized) {
        return false;
      }

      return safeSend({
        type: "chat-message",
        roomId,
        text: normalized,
      });
    },
    [roomId, safeSend]
  );

  const setTyping = useCallback(
    (isTyping: boolean) => {
      safeSend({
        type: "typing-state",
        roomId,
        isTyping,
      });

      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }

      if (isTyping) {
        typingTimeoutRef.current = window.setTimeout(() => {
          safeSend({
            type: "typing-state",
            roomId,
            isTyping: false,
          });
        }, 1200);
      }
    },
    [roomId, safeSend]
  );

  const typingNames = useMemo(() => Object.values(typingParticipants), [typingParticipants]);

  const sendMeetingEnded = useCallback(() => {
    return safeSend({
      type: "meeting-ended",
      roomId,
    });
  }, [roomId, safeSend]);

  const sendRecordingState = useCallback(
    (isRecording: boolean) => {
      return safeSend({
        type: "recording-state",
        roomId,
        isRecording,
      });
    },
    [roomId, safeSend]
  );

  const sendMediaState = useCallback(
    (mediaState: ParticipantMediaState) => {
      localMediaStateRef.current = mediaState;

      const sent = safeSend({
        type: "media-state",
        roomId,
        isMuted: mediaState.isMuted,
        isVideoOff: mediaState.isVideoOff,
      });

      const selfParticipantId = selfParticipantIdRef.current;
      if (selfParticipantId) {
        setParticipantMediaStates((current) =>
          setParticipantMediaState(current, selfParticipantId, mediaState)
        );
      }

      return sent;
    },
    [roomId, safeSend]
  );

  return {
    connectionStatus,
    chatMessages,
    typingNames,
    participantMediaStates,
    unreadCount,
    sendChatMessage,
    setTyping,
    sendMeetingEnded,
    sendRecordingState,
    sendMediaState,
  };
}
