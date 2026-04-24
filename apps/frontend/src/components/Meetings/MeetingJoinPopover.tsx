import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Mic, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DevicePreview } from "./DevicePreview";

type MeetingJoinPopoverProps = {
  triggerLabel: string;
  onJoin: (devices: { micId?: string; cameraId?: string }) => Promise<void> | void;
  disabled?: boolean;
  busy?: boolean;
  variant?: "amber" | "blue";
};

export function MeetingJoinPopover({
  triggerLabel,
  onJoin,
  disabled,
  busy,
  variant = "amber",
}: MeetingJoinPopoverProps) {
  const [open, setOpen] = useState(false);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [micDevices, setMicDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [selectedMicId, setSelectedMicId] = useState("");
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open || typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      return;
    }

    let active = true;

    const loadDevices = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: selectedCameraId ? { deviceId: { exact: selectedCameraId } } : true,
          audio: selectedMicId ? { deviceId: { exact: selectedMicId } } : true,
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = stream;
        setPreviewError(null);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((device) => device.kind === "videoinput");
        const microphones = devices.filter((device) => device.kind === "audioinput");

        if (!active) {
          return;
        }

        setCameraDevices(cameras);
        setMicDevices(microphones);

        if (!selectedCameraId && cameras[0]?.deviceId) {
          setSelectedCameraId(cameras[0].deviceId);
        }

        if (!selectedMicId && microphones[0]?.deviceId) {
          setSelectedMicId(microphones[0].deviceId);
        }
      } catch {
        if (active) {
          setPreviewError("Could not access your camera or microphone.");
        }
      }
    };

    void loadDevices();

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [open, selectedCameraId, selectedMicId]);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      await onJoin({
        micId: selectedMicId || undefined,
        cameraId: selectedCameraId || undefined,
      });
      setOpen(false);
    } finally {
      setIsJoining(false);
    }
  };

  const triggerClassName =
    variant === "blue"
      ? "inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#5ea6ff,#2b7fff)] px-3.5 py-2 text-xs font-semibold text-white shadow-[0_12px_24px_rgba(43,127,255,0.18)] transition hover:brightness-110 cursor-pointer disabled:pointer-events-none disabled:opacity-50"
      : "inline-flex items-center gap-2 rounded-full border border-[#f5a623]/15 bg-[#f5a623]/10 px-4 py-2 text-[12px] font-bold text-[#f5a623] transition hover:border-[#f5a623]/30 hover:bg-[#f5a623]/14 hover:brightness-105 cursor-pointer disabled:pointer-events-none disabled:opacity-50";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" disabled={disabled || busy} className={triggerClassName}>
          {busy ? <LoaderCircle className="size-3.5 animate-spin" /> : null}
          {triggerLabel}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] border border-white/10 bg-[#120f0b] p-4 text-[#fff5de]" align="end">
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f5a623]/60">
              Device check
            </p>
            <h3 className="mt-1 text-base font-bold text-[#fff5de]">Choose your camera and mic</h3>
          </div>

          <DevicePreview videoRef={videoRef} previewError={previewError} />

          <div className="grid gap-3">
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#b49650]/60">
                Camera
              </p>
              <Select value={selectedCameraId} onValueChange={setSelectedCameraId} disabled={cameraDevices.length === 0}>
                <SelectTrigger className="h-11 border-white/10 bg-white/4 text-[#fff5de]">
                  <div className="inline-flex items-center gap-2">
                    <Video className="size-4 text-[#f5a623]" />
                    <SelectValue placeholder="Select camera" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {cameraDevices.map((device, index) => (
                    <SelectItem key={device.deviceId || index} value={device.deviceId}>
                      {device.label || `Camera ${index + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#b49650]/60">
                Microphone
              </p>
              <Select value={selectedMicId} onValueChange={setSelectedMicId} disabled={micDevices.length === 0}>
                <SelectTrigger className="h-11 border-white/10 bg-white/4 text-[#fff5de]">
                  <div className="inline-flex items-center gap-2">
                    <Mic className="size-4 text-[#f5a623]" />
                    <SelectValue placeholder="Select microphone" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {micDevices.map((device, index) => (
                    <SelectItem key={device.deviceId || index} value={device.deviceId}>
                      {device.label || `Microphone ${index + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => void handleJoin()}
            disabled={disabled || busy || isJoining}
            className="h-11 w-full bg-[linear-gradient(135deg,#ffd166,#f5a623)] font-bold text-[#1b1100] hover:brightness-105 cursor-pointer disabled:pointer-events-none disabled:opacity-50"
          >
            {isJoining || busy ? <LoaderCircle className="size-4 animate-spin" /> : null}
            Continue to meeting
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
