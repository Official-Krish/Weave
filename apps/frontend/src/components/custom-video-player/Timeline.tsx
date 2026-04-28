export function Timeline({ state, actions }: { state: any; actions: any }) {
  const progress = (state.currentTime / state.duration) * 100;
  const buffered = (state.buffered / state.duration) * 100;

  return (
    <div className="timeline">
      <div className="timeline-track">
        <div
          className="timeline-buffer"
          style={{ width: `${buffered}%` }}
        />
        <div
          className="timeline-progress"
          style={{ width: `${progress}%` }}
        />
      </div>

      <input
        type="range"
        min={0}
        max={state.duration}
        step={0.1}
        value={state.currentTime}
        onChange={(e) =>
          actions.setTime(Number(e.target.value))
        }
      />
    </div>
  );
}