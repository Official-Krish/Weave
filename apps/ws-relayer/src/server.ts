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
      },
      close(ws) {
        handleSocketClose(ws);
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
