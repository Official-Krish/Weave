interface RecordingIndicatorProps {
  isRecording: boolean;
}

export const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({ isRecording }) => {
  if (!isRecording) return null;
  
  return (
    <div 
      className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-red-600 text-white px-2 py-1 rounded-md shadow-md animate-pulse-opacity"
      role="status"
      aria-live="polite"
      aria-label="Recording in progress"
    >
      <div className="w-2 h-2 bg-white rounded-full animate-ping" />
      <span className="text-xs font-medium">REC</span>
    </div>
  );
};