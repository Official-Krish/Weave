export type LoginResponse = {
  message: string;
  token: string;
  name?: string | null;
};

export type UserProfile = {
  id: string;
  name?: string | null;
  email?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserProfileResponse = {
  message: string;
  user: UserProfile;
};

export type SignupResponse = {
  message: string;
  token: string;
};

export type CreateMeetingResponse = {
  roomId: string;
  passcode: string;
  name?: string | null;
  id: string;
};

export type JoinMeetingResponse = {
  id: string;
  passcode: string;
  name?: string | null;
  isHost: boolean;
  recordingState: "IDLE" | "RECORDING" | "UPLOADING" | "PROCESSING" | "READY" | "FAILED"
};

export type FinalRecording = {
  id: string;
  meetingId: string;
  videoLink: string;
  audioLink?: string | null;
  visibleToEmails: string[];
  generatedAt: string;
};

export type RecordingVisibilityParticipant = {
  id: string;
  name?: string | null;
  email?: string | null;
};

export type RecordingVisibilityResponse = {
  meetingId: string;
  hostEmail?: string | null;
  visibleToEmails: string[];
  participants: RecordingVisibilityParticipant[];
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

export type RecordingPageParticipant = {
  email?: string | null;
};

export type RecordingPageResponse = {
  id: string;
  meetingId: string;
  roomName?: string | null;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  isHost: boolean;
  recordingState?: "IDLE" | "RECORDING" | "UPLOADING" | "PROCESSING" | "READY" | "FAILED";
  hostEmail?: string | null;
  userEmail?: string | null;
  canViewRecording: boolean;
  visibleToEmails: string[];
  participants: RecordingPageParticipant[];
};

export type MeetingDetails = {
  finalRecording: {
    id: string;
    meetingId: string;
    videoLink?: string;
    audioLink?: string | null;
    visibleToEmails: string[];
    generatedAt: Date;
  },
  id: string;
  roomId: string;
  passcode: string | null;
  userId: string;
  roomName: string | null;
  date: Date;
  startTime: Date | null;
  endTime: Date | null;
  isEnded: boolean;
  isHost: boolean;
  joinedParticipants: string[];
  invitedParticipants: string[];
  recordingState: "IDLE" | "RECORDING" | "UPLOADING" | "PROCESSING" | "READY" | "FAILED";
  recordingStartedAt: Date | null;
  recordingStoppedAt: Date | null;
  processingStartedAt: Date | null;
  processingEndedAt: Date | null;
}

export type RemoveVisibleEmailRequest = {
  meetingId: string;
  visibleToEmails: string[];
}

export type GoogleAuthResponse = {
  name: string;
  token: string;
  message: string;
}