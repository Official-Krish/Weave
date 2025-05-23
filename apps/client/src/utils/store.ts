import { configureStore } from '@reduxjs/toolkit';
import mediaReducer from './slices/mediaSlice';
import meetingReducer from './slices/meetingSlice';
import participantsReducer from './slices/participantsSlice';
import videoChatReducer from './slices/videoChatSlice';

export const store = configureStore({
  reducer: {
    media: mediaReducer,
    meeting: meetingReducer,
    participants: participantsReducer,
    videoChat: videoChatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;