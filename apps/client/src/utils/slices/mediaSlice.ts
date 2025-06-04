import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MediaState {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  localTracks: any[];
  remoteTracks: Record<string, any[]>;
  cameras: MediaDeviceDescriptor[];
  microphones: MediaDeviceDescriptor[];
  selectedCamera: string | null;
  selectedMicrophone: string | null;
  screenShareRef?: React.RefObject<HTMLDivElement>; 
  videoTrack: any | null;
  audioTrack?: any | null;
  screenShareTrack?: any | null;
  remoteScreenShares: Record<string, any>;
}

const initialState: MediaState = {
  isMuted: false,
  isVideoOff: false,
  isScreenSharing: false,
  localTracks: [],
  remoteTracks: {},
  cameras: [],
  microphones: [],
  selectedCamera: null,
  selectedMicrophone: null,
  videoTrack: null,
  audioTrack: null,
  screenShareTrack: null,
  remoteScreenShares: {},
};

interface MediaDeviceDescriptor {
  deviceId: string;
  label: string;
  kind: string;
  groupId: string;
}

export const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
    },
    setMute: (state, action: PayloadAction<boolean>) => {
      state.isMuted = action.payload;
    },
    toggleVideo: (state) => {
      state.isVideoOff = !state.isVideoOff;
      if (state.videoTrack) {
        if (state.isVideoOff) {
          state.videoTrack.mute();
        } else {
          state.videoTrack.unmute();
        }
      }
    },
    setVideoOff: (state, action: PayloadAction<boolean>) => {
      state.isVideoOff = action.payload;
    },
    toggleScreenShare: (state) => {
      state.isScreenSharing = !state.isScreenSharing;
    },
    setLocalTracks: (state, action: PayloadAction<any[]>) => {
      state.localTracks = action.payload;
    },
    addLocalTrack: (state, action: PayloadAction<any>) => {
      state.localTracks.push(action.payload);
    },
    removeLocalTrack: (state, action: PayloadAction<string>) => {
      state.localTracks = state.localTracks.filter(track => track.getId() !== action.payload);
    },
    addRemoteTrack: (state, action: PayloadAction<{ participantId: string; track: any }>) => {
      if (!state.remoteTracks[action.payload.participantId]) {
        state.remoteTracks[action.payload.participantId] = [];
      }
      state.remoteTracks[action.payload.participantId].push(action.payload.track);
    },
    removeRemoteTrack: (state, action: PayloadAction<{ participantId: string; trackId: string }>) => {
      if (state.remoteTracks[action.payload.participantId]) {
        state.remoteTracks[action.payload.participantId] = 
          state.remoteTracks[action.payload.participantId].filter(
            track => track.getId() !== action.payload.trackId
          );
      }
    },
    setCameras: (state, action: PayloadAction<MediaDeviceDescriptor[]>) => {
      state.cameras = action.payload;
      if (action.payload.length > 0 && !state.selectedCamera) {
        state.selectedCamera = action.payload[0].deviceId;
      }
    },
    setMicrophones: (state, action: PayloadAction<MediaDeviceDescriptor[]>) => {
      state.microphones = action.payload;
      if (action.payload.length > 0 && !state.selectedMicrophone) {
        state.selectedMicrophone = action.payload[0].deviceId;
      }
    },
    selectCamera: (state, action: PayloadAction<string>) => {
      state.selectedCamera = action.payload;
    },
    selectMicrophone: (state, action: PayloadAction<string>) => {
      state.selectedMicrophone = action.payload;
    },
    resetMediaState: () => initialState,
    setVideoTrack: (state, action: PayloadAction<any>) => {
      state.videoTrack = action.payload;
    },
    setAudioTrack: (state, action: PayloadAction<any>) => {
      state.audioTrack = action.payload;
    },
    setSccreenShareTracks: (state, action) => {
      if (action.payload) {
        state.isScreenSharing = true;
        state.screenShareTrack = action.payload;
      } else {
        state.isScreenSharing = false;
        state.screenShareTrack = null;
      }
    },
    setRemoteScreenShares: {
      reducer: (
        state, 
        action: PayloadAction<{ participantId: string; track: JitsiTrack }>
      ) => {
        const { participantId, track } = action.payload;
        if (track === null) {
          delete state.remoteScreenShares[participantId];
        }
        else {
          state.remoteScreenShares[participantId] = track;
          
          console.log("Updated remote screen shares:", {
            participantId,
            trackType: track.getType(),
            isScreenShare: track.getVideoType?.() === 'desktop'
          });
        }
      },
      prepare: (participantId: string, track: JitsiTrack) => ({
        payload: { participantId, track }
      })
    },
  },
});

export const {
  toggleMute,
  setMute,
  toggleVideo,
  setVideoOff,
  toggleScreenShare,
  setLocalTracks,
  addLocalTrack,
  removeLocalTrack,
  addRemoteTrack,
  removeRemoteTrack,
  setCameras,
  setMicrophones,
  selectCamera,
  selectMicrophone,
  resetMediaState,
  setVideoTrack,
  setAudioTrack,
  setSccreenShareTracks,
  setRemoteScreenShares,
} = mediaSlice.actions;

export default mediaSlice.reducer;