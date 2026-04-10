type RecordingIndicatorProps = {
  isRecording: boolean;
};

export function RecordingIndicator({ isRecording }: RecordingIndicatorProps) {
  if (!isRecording) {
    return null;
  }

  return (
    <div
      className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-md bg-red-600 px-2 py-1 text-white shadow-md"
      role="status"
      aria-live="polite"
      aria-label="Recording in progress"
    >
      <div className="h-2 w-2 animate-ping rounded-full bg-white" />
      <span className="text-xs font-medium">REC</span>
    </div>
  );
}
