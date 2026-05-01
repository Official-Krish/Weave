import type { ServerWebSocket } from "bun";

export type SocketMetadata = {
  roomId: string;
  participantId: string;
  displayName: string;
  isHost: boolean;
};

export type RoomParticipant = {
  participantId: string;
  displayName: string;
  isTyping: boolean;
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
};

export type WsPayload = Record<string, unknown>;

export type RelayerSocket = ServerWebSocket<unknown>;
