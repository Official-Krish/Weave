import { create } from 'zustand';

interface MediaState {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  videoTrack: any | null;
  audioTrack: any | null;
  localTracks: any[];
  setVideoTrack: (track: any) => void;
  setAudioTrack: (track: any) => void;
  addLocalTrack: (track: any) => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  toggleScreenShare: () => void;
}

export const useMediaStore = create<MediaState>((set, get) => ({
  isMuted: false,
  isVideoOff: false,
  isScreenSharing: false,
  videoTrack: null,
  audioTrack: null,
  localTracks: [],

  setVideoTrack: (track) => set({ videoTrack: track }),
  setAudioTrack: (track) => set({ audioTrack: track }),
  addLocalTrack: (track) => set((state) => ({ localTracks: [...state.localTracks, track] })),

  toggleVideo: () => {
    const { videoTrack, isVideoOff } = get();
    if (videoTrack) {
      if (isVideoOff) {
        videoTrack.unmute();
      } else {
        videoTrack.mute();
      }
      set({ isVideoOff: !isVideoOff });
    }
  },

  toggleAudio: () => {
    const { audioTrack, isMuted } = get();
    if (audioTrack) {
      if (isMuted) {
        audioTrack.unmute();
      } else {
        audioTrack.mute();
      }
      set({ isMuted: !isMuted });
    }
  },

  toggleScreenShare: () => set((state) => ({ isScreenSharing: !state.isScreenSharing })),
}));