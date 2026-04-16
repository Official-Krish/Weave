import { prisma } from "@repo/db/client";
import { Redis } from "ioredis";

export const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
});

export async function sendInvitationEmail() {
  while (true) {
    try {
      const reciever = await redisClient.brpop("MeetingInvitations", 0);
      if (!reciever) continue;

      const { email, meetingId, meetingName, inviterName } = JSON.parse(reciever[1]);

      const user = await prisma.user.findFirst({
        where: { email: email.toLowerCase() },
        select: { id: true },
      });

      if (!user) continue;

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "MEETING_INVITE",
          message: `You have been invited to join the meeting "${meetingName}" by ${inviterName}.`,
          metadata: { meetingId },
        },
      });

    } catch (error) {
      console.error("Error processing invitation, retrying...", error);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}