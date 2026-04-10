export type LoginResponse = {
  message: string;
  token: string;
  name?: string | null;
};

export type SignupResponse = {
  message: string;
  token: string;
};

export type CreateMeetingResponse = {
  meetingId: string;
  passcode: string;
  name?: string | null;
  id: string;
};

export type JoinMeetingResponse = {
  id: string;
  passcode: string;
  name?: string | null;
};

export type FinalRecording = {
  id: string;
  meetingId: string;
  VideoLink: string;
  AudioLink?: string | null;
  generatedAt: string;
  format: string;
  quality: string;
};

export type MeetingListItem = {
  id: string;
  meetingId: string;
  roomName?: string | null;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  isEnded: boolean;
  participants: string[];
  isHost: boolean;
};

export type MeetingDetail = MeetingListItem & {
  finalRecording: FinalRecording[];
};

export type RecordingStatusResponse = {
  meetingId: string;
  isHost: boolean;
  isRecording: boolean;
  recordingState: "IDLE" | "RECORDING" | "UPLOADING" | "PROCESSING" | "READY" | "FAILED";
  recordingStartedAt?: string | null;
  recordingStoppedAt?: string | null;
  processingStartedAt?: string | null;
  processingEndedAt?: string | null;
  isEnded: boolean;
};
