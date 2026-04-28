import {
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeOffIcon,
} from "./icons";

export function VolumeControl({ state, actions }: { state: any; actions: any }) {
  const icon = state.muted
    ? <VolumeOffIcon />
    : state.volume > 0.5
    ? <VolumeHighIcon />
    : <VolumeLowIcon />;

  return (
    <div className="volume">
      <button onClick={actions.toggleMute}>{icon}</button>

      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={state.muted ? 0 : state.volume}
        onChange={(e) =>
          actions.setVolume(Number(e.target.value))
        }
      />
    </div>
  );
}