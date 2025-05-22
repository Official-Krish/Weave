import { Participant } from '../../types/videoChat';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface ParticipantsState {
  participants: Record<string, Participant>;
  joinees: { email: string }[];
}

const initialState: ParticipantsState = {
  participants: {},
  joinees: [],
};

export const participantsSlice = createSlice({
  name: 'participants',
  initialState,
  reducers: {
    addParticipant: (state, action: PayloadAction<Participant>) => {
      state.participants[action.payload.id] = action.payload;
    },
    removeParticipant: (state, action: PayloadAction<string>) => {
      delete state.participants[action.payload];
    },
    updateParticipant: (state, action: PayloadAction<{ id: string; changes: Partial<Participant> }>) => {
      if (state.participants[action.payload.id]) {
        state.participants[action.payload.id] = {
          ...state.participants[action.payload.id],
          ...action.payload.changes,
        };
      }
    },
    addJoinee: (state, action: PayloadAction<{ email: string }>) => {
      state.joinees.push(action.payload);
    },
    removeJoinee: (state, action: PayloadAction<string>) => {
      state.joinees = state.joinees.filter(j => j.email !== action.payload);
    },
    resetParticipantsState: () => initialState,
  },
});

export const {
  addParticipant,
  removeParticipant,
  updateParticipant,
  addJoinee,
  removeJoinee,
  resetParticipantsState,
} = participantsSlice.actions;

export default participantsSlice.reducer;