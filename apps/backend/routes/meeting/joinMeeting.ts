import { Router } from "express";
import { authMiddleware } from "../../utils/authMiddleware";
import { prisma } from "@repo/db/client";
import { redisPublisher } from "../../utils/redis";
import { toSingleString, generateString } from "../../utils/helpers";

const joinMeetingRouter = Router();

joinMeetingRouter.post("/join/:id", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const id = toSingleString(req.params.id);
  const { passcode } = req.body;

  if (!userId || !id) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    let meeting = await prisma.meeting.findUnique({
      where: { roomId: id },
      include: { participants: true },
    });

    if (!meeting) {
      const schedule = await prisma.meetingSchedule.findUnique({
        where: { id },
        include: { participants: true },
      });

      if (!schedule) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      meeting = await prisma.meeting.findFirst({
        where: { scheduleId: schedule.id },
        include: { participants: true },
      });

      if (meeting && schedule.hostId === userId) {
        meeting = await prisma.meeting.create({
          data: {
            roomId: generateString().toLowerCase(),
            roomName: schedule.title,
            userId: schedule.hostId,
            isHost: true,
            isEnded: false,
            scheduleId: schedule.id,
            participants: {
              create: [
                {
                  userId: schedule.hostId,
                  role: "HOST",
                },
                ...schedule.participants
                  .filter((p) => p.userId !== schedule.hostId)
                  .map((p) => ({
                    userId: p.userId,
                  })),
              ],
            },
          },
          include: { participants: true },
        });

        await redisPublisher.lpush("MeetingInvitations", JSON.stringify({
          roomId: meeting.roomId,
          message: `Your scheduled meeting "${schedule.title}" is starting now.`,
          participants: schedule.participants
            .filter((p) => p.userId !== schedule.hostId)
            .map((p) => ({
              userId: p.userId,
            })),
        }));
        return res.status(200).json({
          roomId: meeting.roomId,
          meetingId: meeting.id,
          isHost: true,
          recordingState: meeting.recordingState,
        });
      } else if (meeting && schedule.hostId !== userId) {
        return res.status(201).json({ message: "Waiting for host to start the meeting" });
      }
    }

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (meeting.isEnded) {
      return res.status(400).json({ message: "Meeting ended" });
    }

    const existing = meeting.participants.find(p => p.userId === userId);

    const isInvited = meeting.scheduleId
      ? true
      : existing !== undefined;

    if (!isInvited && meeting.passcode && meeting.passcode !== passcode) {
      return res.status(403).json({ message: "Invalid passcode" });
    }

    if (!existing) {
      await prisma.meetingParticipant.create({
        data: {
          meetingId: meeting.id,
          userId,
          role: "PARTICIPANT",
        },
      });
    } else {
      await prisma.meetingParticipant.update({
        where: { id: existing.id },
        data: { leftAt: null },
      });
    }

    return res.status(200).json({
      roomId: meeting.roomId,
      meetingId: meeting.id,
      isHost: meeting.userId === userId,
      recordingState: meeting.recordingState,
    });

  } catch (error) {
    console.error("Join error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default joinMeetingRouter;
