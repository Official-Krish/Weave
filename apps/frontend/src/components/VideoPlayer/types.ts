export interface Thumbnail {
  start: number;
  end: number;
  url: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface HLSPlayerProps {
  src: string;
  poster?: string;
  thumbnailVtt?: string;
  className?: string;
}