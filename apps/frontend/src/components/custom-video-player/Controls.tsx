import { Timeline } from "./Timeline";
import { VolumeControl } from "./volumeControl";
import {
  PlayIcon,
  PauseIcon,
  SeekIcon,
  FullscreenEnterIcon,
  PipEnterIcon,
} from "./icons";

export function Controls({ state, actions }: { state: any; actions: any }) {
  return (
    <div className="controls">
      {/* Left */}
      <div className="controls-left">
        <button onClick={actions.toggle}>
          {state.paused ? <PlayIcon /> : <PauseIcon />}
        </button>

        <button onClick={() => actions.seek(-10)}>
          <SeekIcon /> 10
        </button>

        <button onClick={() => actions.seek(10)}>
          <SeekIcon /> 10
        </button>
      </div>

      {/* Center */}
      <Timeline state={state} actions={actions} />

      {/* Right */}
      <div className="controls-right">
        <select
          value={state.playbackRate}
          onChange={(e) =>
            actions.setPlaybackRate(Number(e.target.value))
          }
        >
          {[0.5, 1, 1.5, 2].map((r) => (
            <option key={r} value={r}>
              {r}x
            </option>
          ))}
        </select>

        <VolumeControl state={state} actions={actions} />

        <button onClick={actions.pip}>
          <PipEnterIcon />
        </button>

        <button onClick={actions.fullscreen}>
          <FullscreenEnterIcon />
        </button>
      </div>
    </div>
  );
}