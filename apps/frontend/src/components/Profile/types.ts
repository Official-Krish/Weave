export type Meeting = {
  roomName: string;
  roomId: string;
  isHost: boolean;
  participants: string[];
};

export type User = {
  name: string;
  email: string;
  googleId: string | null;
  githubUsername: string | null;
  createdAt: string;
  updatedAt: string;
  hostedMeetings: Meeting[];
};