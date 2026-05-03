export type RenderPayload = {
  projectId: string;
  jobId: string;
  roomId: string;
  retryCount?: number;
};

export type RenderClip = {
  id: string;
  trackType: "VIDEO" | "AUDIO" | "TEXT";
  sourceAssetId: string;
  sourcePath: string;
  sourceStartMs: number;
  timelineStartMs: number;
  durationMs: number;
  name?: string | null;
  audioMode?: "replace" | "layer";
  transitionStart?: Record<string, unknown> | null;
  transitionEnd?: Record<string, unknown> | null;
  transitionIn?: "fade" | "cut" | null;
  transitionOut?: "fade" | "cut" | null;
};

export type AudioClipPlan = {
  sourcePath: string;
  timelineStartMs: number;
  sourceStartMs: number;
  durationMs: number;
  volume: number;
  audioMode: "replace" | "layer";
};
