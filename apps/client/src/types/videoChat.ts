export type Participant = {
    id: string;
    name: string;
    isScreenSharing: boolean;
    isMuted: boolean;
    isVideoOff: boolean;
    stream?: MediaStream;
    screenStream?: MediaStream;
    tracks?: any;
};
  
export type VideoLayout = "grid" | "focus" | "screenShare";