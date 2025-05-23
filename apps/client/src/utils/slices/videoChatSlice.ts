import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VideoLayout } from '../../types/videoChat';

interface VideoChatState {
  layout: VideoLayout;
  activeScreenShareId: string | null;
  focusedParticipantId: string | null;
  showParticipantsSidebar: boolean;
  userPreferences: {
    focusedViewRatio: number;
    gridMaxColumns: number;
    screenShareRatio: number;
    compactView: boolean;
  };
}

const initialState: VideoChatState = {
  layout: "grid",
  activeScreenShareId: null,
  focusedParticipantId: null,
  showParticipantsSidebar: false,
  userPreferences: {
    focusedViewRatio: 70,
    gridMaxColumns: 4,
    screenShareRatio: 70,
    compactView: false
  }
};

export const videoChatSlice = createSlice({
  name: 'videoChat',
  initialState,
  reducers: {
    setLayout: (state, action: PayloadAction<VideoLayout>) => {
      state.layout = action.payload;
    },
    setActiveScreenShareId: (state, action: PayloadAction<string | null>) => {
      state.activeScreenShareId = action.payload;
    },
    setFocusedParticipantId: (state, action: PayloadAction<string | null>) => {
      state.focusedParticipantId = action.payload;
    },
    toggleParticipantsSidebar: (state) => {
      state.showParticipantsSidebar = !state.showParticipantsSidebar;
    },
    setUserPreference: (state, action: PayloadAction<{
      key: keyof VideoChatState['userPreferences'];
      value: number | boolean;
    }>) => {
      const { key, value } = action.payload;
      state.userPreferences[key] = value as never;
    },
    resetVideoChatState: () => initialState,
  },
});

export const {
  setLayout,
  setActiveScreenShareId,
  setFocusedParticipantId,
  toggleParticipantsSidebar,
  setUserPreference,
  resetVideoChatState,
} = videoChatSlice.actions;

export default videoChatSlice.reducer;