import { prisma } from "@repo/db/client";
import { Redis } from "ioredis";

export const redisSubscriber = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
});

export const redisPublisher = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
});

export async function sendInvitationEmail() {
  while (true) {
    try {
      const reciever = await redisSubscriber.brpop("MeetingInvitations", 0);
      if (!reciever) continue;

      const { roomId, message, participants } = JSON.parse(reciever[1]);

      if (!participants) continue;

      participants.forEach(async (userId: string) => {
        await prisma.notification.create({
          data: {
            userId: userId,
            type: "MEETING_INVITE",
            message: message,
            metadata: {
              roomId: roomId,
            },
          },
        });
      });

    } catch (error) {
      console.error("Error processing invitation, retrying...", error);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

export async function sendMeetingReminders() {
  while (true) {
    try {
      const reciever = await redisSubscriber.brpop("MeetingReminders", 0);
      if (!reciever) continue;

      const { scheduleId, message, participants } = JSON.parse(reciever[1]);

      if (!participants) continue;

      participants.forEach(async (userId: string) => {
        await prisma.notification.create({
          data: {
            userId: userId,
            type: "MEETING_REMINDER",
            message: message,
            metadata: {
              scheduleId: scheduleId,
            },
          },
        });
      });

    } catch (error) {
      console.error("Error processing reminder, retrying...", error);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}