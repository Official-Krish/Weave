import type { RefObject } from "react";

type DevicePreviewProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  previewError: string | null;
};

export function DevicePreview({
  videoRef,
  previewError,
}: DevicePreviewProps) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-background/40 p-4 sm:p-5">
      <div className="relative aspect-video overflow-hidden rounded-xl border border-border/70 bg-black/35">
        <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
      </div>

      {previewError ? (
        <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {previewError}
        </p>
      ) : null}
    </div>
  );
}
