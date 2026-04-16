export type Meeting = {
  roomName: string;
  roomId: string;
  startTime: string;
  endTime: string;
  isHost: boolean;
  joinedParticipants: string[];
};

export type User = {
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  meetings: Meeting[];
};