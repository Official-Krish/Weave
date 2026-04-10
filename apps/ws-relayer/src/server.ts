import { handleSocketClose, handleSocketMessage } from "./handlers";
import { parseJsonMessage, sendJson } from "./socket-utils";

export function startRelayerServer() {
  Bun.serve({
    fetch(req, server) {
      if (server.upgrade(req)) {
        return;
      }

      return new Response("Upgrade failed", { status: 500 });
    },
    websocket: {
      open() {
        console.log("WebSocket connection opened");
      },
      close(ws) {
        handleSocketClose(ws);
        console.log("WebSocket connection closed");
      },
      message(ws, rawMessage) {
        const data = parseJsonMessage(rawMessage);
        if (!data) {
          sendJson(ws, { type: "error", message: "Invalid JSON payload" });
          return;
        }

        handleSocketMessage(ws, data);
      },
    },
    port: Number(process.env.WS_PORT || 9093),
  });
}
