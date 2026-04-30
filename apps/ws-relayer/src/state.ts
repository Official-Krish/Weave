import type { RelayerSocket, RoomParticipant, SocketMetadata } from "./types";

export const roomRecordingStates = new Map<string, boolean>();
export const roomSockets = new Map<string, Set<RelayerSocket>>();
export const socketMetadata = new Map<RelayerSocket, SocketMetadata>();
export const roomParticipants = new Map<string, Map<string, RoomParticipant>>();
export const hostDisconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function getParticipantList(roomId: string) {
  const participants = roomParticipants.get(roomId);
  if (!participants) {
    return [] as RoomParticipant[];
  }

  return [...participants.values()];
}

export function upsertParticipant(roomId: string, participant: RoomParticipant) {
  if (!roomParticipants.has(roomId)) {
    roomParticipants.set(roomId, new Map());
  }

  roomParticipants.get(roomId)?.set(participant.participantId, participant);
}

export function updateParticipantMediaState(
  roomId: string,
  participantId: string,
  mediaState: Pick<RoomParticipant, "isMuted" | "isVideoOff">
) {
  const participant = roomParticipants.get(roomId)?.get(participantId);
  if (!participant) {
    return null;
  }

  participant.isMuted = mediaState.isMuted;
  participant.isVideoOff = mediaState.isVideoOff;
  return participant;
}

export function addSocketToRoom(roomId: string, ws: RelayerSocket) {
  if (!roomSockets.has(roomId)) {
    roomSockets.set(roomId, new Set());
  }

  roomSockets.get(roomId)?.add(ws);
}

export function removeSocketFromMaps(ws: RelayerSocket) {
  const metadata = socketMetadata.get(ws);
  if (!metadata) {
    return null;
  }

  const { roomId, participantId } = metadata;
  roomSockets.get(roomId)?.delete(ws);
  roomParticipants.get(roomId)?.delete(participantId);
  socketMetadata.delete(ws);

  const sockets = roomSockets.get(roomId);
  if (sockets && sockets.size === 0) {
    roomSockets.delete(roomId);
    roomParticipants.delete(roomId);
    roomRecordingStates.delete(roomId);
  }

  return metadata;
}
