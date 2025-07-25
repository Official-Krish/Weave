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
            console.log(`WebSocket message received: ${JSON.stringify(data)}`);

            if (data.type === "join-room"){
                console.log(`WebSocket joined room: ${data.roomId}`);
                const roomId = data.roomId;
                if (!participants.has(roomId)) {
                    participants.set(roomId, new Set());
                }
                participants.get(roomId)?.add(ws);
                
                ws.send(JSON.stringify({ type: 'joined-room', roomId, displayName: data.displayName }));
            }
            
            if (data.type === 'recording-state') {
                console.log(`WebSocket recording state for room: ${data.roomId}, isRecording: ${data.isRecording}`);
                roomRecordingStates.set(data.roomId, data.isRecording);
                const roomParticipants = participants.get(data.roomId);
                if (roomParticipants) {
                    for (const participant of roomParticipants) {
                        if (participant !== ws && participant.readyState === WebSocket.OPEN) {
                            participant.send(JSON.stringify({
                                type: 'recording-state',
                                isRecording: data.isRecording
                            }));
                        }
                    }
                }
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
            else if (data.type === 'leave-room') {
                console.log(`WebSocket left room: ${data.roomId}`);
                const roomId = data.roomId;
                const roomParticipants = participants.get(roomId);
                if (roomParticipants) {
                    roomParticipants.delete(ws);
                    if (roomParticipants.size === 0) {
                        participants.delete(roomId);
                        roomRecordingStates.delete(roomId);
                    }
                }
                ws.send(JSON.stringify({ type: 'left-room', roomId }));
            }
        }
    }, 
    port: 9093,
});