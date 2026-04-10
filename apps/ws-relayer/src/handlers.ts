import {
  addSocketToRoom,
  getParticipantList,
  removeSocketFromMaps,
  roomParticipants,
  roomRecordingStates,
  socketMetadata,
  upsertParticipant,
} from "./state";
import { broadcastToRoom, normalizeText, sendJson } from "./socket-utils";
import type { RelayerSocket, SocketMetadata, WsPayload } from "./types";

function broadcastParticipantList(roomId: string) {
  broadcastToRoom(roomId, {
    type: "participant-list",
    roomId,
    participants: getParticipantList(roomId),
  });
}

function handleSocketLeave(ws: RelayerSocket) {
  const metadata = removeSocketFromMaps(ws);
  if (!metadata) {
    return;
  }

  broadcastToRoom(metadata.roomId, {
    type: "participant-left",
    roomId: metadata.roomId,
    participantId: metadata.participantId,
    displayName: metadata.displayName,
  });

  broadcastParticipantList(metadata.roomId);
}

function handleJoinRoom(ws: RelayerSocket, data: WsPayload, roomId: string) {
  handleSocketLeave(ws);

  const displayName = normalizeText(data.displayName, 80) || "Guest";
  const participantId =
    (typeof data.participantId === "string" && data.participantId.trim()) || crypto.randomUUID();
  const isHost = Boolean(data.isHost);

  addSocketToRoom(roomId, ws);
  upsertParticipant(roomId, {
    participantId,
    displayName,
    isTyping: false,
    isHost,
  });

  const metadata: SocketMetadata = {
    roomId,
    participantId,
    displayName,
    isHost,
  };
  socketMetadata.set(ws, metadata);

  sendJson(ws, {
    type: "joined-room",
    roomId,
    participantId,
    displayName,
    isHost,
    isRecording: roomRecordingStates.get(roomId) ?? false,
  });

  broadcastToRoom(
    roomId,
    {
      type: "participant-joined",
      roomId,
      participant: {
        participantId,
        displayName,
        isTyping: false,
        isHost,
      },
    },
    ws
  );

  broadcastParticipantList(roomId);
}

export function handleSocketClose(ws: RelayerSocket) {
  handleSocketLeave(ws);
}

export function handleSocketMessage(ws: RelayerSocket, data: WsPayload) {
  const type = typeof data.type === "string" ? data.type : "";
  const roomId = typeof data.roomId === "string" ? data.roomId.trim() : "";

  if (!type) {
    sendJson(ws, { type: "error", message: "Message type is required" });
    return;
  }

  if (type === "join-room") {
    if (!roomId) {
      sendJson(ws, { type: "error", message: "roomId is required for join-room" });
      return;
    }

    handleJoinRoom(ws, data, roomId);
    return;
  }

  const metadata = socketMetadata.get(ws);
  if (!metadata || metadata.roomId !== roomId) {
    sendJson(ws, { type: "error", message: "Join the room before sending events" });
    return;
  }

  if (type === "recording-state") {
    const isRecording = Boolean(data.isRecording);
    roomRecordingStates.set(roomId, isRecording);
    broadcastToRoom(roomId, {
      type: "recording-state",
      roomId,
      isRecording,
      participantId: metadata.participantId,
    });
    return;
  }

  if (type === "get-recording-state") {
    sendJson(ws, {
      type: "recording-state",
      roomId,
      isRecording: roomRecordingStates.get(roomId) ?? false,
    });
    return;
  }

  if (type === "chat-message") {
    const text = normalizeText(data.text, 1000);
    if (!text) {
      return;
    }

    broadcastToRoom(roomId, {
      type: "chat-message",
      id: crypto.randomUUID(),
      roomId,
      text,
      timestamp: Date.now(),
      sender: {
        participantId: metadata.participantId,
        displayName: metadata.displayName,
      },
    });
    return;
  }

  if (type === "typing-state") {
    const isTyping = Boolean(data.isTyping);
    const participant = roomParticipants.get(roomId)?.get(metadata.participantId);
    if (participant) {
      participant.isTyping = isTyping;
    }

    broadcastToRoom(
      roomId,
      {
        type: "typing-state",
        roomId,
        participantId: metadata.participantId,
        displayName: metadata.displayName,
        isTyping,
      },
      ws
    );
    return;
  }

  if (type === "meeting-ended") {
    if (!metadata.isHost) {
      sendJson(ws, { type: "error", message: "Only host can end the meeting for all" });
      return;
    }

    broadcastToRoom(roomId, {
      type: "meeting-ended",
      roomId,
      endedBy: {
        participantId: metadata.participantId,
        displayName: metadata.displayName,
      },
      timestamp: Date.now(),
    });
    return;
  }

  if (type === "leave-room") {
    handleSocketLeave(ws);
    sendJson(ws, { type: "left-room", roomId });
    return;
  }

  if (type === "ping") {
    sendJson(ws, { type: "pong", timestamp: Date.now() });
    return;
  }

  sendJson(ws, { type: "error", message: `Unsupported message type: ${type}` });
}
