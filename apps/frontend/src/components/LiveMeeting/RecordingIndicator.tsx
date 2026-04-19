type RecordingIndicatorProps = {
  isRecording: boolean;
};

export function RecordingIndicator({ isRecording }: RecordingIndicatorProps) {
  if (!isRecording) {
    return null;
  }

  return (
    <div
      className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full border border-red-400/35 bg-[#2a0c0c]/95 px-3 py-1.5 text-[#ffd7d7] shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
      role="status"
      aria-live="polite"
      aria-label="Recording in progress"
    >
      <div className="relative flex h-2.5 w-2.5 items-center justify-center">
        <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-red-400/80" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-300" />
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">Recording</span>
    </div>
  );
}
