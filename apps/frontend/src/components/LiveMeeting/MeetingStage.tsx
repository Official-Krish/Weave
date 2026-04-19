import { LoaderCircle } from "lucide-react";
import { TrackTile } from "./TrackTile";
import type { FocusedTiles, MeetingConnectionState, MeetingTile } from "../../types/meeting";

type MeetingStageProps = {
  connectionState: MeetingConnectionState;
  focusedTiles: FocusedTiles | null;
  allTiles: MeetingTile[];
  onSelectFocusTile: (tileId: string) => void;
};

export function MeetingStage({
  connectionState,
  focusedTiles,
  allTiles,
  onSelectFocusTile,
}: MeetingStageProps) {
  if (connectionState === "connecting" || connectionState === "loading-lib") {
    return (
      <div className="flex h-full items-center justify-center text-[#c9af79]">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#f5a623]/16 bg-[#130f0a]/92 px-4 py-2 text-sm">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Connecting custom room...
        </span>
      </div>
    );
  }

  const screenTiles = allTiles.filter((tile) => tile.id.includes("-screen"));
  if (screenTiles.length > 0) {
    const selectedScreen = screenTiles[0];
    const sideTiles = allTiles.filter((tile) => tile.id !== selectedScreen.id);

    return (
      <div className="flex min-h-screen w-full gap-2 p-3">
        <div className="h-full w-[75%]">
          <TrackTile
            title={selectedScreen.title}
            subtitle={selectedScreen.subtitle}
            track={selectedScreen.track}
            isMuted={selectedScreen.isMuted}
            isVideoOff={selectedScreen.isVideoOff}
            isScreenSharing={selectedScreen.isScreenSharing}
          />
        </div>
        <div className="h-full w-[25%] overflow-y-auto">
          <div className="flex flex-col gap-2 pr-1.5">
            {sideTiles.map((tile) => (
              <div key={tile.id} className="h-40 min-h-24">
                <TrackTile
                  title={tile.title}
                  subtitle={tile.subtitle}
                  track={tile.track}
                  onClick={() => onSelectFocusTile(tile.id)}
                  isMuted={tile.isMuted}
                  isVideoOff={tile.isVideoOff}
                  isScreenSharing={tile.isScreenSharing}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (focusedTiles) {
    return (
      <div className="flex h-full w-full gap-2 p-3">
        <div className="h-full w-[75%]">
          <TrackTile
            title={focusedTiles.selected.title}
            subtitle={focusedTiles.selected.subtitle}
            track={focusedTiles.selected.track}
            isMuted={focusedTiles.selected.isMuted}
            isVideoOff={focusedTiles.selected.isVideoOff}
            isScreenSharing={focusedTiles.selected.isScreenSharing}
          />
        </div>
        <div className="h-full w-[25%] overflow-y-auto">
          <div className="flex flex-col gap-2 pr-1.5">
            {focusedTiles.others.map((tile) => (
              <div key={tile.id} className="h-44 min-h-24">
                <TrackTile
                  title={tile.title}
                  subtitle={tile.subtitle}
                  track={tile.track}
                  onClick={() => onSelectFocusTile(tile.id)}
                  isMuted={tile.isMuted}
                  isVideoOff={tile.isVideoOff}
                  isScreenSharing={tile.isScreenSharing}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const participantCount = allTiles.length;
  const columns = participantCount <= 1 ? 1 : participantCount <= 4 ? 2 : participantCount <= 9 ? 3 : 4;

  return (
    <div
      className="grid h-full w-full gap-2 p-3"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {allTiles.map((tile) => (
        <TrackTile
          key={tile.id}
          title={tile.title}
          subtitle={tile.subtitle}
          track={tile.track}
          onClick={() => onSelectFocusTile(tile.id)}
          isMuted={tile.isMuted}
          isVideoOff={tile.isVideoOff}
          isScreenSharing={tile.isScreenSharing}
        />
      ))}
    </div>
  );
}
