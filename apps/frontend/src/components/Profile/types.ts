export type Meeting = {
  roomName: string;
  roomId: string;
  isHost: boolean;
  participants: string[];
};

export type User = {
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  hostedMeetings: Meeting[];
};