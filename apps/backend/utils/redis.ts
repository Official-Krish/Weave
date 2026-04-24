import { prisma } from "@repo/db/client";
import { Redis } from "ioredis";

export const redisSubscriberReminders = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
});

export const redisSubscriberInvitations = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
});

export const redisPublisher = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
});

function resolveParticipantUserId(participant: string | { userId?: string }) {
  if (typeof participant === "string") {
    return participant;
  }

  return participant.userId;
}

export async function sendInvitationEmail() {
  while (true) {
    try {
      const reciever = await redisSubscriberInvitations.brpop("MeetingInvitations", 0);
      if (!reciever) continue;

      const { roomId, message, participants } = JSON.parse(reciever[1]);

      if (!participants) continue;

      await Promise.all(
        participants.map(async (participant: string | { userId?: string }) => {
        const userId = resolveParticipantUserId(participant);
        if (!userId) return;

          return prisma.notification.create({
            data: {
              userId: userId,
              type: "MEETING_INVITE",
              message: message,
              metadata: {
                roomId: roomId,
              },
            },
          });
        })
      );

    } catch (error) {
      console.error("Error processing invitation, retrying...", error);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

export async function sendMeetingReminders() {
  while (true) {
    try {
      const reciever = await redisSubscriberReminders.brpop("MeetingReminders", 0);
      if (!reciever) continue;

      const { scheduleId, message, participants, scheduledAt } = JSON.parse(reciever[1]);

      if (!participants) continue;

      await Promise.all(
        participants.map(async (participant: string | { userId?: string }) => {
          const userId = resolveParticipantUserId(participant);

          if (!userId) return;

          return prisma.notification.create({
            data: {
              userId,
              type: "MEETING_REMINDER",
              message,
              metadata: {
                scheduleId,
                scheduledAt,
              },
            },
          });
        })
      );

    } catch (error) {
      console.error("Error processing reminder, retrying...", error);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}
