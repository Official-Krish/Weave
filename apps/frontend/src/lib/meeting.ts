export function buildMeetingLivePath(args: {
  roomId: string;
  name: string;
  role: "host" | "guest";
  recordingState?: boolean;
  micId?: string;
  cameraId?: string;
}) {
  const params = new URLSearchParams({
    name: args.name || (args.role === "host" ? "Host" : "Guest"),
    role: args.role,
  });

  if (args.recordingState) {
    params.set("recordingState", "true");
  }

  if (args.micId) {
    params.set("micId", args.micId);
  }

  if (args.cameraId) {
    params.set("cameraId", args.cameraId);
  }

  return `/meeting/live/${args.roomId}?${params.toString()}`;
}
