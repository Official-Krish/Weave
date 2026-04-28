import { useVideoController } from "./useVideoController";
import { Controls } from "./Controls";
import { useHotkeys } from "./hooks/useHotKeys";

export function VideoPlayer({
  src,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onPlayStateChange,
  className,
  style,
}: {
    src: string;
    currentTime?: number;
    isPlaying?: boolean;
    onTimeUpdate?: (t: number) => void;
    onPlayStateChange?: (playing: boolean) => void;
    className?: string;
    style: React.CSSProperties;
}) {
  const { videoRef, state, actions } = useVideoController({
    currentTime,
    isPlaying,
    onTimeUpdate,
    onPlayStateChange,
  });

  useHotkeys(actions);

  return (
    <div className={`player ${className || ""}`}
      style={style}
    >
      <video ref={videoRef} src={src} playsInline />

      <Controls state={state} actions={actions} />
    </div>
  );
}