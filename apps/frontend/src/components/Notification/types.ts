export type NotificationType =
  | "MEETING_INVITE"
  | "MEETING_REMINDER"
  | "RECORDING_REQUEST"
  | "RECORDING_READY"
  | "RECORDING_FAILED"
  | "RECORDING_REQUEST_APPROVED"
  | "RECORDING_REQUEST_DENIED"
  | "OTHER";

export interface NotificationMetadata {
  meetingId?: string;
  roomName?: string;
  invitedBy?: string;
  invitedUserId?: string;
  scheduledAt?: string;
  requestedBy?: string;
  reason?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: NotificationMetadata;
}

export type NotificationsResponse = {
  notifications: Array<
    Omit<Notification, "metadata"> & {
      metadata?: Notification["metadata"] | null;
    }
  >;
};

export type NotificationActionInput = {
  roomId: string;
  notificationId: string;
};

export const FILTERS = ["All", "Unread", "Recording", "Meeting"] as const;
export type Filter = (typeof FILTERS)[number];