import videojs from "video.js";

interface QualityLevel {
  height: number;
  bitrate: number;
  enabled: boolean;
}

interface QualityLevelList {
  length: number;
  [index: number]: QualityLevel;
  on(event: string, cb: () => void): void;
  off(event: string, cb: () => void): void;
}

declare module "video.js" {
  interface VideoJsPlayer {
    qualityLevels(): QualityLevelList;
  }
}