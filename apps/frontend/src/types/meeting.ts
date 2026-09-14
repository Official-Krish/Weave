export type MeetingTrackKind = "video" | "audio";

export type MeetingTrackSource = "camera" | "screen" | "microphone";

export type VideoTrackLike = {
  attach?: (element: HTMLMediaElement) => void;
  detach?: (element?: HTMLMediaElement) => void;
  kind?: MeetingTrackKind;
  source?: MeetingTrackSource;
  mediaStreamTrack?: MediaStreamTrack | null;
};

export type MeetingTile = {
  id: string;
  title: string;
  subtitle?: string;
  track: VideoTrackLike | null;
  participantId?: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isScreenSharing?: boolean;
  isLocal?: boolean;
};

export type FocusedTiles = {
  selected: MeetingTile;
  others: MeetingTile[];
};

export type RemoteAudioTrackItem = {
  id: string;
  track: unknown;
};

export type MeetingParticipant = {
  id: string;
  displayName: string;
};

export type MeetingParticipantState = {
  id: string;
  name: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isLocal?: boolean;
};

export type MeetingConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "failed";
