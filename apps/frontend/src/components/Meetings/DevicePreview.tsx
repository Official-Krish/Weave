import { Mic, Video } from "lucide-react";
import type { RefObject } from "react";

type DevicePreviewProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  cameraDevices: MediaDeviceInfo[];
  micDevices: MediaDeviceInfo[];
  selectedCameraId: string;
  selectedMicId: string;
  onCameraChange: (deviceId: string) => void;
  onMicChange: (deviceId: string) => void;
  previewError: string | null;
};

export function DevicePreview({
  videoRef,
  cameraDevices,
  micDevices,
  selectedCameraId,
  selectedMicId,
  onCameraChange,
  onMicChange,
  previewError,
}: DevicePreviewProps) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-background/40 p-4 sm:p-5">
      <div className="relative aspect-video overflow-hidden rounded-xl border border-border/70 bg-black/35">
        <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 bg-black/55 p-3 backdrop-blur-sm">
          <div className="relative min-w-42 flex-1">
            <Video className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={selectedCameraId}
              onChange={(event) => onCameraChange(event.target.value)}
              className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground outline-none"
            >
              {cameraDevices.map((camera) => (
                <option key={camera.deviceId} value={camera.deviceId}>
                  {camera.label || "Camera"}
                </option>
              ))}
            </select>
          </div>
          <div className="relative min-w-42 flex-1">
            <Mic className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={selectedMicId}
              onChange={(event) => onMicChange(event.target.value)}
              className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground outline-none"
            >
              {micDevices.map((mic) => (
                <option key={mic.deviceId} value={mic.deviceId}>
                  {mic.label || "Microphone"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {previewError ? (
        <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {previewError}
        </p>
      ) : null}
    </div>
  );
}
