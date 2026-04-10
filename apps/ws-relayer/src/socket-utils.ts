import { roomSockets } from "./state";
import type { RelayerSocket, WsPayload } from "./types";

export function sendJson(ws: RelayerSocket, payload: WsPayload) {
  if (ws.readyState !== WebSocket.OPEN) {
    return;
  }

  ws.send(JSON.stringify(payload));
}

export function broadcastToRoom(roomId: string, payload: WsPayload, exclude?: RelayerSocket) {
  const sockets = roomSockets.get(roomId);
  if (!sockets) {
    return;
  }

  for (const socket of sockets) {
    if (socket === exclude) {
      continue;
    }

    sendJson(socket, payload);
  }
}

export function parseJsonMessage(rawMessage: string | Buffer | Uint8Array) {
  try {
    const parsed = JSON.parse(typeof rawMessage === "string" ? rawMessage : rawMessage.toString());
    if (typeof parsed === "object" && parsed !== null) {
      return parsed as WsPayload;
    }

    return {};
  } catch {
    return null;
  }
}

export function normalizeText(value: unknown, maxLength = 1000) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}
