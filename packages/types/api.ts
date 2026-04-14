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
  visibleToEmails: string[];
  generatedAt: string;
  format: string;
  quality: string;
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
  recordingState?: "IDLE" | "RECORDING" | "UPLOADING" | "PROCESSING" | "READY" | "FAILED";
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

export type RecordingPageParticipant = {
  id: string;
  name?: string | null;
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
