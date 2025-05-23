import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MeetingState {
  isConnecting: boolean;
  isConnected: boolean;
  roomName: string;
  displayName: string;
  roomId: string;
  passcode: string;
  error: string;
  jitsiLoaded: boolean;
  email: string;
  leaveConference: boolean;
  isEnded: boolean;
}

const initialState: MeetingState = {
  isConnecting: false,
  isConnected: false,
  roomName: "",
  displayName: "",
  roomId: "",
  passcode: "",
  error: "",
  jitsiLoaded: false,
  leaveConference: false,
  email: "",
  isEnded: false,
};

export const meetingSlice = createSlice({
  name: 'meeting',
  initialState,
  reducers: {
    setConnecting: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setRoomName: (state, action: PayloadAction<string>) => {
      state.roomName = action.payload;
    },
    setDisplayName: (state, action: PayloadAction<string>) => {
      state.displayName = action.payload;
    },
    setRoomId: (state, action: PayloadAction<string>) => {
      state.roomId = action.payload;
    },
    setPasscode: (state, action: PayloadAction<string>) => {
      state.passcode = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setJitsiLoaded: (state, action: PayloadAction<boolean>) => {
      state.jitsiLoaded = action.payload;
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    resetMeetingState: () => initialState,
    setLeaveConference: (state, action: PayloadAction<boolean>) => {
      state.leaveConference = action.payload;
    },
    setIsEnded: (state, action: PayloadAction<boolean>) => {
      state.isEnded = action.payload;
    },
  },
});

export const {
  setConnecting,
  setConnected,
  setRoomName,
  setDisplayName,
  setRoomId,
  setPasscode,
  setError,
  setJitsiLoaded,
  setEmail,
  resetMeetingState,
  setIsEnded,
} = meetingSlice.actions;

export default meetingSlice.reducer;