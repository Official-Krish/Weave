import type { ServerWebSocket } from "bun";

// Server maintains room states
const roomRecordingStates = new Map<string, boolean>();
const participants = new Map<string, Set<ServerWebSocket<unknown>>>();

Bun.serve({
    fetch(req, server) {
      if (server.upgrade(req)) {
        return;
      }
      return new Response("Upgrade failed", { status: 500 });
    },
    websocket: {
        open(ws) {
            console.log('WebSocket connection opened');
        },
        close(ws) {
            console.log('WebSocket connection closed');
        },
        message(ws, message) {
            // Handle incoming messages
            const data = JSON.parse(typeof message === 'string' ? message : message.toString());

            if (data.type === "join-room"){
                console.log(`WebSocket joined room: ${data.roomId}`);
                const roomId = data.roomId;
                if (!participants.has(roomId)) {
                    participants.set(roomId, new Set());
                }
                participants.get(roomId)?.add(ws);
                
                ws.send(JSON.stringify({ type: 'joined-room', roomId }));
            }
            
            if (data.type === 'recording-state') {
                console.log(`WebSocket recording state for room: ${data.roomId}, isRecording: ${data.isRecording}`);
                roomRecordingStates.set(data.roomId, data.isRecording);
            
                broadcastToRoom(data.roomId, {
                    type: 'recording-state',
                    isRecording: data.isRecording
                });
                console.log(`Broadcasted recording state for room: ${data.roomId}, isRecording: ${data.isRecording}`);
            }
            else if (data.type === 'get-recording-state') {
                console.log(`WebSocket requested recording state for room: ${data.roomId}`);
                const isRecording = roomRecordingStates.get(data.roomId) || false;
                ws.send(JSON.stringify({
                    type: 'recording-state',
                    roomId: data.roomId,
                    isRecording: isRecording
                }));
            }
        }
    }, 
    port: 9093,
});

function broadcastToRoom(roomId: string, message: { type: string; isRecording: boolean }) {
    const roomParticipants = participants.get(roomId);
    if (roomParticipants) {
        for (const ws of roomParticipants) {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(message));
            }
        }
    }
}