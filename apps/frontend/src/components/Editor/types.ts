export type TrackType = "VIDEO" | "AUDIO" | "TEXT";
export type OverlayType = "TEXT";
export type ActiveTool = "select" | "split" | "text";

export interface Clip {
  id?: string;
  sourceAssetId: string;
  sourceStartMs: number;
  timelineStartMs: number;
  durationMs: number;
  transitionIn?: "fade" | "cut";
  transitionOut?: "fade" | "cut";
  name?: string;
}

export interface Track {
  id: string;
  type: TrackType;
  order: number;
  visible: boolean;
  muted: boolean;
  volume: number;
  clips: Clip[];
}

export interface OverlayStyle {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  textAlign?: "left" | "center" | "right";
  textShadow?: boolean;
  backgroundColor?: string;
  backgroundOpacity?: number;
  letterSpacing?: number;
}

export interface Overlay {
  id: string;
  type: OverlayType;
  content: {
    text: string;
  };
  zIndex?: number;
  timelineStartMs: number;
  durationMs: number;
  transform: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;
  };
  style?: OverlayStyle;
}

export interface Asset {
  id: string;
  assetType: "VIDEO" | "AUDIO";
  url: string;
  durationMs?: number;
  participantId?: string | null;
  waveformUrl?: string | null;
  thumbUrl?: string | null;
}

export interface EditorProject {
  id: string;
  meetingId: string;
  sourceMode: "FINAL" | "MULTITRACK";
  tracks: Track[];
  overlays: Overlay[];
  assets: Asset[];
  durationMs: number;
  status: "EDITING" | "EXPORTING" | "COMPLETED" | "FAILED";
  exports?: ExportJob[];
  fps: number;
  width: number;
  height: number;
}

export interface ExportJob {
  id: string;
  status: "QUEUED" | "PROCESSING" | "DONE" | "FAILED";
  progress?: number | null;
  outputUrl?: string | null;
  error?: string | null;
}

export interface HistoryEntry {
  tracks: Track[];
  overlays: Overlay[];
}

export interface EditorState {
  projectId: string | null;
  meetingId: string;
  tracks: Track[];
  overlays: Overlay[];
  assets: Asset[];
  durationMs: number;
  currentTime: number;
  isPlaying: boolean;
  selectedClipId: string | null;
  zoom: number;
  fps: number;
  width: number;
  height: number;
}

export interface Toast {
  id: string;
  message: string;
  type: "info" | "success" | "error";
}
